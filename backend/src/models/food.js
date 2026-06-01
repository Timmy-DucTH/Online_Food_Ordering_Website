const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Tên món ăn không được để trống'], trim: true },
  price: { type: Number, required: [true, 'Giá món ăn không được để trống'], min: [1, 'Đơn giá phải lớn hơn 0'] },
  category: { type: String, required: [true, 'Danh mục không được để trống'], trim: true },
  category_lvl1: { type: String, trim: true }, // Cấp 1: Đồ ăn hoặc Đồ uống
  image: { type: String, required: [true, 'Hình ảnh món ăn là bắt buộc'] },
  description: { type: String, trim: true, default: '' },
  rating: { type: Number, min: 1, max: 5, default: 4.5 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant' },
  restaurant_name: { type: String, default: '' }
}, { timestamps: true });

// Tự động phân loại Đồ ăn / Đồ uống theo cấp 1 tổng quát dựa trên danh mục cấp 2
FoodSchema.pre('save', function() {
  const categoryMap = {
    // Cấp 1: Đồ ăn (Food)
    'Burger': 'Đồ ăn',
    'Pizza': 'Đồ ăn',
    'Cơm': 'Đồ ăn',
    'Món nước': 'Đồ ăn',
    'Tráng miệng': 'Đồ ăn',
    'Đồ ăn nhanh': 'Đồ ăn',
    'Khác': 'Đồ ăn',

    // Cấp 1: Đồ uống (Drink)
    'Trà sữa': 'Đồ uống',
    'Cà phê': 'Đồ uống',
    'Đồ uống khác': 'Đồ uống'
  };

  this.category_lvl1 = categoryMap[this.category] || 'Đồ ăn';
});

module.exports = mongoose.model('food', FoodSchema);
