const express = require('express');
const {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore
} = require('../controllers/storeController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.get('/',          getStores);
router.get('/:id',      getStoreById);
router.post('/',         protect, adminOnly, createStore);
router.put('/:id',       protect, adminOnly, updateStore);
router.delete('/:id',    protect, adminOnly, deleteStore);

module.exports = router;
