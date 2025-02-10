const express = require("express");

const {
  getFilteredProducts,
  getProductDetails,
  getProductsByCategory,
} = require("../../controllers/shop/products-controller");

const router = express.Router();

router.get("/get", getFilteredProducts);
router.get("/get/:id", getProductDetails);
router.get("/category/:category", getProductsByCategory);

module.exports = router;
