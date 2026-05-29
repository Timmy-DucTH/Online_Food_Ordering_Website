const mongoose = require('mongoose');

// =================================================================
// 1. ĐỊNH NGHĨA SUB-SCHEMA CHO CÁC MÓN ĂN TRONG ĐƠN HÀNG (Embedding)
// =================================================================
// Lưu cấu trúc này trực tiếp vào đơn hàng để đảm bảo "chốt giá" cố định tại thời điểm mua,
// kể cả sau này chủ quán có tăng hay giảm giá món ăn trong bảng Menus.
const OrderItemSchema = new mongoose.Schema({
  item_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng món phải tối thiểu là 1']
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Giá món ăn không thể âm']
  },
  // Phục vụ Đặt hàng nhóm (BM 6): Xác định ai là người đã chọn món này trong nhóm
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
});

// =================================================================
// 2. ĐỊNH NGHĨA CHÍNH SCHEMA CHO COLLECTION 'orders'
// =================================================================
const OrderSchema = new mongoose.Schema({
  // Tham chiếu tới Cửa hàng mà khách đặt món
  store_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'restaurant',
    required: [true, 'Đơn hàng phải thuộc về một cửa hàng']
  },

  // Người khởi tạo/Trưởng nhóm đơn hàng
  creator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'Đơn hàng phải có người tạo']
  },

  // Phân loại đơn hàng (Theo yêu cầu nghiệp vụ: Đơn cá nhân hoặc Đơn đặt chung theo nhóm)
  order_type: {
    type: String,
    enum: {
      values: ['single', 'group'],
      message: 'Loại đơn hàng phải là single (cá nhân) hoặc group (nhóm)'
    },
    default: 'single'
  },

  // Danh sách ID các thành viên tham gia (Chỉ dùng khi order_type = 'group')
  // Trong code xử lý Backend (Controller), nhóm sẽ viết logic check: tối đa 20 người theo QĐ 8
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],

  // Nhúng mảng danh sách món ăn đã định nghĩa ở trên vào đơn hàng
  items: [OrderItemSchema],

  // Thông tin giao hàng (BM 5)
  shipping_address: {
    type: String,
    required: [true, 'Địa chỉ giao hàng không được để trống']
  },

  // Ràng buộc khoảng cách (Theo QĐ 6: Khoảng cách giao hàng phải <= 15km)
  distance_km: {
    type: Number,
    required: true,
    max: [15, 'Hệ thống chỉ hỗ trợ giao hàng trong phạm vi tối đa 15km']
  },

  // Phí vận chuyển (Theo QĐ 7: Tự động tính toán bằng khoảng cách nhân với 5.000đ/km)
  shipping_fee: {
    type: Number,
    required: true,
    default: 0
  },

  // Tổng tiền món ăn (Chưa cộng phí ship)
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },

  // Tổng tiền cuối cùng của đơn hàng (= subtotal + shipping_fee)
  total_price: {
    type: Number,
    required: true,
    default: 0
  },

  // Phương thức thanh toán
  payment_method: {
    type: String,
    enum: ['COD', 'wallet', 'card'],
    default: 'COD'
  },

  // Trạng thái vòng đời đơn hàng (Phục vụ cập nhật real-time trạng thái đơn hàng)
  status: {
    type: String,
    enum: ['pending', 'preparing', 'shipping', 'completed', 'cancelled'],
    default: 'pending'
  },

  // Ghi chú thêm của khách dành cho shipper hoặc nhà hàng
  note: {
    type: String,
    trim: true
  }
}, {
  // Tự động lưu thời gian tạo đơn hàng (createdAt) phục vụ cho tính năng Báo cáo Doanh thu theo ngày/tháng (QĐ 10)
  timestamps: true 
});

module.exports = mongoose.model('order', OrderSchema);