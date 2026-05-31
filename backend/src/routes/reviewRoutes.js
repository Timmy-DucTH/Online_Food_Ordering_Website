const express = require('express');
const router = express.Router();
const reviewCtrl = require('../controllers/reviewController');

router.post('/', reviewCtrl.createReview);
router.get('/restaurant/:restaurantId', reviewCtrl.getReviewsByRestaurant);
router.patch('/:reviewId/reply', reviewCtrl.replyReview);

module.exports = router;
