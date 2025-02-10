const express = require("express");
const {
  fetchCategories,
  createDefaultCategories,
} = require("../../controllers/shop/category-controller");

const router = express.Router();

router.get("/", fetchCategories); // Fetch categories
router.post("/create-default", createDefaultCategories); // Create default categories

module.exports = router; 