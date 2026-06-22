const express = require('express');
const { getOffers, validateOffer, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');
const { protect, adminOnly } = require('../middlewares/auth');

const router = express.Router();

router.get('/',           getOffers);
router.get('/validate',   validateOffer);
router.post('/',          protect, adminOnly, createOffer);
router.put('/:id',        protect, adminOnly, updateOffer);
router.delete('/:id',     protect, adminOnly, deleteOffer);

module.exports = router;
