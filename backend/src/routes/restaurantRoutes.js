const express = require('express');
const router = express.Router();
const restCtrl = require('../controllers/restaurantController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public/Admin route to get all restaurants
router.get('/all', restCtrl.getRestaurants);

// Merchant registration & management routes (need verifyToken)
router.post('/register', verifyToken, restCtrl.registerRestaurant);
router.get('/my-restaurant', verifyToken, restCtrl.getMyRestaurant);
router.post('/foods', verifyToken, restCtrl.addMerchantFood);
router.get('/my-foods', verifyToken, restCtrl.getMyFoods);

// Legacy/Internal routes
router.patch('/:restaurantId/approve', restCtrl.approveRestaurant);
router.post('/:restaurantId/menu/item', restCtrl.addMenuItem);
router.patch('/:restaurantId/menu/item/:itemId/status', restCtrl.toggleItemAvailability);

module.exports = router;