// import express from "express";
// import { addFood, listFood, removeFood } from "../controllers/foodController.js";
// import multer from "multer";
// import authMiddleware from "../middleware/auth.js";

// const foodRouter = express.Router();

// // Image Storage Engine

// const storage= multer.diskStorage({
//     destination:"uploads",
//     filename:(req,file,cb)=>{
//         return cb(null,`${Date.now()}${file.originalname}`)
//     }
// })

// const upload= multer({storage:storage})

// foodRouter.post("/add",upload.single("image"),authMiddleware,addFood);
// foodRouter.get("/list",listFood);
// foodRouter.post("/remove",authMiddleware,removeFood);

// export default foodRouter;


// import express from "express";
// import { addFood, listFood, removeFood } from "../controllers/foodController.js";
// import multer from "multer";
// import cloudinary from "cloudinary";
// import authMiddleware from "../middleware/auth.js";
// import streamifier from "streamifier"; // Required for buffer uploads

// const foodRouter = express.Router();

// // Cloudinary Configuration
// cloudinary.v2.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUD_API_KEY,
//     api_secret: process.env.CLOUD_API_SECRET,
// });

// // Use Memory Storage for Multer
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// // Handle Image Upload and Call addFood
// foodRouter.post("/add", upload.single("image"), authMiddleware, async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: "No image file uploaded" });
//         }

//         // Upload image to Cloudinary
//         const streamUpload = (req) => {
//             return new Promise((resolve, reject) => {
//                 let stream = cloudinary.v2.uploader.upload_stream(
//                     { resource_type: "image", folder: "dwaraka_handlooms" }, // Save in Cloudinary folder
//                     (error, result) => {
//                         if (result) {
//                             resolve(result);
//                         } else {
//                             reject(error);
//                         }
//                     }
//                 );
//                 streamifier.createReadStream(req.file.buffer).pipe(stream);
//             });
//         };

//         const result = await streamUpload(req);
        
//         // Now call addFood with the image URL
//         req.body.imageUrl = result.secure_url; // Pass the Cloudinary URL in request body
//         await addFood(req, res); // Call the addFood controller function

//     } catch (error) {
//         console.error("File upload error:", error);
//         res.status(500).json({ error: "File upload failed" });
//     }
// });

// // Other Routes
// foodRouter.get("/list", listFood);
// foodRouter.post("/remove", authMiddleware, removeFood);

// export default foodRouter;


// import express from "express";
// import { addFood, listFood, removeFood } from "../controllers/foodController.js";
// import authMiddleware from "../middleware/auth.js";
// import multer from "multer";

// const foodRouter = express.Router();
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// foodRouter.post("/add", upload.single("image"), authMiddleware, async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No image file uploaded" });
//     }

//     // Send image to the upload API first
//     const formData = new FormData();
//     formData.append("image", req.file.buffer, { filename: req.file.originalname });

//     const response = await fetch(`${process.env.BACKEND_URL}/api/upload`, {
//       method: "POST",
//       body: formData,
//     });

//     const data = await response.json();
//     if (!response.ok) {
//       throw new Error(data.error || "Image upload failed");
//     }

//     // Pass imageUrl to addFood controller
//     req.body.imageUrl = data.imageUrl;
//     await addFood(req, res);
    
//   } catch (error) {
//     console.error("File upload error:", error);
//     res.status(500).json({ error: error.message || "File upload failed" });
//   }
// });

// // Other routes
// foodRouter.get("/list", listFood);
// foodRouter.post("/remove", authMiddleware, removeFood);

// export default foodRouter;



const express = require("express");
const multer = require("multer");
const { addFood, listFood, removeFood } = require("../controllers/foodController.js");
const authMiddleware = require("../middleware/auth.js");
const uploadRouter = require("./uploadrouter.js");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Image upload route
router.use("/upload", uploadRouter);

// Add food route with image upload
router.post("/add", upload.single("image"), authMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // Send image to the upload API first
    const formData = new FormData();
    formData.append("image", req.file.buffer, { filename: req.file.originalname });

    const response = await fetch(`${process.env.BACKEND_URL}/api/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Image upload failed");
    }

    // Pass imageUrl to addFood controller
    req.body.imageUrl = data.imageUrl;
    await addFood(req, res);
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ error: error.message || "File upload failed" });
  }
});

// Other routes
router.get("/list", listFood);
router.post("/remove", authMiddleware, removeFood);

module.exports = router;
