require("dotenv/config");
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const passport = require("./config/passport");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const session = require("express-session");
const { initSocket, getIO, ALLOWED_ORIGINS } = require("./sockets/chatSocket");
const prisma = require("./lib/prisma");

const indexRouter = require("./routes/indexRouter");

const app = express();
const server = http.createServer(app); // Wrapped for Socket.io later!
const PORT = process.env.PORT || 8080;
// --- CORS CONFIG (Allows React frontend to talk to Express) ---
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
             // Vite's default local development port
    credentials: true,             // Required for sessions/cookies to pass through
  })
);

// --- BODY PARSERS ---
app.use(express.json());                  // Parses JSON request bodies from React
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data
console.log("NODE_ENV:", process.env.NODE_ENV);
// --- STATIC FILE SERVING (for media/attachment uploads) ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const isProd = process.env.NODE_ENV === "production";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not set");
}

// Must come BEFORE the session middleware: Render terminates HTTPS at its proxy
if (isProd) app.set("trust proxy", 1);

// --- SESSION CONFIG (Using your Prisma Session Store) ---
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: isProd, // read x-forwarded-proto (also covers the socket handshake)
  cookie: {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  },
  store: new PrismaSessionStore(prisma, {
    checkPeriod: 2 * 60 * 1000,
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


app.get("/health", (req, res) => res.json({ ok: true }));
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