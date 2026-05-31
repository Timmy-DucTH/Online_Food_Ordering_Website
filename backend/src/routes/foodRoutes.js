const express = require('express');
const router = express.Router();
const { getAllFoods } = require('../controllers/adminController');

// GET /api/foods - Endpoint công khai lấy danh sách món ăn
router.get('/', getAllFoods);

module.exports = router;
