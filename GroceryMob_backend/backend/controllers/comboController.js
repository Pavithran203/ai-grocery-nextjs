const Combo = require('../models/Combo');

const getActiveCombos = async (req, res) => {
  try {
    const combos = await Combo.find({ isActive: true })
      .populate('products', 'name price image category')
      .sort({ createdAt: -1 });
    res.json({ success: true, combos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const generateSmartCombos = async (req, res) => {
  try {
    // For now, return some random combos from active ones 
    // to simulate "smart" generation
    const combos = await Combo.aggregate([
      { $match: { isActive: true } },
      { $sample: { size: 3 } }
    ]);
    const populated = await Combo.populate(combos, { path: 'products', select: 'name price image category' });
    res.json({ success: true, combos: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getActiveCombos,
  generateSmartCombos
};
