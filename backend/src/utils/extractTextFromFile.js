import fs from "fs";
import path from "path";
import pkg from "pdfjs-dist/legacy/build/pdf.js";
import officeParser from "officeparser";
const { getDocument } = pkg;

/**
 * Splits long text into overlapping chunks to preserve context.
 * @param {string} text - Full extracted text
 * @param {number} chunkSize - Max length of each chunk (in characters)
 * @param {number} overlap - Number of overlapping characters between chunks
 * @returns {string[]} Array of text chunks
 */
export function splitWithOverlap(text, chunkSize = 3800, overlap = 300) {
  const chunks = [];
  let index = 0;

  while (index < text.length) {
    const end = index + chunkSize;
    chunks.push(text.slice(index, end));
    index = end - overlap;
  }

  return chunks;
}

/**
 * Extracts raw text from .txt or .pdf files.
 * @param {string|Buffer} fileInput - Path to the file or file buffer
 * @param {string} originalName - Original filename (required when fileInput is a Buffer)
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromFile = async (fileInput, originalName = null) => {
  // In extractTextFromFile.js before processing
  const freeMem = Math.round(process.memoryUsage().heapFree / 1024 / 1024);
  if (freeMem < 100) {
    throw new Error(`Insufficient memory (${freeMem}MB free)`);
  }

  let ext;
  let data;

  // Handle both file paths and buffers
  if (Buffer.isBuffer(fileInput)) {
    // Input is a buffer
    if (!originalName) {
      throw new Error("Original filename is required when input is a buffer");
    }
    ext = path.extname(originalName).toLowerCase();
    data = new Uint8Array(fileInput);
  } else if (typeof fileInput === "string") {
    // Input is a file path
    ext = path.extname(fileInput).toLowerCase();
    data = new Uint8Array(await fs.promises.readFile(fileInput));
  } else {
    throw new Error(
      "Invalid input type. Expected string (file path) or Buffer"
    );
  }

  // Smart file type detection: check actual content, not just extension
  let actualFileType = ext;
  if (Buffer.isBuffer(fileInput)) {
    const buffer = fileInput;
    // Check if buffer starts with PDF magic number (%PDF)
    if (buffer.length >= 4 && buffer.toString("ascii", 0, 4) === "%PDF") {
      actualFileType = ".pdf";
      console.log(`File content detected as PDF (original extension: ${ext})`);
    }
  }

  if (actualFileType === ".txt") {
    if (Buffer.isBuffer(fileInput)) {
      return fileInput.toString("utf-8");
    } else {
      return await fs.promises.readFile(fileInput, "utf-8");
    }
  }

  if (actualFileType === ".pdf") {
    console.log("Processing as PDF file...");
    const pdfDoc = await getDocument({ data }).promise;

    let fullText = "";
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    // Save extracted text for debugging
    fs.writeFileSync("debug_extracted_text.txt", fullText, "utf-8");
    console.log("Full text saved to debug_extracted_text.txt");
    console.log(`Extracted ${fullText.length} characters from PDF`);

    return fullText.trim();
  }

  // Note: PPTX files are now converted to PDF before reaching this function
  // This section is kept for backward compatibility but should not be reached
  if (actualFileType === ".pptx" || actualFileType === ".ppt") {
    console.log(
      `Warning: ${actualFileType} file reached text extraction without conversion. This should not happen.`
    );
    return `PowerPoint Presentation: ${originalName}\n\nThis PowerPoint file should have been converted to PDF before reaching text extraction. Please check the conversion pipeline.`;
  }

  throw new Error(
    `Unsupported file type: ${ext}. Supported: .txt, .pdf, .pptx, .ppt`
  );
};

/**
 * Extracts and safely splits long text into chunks.
 * @param {string|Buffer} fileInput - Path to the file or file buffer
 * @param {string} originalName - Original filename (required when fileInput is a Buffer)
 * @param {number} chunkSize - Size of each chunk (default: 3800 chars)
 * @param {number} overlap - Overlapping characters (default: 300)
 * @returns {Promise<string[]>} Array of text chunks
 */
export const extractAndSplitText = async (
  fileInput,
  originalName = null,
  chunkSize = 3800,
  overlap = 300
) => {
  const fullText = await extractTextFromFile(fileInput, originalName);
  return splitWithOverlap(fullText, chunkSize, overlap);
};
