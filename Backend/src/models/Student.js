const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  missedLessonsCount: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  discountReason: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'unpaid'], // To'ladi, To'lamadi
    default: 'unpaid',
  },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);