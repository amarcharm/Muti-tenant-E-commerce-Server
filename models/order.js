const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity:  { type: Number, required: true },
    price:     { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  status:      { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('order', orderSchema);