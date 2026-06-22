const express = require('express');
const { getActiveCombos, generateSmartCombos } = require('../controllers/comboController');

const router = express.Router();

router.get('/', getActiveCombos);
router.get('/smart', generateSmartCombos);

module.exports = router;
