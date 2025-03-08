const express = require("express");

const {
  addProductReview,
  getProductReviews,
  getOrderReviews,
} = require("../../controllers/shop/product-review-controller");

const router = express.Router();

router.post("/:orderId/add", addProductReview);
router.get("/:productId", getProductReviews);
router.get("/order/:orderId", getOrderReviews);

module.exports = router;
