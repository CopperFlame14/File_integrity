import express from "express";
import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

// In-memory "database"
const filesDB = {};

// 🟢 Sender uploads file
app.post("/upload", upload.single("file"), (req, res) => {
  const { receiverId } = req.body;
  if (!receiverId) {
    return res.status(400).json({ error: "Receiver ID required." });
  }

  const filePath = req.file.path;
  const fileBuffer = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  filesDB[receiverId] = {
    fileName: req.file.originalname,
    filePath,
    hash,
  };

  res.json({
    message: `File uploaded for receiver ${receiverId}`,
    hash,
  });
});

// 🟣 Receiver downloads file
app.get("/download/:receiverId", (req, res) => {
  const { receiverId } = req.params;
  const fileData = filesDB[receiverId];
  if (!fileData) {
    return res.status(404).json({ error: "No file found for this receiver." });
  }

  res.download(fileData.filePath, fileData.fileName);
});

// 🟠 Verify file integrity
app.get("/verify/:receiverId", (req, res) => {
  const { receiverId } = req.params;
  const fileData = filesDB[receiverId];

  if (!fileData) {
    return res.status(404).json({ error: "No file found." });
  }

  const fileBuffer = fs.readFileSync(fileData.filePath);
  const currentHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  if (currentHash === fileData.hash) {
    res.json({ verified: true, message: "✅ File is intact." });
  } else {
    res.json({ verified: false, message: "❌ File has been modified." });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`✅ Server running on port ${port}`));
