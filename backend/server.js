const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
// Use /tmp on Vercel (serverless read-only filesystem), else local data dir
const DATA_DIR = process.env.VERCEL ? '/tmp/data' : path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Init products
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([
    { id: 'santet-biasa', name: 'Santet Biasa', price: 0, icon: '🌀', description: 'Santet standar. Doa dibacakan AI. Hasil? Tergantung rejeki.', deliveryTime: '3-7 hari kerja', tag: 'GRATIS' },
    { id: 'santet-express', name: 'Santet Express', price: 25000, icon: '⚡', description: 'Prioritas! Tracking number eksklusif. Mantan langsung kena sial.', deliveryTime: '1x24 jam', tag: 'POPULER' },
    { id: 'santet-premium', name: 'Santet Premium', price: 75000, icon: '🕯️', description: 'Dengan lilin + foto target. Dukun partner rapalkan mantra khusus.', deliveryTime: '6 jam', tag: 'BEST SELLER' },
    { id: 'santet-mantan', name: 'Santet Mantan', price: 50000, icon: '💔', description: 'Editors khusus mantan. Bikin dia nyesel selingkuh.', deliveryTime: '2 hari', tag: null },
    { id: 'santet-rejeki', name: 'Santet Rejeki Seret', price: 20000, icon: '💰', description: 'Bikin rejeki target seret. Cocok buat competitor licik.', deliveryTime: '1-3 hari', tag: 'HEMAT' },
    { id: 'santet-cinta', name: 'Santet Cinta', price: 30000, icon: '💕', description: 'Biar doi chat balik. Dijamin baper (atau duit balik).', deliveryTime: '3 hari', tag: null },
    { id: 'santet-corporate', name: 'Santet Corporate', price: 250000, icon: '🏢', description: 'Santet seluruh departemen. Paket komplit buat satu lantai.', deliveryTime: '5 hari', tag: 'CORPORATE' },
    { id: 'santet-ultra', name: 'Santet Ultimate', price: 150000, icon: '🔥', description: 'Dukun level max. Pake ritual lengkap + ayam cemani.', deliveryTime: '3 jam', tag: 'VIP' }
  ]), null, 2);
}

// Init orders
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]');

app.use(cors());
app.use(express.json());

// Serve frontend static files (local dev convenience)
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
if (fs.existsSync(FRONTEND_DIR)) {
  app.use(express.static(FRONTEND_DIR));
  console.log(`📄 Serving frontend dari ${FRONTEND_DIR}`);
}

// ============ API ROUTES ============

// GET /api/products
app.get('/api/products', (req, res) => {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  res.json({ success: true, data: products });
});

// POST /api/orders — create order
app.post('/api/orders', (req, res) => {
  const { productId, targetName, reason, deliveryMethod, photo } = req.body;
  if (!productId || !targetName || !reason || !deliveryMethod) {
    return res.status(400).json({ success: false, message: 'Lengkapi data santet, ada yang kurang!' });
  }

  const products = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf-8'));
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ success: false, message: 'Produk santet tidak ditemukan!' });

  const order = {
    id: uuidv4().slice(0, 8).toUpperCase(),
    trackingNumber: 'SNT-' + Date.now().toString(36).toUpperCase(),
    productId,
    productName: product.name,
    productPrice: product.price,
    targetName,
    reason,
    deliveryMethod,
    photo: photo || null,
    status: 'diproses',
    statusHistory: [
      { status: 'diproses', timestamp: new Date().toISOString(), message: 'Dukun sedang merapalkan mantra pembuka...' }
    ],
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + (product.deliveryTime.includes('jam') ? 6 * 3600000 : 3 * 86400000)).toISOString()
  };

  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);

  res.status(201).json({ success: true, data: order });
});

// GET /api/orders — all orders (admin)
app.get('/api/orders', (req, res) => {
  const orders = getOrders();
  res.json({ success: true, data: orders.reverse() });
});

// GET /api/orders/track/:trackingNumber — tracking
app.get('/api/orders/track/:trackingNumber', (req, res) => {
  const orders = getOrders();
  const order = orders.find(o => o.trackingNumber === req.params.trackingNumber);
  if (!order) return res.status(404).json({ success: false, message: 'Tracking number tidak ditemukan, mungkin kena santet balik?' });
  res.json({ success: true, data: order });
});

// PATCH /api/orders/:id — update status (admin)
app.patch('/api/orders/:id', (req, res) => {
  const { status, message } = req.body;
  const orders = getOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order santet tidak ditemukan' });

  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    message: message || getStatusMessage(status)
  });
  if (status === 'selesai') {
    order.estimatedDelivery = new Date().toISOString();
  }
  saveOrders(orders);
  res.json({ success: true, data: order });
});

// GET /api/counter — fake santet counter
app.get('/api/counter', (req, res) => {
  const orders = getOrders();
  const base = 1337 + orders.length;
  res.json({ success: true, data: { count: base + Math.floor(Math.random() * 10) } });
});

// ============ HELPERS ============

function getOrders() {
  return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
}
function saveOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

function getStatusMessage(status) {
  const messages = {
    'diproses': 'Dukun sedang merapal mantra pembuka...',
    'dikirim': 'Santet sudah dikirim melalui jalur gaib...',
    'dalam-perjalanan': 'Santet sedang dalam perjalanan di alam astral...',
    'selesai': 'Santet berhasil sampai ke target!',
    'gagal': 'Santet gagal — target ternyata punya ilmu kebal!'
  };
  return messages[status] || 'Status tidak diketahui, konsultasi dukun dulu.';
}

// Jangan listen langsung kalo dijalankan oleh Vercel (serverless)
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`🧙 Santet Online API berjalan di http://localhost:${PORT}`);
    console.log(`📦 Data santet tersimpan di ${DATA_DIR}`);
  });
}
