const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Order    = require('../models/Order');
const Product  = require('../models/Product');
const User     = require('../models/User');
const { sendOrderConfirmation } = require('../config/emailService');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Step 1: Create Razorpay order ──────────────────────────────
// Called when customer clicks Pay Now
const createRazorpayOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    // Calculate total from real database prices
    // Never trust prices from frontend
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productId}`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for ${product.name}`,
        });
      }
      totalAmount += product.price * item.quantity;
    }

    // Razorpay requires amount in paise (1 rupee = 100 paise)
    const razorpayOrder = await razorpay.orders.create({
      amount:   totalAmount * 100,
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
    });

    res.status(200).json({
      orderId:      razorpayOrder.id,
      amount:       razorpayOrder.amount,
      currency:     razorpayOrder.currency,
      keyId:        process.env.RAZORPAY_KEY_ID,
      totalAmount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── Step 2: Verify payment and place order ──────────────────────
// Called after Razorpay payment completes on frontend
const verifyPaymentAndPlaceOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      deliveryAddress,
    } = req.body;

    // Verify payment signature to confirm payment is genuine
    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Signature verified — now place the order
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();

      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        quantity:  item.quantity,
        price:     product.price,
      });
    }

    const firstProduct = await Product.findById(items[0].productId);

    const order = await Order.create({
      customerId:       req.user.id,
      storeId:          firstProduct.storeId,
      items:            orderItems,
      totalAmount,
      deliveryAddress,
      status:           'pending',
      paymentIntentId:  razorpay_payment_id,
      isPaid:           true,
    });

    // Populate for email
    const populatedOrder = await Order.findById(order._id)
      .populate('items.productId', 'name price');

    const customer = await User.findById(req.user.id);

    // Send confirmation email
    try {
      await sendOrderConfirmation({
        toEmail:         customer.email,
        customerName:    customer.name,
        orderId:         order._id.toString(),
        items:           populatedOrder.items,
        totalAmount:     order.totalAmount,
        deliveryAddress: order.deliveryAddress,
      });
    } catch (emailError) {
      console.log('Email failed:', emailError.message);
    }

    res.status(201).json({
      message: 'Payment verified. Order placed successfully.',
      order,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createRazorpayOrder, verifyPaymentAndPlaceOrder };