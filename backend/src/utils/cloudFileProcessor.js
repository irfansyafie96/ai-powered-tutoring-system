import { promisify } from "util";
import libre from "libreoffice-convert";
import fs from "fs";
import path from "path";
import os from "os";

const convertAsync = promisify(libre.convert);

/**
 * Converts a PPTX file buffer to PDF buffer
 * @param {Buffer} pptxBuffer - The PPTX file buffer
 * @returns {Promise<Buffer>} - The PDF buffer
 */
export const convertPptxToPdf = async (pptxBuffer) => {
  try {
    console.log("Converting PPTX to PDF...");
    const pdfBuffer = await convertAsync(pptxBuffer, ".pdf", undefined);
    console.log("PPTX to PDF conversion successful");
    return pdfBuffer;
  } catch (error) {
    console.error("PPTX to PDF conversion failed:", error);
    throw new Error("Failed to convert PPTX to PDF");
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
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("File downloaded successfully");
    return buffer;
  } catch (error) {
    console.error("File download failed:", error);
    throw new Error("Failed to download file from URL");
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
    // Download the file
    const fileBuffer = await downloadFileFromUrl(fileUrl);
    const ext = path.extname(originalName).toLowerCase();

    // Convert PPTX to PDF if needed
    if (ext === ".pptx") {
      console.log("Detected PPTX file, converting to PDF...");
      return await convertPptxToPdf(fileBuffer);
    }

    // Return original buffer for other file types
    return fileBuffer;
  } catch (error) {
    console.error("Cloud file processing failed:", error);
    throw error;
  }
};
