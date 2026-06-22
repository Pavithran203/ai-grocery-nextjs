const express = require('express');
const { adminLogin, getDashboard, getAllUsers, toggleUserStatus } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

// ── POST /api/admin/login ─────────────────────────────────────
// Public route — validates credentials and checks role === 'admin'
router.post('/login', adminLogin);

// ── All routes below require admin JWT ───────────────────────
router.use(protect, adminOnly);

// ── GET /api/admin/dashboard ──────────────────────────────────
router.get('/dashboard', getDashboard);

// ── GET /api/admin/users ──────────────────────────────────────
router.get('/users', getAllUsers);

// ── PUT /api/admin/users/:id/toggle-status ────────────────────
router.put('/users/:id/toggle-status', toggleUserStatus);

module.exports = router;
