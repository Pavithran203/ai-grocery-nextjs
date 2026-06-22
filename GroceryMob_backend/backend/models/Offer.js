const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  code:            { type: String, required: true, unique: true, uppercase: true, trim: true },
  description:     { type: String, default: '' },
  discountPercent: { type: Number, required: true, min: 1, max: 100 },
  minCartValue:    { type: Number, default: 0 },
  maxDiscount:     { type: Number, default: 0 }, // 0 = no cap
  isActive:        { type: Boolean, default: true },
  expiresAt:       { type: Date, default: null },
  usageLimit:      { type: Number, default: 0 }, // 0 = unlimited
  usageCount:      { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
