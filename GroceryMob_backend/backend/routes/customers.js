const express = require('express');
const router = express.Router();
const {
    createCustomer,
    getAllCustomers,
    getCustomer,
    updateCustomer,
    deleteCustomer,
    addAddress,
    getStatistics,
    addLoyaltyPoints,
    recordOrder,
    resetPassword,
} = require('../controllers/customerController');
const { protect, adminOnly } = require('../middlewares/auth');

// All customer routes are admin-only
router.use(protect, adminOnly);

// Get statistics (must be before :id routes)
router.get('/stats', getStatistics);

// CRUD operations
router.post('/', createCustomer);
router.get('/', getAllCustomers);
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

// Customer actions
router.post('/:id/address', addAddress);
router.post('/:id/loyalty', addLoyaltyPoints);
router.post('/:id/order', recordOrder);
router.post('/:id/reset-password', resetPassword);

module.exports = router;

