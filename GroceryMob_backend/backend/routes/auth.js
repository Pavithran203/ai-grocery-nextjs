const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// Public routes (Called after Firebase Auth to sync profile)
router.post('/register', authController.register);

// Protected routes (Requires Firebase token)
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateMe);
router.post('/me/addresses', protect, authController.addAddress);
router.delete('/me/addresses/:addressId', protect, authController.deleteAddress);

module.exports = router;
