import path from "path";

export const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `${process.env.BASE_URL}/uploads/${path.basename(
      req.file.filename
    )}`;

    const summary = "Placeholder summary.";

    res.status(201).json({
      note: {
        fileUrl,
        summary,
      },
    });
  } catch (error) {
    console.error("Error uploading note:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
