import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { pdfjs } from "react-pdf";
import "./index.css";

const container = document.getElementById("root");
const root = createRoot(container);

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
