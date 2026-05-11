const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  storeId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  stock:    { type: Number, default: 0 },
  images:   [{ type: String }],
  category: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);