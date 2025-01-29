// const cloudinary = require("cloudinary").v2;
// const multer = require("multer");

// cloudinary.config({
//   cloud_name: "dvrjlvuaf",
//   api_key: "247417563342764",
//   api_secret: "VNuoBwpoBkQaPJre1h9bGos_hGg",
// });

// // cloudinary.config({
// //   cloud_name: process.env.CLOUD_NAME,
// //   api_key: process.env.API_KEY,
// //   api_secret: process.env.API_SECRET,
// // });

// const storage = new multer.memoryStorage();

// async function imageUploadUtil(file) {
//   const result = await cloudinary.uploader.upload(file, {
//     resource_type: "auto",
//   });

//   return result;
// }

// const upload = multer({ storage });

// module.exports = { upload, imageUploadUtil };

require("dotenv").config(); // Load environment variables

const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
