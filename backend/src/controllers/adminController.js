const User = require('../models/user');
const Food = require('../models/food');
const Order = require('../models/order');
const AccountLog = require('../models/accountLog');

// 1. Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Khóa tài khoản người dùng
exports.banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'banned' }, { new: true });
    if (!user) return res.status(404).json({ status: 'fail', message: 'Không tìm thấy người dùng!' });

    await AccountLog.create({
      user_id: req.params.id,
      action_type: 'ban',
      reason: 'Admin khóa tài khoản thủ công',
      performed_by: 'ADMIN_PANEL'
    });

    res.status(200).json({ status: 'success', message: `Đã khóa tài khoản ${user.email} thành công!` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 3. Mở khóa tài khoản người dùng
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ status: 'fail', message: 'Không tìm thấy người dùng!' });

    await AccountLog.create({
      user_id: req.params.id,
      action_type: 'unban',
      reason: 'Admin mở khóa tài khoản thủ công',
      performed_by: 'ADMIN_PANEL'
    });

    res.status(200).json({ status: 'success', message: `Đã mở khóa tài khoản ${user.email} thành công!` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 4. Thống kê hệ thống
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    res.status(200).json({ status: 'success', stats: { totalUsers, bannedUsers, totalOrders, completedOrders } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 5. Lấy danh sách tất cả món ăn công khai (chỉ lấy món đã duyệt hoặc không ở trạng thái pending)
exports.getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find({ status: { $ne: 'pending' } }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', foods });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 5b. Lấy danh sách tất cả món ăn cho Admin (bao gồm cả chờ duyệt)
exports.getAdminFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', foods });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 5c. Admin duyệt/từ chối món ăn của merchant
exports.approveFood = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' hoặc 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Trạng thái duyệt không hợp lệ!' });
    }

    const food = await Food.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!food) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy món ăn!' });
    }

    res.status(200).json({
      status: 'success',
      message: `Đã cập nhật trạng thái món ăn thành: ${status}`,
      food
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 6. Thêm món ăn mới (Dự phòng)
exports.addFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json({ status: 'success', message: 'Thêm món ăn thành công!', food });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 7. Xóa món ăn
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ status: 'fail', message: 'Không tìm thấy món ăn!' });
    res.status(200).json({ status: 'success', message: 'Đã xóa món ăn thành công!' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 8. Lấy tất cả đơn hàng (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('creator_id', 'email full_name')
      .populate('store_id', 'store_name')
      .sort({ createdAt: -1 });
    // Map creator_id thành user_id để phù hợp với frontend
    const mapped = orders.map(o => {
      const obj = o.toObject();
      obj.user_id = obj.creator_id;
      return obj;
    });
    res.status(200).json({ status: 'success', orders: mapped });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 9. Cập nhật trạng thái đơn hàng + tự động tính điểm uy tín
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ status: 'fail', message: 'Không tìm thấy đơn hàng!' });

    order.status = status;
    await order.save();

    // Tự động cập nhật điểm uy tín (credit_score)
    if (status === 'completed') {
      await User.findByIdAndUpdate(order.creator_id, { $inc: { credit_score: 1 } });
    } else if (status === 'cancelled') {
      await User.findByIdAndUpdate(order.creator_id, { $inc: { credit_score: -5 } });
      // Tự động khóa nếu điểm < 30
      const userCheck = await User.findById(order.creator_id);
      if (userCheck && userCheck.credit_score < 30) {
        userCheck.status = 'banned';
        await userCheck.save();
      }
    }

    res.status(200).json({ status: 'success', message: `Đã cập nhật trạng thái đơn hàng sang [${status}]` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};