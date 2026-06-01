const express = require('express');
const router = express.Router();
const reportCtrl = require('../controllers/reportController');
const { verifyToken, isMerchantOrAdmin } = require('../middleware/authMiddleware');

// Merchant report routes (needs token and merchant/admin role)
router.get('/restaurant/:restaurantId/revenue', verifyToken, isMerchantOrAdmin, reportCtrl.getRevenueReport);
router.get('/restaurant/:restaurantId/top-items', verifyToken, isMerchantOrAdmin, reportCtrl.getTopSellingItems);

module.exports = router;
