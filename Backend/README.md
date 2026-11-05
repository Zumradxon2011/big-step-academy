🚀 BigStep Backend API Documentation

Ushbu backend loyihasi BigStep o'quv markazi Admin boshqaruv paneli uchun maxsus ishlab chiqilgan. Tizim Node.js, Express.js va MongoDB Atlas bazasida ishlaydi.

📌 Asosiy Xususiyatlar (Admin Focused)

🔒 Faqat Admin Boshqaruvi: Barcha amallar (guruhlar, o'quvchilar, davomat) admin vakolati ostida.

🔑 Xavfsiz Autentifikatsiya: JWT Access Token (15m) + httpOnly Cookie Refresh Token (7d).

👥 O'quvchilar Boshqaruvi: Faol va ketgan (arxivlangan) o'quvchilar ro'yxati.

📊 12 Oylik Davomat: Yanvar-Dekabr oylari bo'yicha har bir o'quvchining keldi/kemadi statistikasi va dars qoldirishlar soni.

🏫 Guruhlar va O'qituvchilar: Guruh nomi, fan, biriktirilgan o'qituvchi va xona ma'lumotlari.

📂 Loyiha Fayllar Tuzilmasi

backend/
├── src/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas bilan ulanish
│   ├── controllers/
│   │   ├── adminController.js     # Guruhlar va o'quvchilarni boshqarish
│   │   └── attendanceController.js # 12 oylik davomat jurnali va statistika
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT token va Admin huquqini tekshirish
│   ├── models/
│   │   ├── User.js                # Admin modeli (username, password hash)
│   │   ├── Group.js               # Guruh va o'qituvchi modeli
│   │   ├── Student.js             # O'quvchi modeli (active/archived, darslar)
│   │   └── Attendance.js          # Oylik davomat yozuvlari
│   ├── routes/
│   │   └── adminRoutes.js         # Barcha Admin API yo'llari
│   ├── seed.js                    # Boshlang'ich Admin yaratuvchi skript
│   └── server.js                  # Asosiy Express server va middleware sozlamalari
├── .env                           # Maxfiy kalitlar va ulanish parametrlari
└── package.json


⚙️ Muhit Sozlamalari (.env)

PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bigstep?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_access_token_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:3000


🔌 API Endpoints (Yo'nalishlar)

🔑 Auth (Kirish)

POST /api/auth/login - Admin tizimga kirishi va refresh token cookie ga yozilishi.

POST /api/auth/refresh - Access tokenni yangilash.

POST /api/auth/logout - Cookie va bazadagi sessionni tozalash.

📚 Guruhlar va O'qituvchilar (authMiddleware bilan)

GET /api/admin/groups - Barcha guruhlar va o'qituvchilar ro'yxati.

POST /api/admin/groups - Yangi guruh va o'qituvchi biriktirish.

DELETE /api/admin/groups/:id - Guruhni o'chirish.

👨‍🎓 O'quvchilar Boshqaruvi

GET /api/admin/students - Faol o'quvchilar va ularning qoldirgan darslari soni.

GET /api/admin/students/archive - Ketib qolgan (arxivlangan) o'quvchilar ro'yxati.

POST /api/admin/students - Yangi o'quvchi qo'shish.

PATCH /api/admin/students/:id/archive - O'quvchini ketganlar ro'yxatiga (arxivga) o'tkazish.

📅 12 Oylik Davomat Jurnali

GET /api/admin/attendance?month=:month&groupId=:id - Ma'lum bir oy va guruh uchun davomat.

POST /api/admin/attendance - Kunlik keldi/kemadi statusini saqlash.

🚀 Ishga Tushirish

# 1. Kutubxonalarni o'rnatish
npm install

# 2. Boshlang'ich Admin akkauntni bazaga kiritish
node src/seed.js

# 3. Serverni dev rejimida ishga tushirish
npm run dev