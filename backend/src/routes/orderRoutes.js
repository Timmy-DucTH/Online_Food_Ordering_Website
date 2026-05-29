const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const orderCtrl = require('../controllers/orderController');

// Tất cả các tuyến đường đặt hàng đều yêu cầu đăng nhập xác thực
router.use(verifyToken);

router.post('/create', orderCtrl.createOrder);
router.get('/my-orders', orderCtrl.getMyOrders);
router.patch('/:orderId/status', orderCtrl.updateOrderStatus);

module.exports = router;