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
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // Cookie-larni qabul qilish uchun
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