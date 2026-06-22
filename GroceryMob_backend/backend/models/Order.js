const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  category: { type: String },
  quantity: { type: Number, required: true, min: 1 },
});

const addressSchema = new mongoose.Schema({
  fullName: String,
  phone: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  pincode: String,
});

const paymentDetailsSchema = new mongoose.Schema({
  upiId: { type: String, default: '' },
  bankName: { type: String, default: '' },
  walletProvider: { type: String, default: '' },
  cardHolderName: { type: String, default: '' },
  cardNumber: { type: String, default: '' }, // Should be encrypted in production
  cardExpiry: { type: String, default: '' },
  // Don't store CVV - it should never be persisted
});

const trackingEventSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  message: { type: String },
  location: { type: String },
});

const deliveryPartnerSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  phone: { type: String, default: '' },
  vehicleNumber: { type: String, default: '' },
  rating: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    isGuestOrder: { type: Boolean, default: false },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    deliveryAddress: addressSchema,
    paymentMethod: { type: String, enum: ['COD', 'card', 'upi', 'wallet', 'netbanking'], default: 'COD' },
    paymentDetails: paymentDetailsSchema,
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus: {
      type: String,
      enum: ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    storeId: { type: String },
    storeName: { type: String },
    deliveryType: { type: String, enum: ['delivery', 'pickup'], default: 'delivery' },
    estimatedDelivery: { type: Date },
    deliveredAt: { type: Date },
    notes: { type: String, default: '' },
    trackingEvents: [trackingEventSchema],
    deliveryPartner: deliveryPartnerSchema,
  },
  { timestamps: true }
);

// Auto-generate order number before saving
orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'NM' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
