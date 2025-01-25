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


import express from "express";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";
import multer from "multer";
import cloudinary from "cloudinary";
import authMiddleware from "../middleware/auth.js";
import streamifier from "streamifier"; // Required for buffer uploads

const foodRouter = express.Router();

// Cloudinary Configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

// Use Memory Storage for Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Handle Image Upload and Call addFood
foodRouter.post("/add", upload.single("image"), authMiddleware, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image file uploaded" });
        }

        // Upload image to Cloudinary
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.v2.uploader.upload_stream(
                    { resource_type: "image", folder: "dwaraka_handlooms" }, // Save in Cloudinary folder
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
        
        // Now call addFood with the image URL
        req.body.imageUrl = result.secure_url; // Pass the Cloudinary URL in request body
        await addFood(req, res); // Call the addFood controller function

    } catch (error) {
        console.error("File upload error:", error);
        res.status(500).json({ error: "File upload failed" });
    }
});

// Other Routes
foodRouter.get("/list", listFood);
foodRouter.post("/remove", authMiddleware, removeFood);

export default foodRouter;
