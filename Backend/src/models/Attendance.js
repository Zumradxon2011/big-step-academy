const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  month: {
    type: Number, // 1 dan 12 gacha (Yanvar - Dekabr)
    required: true,
  },
  days: [{
    date: Number, // Oydagi kun (1-31)
    status: {
      type: String,
      enum: ['present', 'absent', 'excused'], // keldi, kelmadi, sababli
      default: 'present',
    },
  }],
  isPaid: {
    type: Boolean,
    default: false, // Shu oy uchun to'lov qilinganmi
  },
}, { timestamps: true });

// Bir o'quvchining bir oy uchun faqat bitta davomat varaqasi bo'lishini ta'minlaymiz
attendanceSchema.index({ student: 1, group: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);