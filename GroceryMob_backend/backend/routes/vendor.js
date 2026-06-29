const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
  registerVendorStore,
  getVendorProfile,
  updateVendorProfile,
  getMasterCatalog,
  getVendorListings,
  addVendorListing,
  updateVendorListing,
  deleteVendorListing,
  bulkUpdateVendorListings,
  requestProduct,
  getVendorOrders,
  updateVendorOrderStatus,
  getVendorDashboard,
} = require('../controllers/vendorController');

// Role check middleware for vendors
const vendorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'vendor') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Vendors only.' });
  }
};

// Onboarding route: any logged in user can apply to become a vendor
router.post('/register', protect, registerVendorStore);

// All other endpoints require the 'vendor' role
router.use(protect, vendorOnly);

router.get('/profile', getVendorProfile);
router.put('/profile', updateVendorProfile);

router.get('/catalog', getMasterCatalog);
router.post('/request-product', requestProduct);

router.get('/listings', getVendorListings);
router.post('/listings', addVendorListing);
router.put('/listings/bulk', bulkUpdateVendorListings);
router.put('/listings/:id', updateVendorListing);
router.delete('/listings/:id', deleteVendorListing);

router.get('/orders', getVendorOrders);
router.put('/orders/:id', updateVendorOrderStatus);

router.get('/dashboard', getVendorDashboard);

module.exports = router;
