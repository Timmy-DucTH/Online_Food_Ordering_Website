const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // Người nhận thông báo
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Thông báo phải có người nhận']
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Phân loại thông báo để Frontend hiển thị icon phù hợp
  type: {
    type: String,
    enum: ['order_status', 'discount', 'system'], 
    default: 'system'
  },
  
  // Trạng thái đã đọc thông báo hay chưa (Mặc định khi mới gửi là chưa đọc)
  is_read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('notification', NotificationSchema);