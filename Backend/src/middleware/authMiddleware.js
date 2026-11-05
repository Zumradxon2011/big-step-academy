const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Tokenni ajratib olish
      token = req.headers.authorization.split(' ')[1];

      // Tokenni tekshirish
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

      // Foydalanuvchini topish va req.user ga biriktirish
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Faqat admin uchun ruxsat etilgan' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Token yaroqsiz yoki muddati o\'tgan' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Token topilmadi, avtorizatsiya talab qilinadi' });
  }
};

module.exports = { protect };