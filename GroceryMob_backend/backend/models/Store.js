const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Store name is required'], trim: true },
    emoji: { type: String, default: '🏪' },
    address: { type: String, required: [true, 'Address is required'], trim: true },
    zipCode: { type: String, required: [true, 'Zip code is required'], trim: true },
    area: { type: String, required: [true, 'Area is required'], trim: true },
    city: { type: String, required: [true, 'City is required'], trim: true },
    location: {
      type: { type: String, default: 'Point', enum: ['Point'] },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    storeType: { type: String, default: 'Kirana Store' },
    openTime: { type: String, default: '07:00' },
    closeTime: { type: String, default: '22:00' },
    isClosedToday: { type: Boolean, default: false },
    deliveryAvailable: { type: Boolean, default: true },
    pickupAvailable: { type: Boolean, default: true },
    minOrder: { type: Number, default: 0 },
    freeDeliveryThreshold: { type: Number, default: 0 },
    deliveryRadiusKm: { type: Number, default: 10 },
    freeDeliveryRadiusKm: { type: Number, default: 0 },
    baseDeliveryCharge: { type: Number, default: 0 },
    estimatedDeliveryTime: { type: String, default: '30 mins' },
    image: { type: String, default: '' },
    categories: [{ type: String }],
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending_review', 'approved', 'rejected'], default: 'pending_review' },
    contactDetails: {
      phone: { type: String },
      email: { type: String }
    },
    businessDetails: {
      taxId: { type: String },
      businessLicence: { type: String }
    },
    verificationDocuments: [{ type: String }]
  },
  { timestamps: true }
);

// Create geospatial index for geo-near store searches
storeSchema.index({ location: '2dsphere' });
storeSchema.index({ zipCode: 1 });
storeSchema.index({ name: 'text', area: 'text', storeType: 'text' });

module.exports = mongoose.model('Store', storeSchema);
