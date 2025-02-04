const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
  cartItems: [{ 
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number,
    title: String
  }],
  addressInfo: {
    address: String,
    city: String,
    pincode: String,
    phone: String
  },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'],
    default: 'pending' 
  },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'pending' },
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  orderUpdateDate: { type: Date },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  trackingInfo: {
    status: String,
    location: String,
    updatedAt: Date,
    trackingId: String,
    courierName: String
  },
  returnRequest: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },
    reason: String,
    description: String,
    images: [String], // URLs of return item images
    requestDate: Date,
    processedDate: Date,
    pickupDate: Date,
    refundAmount: Number,
    refundId: String,
    pickupAddress: {
      address: String,
      city: String,
      pincode: String,
      phone: String
    },
    returnTrackingInfo: {
      status: String,
      location: String,
      updatedAt: Date,
      trackingId: String,
      courierName: String
    }
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
