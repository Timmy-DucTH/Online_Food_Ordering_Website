const Restaurant = require('../models/restaurant');
const Menu = require('../models/menu');
const User = require('../models/user');
const Food = require('../models/food');

// Đăng ký hồ sơ Cửa hàng mới (Merchant gửi yêu cầu)
exports.registerRestaurant = async (req, res) => {
  try {
    const { store_name, merchant_name, address, license_image, hygiene_image } = req.body;
    const owner_id = req.user.id; // Lấy từ verifyToken middleware

    // Kiểm tra xem người dùng đã từng gửi hồ sơ chưa
    let restaurant = await Restaurant.findOne({ owner_id });
    if (restaurant) {
      // Cập nhật lại hồ sơ cũ và chuyển trạng thái về pending
      restaurant.store_name = store_name;
      restaurant.merchant_name = merchant_name;
      restaurant.address = address;
      restaurant.license_image = license_image;
      restaurant.hygiene_image = hygiene_image;
      restaurant.status = 'pending';
      await restaurant.save();
    } else {
      // Tạo hồ sơ mới
      restaurant = await Restaurant.create({
        owner_id,
        store_name,
        merchant_name,
        address,
        license_image,
        hygiene_image,
        status: 'pending'
      });
    }

    res.status(201).json({
      status: 'success',
      message: '🎉 Gửi hồ sơ đăng ký cửa hàng thành công!',
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Lấy thông tin cửa hàng của người dùng hiện tại
exports.getMyRestaurant = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const restaurant = await Restaurant.findOne({ owner_id });
    if (!restaurant) {
      return res.status(200).json({ status: 'success', data: null });
    }
    res.status(200).json({ status: 'success', data: restaurant });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Lấy danh sách tất cả cửa hàng (Admin)
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate('owner_id', 'email full_name phone').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: restaurants });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Admin duyệt hồ sơ đăng ký Cửa hàng (BM2, QĐ2)
exports.approveRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.body; // 'approved' hoặc 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Trạng thái duyệt không hợp lệ!' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy thông tin nhà hàng!' });
    }

    restaurant.status = status;
    await restaurant.save();

    // Nếu được duyệt, tự động nâng cấp phân quyền người dùng lên 'merchant' và tạo Thực đơn trống
    if (status === 'approved') {
      await User.findByIdAndUpdate(restaurant.owner_id, { role: 'merchant' });
      const existingMenu = await Menu.findOne({ store_id: restaurantId });
      if (!existingMenu) {
        await Menu.create({ store_id: restaurantId, items: [] });
      }
    } else if (status === 'rejected') {
      // Nếu từ chối, đảm bảo hạ quyền xuống 'customer'
      await User.findByIdAndUpdate(restaurant.owner_id, { role: 'customer' });
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

// Merchant tự thêm món ăn của họ (cần admin duyệt)
exports.addMerchantFood = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const restaurant = await Restaurant.findOne({ owner_id });
    if (!restaurant || restaurant.status !== 'approved') {
      return res.status(403).json({ status: 'fail', message: 'Cửa hàng của bạn chưa được duyệt hoặc không tồn tại!' });
    }

    const { name, price, category, image, description } = req.body;
    if (!price || price <= 0) {
      return res.status(400).json({ status: 'fail', message: 'Đơn giá món ăn phải lớn hơn 0!' });
    }

    const food = await Food.create({
      name,
      price,
      category,
      image,
      description,
      status: 'pending',
      restaurant_id: restaurant._id,
      restaurant_name: restaurant.store_name
    });

    res.status(201).json({
      status: 'success',
      message: '🍔 Đăng ký món ăn thành công! Vui lòng chờ Admin duyệt phát hành.',
      data: food
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Merchant lấy danh sách các món ăn do họ sở hữu
exports.getMyFoods = async (req, res) => {
  try {
    const owner_id = req.user.id;
    const restaurant = await Restaurant.findOne({ owner_id });
    if (!restaurant) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy thông tin cửa hàng!' });
    }

    const foods = await Food.find({ restaurant_id: restaurant._id }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: foods });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Các hàm nghiệp vụ cũ dự phòng (thêm trực tiếp vào menu nhúng)
exports.addMenuItem = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, image, price, category } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quy định hệ thống: Đơn giá món ăn nhập vào phải lớn hơn 0đ!'
      });
    }

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

exports.toggleItemAvailability = async (req, res) => {
  try {
    const { restaurantId, itemId } = req.params;
    const { is_available } = req.body;

    const menu = await Menu.findOne({ store_id: restaurantId });
    if (!menu) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy thực đơn!' });
    }

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