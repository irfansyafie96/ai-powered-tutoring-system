import path from "path";
import fs from "fs";
import { promisify } from "util";
import libre from "libreoffice-convert";

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

    let outputFileName, outputPath, fileUrl;

    if (ext === ".pptx") {
      outputFileName = req.file.filename.replace(/\.pptx$/, ".pdf");
      outputPath = path.join(uploadsDir, outputFileName);

      const fileBuf = await fs.promises.readFile(inputPath);

      const pdfBuf = await convertAsync(fileBuf, ".pdf", undefined);

      await fs.promises.writeFile(outputPath, pdfBuf);

      fileUrl = `${baseUrl}/uploads/${encodeURIComponent(outputFileName)}`;
    } else {
      fileUrl = `${baseUrl}/uploads/${encodeURIComponent(req.file.filename)}`;
    }

    res.status(201).json({
      note: {
        fileUrl,
        summary: "Placeholder",
      },
    });
  } catch (error) {
    console.error("Error uploading note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
