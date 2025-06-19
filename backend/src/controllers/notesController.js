import path from "path";
import fs from "fs";
import { promisify } from "util";
import libre from "libreoffice-convert";
import { extractTextFromFile } from "../utils/extractTextFromFile.js";
import { summarizeWithDeepSeek } from "../utils/summarizeWithDeepSeek.js";
import { synthesizeWithDeepSeek } from "../utils/synthesisWithDeepSeek.js";
import pool from "../db.js";

const convertAsync = promisify(libre.convert);

/**
 * Splits text into coherent chunks, attempting to break at natural boundaries like sentences or paragraphs.
 * This helps in processing large texts by AI models while maintaining context.
 * @param {string} text - The full text to split.
 * @param {number} chunkSize - The target size (in characters) for each chunk.
 * @param {number} overlap - The number of characters to overlap between chunks to maintain context.
 * @returns {string[]} An array of text chunks.
 */
function splitIntoChunks(text, chunkSize, overlap) {
  const chunks = [];
  let index = 0;

  while (index < text.length) {
    const targetEnd = index + chunkSize;

    // If the remaining text is less than a chunk size, take all of it
    if (targetEnd >= text.length) {
      chunks.push(text.slice(index));
      break;
    }

    // Attempt to find a sentence boundary ('. ') before the target end
    let sliceEnd = text.lastIndexOf(". ", targetEnd);
    if (sliceEnd <= index) {
      // If no sentence boundary, try a new line character ('\n')
      sliceEnd = text.lastIndexOf("\n", targetEnd);
    }
    if (sliceEnd <= index) {
      // If no suitable boundary found, simply cut at the targetEnd
      sliceEnd = targetEnd;
    } else {
      // Include the boundary character in the slice
      sliceEnd += 1;
    }

    chunks.push(text.slice(index, sliceEnd));

    // Calculate the next starting index with overlap
    let nextIndex = sliceEnd - overlap;
    // Ensure nextIndex doesn't go backwards or beyond the current index
    if (nextIndex <= index) {
      nextIndex = sliceEnd;
    }
    index = nextIndex;
  }
  return chunks;
}

/**
 * Handles the upload of a note file, converts PPTX to PDF if necessary,
 * extracts text, summarizes it using DeepSeek, synthesizes the final summary,
 * and returns the file URL and summary.
 * @param {object} req - The request object, containing the uploaded file.
 * @param {object} res - The response object.
 */
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
    let outputFileName; // Declared but not explicitly used for its string value after assignment

    // Convert PPTX to PDF if the uploaded file is a PPTX
    if (ext === ".pptx") {
      outputFileName = req.file.filename.replace(/\.pptx$/, ".pdf");
      outputPath = path.join(uploadsDir, outputFileName);

      const fileBuf = await fs.promises.readFile(inputPath);
      const pdfBuf = await convertAsync(fileBuf, ".pdf", undefined);
      await fs.promises.writeFile(outputPath, pdfBuf);

      fileUrl = `${baseUrl}/uploads/${encodeURIComponent(outputFileName)}`;
    }

    // Step 1: Extract full text from the processed file
    const fullText = await extractTextFromFile(outputPath);

    // Step 2: Split into chunks for manageable AI processing
    const CHUNK_SIZE = 3500; // Target size for each text chunk (characters)
    const OVERLAP = 250; // Overlap between chunks (characters) for context
    const chunks = splitIntoChunks(fullText, CHUNK_SIZE, OVERLAP);

    console.log(`Split into ${chunks.length} chunks for summarization.`);

    // Step 3: Summarize each chunk in parallel using DeepSeek
    const partialSummaries = await Promise.all(
      chunks.map(async (chunk) => {
        try {
          return await summarizeWithDeepSeek(chunk);
        } catch (err) {
          console.error("Error summarizing chunk:", err.message);
          return ""; // Return empty string on chunk summary error to continue processing
        }
      })
    );

    // Step 4: Combine all partial summaries
    const combinedSummary = partialSummaries.filter(Boolean).join("\n\n"); // Filter out empty summaries

    // Step 5: Synthesize the combined summary for a more coherent and refined output
    const finalSummary = await synthesizeWithDeepSeek(combinedSummary);

    // Step 6: Return the file URL and final cleaned summary
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

/**
 * Saves note metadata (file URL, summary, subject, topic) to the database.
 * @param {object} req - The request object, including authenticated user ID and body data.
 * @param {object} res - The response object.
 */
export const saveNoteMetadata = async (req, res) => {
  const userId = req.user.id;
  const { fileUrl, summary, subject, topic } = req.body;

  if (!fileUrl || !summary || !subject || !topic) {
    return res
      .status(400)
      .json({ error: "fileUrl, summary, subject, and topic are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notes 
         (user_id, file_url, summary, subject, topic, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, user_id, file_url, summary, subject, topic, created_at`,
      [userId, fileUrl, summary, subject, topic]
    );
    res.status(201).json({ note: result.rows[0] });
  } catch (err) {
    console.error("Save note metadata error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Checks if a specific note is saved by the current user.
 * @param {object} req - The request object, including authenticated user ID and query parameters.
 * @param {object} res - The response object.
 */
export const isNoteSaved = async (req, res) => {
  const userId = req.user.id;
  const { noteId } = req.query;

  try {
    const result = await pool.query(
      "SELECT 1 FROM saved_notes WHERE user_id = $1 AND note_id = $2",
      [userId, noteId]
    );

    res.json({ saved: result.rows.length > 0 });
  } catch (err) {
    console.error("Check saved error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Searches for notes based on subject, topic, or keyword in summary.
 * @param {object} req - The request object, containing query parameters.
 * @param {object} res - The response object.
 */
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

    // Optional: filter by subject (case-insensitive)
    if (subject) {
      query += ` AND n.subject ILIKE $${params.length + 1}`;
      params.push(`%${subject}%`);
    }

    // Optional: filter by topic (case-insensitive)
    if (topic) {
      query += ` AND n.topic ILIKE $${params.length + 1}`;
      params.push(`%${topic}%`);
    }

    // Optional: filter by keyword in summary using full-text search
    if (keyword) {
      // Replaces spaces with '&' for PostgreSQL's to_tsquery, enabling AND logic
      query += ` AND to_tsvector('english', n.summary) @@ to_tsquery('english', $${
        params.length + 1
      })`;
      params.push(`${keyword.replace(/\s+/g, " & ")}`);
    }

    query += ` ORDER BY n.created_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json({ notes: rows });
  } catch (err) {
    console.error("Search notes error:", err.message); // Updated error message
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Retrieves all notes uploaded by the current user.
 * @param {object} req - The request object, including authenticated user ID.
 * @param {object} res - The response object.
 */
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

/**
 * Retrieves a full library of notes for the user, including both notes they uploaded
 * and notes they saved from other users.
 * @param {object} req - The request object, including authenticated user ID.
 * @param {object} res - The response object.
 */
export const getFullLibrary = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `
      -- First part: notes uploaded by the user
      SELECT
        n.id,
        n.file_url AS "fileUrl",
        n.summary,
        n.subject,
        n.topic,
        n.created_at AS "createdAt",
        u.username AS uploader_username,
        'uploaded' AS type
      FROM notes n
      JOIN users u ON n.user_id = u.id
      WHERE n.user_id = $1

      UNION ALL

      -- Second part: notes saved by the user from others
      SELECT
        n.id,
        n.file_url AS "fileUrl",
        n.summary,
        n.subject,
        n.topic,
        sn.saved_at AS "createdAt", -- Use saved_at for saved notes
        u.username AS uploader_username,
        'saved' AS type
      FROM saved_notes sn
      JOIN notes n ON sn.note_id = n.id
      JOIN users u ON n.user_id = u.id
      WHERE sn.user_id = $1

      ORDER BY "createdAt" DESC;
      `,
      [userId]
    );
    res.json(result.rows); // Return just the array of notes, not { notes: [...] }
  } catch (err) {
    console.error("Load library error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Saves a note to the user's personal library (saved_notes).
 * Handles cases where the note is already saved.
 * @param {object} req - The request object, including authenticated user ID and noteId in body.
 * @param {object} res - The response object.
 */
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

    // Try to insert into saved_notes, handle conflict if already saved
    const result = await pool.query(
      `INSERT INTO saved_notes (user_id, note_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, note_id) DO NOTHING
       RETURNING *`, // RETURNING * allows checking if a row was actually inserted
      [userId, noteId]
    );

    if (result.rows.length === 0) {
      // If no rows were returned, it means ON CONFLICT DO NOTHING was triggered
      return res.json({
        message: "Note already saved",
        saved: true, // It is already saved, so 'true' from user's perspective
      });
    }

    res.status(201).json({
      // Use 201 for successful creation
      message: "Note saved to library",
      saved: true,
    });
  } catch (err) {
    console.error("Save to library error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Retrieves recommended notes based on subject, excluding a specific note.
 * Orders them randomly and limits the results.
 * @param {object} req - The request object, containing query parameters.
 * @param {object} res - The response object.
 */
export const getRecommendedNotes = async (req, res) => {
  const { subject, excludeNoteId } = req.query;

  if (!subject || !excludeNoteId) {
    return res
      .status(400)
      .json({ error: "Subject and excludeNoteId are required." });
  }

  try {
    const { rows } = await pool.query(
      `
      SELECT id, subject, topic, summary, file_url as fileurl
      FROM notes
      WHERE subject = $1 AND id != $2
      ORDER BY RANDOM()
      LIMIT 3
      `,
      [subject, excludeNoteId]
    );
    res.json({ notes: rows });
  } catch (err) {
    console.error("Get recommended notes error:", err.message);
    res.status(500).json({ error: "Failed to load recommendations" });
  }
};
