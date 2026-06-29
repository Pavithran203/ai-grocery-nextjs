const MasterProduct = require('../models/MasterProduct');
const VendorListing = require('../models/VendorListing');
const Store = require('../models/Store');

const mapListingToProduct = (listing) => {
  if (!listing || !listing.catalogProduct) return null;
  const p = listing.catalogProduct;
  const s = listing.store || {};
  
  const stockStatus = listing.stock <= 0 
    ? 'OUT_OF_STOCK' 
    : listing.stock <= (listing.lowStockThreshold || 10) 
      ? 'LIMITED' 
      : 'IN_STOCK';
  
  return {
    _id: listing._id,
    id: listing._id.toString(),
    name: p.name,
    price: listing.price,
    originalPrice: listing.originalPrice || listing.price,
    rating: 4.5,
    reviewCount: 25,
    category: p.category,
    brand: p.brand || 'NearMart Organic',
    weight: p.weight || '1 kg',
    unit: p.weight || '1 kg',
    image: p.image || '',
    description: p.description || '',
    stock: listing.stock,
    stockStatus,
    isAvailable: listing.isAvailable && p.status === 'approved' && listing.stock > 0,
    store: {
      _id: s._id,
      name: s.name,
      emoji: s.emoji || '🏪',
      image: s.image || '',
      estimatedDeliveryTime: s.estimatedDeliveryTime || '30 mins',
    },
    // structured product record fields expected by client
    productId: p._id,
    productName: p.name,
    brand: p.brand || 'NearMart Organic',
    weightOrUnit: p.weight || '1 kg',
    imageUrl: p.image || '',
    imageAltText: p.imageAltText || `${p.name}, ${p.weight}`,
    storeId: s._id,
    storeName: s.name,
    isImageVerified: true,
  };
};

// ── GET /api/products ─────────────────────────────────────────
const getProducts = async (req, res) => {
  try {
    const { category, search, store, limit = 50, page = 1 } = req.query;

    const filter = {};
    if (store) {
      filter.store = store;
    }

    let listings = await VendorListing.find(filter)
      .populate('catalogProduct')
      .populate('store');

    let productsMapped = listings
      .map(mapListingToProduct)
      .filter(Boolean);

    // Apply filters
    if (req.query.admin !== 'true') {
      productsMapped = productsMapped.filter(p => p.isAvailable);
    }

    if (category) {
      const catRegex = new RegExp(String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      productsMapped = productsMapped.filter(p => catRegex.test(p.category));
    }

    if (search) {
      const searchStr = String(search).toLowerCase();
      productsMapped = productsMapped.filter(p => 
        p.name.toLowerCase().includes(searchStr) || 
        p.description.toLowerCase().includes(searchStr) || 
        p.brand.toLowerCase().includes(searchStr)
      );
    }

    // Group / Deduplicate for public customer display if no store is specified
    if (!store && req.query.admin !== 'true') {
      const catalogGroups = {};
      for (const p of productsMapped) {
        const catId = p.productId.toString();
        if (!catalogGroups[catId]) {
          catalogGroups[catId] = [];
        }
        catalogGroups[catId].push(p);
      }

      const uniqueProducts = [];
      for (const catId in catalogGroups) {
        const group = catalogGroups[catId];
        // Sort by price ascending
        group.sort((a, b) => a.price - b.price);
        
        const selected = group[0];
        selected.allStoreOffers = group.map(g => ({
          storeId: g.store._id,
          storeName: g.store.name,
          price: g.price,
          originalPrice: g.originalPrice,
          stockStatus: g.stockStatus,
          stock: g.stock,
          deliveryEstimate: g.store.estimatedDeliveryTime || '30 mins',
        }));
        selected.availableStoresCount = group.length;
        selected.minPrice = selected.price;

        uniqueProducts.push(selected);
      }
      productsMapped = uniqueProducts;
    }

    const total = productsMapped.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedProducts = productsMapped.slice(skip, skip + Number(limit));

    res.json({ success: true, total, page: Number(page), products: paginatedProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/products/:id ─────────────────────────────────────
const getProductById = async (req, res) => {
  try {
    const listing = await VendorListing.findById(req.params.id)
      .populate('catalogProduct')
      .populate('store');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Product listing not found.' });
    }

    const productMapped = mapListingToProduct(listing);
    
    // Get alternative store offers
    const otherListings = await VendorListing.find({
      catalogProduct: listing.catalogProduct._id,
      _id: { $ne: listing._id }
    }).populate('store');

    const allOffers = [
      {
        storeId: listing.store._id,
        storeName: listing.store.name,
        price: listing.price,
        originalPrice: listing.originalPrice,
        stockStatus: productMapped.stockStatus,
        stock: listing.stock,
        deliveryEstimate: listing.store.estimatedDeliveryTime || '30 mins',
      },
      ...otherListings.map(l => {
        const lStockStatus = l.stock <= 0 ? 'OUT_OF_STOCK' : l.stock <= (l.lowStockThreshold || 10) ? 'LIMITED' : 'IN_STOCK';
        return {
          storeId: l.store._id,
          storeName: l.store.name,
          price: l.price,
          originalPrice: l.originalPrice,
          stockStatus: lStockStatus,
          stock: l.stock,
          deliveryEstimate: l.store.estimatedDeliveryTime || '30 mins',
        };
      })
    ];

    productMapped.allStoreOffers = allOffers;
    productMapped.availableStoresCount = allOffers.length;
    productMapped.minPrice = Math.min(...allOffers.map(o => o.price));

    res.json({ success: true, product: productMapped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/products/suggestions ───────────────────────────
const getSmartSuggestions = async (req, res) => {
  try {
    const ids = (req.query.ids || '').split(',').filter(Boolean);
    if (!ids.length) return res.json({ success: true, suggestions: [] });

    const listings = await VendorListing.find({ _id: { $in: ids } })
      .populate('catalogProduct')
      .populate('store');

    const mapped = listings.map(mapListingToProduct).filter(Boolean);
    res.json({ success: true, suggestions: mapped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin Actions ──
const createProduct = async (req, res) => {
  try {
    const { name, brand, category, weight, unit, image, image_url, description, price = 0, stock = 100, available = true } = req.body;
    
    // Create MasterProduct
    const master = await MasterProduct.create({
      name,
      brand: brand || 'NearMart Organic',
      category,
      weight: weight || unit || '1 kg',
      image: image || image_url || '',
      description: description || `Fresh ${name}`,
      status: 'approved',
    });

    // Find a store to associate with (default to first approved store or first store)
    let store = await Store.findOne({ status: 'approved' });
    if (!store) {
      store = await Store.findOne();
    }

    if (store) {
      // Create VendorListing
      const listing = await VendorListing.create({
        store: store._id,
        catalogProduct: master._id,
        price: Number(price) || 50,
        originalPrice: (Number(price) || 50) * 1.2,
        stock: Number(stock) || 100,
        isAvailable: available !== false,
        lowStockThreshold: 10,
        preparationTime: '15 mins',
      });

      // Create legacy Product
      const Product = require('../models/Product');
      const stockStatus = listing.stock <= 0 ? 'OUT_OF_STOCK' : listing.stock <= 10 ? 'LIMITED' : 'IN_STOCK';
      const createdProd = await Product.create({
        _id: listing._id,
        name: master.name,
        price: listing.price,
        originalPrice: listing.originalPrice,
        category: master.category,
        brand: master.brand,
        weight: master.weight,
        unit: master.weight,
        image: master.image,
        description: master.description,
        stock: listing.stock,
        stockStatus,
        isAvailable: listing.isAvailable,
        store: store._id,
      });

      return res.status(201).json({ success: true, product: { ...createdProd.toObject(), id: listing._id.toString() } });
    }

    res.status(201).json({ success: true, product: master });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    // Check if it's a VendorListing / Product ID first
    let listing = await VendorListing.findById(id);
    if (listing) {
      const { price, stock, available, name, category, variants, unit, image_url, image, description } = req.body;
      
      if (price !== undefined) listing.price = Number(price);
      if (stock !== undefined) listing.stock = Number(stock);
      if (available !== undefined) listing.isAvailable = !!available;
      await listing.save();

      // Also update the linked MasterProduct
      const master = await MasterProduct.findById(listing.catalogProduct);
      if (master) {
        if (name !== undefined) master.name = name;
        if (category !== undefined) master.category = category;
        if (variants !== undefined) master.weight = Array.isArray(variants) ? variants[0] : variants;
        if (unit !== undefined) master.weight = unit;
        if (image !== undefined) master.image = image;
        if (image_url !== undefined) master.image = image_url;
        if (description !== undefined) master.description = description;
        await master.save();
      }

      // Also update the legacy Product model
      const Product = require('../models/Product');
      const stockStatus = listing.stock <= 0 ? 'OUT_OF_STOCK' : listing.stock <= (listing.lowStockThreshold || 10) ? 'LIMITED' : 'IN_STOCK';
      const updatedProd = await Product.findByIdAndUpdate(id, {
        $set: {
          price: listing.price,
          stock: listing.stock,
          isAvailable: listing.isAvailable,
          stockStatus,
          ...(master && {
            name: master.name,
            category: master.category,
            brand: master.brand,
            weight: master.weight,
            unit: master.weight,
            image: master.image,
            description: master.description
          })
        }
      }, { new: true });

      return res.json({ success: true, product: { ...updatedProd.toObject(), id: listing._id.toString() } });
    }

    // Otherwise, check if it's a MasterProduct
    const masterProduct = await MasterProduct.findByIdAndUpdate(id, req.body, { new: true });
    if (masterProduct) {
      return res.json({ success: true, product: masterProduct });
    }

    res.status(404).json({ success: false, message: 'Product or listing not found' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    // Check if it's a listing ID
    const listing = await VendorListing.findByIdAndDelete(id);
    if (listing) {
      const Product = require('../models/Product');
      await Product.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Listing and product deleted.' });
    }

    // Otherwise, delete MasterProduct
    await MasterProduct.findByIdAndDelete(id);
    res.json({ success: true, message: 'Master product deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  getSmartSuggestions,
  createProduct,
  updateProduct,
  deleteProduct,
};
