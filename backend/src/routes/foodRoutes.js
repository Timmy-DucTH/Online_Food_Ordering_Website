// const express = require('express');
// const router = express.Router();
// const { getAllFoods } = require('../controllers/adminController');

// // GET /api/foods - Endpoint công khai lấy danh sách món ăn
// router.get('/', getAllFoods);

// module.exports = router;

const express = require('express');
const router = express.Router();

// Import chính xác từ foodController
const { 
  getAllFoods, 
  getFoodsByRestaurant, 
  createFood, 
  updateFood, 
  deleteFood 
} = require('../controllers/foodController');

// Khai báo các endpoints
router.route('/')
  .get(getAllFoods)        // Lấy tất cả món ăn (Public)
  .post(createFood);       // Cửa hàng thêm món mới

router.route('/:id')
  .put(updateFood)         // Cửa hàng sửa món
  .delete(deleteFood);     // Cửa hàng xóa món

// Endpoint chuyên biệt để lấy menu của một quán cụ thể
router.get('/restaurant/:restaurantId', getFoodsByRestaurant);

module.exports = router;
