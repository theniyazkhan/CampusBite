const express = require('express');
const router = express.Router();
const { getMenu, getMostSold } = require('../controllers/menuController');

// GET /api/menu - Get all available menu items
router.get('/', getMenu);

// GET /api/menu/most-sold - Get top 3 most sold items
router.get('/most-sold', getMostSold);

module.exports = router;