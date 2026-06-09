const Razorpay = require('razorpay');

let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('Razorpay keys not set – real payments disabled');
  // Provide a dummy object so the app doesn't crash on require
  razorpay = {
    orders: {
      create: () => {
        throw new Error('Razorpay keys not configured');
      },
    },
  };
}

module.exports = razorpay;