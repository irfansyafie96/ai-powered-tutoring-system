import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary using the URL format
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ai-tutoring-system",
    allowed_formats: ["pdf", "docx", "pptx", "txt"],
    resource_type: "auto",
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

// Create multer upload instance
const upload = multer({ storage: storage });

export { cloudinary, upload };
