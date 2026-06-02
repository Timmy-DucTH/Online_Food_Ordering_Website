const User = require('../models/user');
const Food = require('../models/food');
const Order = require('../models/order');
const AccountLog = require('../models/accountLog');
const Notification = require('../models/notification');
const Restaurant = require('../models/restaurant');

// 1. Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Quét và tự động mở khóa các tài khoản hết hạn khóa tạm thời
    for (const u of users) {
      if (u.banned_until && new Date() >= u.banned_until) {
        u.banned_until = null;
        u.status = 'active';
        u.ban_reason = '';
        await u.save();
      }
      
      // Quét cảnh báo điểm thấp dưới 30
      if (u.credit_score < 30) {
        const exists = await Notification.findOne({
          user_id: u._id,
          title: 'Tài khoản bị khóa tự động do uy tín thấp'
        });
        if (!exists) {
          await Notification.create({
            user_id: u._id,
            title: 'Tài khoản bị khóa tự động do uy tín thấp',
            message: `Điểm uy tín của bạn hiện tại là ${u.credit_score} điểm, thấp hơn quy định cho phép (< 30 điểm). Hệ thống đã tự động khóa tài khoản của bạn.`,
            type: 'system'
          });
        }
      }
    }

    const updatedUsers = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', users: updatedUsers });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Khóa tài khoản người dùng
exports.banUser = async (req, res) => {
  try {
    const { reason, duration } = req.body;
    
    let banned_until = null;
    let durationText = 'vĩnh viễn';
    
    if (duration && duration !== 'permanent') {
      const days = parseInt(duration, 10);
      if (!isNaN(days)) {
        banned_until = new Date();
        banned_until.setDate(banned_until.getDate() + days);
        durationText = `${days} ngày`;
      }
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ status: 'fail', message: 'Không tìm thấy người dùng!' });
    if (user.role === 'admin') {
      return res.status(400).json({ status: 'fail', message: 'Không thể khóa tài khoản quản trị viên!' });
    }

    user.status = 'banned';
    user.banned_until = banned_until;
    user.ban_reason = reason || 'Admin khóa tài khoản thủ công';
    await user.save();

    await AccountLog.create({
      user_id: req.params.id,
      action_type: 'ban',
      reason: `${reason || 'Admin khóa tài khoản'} (Thời hạn: ${durationText})`,
      performed_by: 'ADMIN_PANEL'
    });

    // Gửi thông báo cho user
    await Notification.create({
      user_id: req.params.id,
      title: `Tài khoản của bạn đã bị khóa (${durationText})`,
      message: `Tài khoản của bạn đã bị quản trị viên khóa (${durationText}). Lý do: ${reason || 'Không có lý do cụ thể'}${banned_until ? `. Thời gian tự động mở khóa: ${banned_until.toLocaleString('vi-VN')}` : ''}`,
      type: 'system'
    });

    res.status(200).json({ status: 'success', message: `Đã khóa tài khoản ${user.email} (${durationText}) thành công!` });
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
    const foods = await Food.find({ status: { $ne: 'pending' } })
      .populate('restaurant_id')
      .sort({ createdAt: -1 });
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
    const { reason } = req.body;
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ status: 'fail', message: 'Không tìm thấy món ăn!' });

    // Gửi thông báo cho chủ cửa hàng nếu món ăn thuộc về cửa hàng
    if (food.restaurant_id) {
      const restaurantObj = await Restaurant.findById(food.restaurant_id);
      if (restaurantObj && restaurantObj.owner_id) {
        await Notification.create({
          user_id: restaurantObj.owner_id,
          title: 'Món ăn bị gỡ bỏ bởi quản trị viên',
          message: `Món ăn "${food.name}" của bạn đã bị gỡ bỏ bởi admin. Lý do: ${reason || 'Không có lý do cụ thể'}`,
          type: 'system'
        });
      }
    }

    await Food.findByIdAndDelete(req.params.id);
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

        const exists = await Notification.findOne({
          user_id: order.creator_id,
          title: 'Tài khoản bị khóa tự động do uy tín thấp'
        });
        if (!exists) {
          await Notification.create({
            user_id: order.creator_id,
            title: 'Tài khoản bị khóa tự động do uy tín thấp',
            message: `Điểm uy tín của bạn hiện tại là ${userCheck.credit_score} điểm, thấp hơn quy định cho phép (< 30 điểm). Hệ thống đã tự động khóa tài khoản của bạn.`,
            type: 'system'
          });
        }
      }
    }

    res.status(200).json({ status: 'success', message: `Đã cập nhật trạng thái đơn hàng sang [${status}]` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};