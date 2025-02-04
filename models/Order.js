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
  orderStatus: { type: String, default: 'pending' },
  paymentMethod: { type: String, required: true },
  paymentStatus: { type: String, default: 'pending' },
  totalAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  orderUpdateDate: { type: Date },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
