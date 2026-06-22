const Offer = require('../models/Offer');

// ── GET /api/offers ───────────────────────────────────────────
const getOffers = async (_req, res) => {
  try {
    const offers = await Offer.find({ isActive: true });
    res.json({ success: true, offers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/offers/validate?code=XX&cart_total=YY ────────────
const validateOffer = async (req, res) => {
  try {
    const { code, cart_total } = req.query;
    if (!code) return res.status(400).json({ success: false, message: 'Code required.' });

    const offer = await Offer.findOne({ code: code.toUpperCase(), isActive: true });
    if (!offer) return res.status(404).json({ success: false, valid: false, message: 'Coupon not found.' });

    if (offer.expiresAt && new Date() > offer.expiresAt)
      return res.status(400).json({ success: false, valid: false, message: 'Coupon has expired.' });

    if (offer.usageLimit > 0 && offer.usageCount >= offer.usageLimit)
      return res.status(400).json({ success: false, valid: false, message: 'Coupon usage limit reached.' });

    const cartTotal = parseFloat(cart_total || 0);
    if (cartTotal < offer.minCartValue)
      return res.status(400).json({ success: false, valid: false, message: `Min cart value ₹${offer.minCartValue} required.` });

    res.json({ success: true, valid: true, offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/offers (admin) ──────────────────────────────────
const createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, offer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PUT /api/offers/:id (admin) ───────────────────────────────
const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found.' });
    res.json({ success: true, offer });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/offers/:id (admin) ────────────────────────────
const deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Offer deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getOffers, validateOffer, createOffer, updateOffer, deleteOffer };
