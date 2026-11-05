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
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);