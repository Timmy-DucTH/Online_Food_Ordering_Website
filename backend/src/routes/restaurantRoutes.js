const express = require('express');
const router = express.Router();
const restCtrl = require('../controllers/restaurantController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public/Admin route to get all restaurants
router.get('/all', restCtrl.getRestaurants);

// Merchant registration & management routes (need verifyToken)
router.post('/register', verifyToken, restCtrl.registerRestaurant);
router.get('/my-restaurant', verifyToken, restCtrl.getMyRestaurant);
router.put('/display-name-type', verifyToken, restCtrl.updateDisplayNameType);
router.post('/foods', verifyToken, restCtrl.addMerchantFood);
router.get('/my-foods', verifyToken, restCtrl.getMyFoods);
router.delete('/foods/:id', verifyToken, restCtrl.deleteMerchantFood);
router.put('/foods/:id', verifyToken, restCtrl.updateMerchantFood);
router.get('/my-orders', verifyToken, restCtrl.getMyOrders);

// Legacy/Internal routes
// (Unused insecure routes removed)

module.exports = router;