import path from "path";
import fs from "fs";
import { promisify } from "util";
import libre from "libreoffice-convert";
import { extractTextFromFile } from "../utils/extractTextFromFile.js";
import { summarizeWithDeepSeek } from "../utils/summarizeWithDeepSeek.js";
import pool from "../db.js";

const convertAsync = promisify(libre.convert);

export const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    const uploadsDir = path.join(process.cwd(), "uploads");
    const inputPath = path.join(uploadsDir, req.file.filename);
    const ext = path.extname(req.file.filename).toLowerCase();

    let outputPath = inputPath;
    let fileUrl = `${baseUrl}/uploads/${encodeURIComponent(req.file.filename)}`;
    let outputFileName;

    if (ext === ".pptx") {
      outputFileName = req.file.filename.replace(/\.pptx$/, ".pdf");
      outputPath = path.join(uploadsDir, outputFileName);

      const fileBuf = await fs.promises.readFile(inputPath);
      const pdfBuf = await convertAsync(fileBuf, ".pdf", undefined);
      await fs.promises.writeFile(outputPath, pdfBuf);

      fileUrl = `${baseUrl}/uploads/${encodeURIComponent(outputFileName)}`;
    }

    const text = await extractTextFromFile(outputPath);
    const summary = await summarizeWithDeepSeek(text);

    res.status(201).json({
      note: {
        fileUrl,
        summary,
      },
    });
  } catch (error) {
    console.error("Error uploading note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const saveNoteMetadata = async (req, res) => {
  const userId = req.user.id;
  const { fileUrl, summary, subject, topic } = req.body;

  if (!fileUrl || !summary || !subject || !topic) {
    return res
      .status(400)
      .json({ error: "fileUrl, summary, subject and topic are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notes 
         (user_id, file_url, summary, subject, topic, created_at)
       VALUES ($1,$2,$3,$4,$5,NOW())
       RETURNING id, user_id, file_url, summary, subject, topic, created_at`,
      [userId, fileUrl, summary, subject, topic]
    );
    res.status(201).json({ note: result.rows[0] });
  } catch (err) {
    console.error("Save note metadata error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
