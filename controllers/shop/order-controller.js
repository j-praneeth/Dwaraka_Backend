const razorpay = require("../../helpers/razorpay");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const crypto = require('crypto');

const createOrder = async (req, res) => {
  try {
    const {
      userId,
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

    // // Create order in our database
    // const newOrder = new Order({
    //   userId: userId,
    //   cartId,
    //   cartItems: cartItems.map(item => ({
    //     productId: item.productId,
    //     quantity: item.quantity,
    //     price: Number(item.price),
    //     title: item.title
    //   })),
    //   addressInfo,
    //   orderStatus: "pending",
    //   paymentMethod: "razorpay",
    //   paymentStatus: "pending",
    //   totalAmount,
    //   orderDate: new Date(),
    //   orderUpdateDate: new Date(),
    // });

    // await newOrder.save();

    // Function to generate a custom Order ID
    const generateOrderId = () => {
      const randomString = Math.random().toString().substring(2, 24); // Generate a string of 22 digits
      return `DH${randomString}`; // Prepend "DH" to the random string
    };    
    
    // Create order in our database
    const moment = require('moment');
    const newOrder = new Order({
      _id: generateOrderId(), // Set the custom ID
      userId: userId,
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
      orderDate:  moment().format('DD-MM-YYYY, hh:mm A'),
      orderUpdateDate: moment().format('DD-MM-YYYY, hh:mm A'),
    });

    await newOrder.save();

    // We only get orderId at this stage
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `order_rcpt_${Date.now()}`
    });

    // Return response with the new order ID
    res.status(201).json({
      success: true,
      data: {
        orderId: newOrder._id, // This is the generated Order ID
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
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
    console.log(userId);

    // Verify that the requesting user is accessing their own orders
    // if (req.user._id.toString() !== userId) {
    //   return res.status(403).json({ 
    //     success: false, 
    //     message: "Unauthorized: Can only access your own orders" 
    //   });
    // }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'cartItems.productId',
        select: 'title image price salePrice'
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
    const order = await Order.findById(id).populate('userId');

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const updateOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location, trackingId, courierName } = req.body;

    // Validate input
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required"
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update tracking info
    order.trackingInfo = {
      status,
      location: location || order.trackingInfo?.location,
      updatedAt: new Date(),
      trackingId: trackingId || order.trackingInfo?.trackingId,
      courierName: courierName || order.trackingInfo?.courierName
    };

    // Update order status based on tracking status
    if (status === 'shipped') {
      order.orderStatus = 'shipped';
    } else if (status === 'delivered') {
      order.orderStatus = 'delivered';
    } else if (status === 'returned') {
      order.orderStatus = 'returned'; // Set order status to returned
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order tracking updated successfully",
      data: order
    });

  } catch (error) {
    console.error('Error updating order tracking:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update order tracking",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Request a return
const requestReturn = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, description, images } = req.body;
    const userId = req.user.id; // Extract userId from authenticated request

    // Validate input
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Return reason is required"
      });
    }

    const order = await Order.findById(orderId);
    
    // Validate order exists and belongs to user
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Not your order"
      });
    }

    // Create return request
    order.returnRequest = {
      status: 'pending',
      reason,
      description,
      images: images || [],
      requestDate: new Date(),
      pickupAddress: order.addressInfo // Default to delivery address
    };

    await order.save();

    res.status(200).json({
      success: true,
      message: "Return request submitted successfully",
      data: order
    });

  } catch (error) {
    console.error('Return request error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to submit return request",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


// Process return request (Admin only)
const processReturnRequest = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Update return request status
    order.returnRequest.status = 'accepted'; // Mark as accepted for processing
    await order.save();

    // Here you would integrate with your payment provider to process the refund
    // For example, using Razorpay's API to process the refund
    // Assuming refund is successful:
    order.refundStatus = 'completed'; // Mark refund as completed
    await order.save();

    res.status(200).json({ success: true, message: "Return processed successfully", data: order });
  } catch (error) {
    console.error('Error processing return request:', error);
    res.status(500).json({ success: false, message: "Failed to process return request" });
  }
};

// Update return tracking
const updateReturnTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location } = req.body;

    const order = await Order.findById(orderId);
    if (!order || !order.returnRequest) {
      return res.status(404).json({
        success: false,
        message: "Order or return request not found"
      });
    }

    order.returnRequest.returnTrackingInfo = {
      ...order.returnRequest.returnTrackingInfo,
      status,
      location,
      updatedAt: new Date()
    };

    if (status === 'delivered_to_warehouse') {
      // Process refund
      order.orderStatus = 'refunded';
      order.returnRequest.status = 'completed';
      // Here you would integrate with Razorpay refund API
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Return tracking updated",
      data: order
    });

  } catch (error) {
    console.error('Update return tracking error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update return tracking",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const getAllReturnRequests = async (req, res) => {
  try {
    const orders = await Order.find({ "returnRequest.status": { $ne: "completed" } })
      .populate('userId', 'userName email')
      .populate('cartItems.productId', 'title image price salePrice');

    if (!orders.length) {
      return res.status(404).json({ 
        success: false, 
        message: "No return requests found!" 
      });
    }

    const returnRequests = orders.map(order => ({
      orderId: order._id,
      userId: order.userId,
      returnRequest: order.returnRequest,
      cartItems: order.cartItems
    }));

    res.status(200).json({ 
      success: true, 
      data: returnRequests 
    });
  } catch (error) {
    console.error('Error fetching return requests:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch return requests",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

const cancelReturnRequest = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if there is a return request
    if (!order.returnRequest) {
      return res.status(400).json({
        success: false,
        message: "No return request to cancel",
      });
    }

    // Remove the returnRequest field
    order.returnRequest = undefined;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Return request canceled successfully",
      data: order,
    });
  } catch (error) {
    console.error('Error canceling return request:', error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel return request",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

const updateReturnStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.returnRequest) {
      return res.status(400).json({
        success: false,
        message: "No return request found for this order",
      });
    }

    order.returnRequest.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Return request status updated successfully",
      data: order,
    });
  } catch (error) {
    console.error('Error updating return request status:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update return request status",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

const updateRefundStatus = async (req, res) => {
  const { orderId } = req.params;
  const { refundStatus } = req.body;

  try {
    // Input validation
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!refundStatus) {
      return res.status(400).json({
        success: false,
        message: "Refund status is required",
      });
    }

    // Validate refund status
    const validStatuses = ['Inprocess', 'Refunded', 'Failed'];
    if (!validStatuses.includes(refundStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid refund status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Find and update the order
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update refund status
    order.refundStatus = refundStatus;

    // Optionally update order status if needed
    if (refundStatus === 'Refunded') {
      order.orderStatus = 'cancelled'; // Update order status to cancelled
    }
    
    // Save the changes
    await order.save();

    // Fetch the updated order with populated data
    const updatedOrder = await Order.findById(orderId)
      .populate('userId', 'userName email')
      .populate('cartItems.productId', 'title image price salePrice');

    res.status(200).json({
      success: true,
      message: "Refund status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating refund status:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update refund status",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

const getAllRefunds = async (req, res) => {
  try {
    // Fetching orders with refundStatus either "Inprocess" or "Refunded"
    const refunds = await Order.find({ refundStatus: { $in: ["Inprocess", "Refunded"] } })
      .populate('userId', 'userName email')
      .populate('cartItems.productId', 'title image price salePrice');

    if (!refunds.length) {
      return res.status(404).json({ success: false, message: "No refunds found!" });
    }

    res.status(200).json({ success: true, data: refunds });
  } catch (error) {
    console.error('Error fetching refunds:', error);
    res.status(500).json({ success: false, message: "Failed to fetch refunds" });
  }
};

const cancelOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Find the order by ID
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if the order can be cancelled
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    // Restore stock for each product in the canceled order
    await Promise.all(order.cartItems.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (product) {
        product.totalStock += item.quantity; // Restore stock count
        await product.save();
      }
    }));

    // Update the order status to cancelled
    order.orderStatus = "cancelled";
    order.refundStatus = "Inprocess"; // Set refund status to "In process"
    order.orderUpdateDate = new Date(); // Update the order update date

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
  updateOrderTracking,
  requestReturn,
  processReturnRequest,
  updateReturnTracking,
  getAllReturnRequests,
  cancelReturnRequest,
  updateReturnStatus,
  updateRefundStatus,
  getAllRefunds,
  cancelOrder
};
