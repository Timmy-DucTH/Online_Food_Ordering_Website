const Restaurant = require('../models/restaurant');
const Menu = require('../models/menu');

// NGHIỆP VỤ 1: Admin duyệt hồ sơ đăng ký Cửa hàng (BM2, QĐ2) [cite: 124, 134, 135]
exports.approveRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.body; // 'approved' hoặc 'rejected' [cite: 136]

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Trạng thái duyệt không hợp lệ!' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { status },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy thông tin nhà hàng!' });
    }

    // Nếu được duyệt, tự động khởi tạo 1 Thực đơn trống cho nhà hàng đó
    if (status === 'approved') {
      const existingMenu = await Menu.findOne({ store_id: restaurantId });
      if (!existingMenu) {
        await Menu.create({ store_id: restaurantId, items: [] });
      }
    }

    res.status(200).json({
      status: 'success',
      message: `Đã cập nhật trạng thái hồ sơ nhà hàng thành: ${status}`,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// NGHIỆP VỤ 2: Quản lý thực đơn - Thêm món ăn mới vào Menu (BM4, QĐ5) [cite: 124, 145, 146]
exports.addMenuItem = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, image, price, category } = req.body;

    // RÀNG BUỘC QĐ 5: Đơn giá món ăn phải lớn hơn 0 [cite: 146, 147]
    if (!price || price <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quy định hệ thống: Đơn giá món ăn nhập vào phải lớn hơn 0đ!' [cite: 147]
      });
    }

    // Tìm Menu của nhà hàng và đẩy món ăn mới vào mảng items (Embedding)
    const menu = await Menu.findOne({ store_id: restaurantId });
    if (!menu) {
      return res.status(404).json({ status: 'fail', message: 'Nhà hàng này chưa được tạo thực đơn!' });
    }

    menu.items.push({ name, image, price, category, is_available: true });
    await menu.save();

    res.status(201).json({
      status: 'success',
      message: '➕ Thêm món ăn vào thực đơn thành công!',
      data: menu
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// NGHIỆP VỤ 3: Thiết lập trạng thái Còn/Hết món ăn nhanh 
exports.toggleItemAvailability = async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;
    const { is_available } = req.body; // true hoặc false

    const menu = await Menu.findOne({ store_id: restaurantId });
    if (!menu) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy thực đơn!' });
    }

    // Tìm món ăn con trong mảng để cập nhật trạng thái
    const item = menu.items.id(itemId);
    if (!item) {
      return res.status(404).json({ status: 'fail', message: 'Món ăn không tồn tại trong thực đơn!' });
    }

    item.is_available = is_available;
    await menu.save();

    res.status(200).json({
      status: 'success',
      message: `Đã cập nhật trạng thái món ăn thành: ${is_available ? 'Còn món' : 'Hết món'}`,
      data: item
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};