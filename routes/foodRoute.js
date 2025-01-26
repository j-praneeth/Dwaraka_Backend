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


// import express from "express"
// import { addFood, listFood, removeFood } from "../controllers/foodController.js"
// import multer from "multer"
// import authMiddleware from "../middleware/auth.js"
// import path from "path"
// import fs from "fs"

// const foodRouter = express.Router()

// // Ensure upload directory exists
// const uploadDir = path.join(process.cwd(), "uploads")
// try {
//   if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true })
//   }
// } catch (err) {
//   console.error(`Error creating upload directory: ${err.message}`)
// }

// // Image Storage Engine
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadDir)
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
//     cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
//   },
// })

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png|gif/
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
//     const mimetype = filetypes.test(file.mimetype)
//     if (extname && mimetype) {
//       return cb(null, true)
//     } else {
//       cb(new Error("Error: Images Only!"))
//     }
//   },
// }).single("image")

// // Update the routes
// foodRouter.post("/add", authMiddleware, (req, res) => {
//   upload(req, res, (err) => {
//     if (err instanceof multer.MulterError) {
//       console.error("Multer error:", err)
//       return res.status(500).json({ message: "File upload error", error: err.message })
//     } else if (err) {
//       console.error("Unknown error:", err)
//       return res.status(500).json({ message: "Unknown error", error: err.message })
//     }

//     // If file upload is successful, proceed with adding food
//     addFood(req, res).catch((error) => {
//       console.error("Error in addFood:", error)
//       res.status(500).json({ message: "Error adding food", error: error.message })
//     })
//   })
// })

// foodRouter.get("/list", listFood)
// foodRouter.post("/remove", authMiddleware, removeFood)

// export default foodRouter

import express from "express"
import { addFood, listFood, removeFood } from "../controllers/foodController.js"
import multer from "multer"
import authMiddleware from "../middleware/auth.js"
import path from "path"
import fs from "fs"

const foodRouter = express.Router()

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "tmp", "uploads")
try {
  fs.mkdirSync(uploadDir, { recursive: true })
} catch (err) {
  console.error(`Error creating upload directory: ${err.message}`)
}

// Image Storage Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)
    if (extname && mimetype) {
      return cb(null, true)
    } else {
      cb(new Error("Error: Images Only!"))
    }
  },
}).single("image")

// Update the routes
foodRouter.post("/add", authMiddleware, (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err)
      return res.status(500).json({ success: false, message: "File upload error", error: err.message })
    } else if (err) {
      console.error("Unknown error:", err)
      return res.status(500).json({ success: false, message: "Unknown error", error: err.message })
    }

    // If file upload is successful, proceed with adding food
    addFood(req, res).catch((error) => {
      console.error("Error in addFood:", error)
      res.status(500).json({ success: false, message: "Error adding food", error: error.message })
    })
  })
})

foodRouter.get("/list", listFood)
foodRouter.post("/remove", authMiddleware, removeFood)

export default foodRouter

