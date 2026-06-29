const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Customer = require('../models/Customer');
const MasterProduct = require('../models/MasterProduct');
const Store = require('../models/Store');
const VendorListing = require('../models/VendorListing');

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
    const filter = { role: { $in: ['user', 'customer'] } };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    // Enrich with order stats
    const enriched = await Promise.all(users.map(async (u) => {
      const userObj = u.toObject();
      const orderCount = await Order.countDocuments({ user: u._id });
      const revenueResult = await Order.aggregate([
        { $match: { user: u._id, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]);
      userObj.totalOrders = orderCount;
      userObj.totalSpent = revenueResult[0]?.total || 0;
      return userObj;
    }));

    res.json({ success: true, total, page: Number(page), users: enriched });
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

const getVendorStores = async (req, res) => {
  try {
    const stores = await Store.find().populate('vendor', 'name email phone role');
    res.json({ success: true, stores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const approveVendorStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });

    store.status = 'approved';
    await store.save();

    if (store.vendor) {
      await User.findByIdAndUpdate(store.vendor, { role: 'vendor' });
    }

    res.json({ success: true, store, message: 'Vendor store approved successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const rejectVendorStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });

    store.status = 'rejected';
    await store.save();

    res.json({ success: true, store, message: 'Vendor store rejected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProductRequests = async (req, res) => {
  try {
    const requests = await MasterProduct.find({ status: 'pending_review' });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const approveProductRequest = async (req, res) => {
  try {
    const product = await MasterProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product request not found.' });

    product.status = 'approved';
    await product.save();

    res.json({ success: true, product, message: 'Product request approved.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const rejectProductRequest = async (req, res) => {
  try {
    const product = await MasterProduct.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product request not found.' });

    product.status = 'rejected';
    await product.save();

    res.json({ success: true, product, message: 'Product request rejected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/metrics ────────────────────────────────────
const getMetrics = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      todayOrders,
      revenueAll,
      revenueToday,
      lowStock,
      deliveryPartnerCount,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['user', 'customer'] } }),
      Product.countDocuments({ isAvailable: true }),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { orderStatus: { $ne: 'cancelled' }, createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Product.find({ stock: { $lte: 10 }, isAvailable: true })
        .select('name stock category')
        .sort({ stock: 1 })
        .limit(10)
        .lean(),
      User.countDocuments({ role: 'delivery' }),
    ]);

    // Build weekly order trend (last 7 days)
    const orderTrends = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayResult = await Order.aggregate([
        { $match: { createdAt: { $gte: dayStart, $lt: dayEnd }, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]);

      orderTrends.push({
        day: dayNames[dayStart.getDay()],
        orders: dayResult[0]?.count || 0,
        revenue: dayResult[0]?.revenue || 0,
      });
    }

    // Build monthly revenue (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueSeries = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthResult = await Order.aggregate([
        { $match: { createdAt: { $gte: monthStart, $lt: monthEnd }, orderStatus: { $ne: 'cancelled' } } },
        { $group: { _id: null, revenue: { $sum: '$total' } } },
      ]);

      revenueSeries.push({
        month: monthNames[monthStart.getMonth()],
        revenue: monthResult[0]?.revenue || 0,
      });
    }

    // Inventory alerts from vendor listings
    const inventoryAlerts = lowStock.map(p => ({
      id: p._id,
      product: p.name,
      issue: p.stock === 0 ? 'Out of Stock' : 'Low Stock',
      quantity: p.stock,
      warehouse: p.category || 'General',
    }));

    res.json({
      success: true,
      metrics: {
        totalOrders,
        revenueToday: revenueToday[0]?.total || 0,
        activeUsers: totalUsers,
        activePartners: deliveryPartnerCount,
        totalProducts,
        todayOrders,
        totalRevenue: revenueAll[0]?.total || 0,
      },
      orderTrends,
      revenueSeries,
      lowStockProducts: lowStock,
      inventoryAlerts,
    });
  } catch (err) {
    console.error('Metrics error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/orders ────────────────────────────────────
const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    // Normalize for admin frontend format
    const normalized = orders.map(o => {
      const statusMap = {
        placed: 'Pending',
        confirmed: 'Packed',
        preparing: 'Packed',
        packed: 'Packed',
        out_for_delivery: 'Out for Delivery',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
      };
      const rawStatus = String(o.orderStatus || 'placed').toLowerCase();
      const status = statusMap[rawStatus] || 'Pending';

      return {
        id: o._id,
        customer: o.user?.name || o.deliveryAddress?.fullName || 'Customer',
        email: o.user?.email || '',
        phone: o.user?.phone || o.deliveryAddress?.phone || '',
        amount: o.total || 0,
        subtotal: o.subtotal || 0,
        deliveryFee: o.deliveryFee || 0,
        tax: o.tax || 0,
        status,
        orderStatus: o.orderStatus,
        assignedTo: o.deliveryPartner?.name || 'Unassigned',
        placedAt: o.createdAt,
        createdAt: o.createdAt,
        deliveryEta: o.estimatedDelivery ? new Date(o.estimatedDelivery).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '30 min',
        address: o.deliveryAddress ? `${o.deliveryAddress.line1 || ''}, ${o.deliveryAddress.pincode || ''}` : 'N/A',
        paymentMethod: o.paymentMethod || 'COD',
        items: (o.items || []).map(i => ({
          productId: i.product,
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        statusHistory: (o.trackingEvents || []).map(e => ({
          status: statusMap[String(e.status).toLowerCase()] || e.status,
          timestamp: e.timestamp || o.createdAt,
        })),
        notes: o.notes || '',
        // E2EE fields (pass through for delivery decryption)
        encryptedAddress: o.encryptedAddress,
        encryptedNotes: o.encryptedNotes,
        customerKeyBlob: o.customerKeyBlob,
        deliveryKeyBlob: o.deliveryKeyBlob,
      };
    });

    res.json({ success: true, orders: normalized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/admin/orders/:id ──────────────────────────────
const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { status } = req.body;
    const statusReverseMap = {
      'Pending': 'placed',
      'Packed': 'packed',
      'Out for Delivery': 'out_for_delivery',
      'Delivered': 'delivered',
      'Cancelled': 'cancelled',
    };
    const backendStatus = statusReverseMap[status] || status.toLowerCase();

    const update = {
      orderStatus: backendStatus,
      ...(backendStatus === 'delivered' && { deliveredAt: new Date() }),
    };

    // Push tracking event
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.orderStatus = backendStatus;
    if (backendStatus === 'delivered') order.deliveredAt = new Date();
    order.trackingEvents.push({
      status: backendStatus,
      message: `Order status updated to ${status}`,
      location: 'Admin Panel',
      timestamp: new Date(),
    });

    // If delivering, restore stock for cancelled orders
    if (backendStatus === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
          $set: { isAvailable: true },
        });
      }
    }

    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/delivery-partners ─────────────────────────
const getDeliveryPartners = async (req, res) => {
  try {
    const partners = await User.find({ role: 'delivery' })
      .select('-password')
      .lean();

    // Enrich with delivery stats
    const enriched = await Promise.all(partners.map(async (p) => {
      const completedOrders = await Order.countDocuments({
        deliveryStaff: p._id,
        orderStatus: 'delivered',
      });
      const activeOrders = await Order.countDocuments({
        deliveryStaff: p._id,
        orderStatus: { $in: ['out_for_delivery', 'packed'] },
      });

      return {
        id: p._id,
        name: p.name,
        email: p.email,
        phone: p.phone || 'N/A',
        location: 'Chennai',
        status: p.isActive ? 'On Duty' : 'Offline',
        completed: completedOrders,
        active: activeOrders,
        rating: 4.5 + Math.random() * 0.5,
      };
    }));

    res.json({ success: true, partners: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  adminLogin,
  getDashboard,
  getMetrics,
  getAllUsers,
  toggleUserStatus,
  getVendorStores,
  approveVendorStore,
  rejectVendorStore,
  getProductRequests,
  approveProductRequest,
  rejectProductRequest,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getDeliveryPartners,
};
