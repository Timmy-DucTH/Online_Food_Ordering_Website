const express = require('express');
const router = express.Router();
const reportCtrl = require('../controllers/reportController');

router.get('/restaurants/:restaurantId/revenue', reportCtrl.getRevenueReport);
router.get('/restaurants/:restaurantId/top-items', reportCtrl.getTopSellingItems);

module.exports = router;
