const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'Store',
  },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity:  { type: Number, required: true },
      price:     { type: Number, required: true },
    },
  ],
  totalAmount: {
    type:     Number,
    required: true,
  },
  deliveryAddress: {
    fullName: { type: String, required: true },
    phone:    { type: String, required: true },
    street:   { type: String, required: true },
    city:     { type: String, required: true },
    state:    { type: String, required: true },
    pincode:  { type: String, required: true },
  },
  status: {
    type:    String,
    enum:    ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);