import path from "path";
import fetch from "node-fetch";

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
    const ext = path.extname(originalName).toLowerCase();

    // Convert PPTX to PDF if needed
    // if (ext === ".pptx") {
    //   console.log("Detected PPTX file, converting to PDF...");
    //   return await convertPptxToPdfWithApi(fileUrl);
    // }

    // For other file types, just download the file
    return await downloadFileFromUrl(fileUrl);
  } catch (error) {
    console.error("Cloud file processing failed:", error);
    throw error;
  }
};
