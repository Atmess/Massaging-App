require('dotenv').config();
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); 
const chatController = require('../controllers/chatController');  
const fileController = require('../controllers/fileController'); 
const messageController = require('../controllers/messageController'); 
const multer = require('multer');
const path = require('path');
const { body } = require("express-validator");
const passport = require("../config/passport");

// --- MULTER CONFIG FOR CHAT ATTACHMENTS ---
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'application/zip',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) =>
    ALLOWED_MIME_TYPES.has(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Invalid file type.')),
});

const FilterFile = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File too large (max 10 MB)" });
    }
    return res.status(400).json({ message: err.message });
  });
};
// --- SESSION AUTH MIDDLEWARE ---
const isAuthenticated = (req, res, next) => {
  // Passport automatically attaches req.isAuthenticated() and req.user
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  // Fallback check for custom session tracking
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "Access denied. Please log in." });
};

// ==========================================
// --- PUBLIC AUTH ROUTES ---
// ==========================================

router.post("/register", [
  body("email").trim().isEmail().withMessage("Please enter a valid email address.").normalizeEmail(),
  body("username").trim().notEmpty().withMessage("Username cannot be empty.").escape(),
  body("password").isLength({ min: 5 }).withMessage("Password must be at least 5 characters long."),
  body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    })
], authController.createUserPost);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || "Invalid credentials" });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ 
        message: "Logged in successfully!", 
        user: { id: user.id, username: user.username, email: user.email } 
      });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully!" });
    });
  });
});


router.get("/current-user", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.status(401).json({ isAuthenticated: false });
  }
});


// ==========================================
// --- PROTECTED CHAT & MESSAGE ROUTES ---
// ==========================================

// Protect all routes below this line with Session Auth
router.use(isAuthenticated);

// User Profile
router.get('/users/me', authController.getCurrentUser);
router.patch('/users/profile', FilterFile, authController.updateProfile);
router.post('/messages/find',chatController.findReceiver)
// Chat Rooms / Conversations
router.get('/chats', chatController.getUserChats);           
router.post('/chats', chatController.createPrivateChat);     
router.get('/chats/find', chatController.getChatWithUser);   

// Messages
router.get('/messages/:chatId', messageController.getChatMessages); 
router.post('/messages', FilterFile, messageController.sendMessage);

//upload
router.post('/upload' , FilterFile , fileController.uploadMedia)

module.exports = router;