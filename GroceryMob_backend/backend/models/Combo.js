const mongoose = require('mongoose');

const comboSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    originalPrice: { type: Number, required: true, min: 0 },
    comboPrice: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    type: { type: String, enum: ['Breakfast', 'Snacks', 'Summer', 'Family', 'Smart', 'General'], default: 'General' },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Combo', comboSchema);
