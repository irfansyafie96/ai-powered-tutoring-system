import path from "path";
import fs from "fs";
import { promisify } from "util";
import libre from "libreoffice-convert";
import { extractTextFromFile } from "../utils/extractTextFromFile.js";
import { summarizeWithDeepSeek } from "../utils/summarizeWithDeepSeek.js";

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
