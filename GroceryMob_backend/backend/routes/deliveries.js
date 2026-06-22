const express = require('express');
const router = express.Router();
const {
    createDelivery,
    getAllDeliveries,
    getDelivery,
    updateDelivery,
    deleteDelivery,
    addTrackingEvent,
    verifyOTP,
    rateDelivery,
    getDeliveryStats,
} = require('../controllers/deliveryController');

// Get statistics (must be before :id routes)
router.get('/stats', getDeliveryStats);

// CRUD operations
router.post('/', createDelivery);
router.get('/', getAllDeliveries);
router.get('/:id', getDelivery);
router.put('/:id', updateDelivery);
router.delete('/:id', deleteDelivery);

// Delivery-specific actions
router.post('/:id/track', addTrackingEvent);
router.post('/:id/verify-otp', verifyOTP);
router.post('/:id/rate', rateDelivery);

module.exports = router;
