import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { pdfjs } from "react-pdf";
import "./index.css";

console.log("pdfjs.version =", pdfjs.version);
pdfjs.GlobalWorkerOptions.workerSrc = `//cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
