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

      // Verify price matches with salePrice (if available) or regular price
      const validPrice = product.salePrice > 0 ? product.salePrice : product.price;
      if (Number(validPrice) !== Number(item.price)) {
        return res.status(400).json({
          success: false,
          message: `Price mismatch for product: ${product.title}. Expected: ${validPrice}, Got: ${item.price}`
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
    });

    await newOrder.save();

    // We only get orderId at this stage
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `order_rcpt_${Date.now()}`
    });

    res.status(201).json({
      success: true,
      data: {
        orderId: newOrder._id,
        razorpayOrderId: razorpayOrder.id,  // This is needed for payment
        amount: razorpayOrder.amount,
        keyId: process.env.RAZORPAY_KEY_ID
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
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, orderId } = req.body;

    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details"
      });
    }

    // 1. Find our order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // 2. Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      order.paymentStatus = "failed";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    // 3. Verify payment with Razorpay
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

    // 4. If everything is valid, update order
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.razorpayOrderId = razorpayOrderId;
    order.razorpayPaymentId = razorpayPaymentId;
    order.razorpaySignature = razorpaySignature;
    order.orderUpdateDate = new Date();

    // 5. Update product stock and clear cart
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
      message: "Payment successful",
      data: order
    });

  } catch (error) {
    console.error('Payment capture error:', error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
      .populate({
        path: 'cartItems.productId',
        select: 'title image price salePrice' // Added image and salePrice to populated fields
      });

    if (!orders.length) {
      return res.status(404).json({ 
        success: false, 
        message: "No orders found!" 
      });
    }

    // Format the response to include all necessary product details
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      cartItems: order.cartItems.map(item => ({
        ...item,
        product: {
          title: item.productId?.title || item.title,
          image: item.productId?.image || '',
          price: item.productId?.price || item.price,
          salePrice: item.productId?.salePrice || 0
        }
      }))
    }));

    res.status(200).json({ 
      success: true, 
      data: formattedOrders
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

    const order = await Order.findById(id)
      .populate({
        path: 'cartItems.productId',
        select: 'title image price salePrice'
      });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found!" 
      });
    }

    // Format the response to include product details
    const formattedOrder = {
      ...order.toObject(),
      cartItems: order.cartItems.map(item => ({
        ...item,
        product: {
          title: item.productId?.title || item.title,
          image: item.productId?.image || '',
          price: item.productId?.price || item.price,
          salePrice: item.productId?.salePrice || 0
        }
      }))
    };

    res.status(200).json({ 
      success: true, 
      data: formattedOrder 
    });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch order details",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
