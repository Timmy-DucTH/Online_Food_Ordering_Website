const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Route 1: Lấy danh sách đánh giá của 1 quán ăn (Ai cũng xem được)
// Vd: GET /api/reviews/restaurant/65abc123...
router.get('/restaurant/:store_id', reviewController.getReviewsByRestaurant);

// Route 2: Khách hàng gửi đánh giá mới
// Vd: POST /api/reviews
// (Lưu ý: Nếu nhóm bạn đã viết xong authMiddleware, hãy kẹp nó vào giữa để chặn người chưa đăng nhập)
router.post('/', reviewController.createReview);

module.exports = router;