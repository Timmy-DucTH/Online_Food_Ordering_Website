const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, isMerchantOrAdmin } = require('../middleware/authMiddleware');

// Route 1: Lấy danh sách đánh giá của 1 quán ăn (Ai cũng xem được)
// Vd: GET /api/reviews/restaurant/65abc123...
router.get('/restaurant/:store_id', reviewController.getReviewsByRestaurant);

// Route 2: Khách hàng gửi đánh giá mới
// Vd: POST /api/reviews
router.post('/', verifyToken, reviewController.createReview);

// Route 3: Chủ quán phản hồi đánh giá của khách hàng (Nghiệp vụ 11)
router.patch('/:reviewId/reply', verifyToken, isMerchantOrAdmin, reviewController.replyToReview);

module.exports = router;