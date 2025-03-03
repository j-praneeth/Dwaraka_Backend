const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const razorpay = require("../../helpers/razorpay");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  capturePayment,
  updateOrderTracking,
  requestReturn,
  processReturnRequest,
  updateReturnTracking,
  getAllReturnRequests,
  cancelReturnRequest,
  updateReturnStatus,
  updateRefundStatus,
  getAllRefunds
} = require("../../controllers/shop/order-controller");

const router = express.Router();

// Protect all order routes with authentication.
router.use(authMiddleware);

router.post("/create", createOrder);
router.post("/capture", capturePayment);
router.get("/user/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

// New route for fetching all return requests
router.get("/returns", getAllReturnRequests);

// New route for canceling a return request
router.delete("/return/:orderId/cancel", cancelReturnRequest);

// Update order tracking - Protected for admin only
router.put("/tracking/:orderId", updateOrderTracking);

// Return routes
router.post("/return/request/:orderId", requestReturn);
router.post("/return/:orderId/process", processReturnRequest);
router.put("/return/:orderId/tracking", updateReturnTracking);

// New route for updating return status
router.put("/return/:orderId", updateReturnStatus);

// New route for updating refund status
router.put("/refund/:orderId", updateRefundStatus);

// New route for fetching refunds
router.get("/refunds", getAllRefunds);

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
