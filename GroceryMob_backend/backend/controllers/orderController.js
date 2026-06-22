const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Customer = require('../models/Customer');

// ── POST /api/orders ──────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { 
      deliveryAddress, 
      paymentMethod = 'COD', 
      notes = '', 
      paymentDetails = {},
      storeId,
      storeName,
      deliveryType = 'delivery',
      subtotal: bodySubtotal,
      deliveryFee: bodyDeliveryFee,
      discount: bodyDiscount = 0
    } = req.body;

    if (!deliveryAddress) {
      return res.status(400).json({ success: false, message: 'Delivery address is required.' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const subtotal = bodySubtotal || cart.total;
    const tax = parseFloat((subtotal * 0.05).toFixed(2));
    const deliveryFee = bodyDeliveryFee !== undefined ? bodyDeliveryFee : (subtotal >= 500 ? 0 : 40);
    const discount = bodyDiscount;
    const total = subtotal + tax + deliveryFee - discount;
    const estimatedDelivery = new Date(Date.now() + 30 * 60 * 1000); // 30 mins default

    // Prepare payment details - sanitize card number for security
    const sanitizedPaymentDetails = {};
    if (paymentMethod === 'upi' && paymentDetails.upiId) {
      sanitizedPaymentDetails.upiId = paymentDetails.upiId;
    }
    if (paymentMethod === 'card' && paymentDetails.cardNumber) {
      sanitizedPaymentDetails.cardHolderName = paymentDetails.cardHolderName;
      // Store only last 4 digits of card number (never store full card number in database)
      sanitizedPaymentDetails.cardNumber = 'XXXX-XXXX-XXXX-' + paymentDetails.cardNumber.replace(/\s/g, '').slice(-4);
      sanitizedPaymentDetails.cardExpiry = paymentDetails.cardExpiry;
    }
    if (paymentMethod === 'netbanking' && paymentDetails.bankName) {
      sanitizedPaymentDetails.bankName = paymentDetails.bankName;
    }
    if (paymentMethod === 'wallet' && paymentDetails.walletProvider) {
      sanitizedPaymentDetails.walletProvider = paymentDetails.walletProvider;
    }

    // Create tracking events
    const trackingEvents = [
      {
        status: 'placed',
        message: 'Your order has been placed.',
        location: 'Customer Location',
      }
    ];

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map(i => ({
        product: i.product._id,
        name: i.name,
        price: i.price,
        image: i.image,
        category: i.product.category,
        quantity: i.quantity,
      })),
      deliveryAddress,
      paymentMethod,
      paymentDetails: sanitizedPaymentDetails,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
      subtotal,
      tax,
      deliveryFee,
      discount,
      total,
      storeId,
      storeName,
      deliveryType,
      estimatedDelivery,
      notes,
      trackingEvents,
      deliveryPartner: {
        name: '',
        phone: '',
        vehicleNumber: '',
        rating: 0,
      },
    });

    // Sync order metrics to Customer model
    try {
      const user = await User.findById(req.user._id);
      if (user && user.email) {
        const updateResult = await Customer.findOneAndUpdate(
          { email: user.email.toLowerCase() },
          {
            $inc: { totalOrders: 1, totalSpent: total },
            $set: { lastOrderDate: new Date() }
          },
          { new: true }
        );

        // Recalculate average if customer found
        if (updateResult) {
          updateResult.averageOrderValue = updateResult.totalSpent / updateResult.totalOrders;
          await updateResult.save();
          console.log('✓ Customer metrics synced:', updateResult.email);
        }
      }
    } catch (err) {
      console.error('Customer sync error:', err.message);
      // Don't fail the order creation if sync fails
    }

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], total: 0 });
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders ───────────────────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders/:id ───────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/orders/:id/cancel ────────────────────────────────
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.orderStatus !== 'placed') {
      return res.status(400).json({ success: false, message: 'Only orders in "placed" status can be cancelled.' });
    }
    order.orderStatus = 'cancelled';
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders (admin) ───────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/orders/:id/status (admin) ────────────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus, ...(orderStatus === 'delivered' && { deliveredAt: new Date() }) },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, cancelOrder };
