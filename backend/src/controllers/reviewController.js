const Review = require('../models/review');

// 1. Khách hàng tạo đánh giá mới
exports.createReview = async (req, res) => {
  try {
    const { order_id, customer_id, store_id, rating, comment } = req.body;

    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!order_id || !customer_id || !store_id || !rating) {
      return res.status(400).json({ 
        status: 'fail',
        message: 'Vui lòng cung cấp đủ mã đơn hàng, khách hàng, cửa hàng và số sao!' 
      });
    }

    // Tạo bản ghi đánh giá mới
    const newReview = new Review({
      order_id,
      customer_id,
      store_id,
      rating,
      comment
    });

    const savedReview = await newReview.save();
    
    res.status(201).json({ 
      status: 'success',
      message: 'Cảm ơn bạn đã đánh giá!', 
      data: savedReview 
    });

  } catch (error) {
    // Xử lý lỗi trùng lặp (11000 là mã lỗi của MongoDB khi vi phạm unique: true)
    if (error.code === 11000) {
      return res.status(400).json({ 
        status: 'fail',
        message: 'Đơn hàng này đã được đánh giá rồi, bạn không thể đánh giá lại!' 
      });
    }
    res.status(500).json({ status: 'error', message: 'Lỗi server', error: error.message });
  }
};

// 2. Lấy danh sách đánh giá của một cửa hàng (Hiển thị trên Frontend)
exports.getReviewsByRestaurant = async (req, res) => {
  try {
    const { store_id } = req.params;

    // Tìm tất cả đánh giá của store_id này
    // populate() giúp lấy thêm tên và avatar của khách hàng thay vì chỉ hiển thị mỗi cái ID
    const reviews = await Review.find({ store_id })
      .populate('customer_id', 'full_name email') // Giả sử model user của bạn có trường full_name
      .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu

    res.status(200).json({ 
      status: 'success',
      results: reviews.length,
      data: reviews 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Lỗi server', error: error.message });
  }
};

// 3. Chủ quán phản hồi đánh giá của khách hàng (Nghiệp vụ 11)
exports.replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reply_from_store } = req.body;

    if (!reply_from_store || !reply_from_store.trim()) {
      return res.status(400).json({ status: 'fail', message: 'Nội dung phản hồi không được để trống!' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy đánh giá nào!' });
    }

    // Kiểm tra quyền sở hữu cửa hàng
    const Restaurant = require('../models/restaurant');
    const restaurant = await Restaurant.findById(review.store_id);
    if (!restaurant || restaurant.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'Từ chối truy cập! Bạn không có quyền phản hồi đánh giá này.' });
    }

    review.reply_from_store = reply_from_store.trim();
    await review.save();

    res.status(200).json({
      status: 'success',
      message: '✓ Phản hồi đánh giá thành công!',
      data: review
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Lỗi máy chủ', error: error.message });
  }
};