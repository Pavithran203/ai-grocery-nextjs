const Product = require('../models/Product');

// ── Allowed fields for create/update (prevents field injection) ──────────────
const ALLOWED_FIELDS = [
  'name', 'price', 'originalPrice', 'rating', 'reviewCount',
  'category', 'brand', 'weight', 'image', 'description', 'unit', 'stock', 'stockStatus',
  'isAvailable', 'isTrending', 'isRecommended', 'isMegaDeal',
  'tags', 'suggestedWith',
];

const sanitizeProductBody = (body) => {
  const clean = {};
  for (const key of ALLOWED_FIELDS) {
    if (body[key] !== undefined) clean[key] = body[key];
  }
  return clean;
};

const validateProductBody = (body, requireAll = false) => {
  const errors = [];
  if (requireAll || body.name !== undefined) {
    if (!body.name || typeof body.name !== 'string' || !body.name.trim())
      errors.push('name is required and must be a non-empty string.');
  }
  if (requireAll || body.price !== undefined) {
    if (body.price === undefined || isNaN(Number(body.price)) || Number(body.price) < 0)
      errors.push('price is required and must be a non-negative number.');
  }
  if (requireAll || body.category !== undefined) {
    if (!body.category || typeof body.category !== 'string' || !body.category.trim())
      errors.push('category is required and must be a non-empty string.');
  }
  if (requireAll || body.image !== undefined) {
    if (body.image !== undefined && body.image !== '' && typeof body.image !== 'string')
      errors.push('image must be a valid URL string when provided.');
  }
  return errors;
};

// ── GET /api/products ─────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { category, search: rawSearch, trending, recommended, megaDeal, limit = 50, page = 1 } = req.query;

    // ── Security: coerce search to a plain string to block NoSQL operator injection
    // e.g. ?search[$gt]='' is parsed by Express as { $gt: '' } — casting to String
    // neutralises operator objects before they reach the Mongoose query engine.
    const search = rawSearch !== undefined ? String(rawSearch).trim() : undefined;

    const filter = {};
    if (req.query.admin !== 'true') {
      filter.isAvailable = true;
    }
    
    if (category) filter.category = { $regex: new RegExp(String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };
    if (trending === 'true') filter.isTrending = true;
    if (recommended === 'true') filter.isRecommended = true;
    if (megaDeal === 'true') filter.isMegaDeal = true;
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const products = await Product.find(filter).skip(skip).limit(Number(limit));
    const total = await Product.countDocuments(filter);

    res.json({ success: true, total, page: Number(page), products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/products/:id ─────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('suggestedWith');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/products/:id/suggestions ────────────────────────
const getSmartSuggestions = async (req, res) => {
  try {
    // Accept comma-separated product IDs in query: ?ids=abc,def
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (!ids.length) return res.json({ success: true, suggestions: [] });

    const products = await Product.find({ _id: { $in: ids } }).populate('suggestedWith');
    const suggestionSet = new Map();
    products.forEach(p => {
      p.suggestedWith.forEach(s => {
        if (!ids.includes(s._id.toString())) {
          suggestionSet.set(s._id.toString(), s);
        }
      });
    });

    res.json({ success: true, suggestions: Array.from(suggestionSet.values()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/products (admin) ────────────────────────────────
const createProduct = async (req, res) => {
  try {
    const errors = validateProductBody(req.body, true);
    if (errors.length) return res.status(400).json({ success: false, errors });
    const data = sanitizeProductBody(req.body);
    const product = await Product.create(data);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PUT /api/products/:id (admin) ─────────────────────────────
const updateProduct = async (req, res) => {
  try {
    const errors = validateProductBody(req.body, false);
    if (errors.length) return res.status(400).json({ success: false, errors });
    const data = sanitizeProductBody(req.body);
    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true, runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/products/:id (admin) ──────────────────────────
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProducts, getProductById, getSmartSuggestions, createProduct, updateProduct, deleteProduct };
