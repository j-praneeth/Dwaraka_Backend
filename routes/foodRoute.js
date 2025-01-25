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
import authMiddleware from "../middleware/auth.js";
import path from "path";
import fs from "fs";

const foodRouter = express.Router();

// Image Storage Engine
const uploadPath = path.join('/tmp', 'uploads');  // Vercel's writable temp directory

// Ensure the upload directory exists in /tmp
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath); // Save files to /tmp/uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  }
});

const upload = multer({ storage: storage });

foodRouter.post("/add", upload.single("image"), authMiddleware, addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", authMiddleware, removeFood);

export default foodRouter;
