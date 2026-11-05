require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    // Oldindan mavjud adminni tekshirish
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin foydalanuvchisi allaqachon mavjud!');
      process.exit();
    }

    // Parolni xavfsiz hashlash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Admin yaratish
    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Boshlang\'ich Admin muvaffaqiyatli yaratildi!');
    console.log('Username: admin');
    console.log('Parol: admin123');
    process.exit();
  } catch (error) {
    console.error(`Xatolik yuz berdi: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();