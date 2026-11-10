require("dotenv/config");
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const passport = require("./config/passport");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const session = require("express-session");
const { initSocket, getIO } = require("./sockets/chatSocket");
const prisma = require("./lib/prisma");

const indexRouter = require("./routes/indexRouter");

const app = express();
const server = http.createServer(app); // Wrapped for Socket.io later!
const PORT = process.env.PORT || 8080;
// --- CORS CONFIG (Allows React frontend to talk to Express) ---
app.use(
  cors({
    origin: ["http://localhost:5173",
              'http://192.168.1.37:5173'
    ],
             // Vite's default local development port
    credentials: true,             // Required for sessions/cookies to pass through
  })
);

// --- BODY PARSERS ---
app.use(express.json());                  // Parses JSON request bodies from React
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data

// --- STATIC FILE SERVING (for media/attachment uploads) ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- SESSION CONFIG (Using your Prisma Session Store) ---
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "cats",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000, // Cleans up expired sessions every 2 minutes
    dbRecordIdIsSessionId: true,
    dbRecordIdFunction: undefined,
  }),
});
app.use(sessionMiddleware);

// --- SOCKET.IO (real-time messaging) ---

initSocket(server, sessionMiddleware);
app.set("io", getIO());

// --- PASSPORT INITIALIZATION ---
app.use(passport.session());

// --- API ROUTES ---
app.use("/api", indexRouter);

// --- CENTRALIZED ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error"
  });
});

// --- START SERVER ---
server.listen(PORT,'0.0.0.0',(error) => {
  if (error) throw error;
  console.log(`Messaging App backend listening on port ${PORT}!`);
});