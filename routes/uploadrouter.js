import express from "express";
import multer from "multer";
import cloudinary from "cloudinary";
import streamifier from "streamifier";

const uploadRouter = express.Router();

// Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Use Memory Storage for Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

uploadRouter.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Upload image to Cloudinary
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.v2.uploader.upload_stream(
          { resource_type: "image", folder: "dwaraka_handlooms" },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);
    res.json({ imageUrl: result.secure_url, message: "Image uploaded successfully" });

  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ error: "File upload failed" });
  }
});

export default uploadRouter;
