const { Server } = require("socket.io");
const prisma = require("../lib/prisma");


// Frontend origins allowed to connect (must match the Express CORS config in app.js)
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://192.168.1.37:5173",
  "https://massaging-app-teal.vercel.app/"
];

const MAX_MESSAGE_LENGTH = 4000;

// Public fields only. Don't broadcast emails to other chat participants.
const SENDER_SELECT = { id: true, username: true, avatarUrl: true };

let io = null;

// Every socket joins a personal room so we can reach a user on all their devices,
// even when they don't have a particular chat open (chat list, unread badges, etc.)
const userRoom = (userId) => `user:${userId}`;

// Accept both `{ chatId }` and a plain string, so a small client mistake doesn't fail silently
const readChatId = (payload) =>
  typeof payload === "string" ? payload : payload?.chatId;

async function isParticipant(chatId, userId) {
  const participant = await prisma.chatParticipant.findFirst({
    where: { chatId, userId },
    select: { id: true },
  });
  return !!participant;
}

/**
 * Initialize Socket.io on the Express HTTP server.
 * Reuses the same express-session instance so the `connect.sid` cookie
 * authenticates socket connections (same as the REST API).
 */
function initSocket(httpServer, sessionMiddleware) {
  io = new Server(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // --- Socket authentication via express-session ---
  io.use((socket, next) => {
    const req = socket.request;

    // Minimal response stub so express-session can run outside a normal HTTP response
    const res = {
      writeHead: () => {},
      end: () => {},
      setHeader: () => {},
      getHeader: () => undefined,
      removeHeader: () => {},
      getHeaders: () => ({}),
      hasHeader: () => false,
      writable: true,
      writableEnded: false,
    };

    sessionMiddleware(req, res, async (err) => {
      if (err) {
        console.error("[socket] session middleware error:", err.message);
        return next(err);
      }

      // Passport's serializeUser stores the user ID in session.passport.user
      const rawUser = req.session?.passport?.user;

      if (!rawUser) {
        console.error("[socket] no authenticated user in session", {
          hasSession: !!req.session,
          hasPassport: !!req.session?.passport,
        });
        return next(new Error("Unauthorized: no active session"));
      }

      // rawUser may be a string (the serialized id) or a user object
      const userId = typeof rawUser === "string" ? rawUser : rawUser.id;
      socket.userId = userId;

      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, username: true, email: true, avatarUrl: true },
        });
        socket.user = user || { id: userId };
      } catch (dbErr) {
        console.error("[socket] failed to fetch user:", dbErr.message);
        socket.user = { id: userId };
      }

      next();
    });
  });

  io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id} (user ${socket.userId})`);

    // Personal room: lets the server reach this user on every device
    socket.join(userRoom(socket.userId));

    // ---------- join / leave a chat room ----------
    socket.on("join", async (payload, cb) => {
      const reply = typeof cb === "function" ? cb : () => {};
      try {
        const chatId = readChatId(payload);
        if (!chatId) throw new Error("chatId is required");

        if (!(await isParticipant(chatId, socket.userId))) {
          return reply({ ok: false, error: "You are not part of this chat" });
        }

        socket.join(chatId);
        socket.currentChatId = chatId;
        reply({ ok: true, chatId });
        socket.to(chatId).emit("userJoined", { chatId, userId: socket.userId });
      } catch (err) {
        console.error("[socket] join error:", err.message);
        reply({ ok: false, error: err.message });
      }
    });

    socket.on("leave", (payload) => {
      const chatId = readChatId(payload);
      if (!chatId) return;
      socket.leave(chatId);
      if (socket.currentChatId === chatId) socket.currentChatId = null;
    });

    // ---------- send a message: persist + broadcast ----------
    socket.on("sendMessage", async (payload, cb) => {
      const reply = typeof cb === "function" ? cb : () => {};
      try {
        const { chatId, content, mediaUrl } = payload || {};
        const text = typeof content === "string" ? content.trim() : "";

        if (!chatId || !text) {
          throw new Error("chatId and content are required");
        }
        if (text.length > MAX_MESSAGE_LENGTH) {
          throw new Error(`Message is too long (max ${MAX_MESSAGE_LENGTH} characters)`);
        }
        if (!(await isParticipant(chatId, socket.userId))) {
          return reply({ ok: false, error: "You are not part of this chat" });
        }

        const message = await prisma.message.create({
          data: {
            content: text,
            senderId: socket.userId,
            chatId,
            mediaUrl: typeof mediaUrl === "string" ? mediaUrl : undefined,
          },
          include: { sender: { select: SENDER_SELECT } },
        });

        // Everyone in the chat room EXCEPT this socket gets the message live.
        // The sender gets it through the ack callback below.
        socket.to(chatId).emit("newMessage", message);

        // Confirm to the sender right away; the notifications below can't fail the send
        reply({ ok: true, message });

        // Tell every participant (on all devices) so chat lists / unread badges update
        try {
          const participants = await prisma.chatParticipant.findMany({
            where: { chatId },
            select: { userId: true },
          });
          for (const { userId } of participants) {
            io.to(userRoom(userId)).emit("chatUpdated", { chatId, lastMessage: message });
          }
        } catch (notifyErr) {
          console.error("[socket] chatUpdated error:", notifyErr.message);
        }
      } catch (err) {
        console.error("[socket] sendMessage error:", err.message);
        reply({ ok: false, error: err.message });
      }
    });

    // ---------- typing indicators (only for rooms this socket has joined) ----------
    socket.on("typing", (payload) => {
      const chatId = readChatId(payload);
      if (chatId && socket.rooms.has(chatId)) {
        socket.to(chatId).emit("typing", { chatId, userId: socket.userId });
      }
    });

    socket.on("stopTyping", (payload) => {
      const chatId = readChatId(payload);
      if (chatId && socket.rooms.has(chatId)) {
        socket.to(chatId).emit("stopTyping", { chatId, userId: socket.userId });
      }
    });

    // ---------- disconnect ----------
    socket.on("disconnect", () => {
      console.log(`[socket] disconnected: ${socket.id}`);
      if (socket.currentChatId) {
        socket.to(socket.currentChatId).emit("userLeft", {
          chatId: socket.currentChatId,
          userId: socket.userId,
        });
      }
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io has not been initialized. Call initSocket first.");
  return io;
}

module.exports = { initSocket, getIO, ALLOWED_ORIGINS };