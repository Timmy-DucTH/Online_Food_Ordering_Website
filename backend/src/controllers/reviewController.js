const Review = require('../models/review');
const Order = require('../models/order');

exports.createReview = async (req, res) => {
  try {
    const { order_id, customer_id, store_id, rating, comment } = req.body;

    if (!order_id || !customer_id || !store_id || !rating) {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui long nhap day du order_id, customer_id, store_id va rating!'
      });
    }

    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Khong tim thay don hang de danh gia!' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        status: 'fail',
        message: 'Chi don hang da hoan thanh moi duoc danh gia!'
      });
    }

    if (order.creator_id.toString() !== customer_id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Chi nguoi tao don hang moi duoc danh gia don nay!'
      });
    }

    const review = await Review.create({
      order_id,
      customer_id,
      store_id,
      rating,
      comment: comment || ''
    });

    res.status(201).json({
      status: 'success',
      message: 'Da gui danh gia quan thanh cong!',
      data: review
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'Don hang nay da co danh gia roi!'
      });
    }

    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getReviewsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const reviews = await Review.find({ store_id: restaurantId })
      .populate('customer_id', 'full_name email')
      .sort({ createdAt: -1 });

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? Number((totalRating / reviews.length).toFixed(1)) : 0;

    res.status(200).json({
      status: 'success',
      message: 'Lay danh sach danh gia thanh cong!',
      data: {
        averageRating,
        totalReviews: reviews.length,
        reviews
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.replyReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Noi dung phan hoi khong duoc de trong!' });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { reply_from_store: reply.trim() },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ status: 'fail', message: 'Khong tim thay danh gia!' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Da phan hoi danh gia thanh cong!',
      data: review
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
