import path from "path";

export const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

    const encodeFileName = encodeURIComponent(req.file.filename);

    // const safeFilename = encodeURIComponent(req.file.filename);

    const fileUrl = `${baseUrl}/uploads/${encodeFileName}`;

    // const fileUrl = `/uploads/${encodeURIComponent(req.file.filename)}`;

    // const summary = "Placeholder summary.";

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
