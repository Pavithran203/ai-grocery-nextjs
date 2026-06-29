const Store = require('../models/Store');

// ── Allowed fields for create/update
const ALLOWED_FIELDS = [
  'name', 'emoji', 'address', 'zipCode', 'area', 'city',
  'location', 'rating', 'reviewCount', 'storeType', 'openTime', 'closeTime',
  'isClosedToday', 'deliveryAvailable', 'pickupAvailable', 'minOrder',
  'freeDeliveryThreshold', 'deliveryRadiusKm', 'freeDeliveryRadiusKm',
  'baseDeliveryCharge', 'estimatedDeliveryTime', 'image', 'categories', 'vendor'
];

const sanitizeStoreBody = (body) => {
  const clean = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) clean[key] = body[key];
  }
  return clean;
};

// ── GET /api/stores ───────────────────────────────────────────
const getStores = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 15, search, limit = 50, page = 1 } = req.query;

    const filter = {};
    if (search) {
      filter.$text = { $search: String(search).trim() };
    }

    let stores;
    const skip = (Number(page) - 1) * Number(limit);

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ success: false, message: 'Invalid coordinates provided.' });
      }

      // GeoJSON query aggregation with distance in meters
      const aggregationStages = [
        {
          $geoNear: {
            near: { type: 'Point', coordinates: [longitude, latitude] },
            distanceField: 'distance', // field to store distance in meters
            maxDistance: parseFloat(maxDistance) * 1000, // convert km to meters
            spherical: true,
            query: filter
          }
        },
        { $skip: skip },
        { $limit: Number(limit) }
      ];

      stores = await Store.aggregate(aggregationStages);
    } else {
      stores = await Store.find(filter).skip(skip).limit(Number(limit)).lean();
    }

    const total = await Store.countDocuments(filter);

    // Format distance in km
    const formattedStores = stores.map(store => {
      if (store.distance !== undefined) {
        store.distanceKm = parseFloat((store.distance / 1000).toFixed(2));
      }
      return store;
    });

    res.json({
      success: true,
      total,
      page: Number(page),
      stores: formattedStores
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/stores/:id ───────────────────────────────────────
const getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }
    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/stores (admin / vendor onboarding) ──────────────
const createStore = async (req, res) => {
  try {
    const data = sanitizeStoreBody(req.body);
    
    if (!data.name || !data.address || !data.zipCode || !data.city) {
      return res.status(400).json({ success: false, message: 'Name, address, zipCode and city are required.' });
    }

    // Default to Point schema if coordinates are provided
    if (req.body.coordinates && Array.isArray(req.body.coordinates)) {
      data.location = {
        type: 'Point',
        coordinates: req.body.coordinates // [longitude, latitude]
      };
    }

    const store = await Store.create(data);
    res.status(201).json({ success: true, store });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PUT /api/stores/:id ───────────────────────────────────────
const updateStore = async (req, res) => {
  try {
    const data = sanitizeStoreBody(req.body);

    if (req.body.coordinates && Array.isArray(req.body.coordinates)) {
      data.location = {
        type: 'Point',
        coordinates: req.body.coordinates
      };
    }

    const store = await Store.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });

    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }

    res.json({ success: true, store });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/stores/:id ────────────────────────────────────
const deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) {
      return res.status(404).json({ success: false, message: 'Store not found.' });
    }
    res.json({ success: true, message: 'Store deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
};
