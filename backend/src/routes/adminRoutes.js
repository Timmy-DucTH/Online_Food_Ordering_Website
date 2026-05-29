const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

// Tất cả routes admin đều yêu cầu verifyToken + isAdmin
router.use(verifyToken, isAdmin);

// Thống kê hệ thống
router.get('/stats', adminController.getSystemStats);

// Quản lý người dùng
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/unban', adminController.unbanUser);

// Quản lý món ăn
router.post('/foods', adminController.addFood);
router.delete('/foods/:id', adminController.deleteFood);

// Quản lý đơn hàng
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

module.exports = router;