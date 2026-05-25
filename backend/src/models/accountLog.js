const mongoose = require('mongoose');

const AccountLogSchema = new mongoose.Schema({
  // Tài khoản bị tác động (Khóa/Mở khóa)
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Nhật ký phải gắn với một tài khoản cụ thể']
  },
  
  // Loại hành động xử lý tài khoản
  action_type: {
    type: String,
    enum: ['ban', 'unban'],
    required: true
  },
  
  // Lý do xử lý (Ví dụ: "Hệ thống tự động khóa do điểm uy tín < 30", hoặc "Admin phê duyệt mở khóa")
  reason: {
    type: String,
    required: [true, 'Lý do xử lý không được để trống'],
    trim: true
  },
  
  // Thời hạn khóa tài khoản (Tính theo đơn vị: ngày). Nếu khóa vĩnh viễn thì để trống hoặc giá trị đặc biệt
  duration_days: {
    type: Number,
    default: null
  },
  
  // Người thực hiện lệnh khóa (Nếu do hệ thống tự động quét và khóa thì lưu ID của Admin hoặc chuỗi "SYSTEM")
  performed_by: {
    type: String,
    default: 'SYSTEM'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('accountLog', AccountLogSchema);