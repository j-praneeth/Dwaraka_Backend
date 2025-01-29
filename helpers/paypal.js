// // const paypal = require("paypal-rest-sdk");

// // paypal.configure({
// //   mode: "",
// //   client_id: "",
// //   client_secret: "",
// // });

// // module.exports = paypal;

const paypal = require("paypal-rest-sdk");

// paypal.configure({
//     mode: "sandbox", // or "live"
//     client_id: 'Aey4aBX4j1y1jCPZ3vIUAE3F336HlaM93cPEQzm-3FXFKxjmgmIwfC0HpJBFp694pJJGcGf833dP1rbd',
//     client_secret: 'EJhY3iuUagIrcP8reLQN0AUTdeCdD0yJHPSGBfhjpNajMeqngxH-BAbe6y_tQuztVnp9ruh3RgdKtduv'
// });

paypal.configure({
    mode: "sandbox", // or "live"
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
});

module.exports = paypal;

// const Razorpay = require("razorpay")

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// })

// // const razorpay = new Razorpay({
// //     key_id: 'rzp_test_6Bxy03dqkbC13P',  // Replace with your test/live key
// //     key_secret: 'D0mijmBmc1P1uENrI2cY7Lh0',  // Replace with your test/live key
// //   });

// module.exports = razorpay


// const Razorpay = require("razorpay")

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// })

// module.exports = razorpay

