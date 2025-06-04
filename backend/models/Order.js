// backend/models/Order.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:   'User',
    required: true
  },
  item: {
    type:     String,
    required: true
  },
  details: {
    type:     String,
    required: true
  },
  trackingNumber: {
    type:     String,
    required: true,
    unique:   true
  },
  status: {
    type: String,
    enum: ['Pending', 'Ready for Pickup', 'Completed'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
