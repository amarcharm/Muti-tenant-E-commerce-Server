const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
  vendorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  storeName:   { type: String, required: true },
  description: { type: String },
  logo:        { type: String },
  isApproved:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Store', storeSchema);