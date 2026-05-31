const Restaurant = require('../models/restaurant');
const Menu = require('../models/menu');

exports.approveRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Trang thai duyet khong hop le!' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurantId,
      { status },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ status: 'fail', message: 'Khong tim thay thong tin nha hang!' });
    }

    if (status === 'approved') {
      const existingMenu = await Menu.findOne({ store_id: restaurantId });
      if (!existingMenu) {
        await Menu.create({ store_id: restaurantId, items: [] });
      }
    }

    res.status(200).json({
      status: 'success',
      message: `Da cap nhat trang thai ho so nha hang thanh: ${status}`,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.addMenuItem = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, image, price, category } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Don gia mon an phai lon hon 0!'
      });
    }

    const menu = await Menu.findOne({ store_id: restaurantId });
    if (!menu) {
      return res.status(404).json({ status: 'fail', message: 'Nha hang nay chua duoc tao thuc don!' });
    }

    menu.items.push({ name, image, price, category, is_available: true });
    await menu.save();

    res.status(201).json({
      status: 'success',
      message: 'Them mon an vao thuc don thanh cong!',
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
      return res.status(404).json({ status: 'fail', message: 'Khong tim thay thuc don!' });
    }

    const item = menu.items.id(itemId);
    if (!item) {
      return res.status(404).json({ status: 'fail', message: 'Mon an khong ton tai trong thuc don!' });
    }

    item.is_available = is_available;
    await menu.save();

    res.status(200).json({
      status: 'success',
      message: `Da cap nhat trang thai mon an thanh: ${is_available ? 'Con mon' : 'Het mon'}`,
      data: item
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
