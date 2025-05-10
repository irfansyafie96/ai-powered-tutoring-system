// src/utils/pdfOverride.js
import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
  process.env.PUBLIC_URL + "/pdfjs/pdf.worker.min.js";

console.log("[PDF Config] Worker initialized"); // Keep for verification
