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
