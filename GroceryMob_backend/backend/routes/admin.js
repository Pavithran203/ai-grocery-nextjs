const express = require('express');
const {
  adminLogin,
  getDashboard,
  getMetrics,
  getAllUsers,
  toggleUserStatus,
  getVendorStores,
  approveVendorStore,
  rejectVendorStore,
  getProductRequests,
  approveProductRequest,
  rejectProductRequest,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getDeliveryPartners,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

// ── POST /api/admin/login ─────────────────────────────────────
router.post('/login', adminLogin);

// ── All routes below require admin JWT ───────────────────────
router.use(protect, adminOnly);

// ── GET /api/admin/dashboard ──────────────────────────────────
router.get('/dashboard', getDashboard);

// ── GET /api/admin/metrics ────────────────────────────────────
router.get('/metrics', getMetrics);

// ── GET /api/admin/users ──────────────────────────────────────
router.get('/users', getAllUsers);

// ── PUT /api/admin/users/:id/toggle-status ────────────────────
router.put('/users/:id/toggle-status', toggleUserStatus);

// ── Vendor Onboarding Approvals ──
router.get('/vendors', getVendorStores);
router.put('/vendors/:storeId/approve', approveVendorStore);
router.put('/vendors/:storeId/reject', rejectVendorStore);

// ── Catalog Product Requests ──
router.get('/catalog/requests', getProductRequests);
router.put('/catalog/requests/:id/approve', approveProductRequest);
router.put('/catalog/requests/:id/reject', rejectProductRequest);

// ── Orders (Admin) ──
router.get('/orders', getAllOrdersAdmin);
router.patch('/orders/:id', updateOrderStatusAdmin);

// ── Delivery Partners ──
router.get('/delivery-partners', getDeliveryPartners);

module.exports = router;

