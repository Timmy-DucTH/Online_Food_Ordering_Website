const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const orderCtrl = require('../controllers/orderController');

// Import adminController vào đầu file orderRoutes.js
const adminController = require('../controllers/adminController');

// Tất cả các tuyến đường đặt hàng đều yêu cầu đăng nhập xác thực
router.use(verifyToken);

router.post('/create', orderCtrl.createOrder);
router.get('/my-orders', orderCtrl.getMyOrders);
router.patch('/:orderId/status', orderCtrl.updateOrderStatus);

// Khai báo route gọi đến hàm updateOrderStatus 
// Chỉ dùng verifyToken (đảm bảo người dùng đã đăng nhập), KHÔNG dùng isAdmin
router.put('/:id/status', verifyToken, adminController.updateOrderStatus);

module.exports = router;