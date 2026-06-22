const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Combo = require('../models/Combo');

// ── GET /api/cart ─────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) cart = { items: [], total: 0 };
    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/cart ────────────────────────────────────────────
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: 'productId required.' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    if (product.stock < quantity)
      return res.status(400).json({ success: false, message: 'Insufficient stock. Only ' + product.stock + ' left.' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingIdx = cart.items.findIndex(i => i.product.toString() === productId);
    if (existingIdx >= 0) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({ product: productId, name: product.name, price: product.price, image: product.image, quantity });
    }

    // Recalculate total
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    await cart.populate('items.product');

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/cart/:productId  OR  PUT /api/cart/update (─────────────
// Supports both REST style (:productId in URL) and mobile app style
// (productId in request body via PUT /cart/update)
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    // Accept productId from URL param (REST) or from body (mobile app alias)
    const productId = req.params.productId || req.body.productId;
    if (!productId) return res.status(400).json({ success: false, message: 'productId required.' });

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx < 0) return res.status(404).json({ success: false, message: 'Item not in cart.' });

    if (quantity < 1) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = quantity;
    }

    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    await cart.populate('items.product');

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/cart/:productId ───────────────────────────────
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/cart ──────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], total: 0 },
      { new: true }
    );
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/cart/combo ──────────────────────────────────────
const addComboToCart = async (req, res) => {
  try {
    const { comboId } = req.body;
    if (!comboId) return res.status(400).json({ success: false, message: 'comboId required.' });

    const combo = await Combo.findById(comboId).populate('products');
    if (!combo) return res.status(404).json({ success: false, message: 'Combo not found.' });
    if (!combo.isActive) return res.status(400).json({ success: false, message: 'Combo is no longer active.' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Calculate the discount ratio to distribute savings across products
    const ratio = combo.originalPrice > 0 ? combo.comboPrice / combo.originalPrice : 1;

    for (const product of combo.products) {
      if (!product.isAvailable || product.stock < 1) continue;
      
      const comboItemPrice = Math.round(product.price * ratio);
      const existingIdx = cart.items.findIndex(i => i.product.toString() === product._id.toString());
      
      if (existingIdx >= 0) {
        cart.items[existingIdx].quantity += 1;
        cart.items[existingIdx].price = comboItemPrice;
      } else {
        cart.items.push({ 
          product: product._id, 
          name: product.name, 
          price: comboItemPrice, 
          image: product.image, 
          category: product.category,
          quantity: 1 
        });
      }
    }

    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    await cart.populate('items.product');

    const comboSavings = combo.originalPrice - combo.comboPrice;

    res.json({ 
      success: true, 
      cart, 
      combo: {
        id: combo._id,
        title: combo.title,
        savings: comboSavings,
        productIds: combo.products.map(p => p._id.toString())
      },
      message: 'Combo added to cart' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const syncCart = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Items array required.' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    for (const item of items) {
      const { productId, quantity = 1 } = item;
      const product = await Product.findById(productId);
      if (!product) continue;

      const existingIdx = cart.items.findIndex(i => i.product.toString() === productId);
      if (existingIdx >= 0) {
        cart.items[existingIdx].quantity += quantity;
      } else {
        cart.items.push({ 
          product: productId, 
          name: product.name, 
          price: product.price, 
          image: product.image, 
          quantity 
        });
      }
    }

    cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    await cart.save();
    await cart.populate('items.product');

    res.json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart, addComboToCart, syncCart };
