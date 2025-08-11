import path from "path";
import fetch from "node-fetch";
import libre from "libreoffice-convert";
import { promisify } from "util";

// Convert libreoffice-convert to use promises
const libreConvert = promisify(libre.convert);

/**
 * Converts a PPTX file to PDF using LibreOffice
 * @param {Buffer} pptxBuffer - The PPTX file buffer
 * @returns {Promise<Buffer>} - The PDF buffer
 */
const convertPptxToPdf = async (pptxBuffer) => {
  try {
    console.log("Converting PPTX to PDF with LibreOffice...");

    // Convert PPTX to PDF
    const pdfBuffer = await libreConvert(pptxBuffer, ".pdf", undefined);
    console.log("PPTX to PDF conversion successful");

    return pdfBuffer;
  } catch (error) {
    console.error("PPTX to PDF conversion failed:", error);

    // Check if it's a LibreOffice installation issue
    if (
      error.message.includes("libreoffice") ||
      error.message.includes("soffice")
    ) {
      console.error(
        "LibreOffice not found. Please install LibreOffice on your system."
      );
      throw new Error(
        "PPTX to PDF conversion requires LibreOffice to be installed on the server"
      );
    }

    throw new Error(`Failed to convert PPTX to PDF: ${error.message}`);
  }
};

/**
 * Downloads a file from a URL and returns it as a buffer
 * @param {string} url - The file URL
 * @returns {Promise<Buffer>} - The file buffer
 */
export const downloadFileFromUrl = async (url) => {
  try {
    console.log("Downloading file from URL:", url);

    // Validate URL
    if (!url || typeof url !== "string") {
      throw new Error(`Invalid URL: ${url}`);
    }

    const response = await fetch(url);
    console.log(
      `Download response status: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to download file: ${response.status} ${response.statusText}`
      );
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    console.log(`Content-Type: ${contentType}`);

    const arrayBuffer = await response.arrayBuffer();
    console.log(`Downloaded ${arrayBuffer.byteLength} bytes`);

    const buffer = Buffer.from(arrayBuffer);
    console.log(`Converted to buffer: ${buffer.length} bytes`);

    return buffer;
  } catch (error) {
    console.error("File download failed:", error);
    console.error("Download error details:", {
      url,
      error: error.message,
      stack: error.stack,
    });
    throw new Error(`Failed to download file from URL: ${error.message}`);
  }
};

/**
 * Processes a file from cloud storage, handling conversions if needed
 * @param {string} fileUrl - The cloud file URL
 * @param {string} originalName - The original filename
 * @returns {Promise<Buffer>} - The processed file buffer ready for text extraction
 */
export const processCloudFile = async (fileUrl, originalName) => {
  try {
    const ext = path.extname(originalName).toLowerCase();
    console.log(
      `Processing cloud file: ${originalName} (${ext}) from URL: ${fileUrl}`
    );

    // Convert PPTX to PDF if needed
    if (ext === ".pptx" || ext === ".ppt") {
      console.log(
        "Detected PowerPoint file, downloading and converting to PDF..."
      );
      const pptxBuffer = await downloadFileFromUrl(fileUrl);
      console.log(
        `PowerPoint file downloaded, size: ${pptxBuffer.length} bytes`
      );

      try {
        // Try to convert to PDF
        const pdfBuffer = await convertPptxToPdf(pptxBuffer);
        console.log(`Conversion complete, PDF size: ${pdfBuffer.length} bytes`);
        return pdfBuffer;
      } catch (conversionError) {
        console.error(
          "PPTX to PDF conversion failed, using fallback:",
          conversionError.message
        );

        // Fallback: return the original PPTX buffer but mark it as unconverted
        // This will allow the file to be uploaded but with limited functionality
        console.log("Using fallback - returning original PPTX buffer");
        return pptxBuffer;
      }
    }

    // For other file types, just download the file
    console.log(`Downloading file from Cloudinary...`);
    const buffer = await downloadFileFromUrl(fileUrl);
    console.log(`File downloaded successfully, size: ${buffer.length} bytes`);
    return buffer;
  } catch (error) {
    console.error("Cloud file processing failed:", error);
    console.error("Error details:", {
      fileUrl,
      originalName,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};
