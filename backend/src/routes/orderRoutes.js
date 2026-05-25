const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderController');

router.post('/create', orderCtrl.createOrder);
router.patch('/:orderId/status', orderCtrl.updateOrderStatus);

module.exports = router;