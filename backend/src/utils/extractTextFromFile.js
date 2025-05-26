import fs from "fs";
import path from "path";
import pkg from "pdfjs-dist/legacy/build/pdf.js";
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
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromFile = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".txt") {
    return await fs.promises.readFile(filePath, "utf-8");
  }

  if (ext === ".pdf") {
    const data = new Uint8Array(await fs.promises.readFile(filePath));
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

    return fullText.trim();
  }

  throw new Error("Unsupported file type for text extraction");
};

/**
 * Extracts and safely splits long text into chunks.
 * @param {string} filePath - Path to the file
 * @param {number} chunkSize - Size of each chunk (default: 3800 chars)
 * @param {number} overlap - Overlapping characters (default: 300)
 * @returns {Promise<string[]>} Array of text chunks
 */
export const extractAndSplitText = async (
  filePath,
  chunkSize = 3800,
  overlap = 300
) => {
  const fullText = await extractTextFromFile(filePath);
  return splitWithOverlap(fullText, chunkSize, overlap);
};
