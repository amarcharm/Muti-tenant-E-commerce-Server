const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['superadmin', 'vendor', 'customer'],
    default: 'customer'
  },

  isActive: {
    type: Boolean,
    default: true
  },

  approved: {
    type: Boolean,
    default: function () {
      return this.role === 'vendor' ? false : true;
    }
  }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);