const mongoose = require('mongoose');
const dns = require('dns');

// Node.js darajasida DNS serverlarni majburiy belgilash (ECONNREFUSED oldini olish uchun)
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Atlasga ulanish hosil qilindi: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB ulanishida xatolik: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;