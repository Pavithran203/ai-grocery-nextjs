const admin = require('firebase-admin');
const User = require('../models/User');
const Customer = require('../models/Customer');

// Helper to normalize phone numbers
const normalizePhone = (phone) => {
  if (!phone) return null;
  return phone.replace(/\D/g, '').slice(-10);
};

// ── POST /api/auth/register ───────────────────────────────────
// This is called AFTER Firebase signup to sync profile
const register = async (req, res) => {
  try {
    const { uid, name, email, phone } = req.body;
    
    if (!uid || !name || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = normalizePhone(phone);

    // Check if user already exists
    let user = await User.findOne({ firebaseUid: uid });
    
    if (user) {
      return res.status(200).json({ success: true, user, message: 'User already exists.' });
    }

    // Create new user linked to Firebase UID
    user = await User.create({
      firebaseUid: uid,
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      isGuest: false
    });

    // Sync with Customer record
    try {
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || name;
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

      await Customer.create({
        firstName,
        lastName,
        email: normalizedEmail,
        phone: normalizedPhone || 'Not Provided',
        status: 'active',
        accountType: 'regular',
        source: 'mobile_app',
      });
    } catch (custErr) {
      console.error('Customer sync error (non-fatal):', custErr.message);
    }

    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/auth/me ──────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    // req.user is populated by 'protect' middleware after verifying Firebase token
    const user = await User.findById(req.user._id).populate('favoriteStores');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/auth/me ──────────────────────────────────────────
const updateMe = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'phone', 'avatar', 'favoriteStores'];
    const updates = {};
    
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    if (updates.phone) updates.phone = normalizePhone(updates.phone);

    const user = await User.findByIdAndUpdate(req.user._id, updates, { 
      new: true, runValidators: true 
    }).populate('favoriteStores');

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Address Handlers ──
const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Initialize addresses if it doesn't exist
    if (!user.addresses) user.addresses = [];

    const newAddress = {
      ...req.body,
      isDefault: user.addresses.length === 0 ? true : req.body.isDefault
    };

    if (newAddress.isDefault) {
      user.addresses.forEach(a => a.isDefault = false);
    }

    user.addresses.push(newAddress);
    await user.save();
    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (err) {
    console.error('Add Address Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { 
  register, 
  getMe, 
  updateMe, 
  addAddress, 
  deleteAddress 
};
