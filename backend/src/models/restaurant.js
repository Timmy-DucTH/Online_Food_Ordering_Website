const mongoose = require('mongoose');

const retaurantSchema = new mongoose.Schema({
  // Liên kết 1-1 với tài khoản chủ quán (Người dùng có role = 'merchant')
  owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Cửa hàng phải thuộc về một chủ tài khoản'],
    unique: true // Một tài khoản đối tác chỉ được đăng ký tối đa 1 cửa hàng
  },
  
  store_name: {
    type: String,
    required: [true, 'Tên cửa hàng không được để trống'],
    trim: true
  },
  
  merchant_name: {
    type: String,
    required: [true, 'Họ tên chủ đại diện không được để trống'],
    trim: true
  },
  
  address: {
    type: String,
    required: [true, 'Địa chỉ cửa hàng không được để trống'],
    trim: true
  },
  
  // Lưu đường dẫn ảnh giấy phép kinh doanh đính kèm khi nộp hồ sơ
  license_image: {
    type: String,
    required: [true, 'Hình ảnh giấy phép kinh doanh là bắt buộc']
  },
  
  // Lưu đường dẫn ảnh chứng nhận vệ sinh an toàn thực phẩm (VSATTP)
  hygiene_image: {
    type: String,
    required: [true, 'Hình ảnh chứng nhận VSATTP là bắt buộc']
  },
  
  // Trạng thái kiểm duyệt hồ sơ của Admin (Mặc định là đang chờ duyệt)
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('retaurant', retaurantSchema);