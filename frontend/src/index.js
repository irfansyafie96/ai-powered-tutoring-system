import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { pdfjs } from "react-pdf";
import "./index.css";

console.log("[DEBUG] PDF.js version:", pdfjs.version);
pdfjs.GlobalWorkerOptions.workerSrc =
  process.env.PUBLIC_URL + "/pdfjs/pdf.worker.min.js";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
