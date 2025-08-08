import path from "path";
import fs from "fs";
import { extractTextFromFile } from "../utils/extractTextFromFile.js";
import { processCloudFile } from "../utils/cloudFileProcessor.js";
import pool from "../db.js";
import { OpenAI } from "openai";
import crypto from "crypto";
import { cloudinary } from "../config/cloudinary.js";

/**
 * Handles the upload of a note file, converts PPTX to PDF if necessary,
 * extracts text, and generates a summary using an optimized single-pass approach.
 * @param {object} req - The request object, containing the uploaded file.
 * @param {object} res - The response object.
 */
export const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Check file size (limit to 10MB to prevent timeouts)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxFileSize) {
      return res.status(400).json({
        error: "File too large. Please upload a file smaller than 10MB.",
      });
    }

    console.log("File uploaded to Cloudinary:", req.file);

    // Get the Cloudinary URL
    const fileUrl = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();

    // Step 1: Process file from Cloudinary (download + convert if needed)
    console.log("Processing file from Cloudinary...");
    const processedBuffer = await processCloudFile(fileUrl, req.file.originalname);

    // Step 2: Extract full text from the processed file
    console.log("Extracting text from document...");
    let fullText;
    try {
      fullText = await extractTextFromFile(processedBuffer);
      console.log(`Extracted ${fullText.length} characters from document`);
      
      // Check if text extraction was successful
      if (!fullText || fullText.trim().length < 10) {
        throw new Error("Text extraction produced insufficient content");
      }
    } catch (extractionError) {
      console.error("Text extraction failed:", extractionError);
      // Fallback: create a basic summary based on file metadata
      fullText = `Document: ${req.file.originalname}\nType: ${ext}\nSize: ${(req.file.size / 1024).toFixed(2)} KB\n\nThis document has been uploaded successfully. Text extraction was not possible for this file type or format.`;
      console.log("Using fallback text extraction");
    }

    // Step 3: Compute file hash for caching (use actual content)
    const fileHash = crypto.createHash("sha256").update(fullText).digest("hex");
    console.log(`Computed file hash: ${fileHash}`);

    // Step 4: Check for cached summary in the notes table
    const cacheResult = await pool.query(
      "SELECT summary, file_url FROM notes WHERE file_hash = $1 LIMIT 1",
      [fileHash]
    );
    if (cacheResult.rows.length > 0) {
      console.log("Summary cache hit! Returning cached summary.");
      return res.status(201).json({
        note: {
          fileUrl: cacheResult.rows[0].file_url,
          summary: cacheResult.rows[0].summary,
          cached: true,
        },
      });
    }

    // Step 5: Smart text preprocessing for better summarization
    const processedText = preprocessTextForSummarization(fullText);
    console.log(`Preprocessed text: ${processedText.length} characters`);

    // Step 6: Generate summary using optimized single-pass approach
    console.log("Generating AI summary...");
    const summary = await generateOptimizedSummary(processedText);
    console.log("Summary generated successfully");

    // Step 7: Return the file URL and summary
    res.status(201).json({
      note: {
        fileUrl,
        summary: summary,
        fileHash,
        cached: false,
      },
    });
  } catch (error) {
    console.error("Error uploading note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Preprocesses text to improve summarization quality and speed
 * @param {string} text - Raw extracted text
 * @returns {string} - Preprocessed text optimized for summarization
 */
function preprocessTextForSummarization(text) {
  // Remove excessive whitespace and normalize
  let processed = text
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, "\n\n") // Normalize paragraph breaks
    .trim();

  // Remove common PDF artifacts
  processed = processed
    .replace(/Page \d+ of \d+/gi, "") // Remove page numbers
    .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, "") // Remove dates
    .replace(/©.*?\./g, "") // Remove copyright notices
    .replace(/All rights reserved\.?/gi, "") // Remove legal text
    .replace(/Confidential\.?/gi, ""); // Remove confidential notices

  // Smart truncation for very long documents (preserve structure)
  const maxLength = 25000; // 25K characters for optimal processing
  if (processed.length > maxLength) {
    console.log(
      `Document truncated from ${processed.length} to ${maxLength} characters`
    );

    // Try to truncate at a sentence boundary
    const truncated = processed.substring(0, maxLength);
    const lastSentenceEnd = truncated.lastIndexOf(".");

    if (lastSentenceEnd > maxLength * 0.8) {
      // If we can find a good sentence break
      processed = truncated.substring(0, lastSentenceEnd + 1);
    } else {
      processed = truncated;
    }

    processed += "\n\n[Document truncated for optimal processing]";
  }

  return processed;
}

/**
 * Generates an optimized summary using a single API call with smart prompting
 * @param {string} text - Preprocessed text
 * @returns {Promise<string>} - Generated summary
 */
async function generateOptimizedSummary(text) {
  try {
    const openai = new OpenAI({
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    });

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an expert academic summarizer. Create a comprehensive, well-structured summary that:

1. Preserves all key concepts and important details
2. Uses clear headings and bullet points for organization
3. Maintains the logical flow of the original content
4. Includes definitions of important terms
5. Highlights main points and supporting evidence
6. Uses markdown formatting for better readability

Focus on accuracy and completeness over brevity.`,
        },
        {
          role: "user",
          content: `Please create a detailed, well-structured summary of this academic content:

${text}

Ensure the summary is comprehensive and preserves all important information while being well-organized.`,
        },
      ],
      temperature: 0.1, // Low temperature for consistency
      max_tokens: 3000, // Allow for comprehensive summaries
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.error("Summary generation failed:", error);
    throw new Error("Failed to generate summary. Please try again.");
  }
}

/**
 * Saves note metadata (file URL, summary, subject, topic) to the database.
 * @param {object} req - The request object, including authenticated user ID and body data.
 * @param {object} res - The response object.
 */
export const saveNoteMetadata = async (req, res) => {
  const userId = req.user.id;
  const { fileUrl, summary, subject, topic, fileHash } = req.body;

  if (!fileUrl || !summary || !subject || !topic || !fileHash) {
    return res.status(400).json({
      error: "fileUrl, summary, subject, topic, and fileHash are required.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO notes 
         (user_id, file_url, summary, subject, topic, file_hash, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id, user_id, file_url, summary, subject, topic, file_hash, created_at`,
      [userId, fileUrl, summary, subject, topic, fileHash]
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
    console.error("Search notes error:", err.message);
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

export const deleteNote = async (req, res) => {
  const userId = req.user.id;
  const { noteId } = req.params;

  if (!noteId) {
    return res.status(400).json({ error: "Note ID is required." });
  }

  try {
    // Only allow deleting notes owned by the user
    const result = await pool.query(
      "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id",
      [noteId, userId]
    );
    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Note not found or not authorized." });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Delete note error:", err);
    res.status(500).json({ error: "Failed to delete note." });
  }
};
