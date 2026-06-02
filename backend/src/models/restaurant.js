const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
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
  },
  
  // Cấu hình loại tên hiển thị: 'store_name' hoặc 'username'
  display_name_type: {
    type: String,
    enum: ['store_name', 'username'],
    default: 'store_name'
  },

  // Tên đăng nhập của chủ cửa hàng (dùng khi display_name_type = 'username')
  owner_username: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Trường ảo display_name tự động lấy tên hiển thị phù hợp
restaurantSchema.virtual('display_name').get(function() {
  return this.display_name_type === 'username' ? (this.owner_username || 'Cửa hàng') : this.store_name;
});

module.exports = mongoose.model('restaurant', restaurantSchema);