const mongoose = require('mongoose');

const masterProductSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    brand:         { type: String, default: '' },
    category:      { type: String, required: true },
    weight:        { type: String, default: '1 kg' }, // Weight or unit size
    image:         { type: String, default: '' },
    imageAltText:  { type: String, default: '' },
    description:   { type: String, default: '' },
    barcode:       { type: String, default: '' },
    status:        { type: String, enum: ['pending_review', 'approved', 'rejected'], default: 'approved' },
  },
  { timestamps: true }
);

// Full-text search index
masterProductSchema.index({ name: 'text', description: 'text', brand: 'text' });
masterProductSchema.index({ category: 1 });
masterProductSchema.index({ status: 1 });

module.exports = mongoose.model('MasterProduct', masterProductSchema);
