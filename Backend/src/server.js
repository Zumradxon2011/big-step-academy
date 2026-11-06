require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const adminRoutes = require('./routes/adminRoutes');

// MongoDB ga ulanish
connectDB();

const app = express();

// Middleware'lar
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Brauzersiz yoki serverdan so'rovlar (masalan curl, mobile, monitoring)
      if (!origin) return callback(null, true);
      // Ruxsat etilgan frontend domenlari yoki Vercel preview domenlari
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        (process.env.FRONTEND_URL && origin.startsWith(process.env.FRONTEND_URL))
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true, // Cross-domain cookie-lar uchun
  })
);

// API Routerlar
app.use('/api', adminRoutes);

// Test endpoint
app.get('/', (req, res) => {
  res.send('BigStep Backend API ishlayapti...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda muvaffaqiyatli ishga tushdi 🚀`);
});