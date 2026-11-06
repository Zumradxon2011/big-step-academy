const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
  },
  teacherName: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true, // Masalan: "09:00 - 11:00"
  },
  days: {
    type: String,
    required: true, // Masalan: "Du-Chor-Juma"
  },
  room: {
    type: String,
    required: true, // Masalan: "Xona 301"
  },
  monthlyPrice: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);