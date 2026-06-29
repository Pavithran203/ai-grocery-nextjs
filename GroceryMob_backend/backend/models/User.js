const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  fullName: { type: String, required: false },
  phone: { type: String, required: false },
  line1: { type: String, required: false },
  line2: { type: String, default: '' },
  city: { type: String, required: false },
  state: { type: String, required: false },
  pincode: { type: String, required: false },
  isDefault: { type: Boolean, default: false },
  encryptedPayload: {
    ciphertext: { type: String },
    iv: { type: String },
    algorithm: { type: String, default: 'AES-GCM-256' },
    version: { type: String, default: '1.0' }
  }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    firebaseUid: { type: String, unique: true, sparse: true },
    password: { type: String, minlength: 6, select: false },
    phone: { type: String, unique: true, sparse: true, trim: true },
    encryptedPhone: {
      ciphertext: { type: String },
      iv: { type: String }
    },
    encryptionSalt: { type: String },
    rsaPublicKey: { type: String },
    isGuest: { type: Boolean, default: false },
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin', 'delivery', 'vendor'], default: 'user' },
    accountType: { type: String, enum: ['regular', 'premium', 'vip'], default: 'regular' },
    addresses: [addressSchema],
    favoriteStores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }],
    isActive: { type: Boolean, default: true },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
