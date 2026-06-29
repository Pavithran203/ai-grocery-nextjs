const Store = require('../models/Store');
const MasterProduct = require('../models/MasterProduct');
const VendorListing = require('../models/VendorListing');
const Order = require('../models/Order');
const User = require('../models/User');

// Helper to get vendor's approved store and verify ownership server-side
const getVendorStore = async (userId) => {
  const store = await Store.findOne({ vendor: userId });
  if (!store) {
    throw new Error('No store associated with this vendor account.');
  }
  return store;
};

// ── POST /api/vendor/register ──────────────────────────────────
// Onboard a new vendor (submits store details for approval)
const registerVendorStore = async (req, res) => {
  try {
    const { name, emoji, address, zipCode, area, city, openTime, closeTime, contactDetails, businessDetails, verificationDocuments } = req.body;
    
    // Check if store already exists for this user
    const existingStore = await Store.findOne({ vendor: req.user._id });
    if (existingStore) {
      return res.status(400).json({ success: false, message: 'A store onboarding request already exists for this account.' });
    }

    const newStore = await Store.create({
      name,
      emoji: emoji || '🏪',
      address,
      zipCode,
      area,
      city,
      openTime: openTime || '08:00',
      closeTime: closeTime || '22:00',
      location: {
        type: 'Point',
        coordinates: [80.23, 13.04], // Default coordinates, can be updated later
      },
      status: 'pending_review',
      contactDetails,
      businessDetails,
      verificationDocuments,
      vendor: req.user._id,
    });

    res.status(201).json({ success: true, store: newStore, message: 'Onboarding application submitted successfully. Pending Admin review.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/vendor/profile ─────────────────────────────────────
const getVendorProfile = async (req, res) => {
  try {
    const store = await Store.findOne({ vendor: req.user._id });
    if (!store) {
      return res.status(200).json({ success: true, onboardingNeeded: true });
    }
    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/vendor/profile ─────────────────────────────────────
const updateVendorProfile = async (req, res) => {
  try {
    const store = await getVendorStore(req.user._id);
    const allowedUpdates = ['name', 'emoji', 'address', 'zipCode', 'area', 'city', 'openTime', 'closeTime', 'contactDetails', 'isClosedToday'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        store[field] = req.body[field];
      }
    });

    await store.save();
    res.json({ success: true, store, message: 'Store profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/vendor/catalog ─────────────────────────────────────
// Retrieve approved master catalog products to add to store inventory
const getMasterCatalog = async (req, res) => {
  try {
    const search = req.query.search ? String(req.query.search).trim() : '';
    const filter = { status: 'approved' };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const catalog = await MasterProduct.find(filter);
    res.json({ success: true, catalog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/vendor/listings ────────────────────────────────────
const getVendorListings = async (req, res) => {
  try {
    const store = await getVendorStore(req.user._id);
    const listings = await VendorListing.find({ store: store._id })
      .populate('catalogProduct');
    res.json({ success: true, listings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/vendor/listings ───────────────────────────────────
// Add a product from Master Catalog to Vendor's Store Inventory
const addVendorListing = async (req, res) => {
  try {
    const store = await getVendorStore(req.user._id);
    const { catalogProductId, price, originalPrice, stock, storeSku, lowStockThreshold, expiryDate, preparationTime } = req.body;

    if (!catalogProductId || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required inventory fields.' });
    }

    // Verify catalog product exists and is approved
    const catalogProduct = await MasterProduct.findById(catalogProductId);
    if (!catalogProduct || catalogProduct.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Catalog product not found or not approved.' });
    }

    // Check for duplicate listing
    const duplicate = await VendorListing.findOne({ store: store._id, catalogProduct: catalogProductId });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'Product already exists in your store inventory.' });
    }

    const listing = await VendorListing.create({
      store: store._id,
      catalogProduct: catalogProductId,
      price,
      originalPrice: originalPrice || price,
      stock,
      storeSku: storeSku || `SKU-${store._id.toString().slice(-4)}-${catalogProduct.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)}-${Date.now().toString().slice(-4)}`,
      lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : 10,
      expiryDate,
      preparationTime: preparationTime || '10 mins',
      isAvailable: true,
    });

    // Also sync to legacy Product model
    const Product = require('../models/Product');
    const stockStatus = listing.stock === 0 ? 'OUT_OF_STOCK' : listing.stock <= 10 ? 'LIMITED' : 'IN_STOCK';
    await Product.create({
      _id: listing._id,
      name: catalogProduct.name,
      price: listing.price,
      originalPrice: listing.originalPrice,
      category: catalogProduct.category,
      brand: catalogProduct.brand || 'NearMart Organic',
      weight: catalogProduct.weight || '1 kg',
      unit: catalogProduct.weight || '1 kg',
      image: catalogProduct.image || '',
      description: catalogProduct.description || '',
      stock: listing.stock,
      stockStatus,
      isAvailable: listing.isAvailable,
      store: store._id,
    });

    res.status(201).json({ success: true, listing, message: 'Product added to inventory successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/vendor/listings/:id ────────────────────────────────
const updateVendorListing = async (req, res) => {
  try {
    const store = await getVendorStore(req.user._id);
    const listing = await VendorListing.findOne({ _id: req.params.id, store: store._id });
    
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found or access denied.' });
    }

    const allowedUpdates = ['price', 'originalPrice', 'stock', 'isAvailable', 'lowStockThreshold', 'expiryDate', 'preparationTime'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        listing[field] = req.body[field];
      }
    });

    await listing.save();

    // Also sync to legacy Product model
    const Product = require('../models/Product');
    const catalogProduct = await MasterProduct.findById(listing.catalogProduct);
    const stockStatus = listing.stock <= 0 ? 'OUT_OF_STOCK' : listing.stock <= (listing.lowStockThreshold || 10) ? 'LIMITED' : 'IN_STOCK';
    await Product.findByIdAndUpdate(listing._id, {
      $set: {
        price: listing.price,
        originalPrice: listing.originalPrice,
        stock: listing.stock,
        isAvailable: listing.isAvailable,
        stockStatus,
        ...(catalogProduct && {
          name: catalogProduct.name,
          category: catalogProduct.category,
          brand: catalogProduct.brand,
          weight: catalogProduct.weight,
          unit: catalogProduct.weight,
          image: catalogProduct.image,
          description: catalogProduct.description
        })
      }
    });

    res.json({ success: true, listing, message: 'Listing updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/vendor/listings/:id ─────────────────────────────
const deleteVendorListing = async (req, res) => {
  try {
    const store = await getVendorStore(req.user._id);
    const listing = await VendorListing.findOneAndDelete({ _id: req.params.id, store: store._id });
    
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found or access denied.' });
    }

    // Also sync to legacy Product model
    const Product = require('../models/Product');
    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Listing removed from store inventory.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/vendor/listings/bulk ──────────────────────────────
// Bulk update prices and stock for multiple listings
const bulkUpdateVendorListings = async (req, res) => {
  try {
    const store = await getVendorStore(req.user._id);
    const { updates } = req.body; // Array of { id, price, stock, isAvailable }

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: 'Invalid bulk updates payload.' });
    }

    const results = [];
    const Product = require('../models/Product');
    for (const item of updates) {
      const listing = await VendorListing.findOneAndUpdate(
        { _id: item.id, store: store._id },
        { 
          $set: {
            ...(item.price !== undefined && { price: item.price }),
            ...(item.stock !== undefined && { stock: item.stock }),
            ...(item.isAvailable !== undefined && { isAvailable: item.isAvailable })
          }
        },
        { new: true }
      );
      if (listing) {
        await Product.findByIdAndUpdate(item.id, {
          $set: {
            ...(item.price !== undefined && { price: item.price }),
            ...(item.stock !== undefined && { stock: item.stock }),
            ...(item.isAvailable !== undefined && { 
              isAvailable: item.isAvailable,
              stockStatus: item.isAvailable ? (item.stock <= 10 ? 'LIMITED' : 'IN_STOCK') : 'OUT_OF_STOCK'
            })
          }
        });
        results.push(listing);
      }
    }

    res.json({ success: true, updatedCount: results.length, message: 'Bulk update completed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/vendor/request-product ───────────────────────────
// Request to add a new product to the master catalog (pending Admin review)
const requestProduct = async (req, res) => {
  try {
    const { name, brand, category, weight, description, barcode } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and Category are required for product request.' });
    }

    const proposedProduct = await MasterProduct.create({
      name,
      brand: brand || '',
      category,
      weight: weight || '1 kg',
      description: description || '',
      barcode: barcode || '',
      status: 'pending_review',
    });

    res.status(201).json({ success: true, product: proposedProduct, message: 'New product request submitted to Admin.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/vendor/orders ──────────────────────────────────────
const getVendorOrders = async (req, res) => {
  try {
    const store = await getVendorStore(req.user._id);
    const orders = await Order.find({ store: store._id })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/vendor/orders/:id ──────────────────────────────────
// Update status of orders belong to this vendor's store
const updateVendorOrderStatus = async (req, res) => {
  try {
    const store = await getVendorStore(req.user._id);
    const order = await Order.findOne({ _id: req.params.id, store: store._id });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or access denied.' });
    }

    const { orderStatus } = req.body;
    if (!orderStatus) {
      return res.status(400).json({ success: false, message: 'Order status required.' });
    }

    order.orderStatus = orderStatus;
    order.trackingEvents.push({
      status: orderStatus,
      message: `Order status updated to ${orderStatus} by store vendor.`,
      timestamp: new Date()
    });
    
    await order.save();
    res.json({ success: true, order, message: 'Order status updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/vendor/dashboard ───────────────────────────────────
const getVendorDashboard = async (req, res) => {
  try {
    const store = await getVendorStore(req.user._id);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      pendingOrdersCount,
      revenueResult,
      lowStockListings,
      outOfStockListings,
      recentUpdatedListings
    ] = await Promise.all([
      // Today's orders count
      Order.countDocuments({ store: store._id, createdAt: { $gte: startOfToday } }),
      // Pending orders count (not delivered or cancelled)
      Order.countDocuments({ store: store._id, orderStatus: { $in: ['placed', 'confirmed', 'packed', 'out_for_delivery'] } }),
      // Revenue summary
      Order.aggregate([
        { $match: { store: store._id, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ]),
      // Low stock listings
      VendorListing.find({ store: store._id, stock: { $gt: 0, $lte: 10 } })
        .populate('catalogProduct')
        .limit(5),
      // Out of stock listings
      VendorListing.find({ store: store._id, stock: 0 })
        .populate('catalogProduct')
        .limit(5),
      // Recently updated products
      VendorListing.find({ store: store._id })
        .populate('catalogProduct')
        .sort({ updatedAt: -1 })
        .limit(5)
    ]);

    const totalRevenue = revenueResult[0] ? revenueResult[0].totalRevenue : 0;

    res.json({
      success: true,
      dashboard: {
        todayOrders,
        pendingOrdersCount,
        totalRevenue,
        lowStockProducts: lowStockListings.map(mapListingToProduct).filter(Boolean),
        outOfStockProducts: outOfStockListings.map(mapListingToProduct).filter(Boolean),
        recentlyUpdated: recentUpdatedListings.map(mapListingToProduct).filter(Boolean)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
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
};
