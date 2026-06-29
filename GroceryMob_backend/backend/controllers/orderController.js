const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Customer = require('../models/Customer');

// ── POST /api/orders ──────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { 
      deliveryAddress,
      encryptedAddress,
      encryptedNotes,
      customerKeyBlob,
      deliveryKeyBlob,
      deliveryStaff,
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

    if (!deliveryAddress && !encryptedAddress) {
      return res.status(400).json({ success: false, message: 'Delivery address (plaintext or encrypted) is required.' });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    // Validate stock
    for (const i of cart.items) {
      const product = i.product;
      if (!product) {
        return res.status(400).json({ success: false, message: `Product "${i.name}" no longer exists.` });
      }
      if (!product.isAvailable) {
        return res.status(400).json({ success: false, message: `Sorry, "${product.name}" is currently out of stock/unavailable.` });
      }
      if (i.quantity > product.stock) {
        return res.status(400).json({ success: false, message: `Sorry, only ${product.stock} unit(s) of "${product.name}" are available in stock. You requested ${i.quantity}.` });
      }
    }

    // Deduct stock
    for (const i of cart.items) {
      const product = i.product;
      product.stock = Math.max(0, product.stock - i.quantity);
      if (product.stock === 0) {
        product.isAvailable = false;
        product.stockStatus = 'OUT_OF_STOCK';
      } else if (product.stock <= 5) {
        product.stockStatus = 'LIMITED';
      }
      await product.save();

      // Also sync to VendorListing
      const VendorListing = require('../models/VendorListing');
      await VendorListing.findByIdAndUpdate(product._id, {
        $set: {
          stock: product.stock,
          isAvailable: product.isAvailable
        }
      });
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
      deliveryAddress: deliveryAddress || undefined,
      encryptedAddress: encryptedAddress || undefined,
      encryptedNotes: encryptedNotes || undefined,
      customerKeyBlob: customerKeyBlob || undefined,
      deliveryKeyBlob: deliveryKeyBlob || undefined,
      deliveryStaff: deliveryStaff || undefined,
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
      store: storeId || undefined,
      deliveryType,
      estimatedDelivery,
      notes: notes || '',
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
    // Customers see only their own orders
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders/:id ───────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const isCustomerOwner = String(order.user) === String(req.user._id);
    const isAssignedDelivery = order.deliveryStaff && String(order.deliveryStaff) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    // Role-based Access Control
    if (!isCustomerOwner && !isAssignedDelivery && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied: Unauthorized to view this order.' });
    }

    // Prepare dynamic payload based on identity:
    // If admin is viewing, omit E2EE keys to satisfy administrative least privilege (no decryption key access)
    const responseOrder = order.toObject();
    if (isAdmin && !isCustomerOwner && !isAssignedDelivery) {
      delete responseOrder.customerKeyBlob;
      delete responseOrder.deliveryKeyBlob;
    }

    res.json({ success: true, order: responseOrder });
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
