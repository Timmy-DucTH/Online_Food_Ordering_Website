const Food = require('../models/food');

// 1. LẤY DANH SÁCH TẤT CẢ MÓN ĂN (Dùng cho Trang chủ Frontend)
// Khách hàng chỉ được xem các món ăn đã được duyệt (status: 'approved')
exports.getAllFoods = async (req, res, next) => {
  try {
    const foods = await Food.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    next(error);
  }
};

// 2. LẤY DANH SÁCH MÓN ĂN CỦA 1 CỬA HÀNG CỤ THỂ
exports.getFoodsByRestaurant = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const foods = await Food.find({ restaurant_id: restaurantId });
    res.status(200).json({
      success: true,
      count: foods.length,
      data: foods
    });
  } catch (error) {
    next(error);
  }
};

// 3. THÊM MÓN ĂN MỚI (Dùng cho Cửa hàng)
exports.createFood = async (req, res, next) => {
  try {
    // Dữ liệu từ body request (chưa có restaurant_id, ta sẽ lấy từ token đăng nhập sau này)
    const foodData = req.body;
    
    const newFood = await Food.create(foodData);
    
    res.status(201).json({
      success: true,
      message: 'Thêm món ăn thành công! Chờ Admin phê duyệt.',
      data: newFood
    });
  } catch (error) {
    next(error);
  }
};

// 4. CẬP NHẬT MÓN ĂN (Dùng cho Cửa hàng)
exports.updateFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // runValidators: Đảm bảo giá trị sửa đổi vẫn tuân thủ các điều kiện (VD: price > 0)
    const updatedFood = await Food.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true 
    });

    if (!updatedFood) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn!' });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật món ăn thành công!',
      data: updatedFood
    });
  } catch (error) {
    next(error);
  }
};

// 5. XÓA MÓN ĂN (Dùng cho Cửa hàng)
exports.deleteFood = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedFood = await Food.findByIdAndDelete(id);

    if (!deletedFood) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy món ăn để xóa!' });
    }

    res.status(200).json({
      success: true,
      message: 'Đã xóa món ăn khỏi thực đơn!'
    });
  } catch (error) {
    next(error);
  }
};