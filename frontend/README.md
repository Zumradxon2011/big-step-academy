🎨 BigStep Academy - Frontend (Next.js App Router) Mukammal Qo'llanmasi

Ushbu hujjat BigStep Academy admin boshqaruv paneli frontend qismining arxitekturasi, ishlatiladigan kutubxonalar, API bilan ishlash protokoli, holat boshqaruvi (state management) va UI/UX standartlarini belgilaydi.

📦 1. O'rnatiladigan Kutubxonalar (Dependencies)

Loyiha to'g'ri va barqaror ishlashi uchun quyidagi paketlar va ularning vazifalari:

Core & Routing:

next (^14.x yoki ^15.x): App Router arxitekturasi bo'yicha marshrutlash va SSR/CSR imkoniyatlari.

react, react-dom: UI komponentlar bazasi.

Styling & Icons:

tailwindcss: Zamonaviy utility-first CSS freymvorki.

postcss, autoprefixer: CSS-ni qayta ishlash va brauzer mosligini ta'minlash.

lucide-react: UI interfeyslar uchun ikonkalari (Dashboard, Users, GraduationCap, ClipboardCheck, LogOut, Search, Plus, Edit, Trash va h.k.).

HTTP Client & API:

axios: Backend bilan so'rovlar almashish (Interceptors, Cookie handling va Timeout sozlamalari bilan).

Notifications & UI Helpers (Tavsiya etiladi):

react-hot-toast yoki toastify: Xatoliklar va muvaffaqiyatli amallarni bildirishnomada ko'rsatish.

clsx, tailwind-merge: Tailwind sinflarini dinamik va xavfsiz birlashtirish.

🎨 2. Logotip va Brend Uslubi (Design System)

Logotipdagi to'q ko'k va yorqin sariq/to'q sariq ranglar asosida Tailwind CSS sozlamalari belgilangan:

Brand Blue (To'q ko'k): #1e3a8a (bg-blue-950, text-blue-950) — Menyu, header, sarlavhalar va asosiy navigatsiya uchun.

Brand Yellow (Sariq / To'q sariq): #f59e0b (text-amber-500, bg-amber-500) — Tugmalar, faol menyu elementlari, aksentlar va bildirishnomalar uchun.

Background (Fon): #f9fafb (bg-gray-50 / bg-gray-100) — Yengil va ko'zni toliqtirmaydigan orqa fon.

Card & Tables: bg-white, rounded-2xl, shadow-sm, border border-gray-100 — Burchaklari yumshoq, minimalistik kartochkalar.

Logo Fayli: frontend/public/logo.png

📂 3. Loyiha Tuzilmasi (Frontend Architecture)

frontend/
├── public/
│   └── logo.png                # BigStep Academy rasmiy logotipi
├── src/
│   ├── app/
│   │   ├── layout.jsx          # Root Layout (Fontlar va global stillar)
│   │   ├── page.jsx            # Asosiy sahifa (Login'ga yo'naltiradi)
│   │   ├── login/
│   │   │   └── page.jsx        # Admin login sahifasi
│   │   └── admin/
│   │       ├── layout.jsx      # Admin Sidebar va Top Navbar
│   │       ├── dashboard/
│   │       │   └── page.jsx    # Umumiy statistika va bugungi davomat
│   │       ├── groups/
│   │       │   └── page.jsx    # Guruhlarni boshqarish (CRUD)
│   │       ├── students/
│   │       │   └── page.jsx    # O'quvchilar ro'yxati va qo'shish (CRUD)
│   │       └── attendance/
│   │           └── page.jsx    # Kunlik davomatni belgilash sahifasi
│   ├── services/
│   │   └── api.js              # Axio'ning yagona markaziy instansiyasi
│   ├── context/
│   │   └── AuthContext.jsx     # Global auth holati boshqaruvi
│   └── components/             # Qayta ishlatiluvchi modal va jadvallar
├── tailwind.config.js          # Tailwind moslashtirishlari
└── package.json


🌐 4. HTTP So'rovlar Mexanizmi (Axios Setup & Requests)

Backend bilan xavfsiz ulanish va session/cookie borki-yo'qligini tekshirish uchun Axios Central Instance yaratiladi.

Axios Konfiguratsiyasi (src/services/api.js):

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // HTTP-Only Cookie (JWT) uzatish uchun shart!
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response Interceptor: 401 (Unauthenticated) bo'lganda avtomatik login'ga yo'naltirish
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;


📡 5. API Ulanish Nuqtalari va So'rovlar Ro'yxati (Endpoints)

A. Auth (Autentifikatsiya)

POST /auth/login

Payload: { username: "admin", password: "..." }

Vazifasi: Tizimga kirish va JWT cookie o'rnatish.

POST /auth/logout

Vazifasi: Tizimdan chiqish (cookie-ni tozalash).

GET /auth/me

Vazifasi: Hozirgi kirgan admin ma'lumotlarini tekshirish.

B. Dashboard (Statistika)

GET /dashboard/stats

Response: { totalStudents: 850, activeGroups: 24, todayAttendance: "94%" }

C. Guruhlar Boshqaruvi (Groups)

GET /groups — Barcha guruhlar ro'yxatini olish.

POST /groups — Yangi guruh yaratish ({ name, teacher, course, schedule }).

PUT /groups/:id — Guruh ma'lumotlarini tahrirlash.

DELETE /groups/:id — Guruhni o'chirish.

D. O'quvchilar Boshqaruvi (Students)

GET /students?groupId=:id — O'quvchilarni guruh bo'yicha filterlab olish.

POST /students — Yangi o'quvchi qo'shish ({ fullName, phone, groupId }).

PUT /students/:id — O'quvchi ma'lumotlarini yangilash.

DELETE /students/:id — O'quvchini tizimdan o'chirish.

E. Davomat Nazorati (Attendance)

GET /attendance?groupId=:id&date=YYYY-MM-DD — Tanlangan guruh va kungi davomat.

POST /attendance — Davomatni saqlash yoki yangilash.

Payload: { groupId, date, records: [{ studentId, status: "Present" | "Absent" }] }

⚡ 6. Holat Boshqaruvi va Amaliyot Standardi (State Management)

Local State (useState): Forma inputlari, modallar ochiq/yopiqligi, loading va error holatlari uchun.

Global Auth State (React Context / AuthContext): Admin login bo'lgan-bo'lmaganligini va profili holatini ilova bo'ylab saqlaydi.

Data Fetching (useEffect + Axios): Sahifa yuklanganda backend serveriga yuklanish ko'rsatkichlari (loading spinner) bilan so'rov yuborish.

🛠 7. Ishga Tushirish Buyruqlari

cd frontend
npm install
npm run dev


Loyiha mahaliymizda http://localhost:3000 manzilida ishlaydi.