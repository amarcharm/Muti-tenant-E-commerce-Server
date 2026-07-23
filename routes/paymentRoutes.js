const express = require('express');
const router  = express.Router();
const {
  createRazorpayOrder,
  verifyPaymentAndPlaceOrder,
} = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

// Create Razorpay order — called first
router.post('/create-order',  verifyToken, createRazorpayOrder);

// Verify payment and place order — called after payment
router.post('/verify-payment', verifyToken, verifyPaymentAndPlaceOrder);

module.exports = router;