// const paypal = require("paypal-rest-sdk");

// paypal.configure({
//     mode: "sandbox", // or "live"
//     client_id: process.env.PAYPAL_CLIENT_ID,
//     client_secret: process.env.PAYPAL_CLIENT_SECRET
// });

// module.exports = paypal;


const Razorpay = require("razorpay");

// Add error handling and validation
const initializeRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be provided in environment variables');
  }

  return new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
  });
};

let razorpay;
try {
  razorpay = initializeRazorpay();
} catch (error) {
  console.error('Failed to initialize Razorpay:', error);
  process.exit(1); // Exit if Razorpay can't be initialized
}

module.exports = razorpay;
