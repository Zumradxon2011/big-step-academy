# 🎓 BigStep Academy — CRM & Admin Boshqaruv Tizimi

BigStep o'quv markazi ma'muriyati uchun to'liq boshqaruv (CRM) tizimi. Guruhlar, o'quvchilar va 12 oylik davomat jurnalini markazlashgan holda boshqarish imkonini beradi.

---

## 🛠️ Texnologiyalar Steki

### 🖥️ Backend (`/Backend`)
- **Node.js & Express.js** — REST API server
- **MongoDB & Mongoose** — Ma'lumotlar bazasi va sxemalar
- **JWT (JSON Web Token)** — 15m Access Token + 7d HTTP-Only Cookie Refresh Token
- **Bcrypt.js** — Parollarni xavfsiz heshlash

### 🎨 Frontend (`/frontend`)
- **Next.js 16 (App Router)** — Zamonaviy React freymvorki
- **React 19 & TypeScript** — Tip xavfsizligi va yuqori unumdorlik
- **Tailwind CSS v4** — Brand UI dizayn tizimi (to'q ko'k va amber sariq aksentlar)
- **Axios** — Avtomatik silent refresh token interceptori bilan
- **Lucide React** — Zamonaviy vektor ikonkalari
- **React Hot Toast** — Bildirishnomalar

---

## 📂 Loyiha Tuzilmasi

```
Big_step loyiha/
├── Backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB ulanishi
│   │   ├── controllers/          # Admin, guruh, o'quvchi va davomat kontrollerlari
│   │   ├── middleware/           # JWT auth tekshiruvi
│   │   ├── models/               # User, Group, Student, Attendance modellari
│   │   ├── routes/               # Himoyalangan API yo'llari
│   │   └── server.js             # Express server
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/                      # Next.js App Router sahifalari
│   │   ├── admin/                # Dashboard, Groups, Students, Attendance
│   │   ├── login/                # Admin login sahifasi
│   │   └── layout.tsx
│   ├── components/               # UI komponentlar (Button, Modal, Card, Input)
│   ├── context/                  # AuthContext (avtorizatsiya holati)
│   ├── services/api.ts           # Markaziy Axios instansiyasi
│   └── public/                   # Rasmiy logotip va rasmlar
│
├── .gitignore
└── README.md
```

---

## 🚀 Ishga Tushirish

### 1. Backendni sozlash va ishga tushirish:
```bash
cd Backend
npm install
cp .env.example .env
# .env faylida MongoDB URI va JWT kalitlarini kiriting
node src/seed.js   # Boshlang'ich admin akkauntini yaratish
npm run dev        # http://localhost:5000 da ishga tushadi
```

### 2. Frontendni ishga tushirish:
```bash
cd frontend
npm install
npm run dev        # http://localhost:3000 da ishga tushadi
```

---

## 👨‍💻 Muallif
- **Zumradxon Xudoyberganova** ([@Zumradxon2011](https://github.com/Zumradxon2011))
