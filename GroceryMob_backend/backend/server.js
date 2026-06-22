const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ── CORS ─────────────────────────────────────────────────────
// In development, allow all origins (required for physical mobile devices).
// In production, restrict to known frontend URLs.
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
    ],
    credentials: true,
  }));
} else {
  app.use(cors({ 
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/admin',      require('./routes/admin'));
app.use('/api/products',   require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart',       require('./routes/cart'));
app.use('/api/orders',     require('./routes/orders'));
app.use('/api/offers',     require('./routes/offers'));
app.use('/api/customers',  require('./routes/customers'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/combos',     require('./routes/combos'));

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'NearMart API is running 🚀', env: process.env.NODE_ENV });
});

// ── Web users list helper ────────────────────────────────────
app.get('/api/web-users-list', async (req, res) => {
  try {
    const User = require('./models/User');
    const webUsers = await User.find({
      firebaseUid: { $regex: /^(web_|user_)/, $options: 'i' }
    }).select('-password -__v').lean();
    
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, 'web-users.json');
    const reportContent = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalWebSignIns: webUsers.length
      },
      webUsers
    };
    fs.writeFileSync(reportPath, JSON.stringify(reportContent, null, 2));

    res.json({ success: true, count: webUsers.length, users: webUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── 404 handler ──────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Server Error:', err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 NearMart backend running on http://0.0.0.0:${PORT}`);
});

