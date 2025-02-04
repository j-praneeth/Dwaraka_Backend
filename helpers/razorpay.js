// const paypal = require("paypal-rest-sdk");

// paypal.configure({
//     mode: "sandbox", // or "live"
//     client_id: process.env.PAYPAL_CLIENT_ID,
//     client_secret: process.env.PAYPAL_CLIENT_SECRET
// });

// module.exports = paypal;


const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;
