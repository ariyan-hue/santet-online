# 🔮 Santet Online

**Platform pengiriman santet digital #1 di Indonesia.**  
*Dari Hati Paling Dalam, Sampai Ke Pesawat Gaib.*

---

## 📂 Arsitektur

```
santet-online/
├── backend/          → API Server (Node.js + Express)
│   ├── server.js     → 8 API endpoints
│   ├── package.json
│   ├── vercel.json   → Deploy ke Vercel
│   └── data/         → JSON database
├── frontend/         → Static SPA
│   ├── index.html    → 6 halaman (Home, Produk, Order, Tracking, Admin)
│   └── style.css     → Dark mistis theme
└── README.md
```

**Frontend (Vercel/Netlify)** → **Backend API (Vercel / Railway / Render)** → **data/**

## 🚀 Cara Jalanin Lokal

### 1. Backend API
```bash
cd backend
npm install
npm start
# → http://localhost:3000
```

### 2. Frontend (pilih salah satu)
```bash
# Pakai npx live-server
npx live-server frontend --port=8080

# Atau VS Code Live Server
# Atau langsung buka index.html (CORS disabled)
```

**⚠️ Ubah `API_URL` di frontend:**
Buka `frontend/index.html` → cari baris `const API_URL = window.API_URL || 'http://localhost:3000';`

## 🌐 Deploy ke Production

### Backend → Vercel
```bash
cd backend
# Push ke GitHub, hubungkan ke Vercel
# Dapat URL: https://santet-api.vercel.app
```

### Frontend → Netlify / Vercel
```bash
cd frontend
# Hubungkan repo ke Netlify
# Build command: none (static site)
# Publish directory: frontend/
```

**Di Netlify:** Tambah environment variable atau inject API_URL di HTML sebelum deploy.

## 📦 API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/products` | Daftar produk santet |
| POST | `/api/orders` | Buat order baru |
| GET | `/api/orders` | Semua order (admin) |
| GET | `/api/orders/track/:tn` | Tracking by tracking number |
| PATCH | `/api/orders/:id` | Update status order |
| GET | `/api/counter` | Fake counter santet |

## 🛠️ Tech Stack

```
Backend:  Node.js + Express + JSON DB
Frontend: HTML5 + CSS3 + Vanilla JS (SPA)
Deploy:   Vercel (backend) + Netlify (frontend)
```

## 👥 Startup Team

| Role | Person |
|------|--------|
| 👔 CEO | "Visi Besar" |
| 📋 Product Manager | "PRD Architect" |
| 🎨 UI/UX Designer | "Dark Mode Specialist" |
| 💻 Full Stack Dev | "The Code Machine" |
| 💻 Full Stack Dev | "Bug Crusher" |
| 🧪 QA / PM | "Timeline Keeper" |

> ⚠️ **DISCLAIMER:** Semua santet adalah parodi dan tidak nyata.
