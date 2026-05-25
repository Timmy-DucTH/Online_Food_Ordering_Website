const mongoose = require('mongoose');

// Định nghĩa cấu trúc con cho từng Món ăn (Sub-schema)
const MenuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên món ăn không được để trống'],
    trim: true
  },
  
  // Lưu đường dẫn hình ảnh món ăn
  image: {
    type: String,
    required: [true, 'Hình ảnh món ăn là bắt buộc']
  },
  
  // Ràng buộc giá tiền (Theo QĐ 5: Đơn giá món ăn phải > 0)
  price: {
    type: Number,
    required: [true, 'Giá món ăn không được để trống'],
    min: [1, 'Đơn giá món ăn phải lớn hơn 0']
  },
  
  category: {
    type: String,
    required: [true, 'Danh mục món ăn không được để trống'], // Ví dụ: Cơm, Bún, Trà sữa...
    trim: true
  },
  
  // Trạng thái bật/tắt hiển thị món ăn tùy thuộc vào nhà hàng còn hay hết nguyên liệu
  is_available: {
    type: Boolean,
    default: true
  }
});

// Định nghĩa cấu trúc chính cho Thực đơn
const MenuSchema = new mongoose.Schema({
  // Mỗi cửa hàng chỉ sở hữu duy nhất 1 thực đơn chính
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'restaurant',
    required: [true, 'Thực đơn phải thuộc về một cửa hàng'],
    unique: true
  },
  
  // Nhúng mảng chứa danh sách nhiều món ăn vào đây
  items: [MenuItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('menu', MenuSchema);