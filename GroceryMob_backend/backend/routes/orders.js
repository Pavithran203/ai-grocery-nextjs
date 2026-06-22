const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.post('/',              createOrder);
router.get('/',               getMyOrders);
router.get('/admin/all',      adminOnly, getAllOrders);
router.get('/:id',            getOrderById);
router.put('/:id/status',     adminOnly, updateOrderStatus);
router.put('/:id/cancel',     cancelOrder);

module.exports = router;
