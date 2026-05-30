const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Tên món ăn không được để trống'], trim: true },
  price: { type: Number, required: [true, 'Giá món ăn không được để trống'], min: [1, 'Đơn giá phải lớn hơn 0'] },
  category: { type: String, required: [true, 'Danh mục không được để trống'], trim: true },
  image: { type: String, required: [true, 'Hình ảnh món ăn là bắt buộc'] },
  description: { type: String, trim: true, default: '' },
  rating: { type: Number, min: 1, max: 5, default: 4.5 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  restaurant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant' },
  restaurant_name: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('food', FoodSchema);
