const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    price:         { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, default: 0 },
    rating:        { type: Number, default: 0, min: 0, max: 5 },
    reviewCount:   { type: Number, default: 0 },
    category:      { type: String, required: true },
    brand:         { type: String, default: '' },
    weight:        { type: String, default: '' },
    image:         { type: String, default: '' },
    description:   { type: String, default: '' },
    unit:          { type: String, default: '1 kg' },
    stock:         { type: Number, default: 100 },
    stockStatus:   { type: String, enum: ['IN_STOCK', 'LIMITED', 'OUT_OF_STOCK'], default: 'IN_STOCK' },
    isAvailable:   { type: Boolean, default: true },
    isTrending:    { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    isMegaDeal:    { type: Boolean, default: false },
    tags:          [{ type: String }],
    // IDs of products that pair well with this one (AI smart suggestions)
    suggestedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    // Reference to the store selling this product
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  },
  { timestamps: true }
);

// Full-text search index
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isTrending: 1 });
productSchema.index({ isRecommended: 1 });
productSchema.index({ stockStatus: 1 });
productSchema.index({ store: 1 });

module.exports = mongoose.model('Product', productSchema);

