const razorpay = require("../../helpers/razorpay");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const crypto = require('crypto');

const createOrder = async (req, res) => {
  try {
    const {
      cartItems,
      addressInfo,
      totalAmount,
      cartId,
    } = req.body;

    // Basic validation
    if (!cartItems?.length || !addressInfo || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required order information"
      });
    }

    // Validate products and calculate total
    let calculatedTotal = 0;
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      // Check if product is in stock
      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.title}. Available: ${product.totalStock}`
        });
      }

      // Verify price matches with current product price
      if (product.price !== item.price) {
        return res.status(400).json({
          success: false,
          message: `Price mismatch for product: ${product.title}`
        });
      }

      calculatedTotal += item.price * item.quantity;
    }

    // Verify total amount
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) { // Using small delta for floating point comparison
      return res.status(400).json({
        success: false,
        message: `Total amount mismatch. Expected: ${calculatedTotal}, Received: ${totalAmount}`
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(totalAmount * 100), // Amount in paise
      currency: "INR",
      receipt: `order_rcpt_${Date.now()}`,
      notes: {
        cartId: cartId || '',
        userId: req.user._id.toString()
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create order in our database
    const newOrder = new Order({
      userId: req.user._id,
      cartId,
      cartItems: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        title: item.title
      })),
      addressInfo,
      orderStatus: "pending",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      totalAmount,
      orderDate: new Date(),
      orderUpdateDate: new Date(),
      razorpayOrderId: razorpayOrder.id
    });

    await newOrder.save();

    // Return the order details needed by frontend
    res.status(201).json({
      success: true,
      data: {
        orderId: newOrder._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        prefill: {
          name: req.user.userName,
          email: req.user.email,
        }
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      orderId
    } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification details"
      });
    }

    // Find the order first
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Verify payment signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // Verify payment status with Razorpay
    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    
    if (payment.status !== 'captured') {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Payment not captured"
      });
    }

    // Update order status
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.orderUpdateDate = new Date();

    // Update product stock
    for (const item of order.cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      if (product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.title}`
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    // Clear cart if exists
    if (order.cartId) {
      await Cart.findByIdAndDelete(order.cartId);
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed",
      data: order
    });
  } catch (error) {
    console.error('Payment capture error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to capture payment",
      error: error.message
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({ success: false, message: "No orders found!" });
    }

    res.status(200).json({ success: true, data: orders });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found!" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Some error occurred!" });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
