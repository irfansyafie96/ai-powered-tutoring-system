import fs from "fs";
import path from "path";
import pkg from "pdfjs-dist/legacy/build/pdf.js";

const { getDocument } = pkg;

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
      const pageText = content.items.map((item) => item.str).join("");
      fullText += pageText + "\n";
    }

    return fullText.trim();
  }

  throw new Error("Unsupported file type for text extraction");
};
