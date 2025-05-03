import express from "express";
import cors from "cors";
import path from "path";
import notesRoutes from "./src/routes/notesRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/uploads", express.static(path.resolve("Uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
