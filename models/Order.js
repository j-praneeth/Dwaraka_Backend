const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  _id: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cartItems: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number,
    title: String
  }],
  totalAmount: Number,
  orderDate: { type: Date, default: Date.now },
  paymentMethod: String,
  paymentStatus: String,
  orderStatus: { type: String, enum: ['pending', 'confirmed', 'rejected', 'returned', 'delivered', 'cancelled'], default: 'pending' },
  addressInfo: {
    address: String,
    city: String,
    pincode: String,
    phone: String,
    notes: String,
  },
  cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
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
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
    },
    reason: String,
    description: String,
    images: [String], // URLs of return item images
    requestDate: Date,
    processedDate: Date,
    pickupDate: Date,
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
  },
  refundStatus: {
    type: String,
    enum: ['Inprocess', 'Refunded', 'Failed'],
    default: 'Inprocess'
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
