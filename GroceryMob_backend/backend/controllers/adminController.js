const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// ── POST /api/admin/login ─────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    if (user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Access denied. Admins only.' });

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated.' });

    const token = signToken(user._id);
    user.password = undefined;

    res.json({ success: true, token, user });
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/dashboard ──────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    // Run all aggregations in parallel for performance
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueResult,
      recentOrders,
      ordersByStatus,
      lowStockProducts,
      totalCustomers,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments({ isAvailable: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' }, avgOrderValue: { $avg: '$total' } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email'),
      Order.aggregate([
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      ]),
      Product.find({ stock: { $lte: 10 }, isAvailable: true })
        .select('name stock category')
        .sort({ stock: 1 })
        .limit(10),
      Customer.countDocuments(),
    ]);

    const revenue = revenueResult[0] || { totalRevenue: 0, avgOrderValue: 0 };

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalUsers,
          totalCustomers,
          totalProducts,
          totalOrders,
          totalRevenue: parseFloat((revenue.totalRevenue ?? 0).toFixed(2)),
          avgOrderValue: parseFloat((revenue.avgOrderValue ?? 0).toFixed(2)),
        },
        recentOrders,
        ordersByStatus: ordersByStatus.reduce((acc, s) => {
          acc[s._id] = s.count;
          return acc;
        }, {}),
        lowStockProducts,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/users ──────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: 'user' };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, total, page: Number(page), users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/admin/users/:id/toggle-status ────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { adminLogin, getDashboard, getAllUsers, toggleUserStatus };
