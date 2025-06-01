import path from "path";
import fs from "fs";
import { promisify } from "util";
import libre from "libreoffice-convert";
import { extractTextFromFile } from "../utils/extractTextFromFile.js";
import { summarizeWithDeepSeek } from "../utils/summarizeWithDeepSeek.js";
import pool from "../db.js";

const convertAsync = promisify(libre.convert);

/**
 * Post-process summary to clean up output before returning.
 * @param {string} summary - Raw summary text
 * @returns {string} Cleaned summary
 */
function postProcessSummary(summary) {
  // Remove leftover markers like === CONTINUED ===
  let cleaned = summary.replace(/=== CONTINUED ===\s*/g, "");

  // Remove extra blank lines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // Fix broken sentences split across newlines
  cleaned = cleaned.replace(/([a-z])\n([a-z])/g, "$1 $2");

  return cleaned.trim();
}

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

    // Step 1: Extract full text from file
    const fullText = await extractTextFromFile(outputPath);

    // Step 2: Split into chunks (improved logic below)
    const CHUNK_SIZE = 3800; // Reduced from 4000 for faster processing
    const OVERLAP = 300;

    const chunks = [];

    let index = 0;
    while (index < fullText.length) {
      const end = index + CHUNK_SIZE;
      chunks.push(fullText.slice(index, end));
      index = end - OVERLAP;
    }

    console.log(`Split into ${chunks.length} chunks`);

    // Step 3: Summarize each chunk in parallel
    const partialSummaries = await Promise.all(
      chunks.map(async (chunk) => {
        try {
          return await summarizeWithDeepSeek(chunk);
        } catch (err) {
          console.error("Error summarizing chunk:", err.message);
          return "";
        }
      })
    );

    // Step 4: Combine all summaries and clean up
    const combinedSummary = partialSummaries.join("\n\n");

    // Step 5: Post-process final summary
    const finalSummary = postProcessSummary(combinedSummary);

    // Step 6: Return final cleaned summary
    res.status(201).json({
      note: {
        fileUrl,
        summary: finalSummary,
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

export const searchNotes = async (req, res) => {
  const { subject, topic, keyword } = req.query;

  try {
    let query = `
      SELECT 
        n.id,
        n.summary,
        n.subject,
        n.topic,
        u.username AS uploader_username,
        n.created_at
      FROM notes n
      JOIN users u ON n.user_id = u.id
      WHERE TRUE
    `;
    const params = [];

    // Optional: filter by subject
    if (subject) {
      query += ` AND n.subject ILIKE $${params.length + 1}`;
      params.push(`%${subject}%`);
    }

    // Optional: filter by topic
    if (topic) {
      query += ` AND n.topic ILIKE $${params.length + 1}`;
      params.push(`%${topic}%`);
    }

    // Optional: filter by keyword in summary
    if (keyword) {
      query += ` AND to_tsvector(n.summary) @@ to_tsquery($${
        params.length + 1
      })`;
      params.push(`${keyword.replace(/\s+/g, " & ")}`);
    }

    query += ` ORDER BY n.created_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json({ notes: rows });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const getUserNotes = async (req, res) => {
  const userId = req.user.id;

  try {
    const { rows } = await pool.query(
      `SELECT id, summary, subject, topic, created_at
       FROM notes
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json({ notes: rows });
  } catch (err) {
    console.error("Get user notes error:", err.message);
    res.status(500).json({ error: "Failed to load your library" });
  }
};

export const saveToLibrary = async (req, res) => {
  const userId = req.user.id;
  const { noteId } = req.body;

  try {
    // Check if note exists
    const noteExists = await pool.query("SELECT 1 FROM notes WHERE id = $1", [
      noteId,
    ]);
    if (!noteExists.rows.length) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Try to insert into saved_notes
    const result = await pool.query(
      `INSERT INTO saved_notes (user_id, note_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, note_id) DO NOTHING
       RETURNING *`,
      [userId, noteId]
    );

    if (result.rows.length === 0) {
      return res.json({
        message: "Note already saved",
        saved: false,
      });
    }

    res.json({
      message: "Note saved to library",
      saved: true,
    });
  } catch (err) {
    console.error("Save to library error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
