const express = require('express');
const {
  getProducts,
  getProductById,
  getSmartSuggestions,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.get('/',              getProducts);
router.get('/suggestions',   getSmartSuggestions);
router.get('/:id',           getProductById);
router.post('/',             protect, adminOnly, createProduct);
router.put('/:id',           protect, adminOnly, updateProduct);
router.delete('/:id',        protect, adminOnly, deleteProduct);

module.exports = router;
