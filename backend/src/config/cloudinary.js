import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary using the URL format
cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL,
});

// Configure Cloudinary storage for ALL file types
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ai-tutoring-system",
    resource_type: "raw", // Use raw for all document files
    // Remove format restrictions - let Cloudinary handle it automatically
    // format: "auto", // This was causing issues
  },
});

// Create a single multer instance for all files
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("File upload attempt:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    // Allow all document types
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
      "application/vnd.ms-powerpoint", // ppt
      "text/plain",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      console.log("File type accepted:", file.mimetype);
      cb(null, true);
    } else {
      console.log("File type rejected:", file.mimetype);
      cb(
        new Error(
          `File type ${
            file.mimetype
          } not allowed. Allowed types: ${allowedMimeTypes.join(", ")}`
        )
      );
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export { cloudinary, upload };
