const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // Lượt đánh giá phải gắn liền với một đơn hàng cụ thể đã hoàn thành
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'order',
    required: [true, 'Đánh giá phải đi kèm với mã đơn hàng'],
    unique: true // Mỗi đơn hàng thành công chỉ được đánh giá duy nhất 1 lần
  },
  
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Phải có thông tin người đánh giá']
  },
  
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'retaurant',
    required: [true, 'Phải có thông tin cửa hàng được đánh giá']
  },
  
  // Điểm đánh giá (Từ 1 đến 5 sao)
  rating: {
    type: Number,
    required: [true, 'Vui lòng chọn số sao đánh giá'],
    min: [1, 'Đánh giá tối thiểu là 1 sao'],
    max: [5, 'Đánh giá tối đa là 5 sao']
  },
  
  comment: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Nội dung phản hồi, trả lời lại từ phía Cửa hàng đối với đánh giá của khách
  reply_from_store: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('review', reviewSchema);