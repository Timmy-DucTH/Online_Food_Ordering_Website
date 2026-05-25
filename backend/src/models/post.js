const mongoose = require('mongoose');

// Định nghĩa cấu trúc Bình luận tương tác dưới bài viết (Embedding)
const CommentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Nội dung bình luận không được để trống'],
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Định nghĩa cấu trúc chính cho Bài viết
const PostSchema = new mongoose.Schema({
  // Người đăng bài viết (Khách hàng hoặc Chủ quán)
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Bài viết phải có người đăng']
  },
  
  content: {
    type: String,
    required: [true, 'Nội dung bài viết không được để trống'],
    trim: true
  },
  
  // Mảng lưu danh sách link hình ảnh đính kèm bài viết
  images: [{
    type: String
  }],
  
  // Mảng lưu danh sách link video đính kèm bài viết
  videos: [{
    type: String
  }],
  
  // Mảng lưu danh sách ID những người dùng đã bấm thích (Like/React) bài viết
  reacts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  
  // Nhúng mảng danh sách bình luận trực tiếp vào bài viết
  Comments: [CommentSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('post', PostSchema);