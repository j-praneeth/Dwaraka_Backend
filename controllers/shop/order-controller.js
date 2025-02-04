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

    // Validate address info
    if (!addressInfo.address || !addressInfo.city || !addressInfo.pincode || !addressInfo.phone) {
      return res.status(400).json({
        success: false,
        message: "All address fields are required (address, city, pincode, phone)"
      });
    }

    // Validate phone number format (basic validation)
    if (!/^\d{10}$/.test(addressInfo.phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format. Must be 10 digits"
      });
    }

    // Validate pincode format
    if (!/^\d{6}$/.test(addressInfo.pincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode format. Must be 6 digits"
      });
    }

    // Validate products and calculate total
    let calculatedTotal = 0;
    for (const item of cartItems) {
      if (!item.productId || !item.quantity || !item.price || !item.title) {
        return res.status(400).json({
          success: false,
          message: `Invalid cart item data: ${JSON.stringify(item)}`
        });
      }

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

      // Verify price matches with current product price or salePrice
      const expectedPrice = product.salePrice || product.price;
      if (Number(expectedPrice) !== Number(item.price)) {
        return res.status(400).json({
          success: false,
          message: `Price mismatch for product: ${product.title}. Expected: ${expectedPrice}, Got: ${item.price}`
        });
      }

      calculatedTotal += Number(item.price) * item.quantity;
    }

    // Verify total amount
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Total amount mismatch. Expected: ${calculatedTotal}, Received: ${totalAmount}`
      });
    }

    // Validate cartId if provided
    if (cartId) {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found"
        });
      }
    }

    // Create Razorpay order with better error handling
    let razorpayOrder;
    try {
      const options = {
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        receipt: `order_rcpt_${Date.now()}`,
        notes: {
          cartId: cartId || '',
          userId: req.user._id.toString()
        }
      };

      razorpayOrder = await razorpay.orders.create(options);
      
      if (!razorpayOrder || !razorpayOrder.id) {
        throw new Error('Failed to create Razorpay order');
      }
    } catch (razorpayError) {
      console.error('Razorpay order creation failed:', razorpayError);
      return res.status(500).json({
        success: false,
        message: "Payment gateway error",
        error: process.env.NODE_ENV === 'development' ? razorpayError.message : 'Payment service unavailable'
      });
    }

    // Create order in our database
    const newOrder = new Order({
      userId: req.user._id,
      cartId,
      cartItems: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
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
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
        debug: {
          generated: generatedSignature,
          received: razorpaySignature,
          orderIdUsed: razorpayOrderId,
          paymentId: razorpayPaymentId
        }
      });
    }

    try {
      // Verify payment with Razorpay
      const payment = await razorpay.payments.fetch(razorpayPaymentId);
      
      if (payment.status !== 'captured') {
        order.paymentStatus = "failed";
        await order.save();
        return res.status(400).json({
          success: false,
          message: "Payment not captured",
          paymentStatus: payment.status
        });
      }

      // Update order status
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;
      order.orderUpdateDate = new Date();

      // Update product stock and clear cart
      await Promise.all([
        ...order.cartItems.map(async (item) => {
          const product = await Product.findById(item.productId);
          if (product) {
            product.totalStock -= item.quantity;
            await product.save();
          }
        }),
        order.cartId ? Cart.findByIdAndDelete(order.cartId) : Promise.resolve()
      ]);

      await order.save();

      res.status(200).json({
        success: true,
        message: "Payment verified and order confirmed",
        data: order
      });

    } catch (razorpayError) {
      console.error('Razorpay payment verification failed:', razorpayError);
      order.paymentStatus = "failed";
      await order.save();
      return res.status(500).json({
        success: false,
        message: "Failed to verify payment with Razorpay",
        error: razorpayError.message
      });
    }

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

    // Verify that the requesting user is accessing their own orders
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized: Can only access your own orders" 
      });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('cartItems.productId', 'title image price'); // Populate product details

    if (!orders.length) {
      return res.status(404).json({ 
        success: false, 
        message: "No orders found!" 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: orders 
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch orders",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
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
