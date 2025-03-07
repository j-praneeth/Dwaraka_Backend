const express = require("express");
const { getSizesByCategory } = require("../../controllers/shop/size-controller");

const router = express.Router();

router.get("/:category/:productId?", getSizesByCategory);

module.exports = router; 