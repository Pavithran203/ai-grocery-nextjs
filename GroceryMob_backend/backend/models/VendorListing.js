const mongoose = require('mongoose');

const vendorListingSchema = new mongoose.Schema(
  {
    store:             { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    catalogProduct:    { type: mongoose.Schema.Types.ObjectId, ref: 'MasterProduct', required: true },
    storeSku:          { type: String, default: '' },
    price:             { type: Number, required: true, min: 0 }, // Selling price
    originalPrice:     { type: Number, default: 0 }, // Discount price or baseline price
    stock:             { type: Number, required: true, default: 100 }, // Available quantity
    reservedStock:     { type: Number, default: 0 }, // Reserved quantity
    isAvailable:       { type: Boolean, default: true }, // Active status
    lowStockThreshold: { type: Number, default: 10 },
    expiryDate:        { type: Date },
    preparationTime:   { type: String, default: '10 mins' },
  },
  { timestamps: true }
);

// Indexes
vendorListingSchema.index({ store: 1, catalogProduct: 1 }, { unique: true });
vendorListingSchema.index({ catalogProduct: 1 });
vendorListingSchema.index({ store: 1 });

module.exports = mongoose.model('VendorListing', vendorListingSchema);
