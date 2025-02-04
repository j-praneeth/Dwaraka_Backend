const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const razorpay = require("../../helpers/razorpay");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

// Protect all order routes with authentication.
router.use(authMiddleware);

router.post("/create", createOrder);
router.post("/capture", capturePayment);
router.get("/user/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

// Add a test route for Razorpay credentials
router.get("/test-razorpay", async (req, res) => {
  try {
    // Try to fetch Razorpay settings
    const settings = await razorpay.preferences.fetch();
    res.json({
      success: true,
      message: "Razorpay credentials are valid",
      merchantName: settings.merchant_name
    });
  } catch (error) {
    console.error('Razorpay test failed:', error);
    res.status(500).json({
      success: false,
      message: "Razorpay credentials are invalid",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
