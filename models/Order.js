const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cartItems: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    title: { type: String, required: true }
  }],
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, required: true },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'confirmed', 'rejected', 'returned', 'delivered'], 
    default: 'pending',
    required: true 
  },
  addressInfo: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    phone: { type: String, required: true },
    notes: String
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
      default: 'pending'
    },
    reason: String,
    description: String,
    images: [String],
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
    default: 'Inprocess',
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add indexes for better query performance
OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ refundStatus: 1 });

module.exports = mongoose.model("Order", OrderSchema);
