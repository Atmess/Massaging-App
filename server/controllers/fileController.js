const multer = require("multer");
const { createClient } = require("@supabase/supabase-js");
const prisma = require("../lib/prisma");
// no require("dotenv").config() here: app.js already loads dotenv/config

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_KEY must be set");
}

// SUPABASE_KEY must be the server-side service role key. Never expose it to the client.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Create this bucket in Supabase (Storage -> New bucket) before using it
const BUCKET = process.env.SUPABASE_BUCKET || "Massaging_File"


// ---------- helpers ----------

function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/_{2,}/g, "_");
}

// Public URL prefix of files in our bucket
const PUBLIC_PREFIX = `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

// Use this in the socket sendMessage handler so users can't attach arbitrary URLs
const isOwnMediaUrl = (url) => typeof url === "string" && url.startsWith(PUBLIC_PREFIX);

// Turn a public URL into the path inside the bucket
function getStoragePath(url) {
  if (!isOwnMediaUrl(url)) return null;
  return decodeURIComponent(url.slice(PUBLIC_PREFIX.length).split("?")[0]);
}

async function removeMediaByUrl(url) {
  const storagePath = getStoragePath(url);
  if (!storagePath) return;
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) console.error("Supabase deletion error:", error);
}

// ---------- receive the file (multer) ----------

// Wrapper so multer errors become clean JSON responses
const receiveFile = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File too large (max 10 MB)" });
    }
    return res.status(400).json({ message: err.message });
  });
};

// ---------- upload handler: POST /api/upload (multipart: file + chatId) ----------

const uploadMedia = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const file = req.file;
    const { chatId } = req.body; // multer has parsed the text fields by now
    if (!file) return res.status(400).json({ message: "No file uploaded" });
    if (!chatId) return res.status(400).json({ message: "chatId is required" });

    // only members of the chat may upload into it
    const participant = await prisma.chatParticipant.findFirst({
      where: { chatId, userId },
      select: { id: true },
    });
    if (!participant) {
      return res.status(403).json({ message: "You are not part of this chat" });
    }

    const storagePath = `${chatId}/${Date.now()}-${sanitizeFilename(file.originalname)}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file.buffer, { contentType: file.mimetype, upsert: false });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    res.status(201).json({
      url: data.publicUrl,
      name: file.originalname,
      size: file.size,
      type: file.mimetype,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    next(error);
  }
};

module.exports = {  uploadMedia, isOwnMediaUrl, removeMediaByUrl };