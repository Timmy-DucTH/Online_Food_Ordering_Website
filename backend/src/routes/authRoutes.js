const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Định nghĩa các cổng API kết nối đến hàm xử lý trong authController
// Đường dẫn đầy đủ sẽ là: POST http://localhost:5000/api/auth/register
router.post('/register', authController.register);

// Đường dẫn đầy đủ sẽ là: POST http://localhost:5000/api/auth/login
router.post('/login', authController.login);

module.exports = router;