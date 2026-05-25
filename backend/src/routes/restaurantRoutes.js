const express = require('express');
const router = express.Router();
const restCtrl = require('../controllers/restaurantController');

router.patch('/:restaurantId/approve', restCtrl.approveRestaurant);
router.post('/:restaurantId/menu/item', restCtrl.addMenuItem);
router.patch('/:restaurantId/menu/item/:itemId/status', restCtrl.toggleItemAvailability);

module.exports = router;