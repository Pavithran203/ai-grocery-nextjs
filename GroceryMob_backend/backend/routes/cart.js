const express = require('express');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart, syncCart } = require('../controllers/cartController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // All cart routes require auth

router.get('/',                 getCart);
router.post('/',                addToCart);
router.post('/sync',            syncCart);
router.post('/combo',           require('../controllers/cartController').addComboToCart);

// Mobile app calls PUT /cart/update with { productId, quantity } in body
router.put('/update',           updateCartItem);
// Standard REST: PUT /cart/:productId
router.put('/:productId',       updateCartItem);

// Mobile app calls DELETE /cart to clear; also support /clear
router.delete('/clear',         clearCart);
router.delete('/',              clearCart);
router.delete('/:productId',    removeFromCart);

module.exports = router;

