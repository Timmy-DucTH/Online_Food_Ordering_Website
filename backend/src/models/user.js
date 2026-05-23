const mongoose = require('mongoose');

// Định nghĩa khuôn mẫu (Schema) cho Collection 'users'
const userSchema = new mongoose.Schema({
  // 1. Số điện thoại (Dùng để shipper hoặc cửa hàng liên lạc)
  phone: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    trim: true
  },

  // 2. Họ và tên người dùng
  full_name: {
    type: String,
    required: [true, 'Họ và tên là bắt buộc'],
    trim: true
  },

  // 3. Email (Theo QĐ 1: Đây là Tên đăng nhập và phải duy nhất, không trùng lặp)
  email: {
    type: String,
    required: [true, 'Email (Tên đăng nhập) là bắt buộc'],
    unique: true, // Đảm bảo không trùng tài khoản
    trim: true,
    lowercase: true, // Tự động chuyển về chữ thường để tránh lỗi đăng nhập
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Vui lòng nhập đúng định dạng email']
  },

  // 4. Mật khẩu (Theo QĐ 1: Sẽ được mã hóa Bcrypt trước khi lưu, độ dài gốc >= 8)
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc']
  },

  // 5. Phân quyền (Role) hệ thống: Khách hàng, Chủ quán ăn, hoặc Admin hệ thống
  role: {
    type: String,
    enum: {
      values: ['customer', 'merchant', 'admin'],
      message: 'Vai trò phải là: customer, merchant hoặc admin'
    },
    default: 'customer' // Mặc định đăng ký mới sẽ là Khách hàng
  },

  // 6. Điểm uy tín (Theo QĐ 3: Mặc định ban đầu là 100 điểm, khoảng giá trị từ 0 đến 100)
  credit_score: {
    type: Number,
    default: 100,
    min: [0, 'Điểm uy tín không thể nhỏ hơn 0'],
    max: [100, 'Điểm uy tín không thể vượt quá 100']
  },

  // 7. Trạng thái tài khoản (Theo QĐ 4: Tài khoản vi phạm có điểm uy tín < 30 sẽ bị đổi thành 'banned')
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active' // Mặc định tài khoản mới tạo sẽ hoạt động bình thường
  }
}, {
  // Tự động tạo thêm 2 trường: 'createdAt' (Ngày tạo) và 'updatedAt' (Ngày cập nhật mới nhất)
  timestamps: true 
});

// Xuất Model 'User' ra để các file Controller gọi vào sử dụng
module.exports = mongoose.model('User', UserSchema);