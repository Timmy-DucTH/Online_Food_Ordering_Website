const User = require('../models/user');
const Food = require('../models/food');
const Order = require('../models/order');
const AccountLog = require('../models/accountLog');
const Notification = require('../models/notification');
const Restaurant = require('../models/restaurant');

// Helper tự động khóa tài khoản dưới 7 ngày nếu điểm uy tín tụt dưới 30đ (QĐ 4)
const checkAndBanUser = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (user && user.credit_score < 30 && user.status !== 'banned') {
      user.status = 'banned';
      user.ban_reason = `Điểm uy tín tụt xuống mức cảnh báo: ${user.credit_score} điểm (< 30 điểm).`;
      
      // Khóa tài khoản tạm thời dưới 7 ngày
      const bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + 7);
      user.banned_until = bannedUntil;
      await user.save();

      await Notification.create({
        user_id: userId,
        title: 'Tài khoản bị khóa tự động do uy tín thấp',
        message: `Điểm uy tín của bạn hiện tại là ${user.credit_score} điểm, thấp hơn quy định cho phép (< 30 điểm). Hệ thống đã tự động khóa tài khoản của bạn trong 7 ngày.`,
        type: 'system'
      });
    }
  } catch (e) {
    console.error('Error auto-banning user:', e.message);
  }
};

// Helper điều chỉnh điểm uy tín của user và giới hạn từ 0 - 100
const adjustCreditScore = async (userId, amount) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.credit_score = Math.max(0, Math.min(100, (user.credit_score || 0) + amount));
      await user.save();
    }
  } catch (e) {
    console.error('Error adjusting user credit score:', e.message);
  }
};


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
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        status: 'active',
        banned_until: null,   // Xóa hạn khóa tạm thời
        ban_reason: ''        // Xóa lý do khóa
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ status: 'fail', message: 'Không tìm thấy người dùng!' });

    await AccountLog.create({
      user_id: req.params.id,
      action_type: 'unban',
      reason: 'Admin mở khóa tài khoản thủ công',
      performed_by: 'ADMIN_PANEL'
    });

    // ✅ QUAN TRỌNG: Xóa tất cả thông báo "bị khóa" chưa đọc
    // Nếu không xóa, frontend polling sẽ tìm thấy thông báo này và tưởng user vẫn bị khóa
    await Notification.deleteMany({
      user_id: req.params.id,
      is_read: false,
      type: 'system',
      $or: [
        { title: { $regex: 'bị khóa', $options: 'i' } },
        { title: { $regex: 'bi khoa', $options: 'i' } }
      ]
    });

    // Gửi thông báo mở khóa thành công cho user
    await Notification.create({
      user_id: req.params.id,
      title: 'Tài khoản của bạn đã được mở khóa',
      message: 'Tài khoản của bạn đã được quản trị viên mở khóa. Bạn có thể đăng nhập và sử dụng dịch vụ bình thường.',
      type: 'system'
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
    const { status, reason } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ status: 'fail', message: 'Không tìm thấy đơn hàng!' });

    // Kiểm tra quyền cập nhật đơn hàng:
    // - Admin được toàn quyền
    // - Merchant chỉ được cập nhật đơn hàng thuộc về cửa hàng của mình
    // - Customer chỉ được cập nhật đơn hàng của chính mình
    if (req.user.role === 'merchant') {
      const myRestaurant = await Restaurant.findOne({ owner_id: req.user.id });
      if (!myRestaurant || myRestaurant._id.toString() !== order.store_id.toString()) {
        return res.status(403).json({
          status: 'fail',
          message: 'Từ chối truy cập! Bạn không sở hữu cửa hàng nhận đơn hàng này.'
        });
      }
    } else if (req.user.role !== 'admin') {
      // Khách hàng thường
      if (order.creator_id.toString() !== req.user.id) {
        return res.status(403).json({
          status: 'fail',
          message: 'Từ chối truy cập! Bạn không có quyền thao tác trên đơn hàng này.'
        });
      }
    }

    const oldStatus = order.status;
    order.status = status;

    // Cập nhật các trường mốc thời gian và tính điểm trễ hạn
    if (status === 'preparing' && oldStatus !== 'preparing') {
      order.confirmedAt = Date.now();
      
      // Tính độ trễ xác nhận từ lúc tạo đơn
      const diffMin = Math.floor((Date.now() - order.createdAt) / 60000);
      if (diffMin > 15) {
        const deduct = Math.min(15, diffMin - 15);
        const rest = await Restaurant.findById(order.store_id);
        if (rest) {
          await adjustCreditScore(rest.owner_id, -deduct);
          await Notification.create({
            user_id: rest.owner_id,
            title: 'Trừ điểm uy tín do xác nhận trễ',
            message: `Cửa hàng của bạn xác nhận đơn trễ ${diffMin} phút. Hệ thống tự động trừ ${deduct} điểm uy tín.`,
            type: 'system'
          });
          
          // Auto ban check
          await checkAndBanUser(rest.owner_id);
        }
      }
    } 
    else if (status === 'shipping' && oldStatus !== 'shipping') {
      order.shippingAt = Date.now();

      // Tính độ trễ chuẩn bị từ lúc xác nhận (nếu có)
      if (order.confirmedAt) {
        const diffMin = Math.floor((Date.now() - order.confirmedAt) / 60000);
        if (diffMin > 15) {
          const deduct = Math.min(15, diffMin - 15);
          const rest = await Restaurant.findById(order.store_id);
          if (rest) {
            await adjustCreditScore(rest.owner_id, -deduct);
            await Notification.create({
              user_id: rest.owner_id,
              title: 'Trừ điểm uy tín do chuẩn bị trễ',
              message: `Cửa hàng của bạn chuẩn bị món ăn trễ ${diffMin} phút. Hệ thống tự động trừ ${deduct} điểm uy tín.`,
              type: 'system'
            });

            // Auto ban check
            await checkAndBanUser(rest.owner_id);
          }
        }
      }
    }
    else if (status === 'completed' && oldStatus !== 'completed') {
      order.completedAt = Date.now();

      // Tính độ trễ nhận hàng của khách từ lúc bắt đầu giao (shippingAt)
      if (order.shippingAt) {
        const diffMin = Math.floor((Date.now() - order.shippingAt) / 60000);
        if (diffMin > 15) {
          const deduct = Math.min(15, diffMin - 15);
          await adjustCreditScore(order.creator_id, -deduct);
          await Notification.create({
            user_id: order.creator_id,
            title: 'Trừ điểm uy tín do nhận hàng trễ',
            message: `Bạn nhận hàng trễ hẹn ${diffMin} phút từ lúc shipper giao đến. Hệ thống tự động trừ ${deduct} điểm uy tín.`,
            type: 'system'
          });

          // Auto ban check
          await checkAndBanUser(order.creator_id);
        }
      }

      // Cộng 1 điểm uy tín cho cả khách và chủ quán khi hoàn thành đơn (QĐ 3)
      await adjustCreditScore(order.creator_id, 1);
      const rest = await Restaurant.findById(order.store_id);
      if (rest) {
        await adjustCreditScore(rest.owner_id, 1);
      }
    }
    else if (status === 'cancelled') {
      const cancelReason = reason || 'Đơn ảo/Hủy không lý do';
      if (cancelReason === 'Đơn ảo/Hủy không lý do') {
        await adjustCreditScore(order.creator_id, -5);
        await checkAndBanUser(order.creator_id);
      }
    }

    await order.save();
    res.status(200).json({ status: 'success', message: `Đã cập nhật trạng thái đơn hàng sang [${status}]` });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 10. Lấy danh sách cửa hàng đang chờ duyệt hồ sơ
exports.getPendingRestaurants = async (req, res) => {
  try {
    const pendingRestaurants = await Restaurant.find({ status: 'pending' })
      .populate('owner_id', 'full_name email phone')
      .sort({ createdAt: -1 });
      
    res.status(200).json({ status: 'success', restaurants: pendingRestaurants });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 11. Phê duyệt hoặc từ chối hồ sơ cửa hàng (UC-22)
exports.approveRestaurant = async (req, res) => {
  try {
    const { status, reason } = req.body; // status: 'approved' hoặc 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Trạng thái không hợp lệ!' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy cửa hàng!' });
    }

    // Nếu duyệt, kích hoạt luôn tài khoản chủ quán
    if (status === 'approved') {
      await User.findByIdAndUpdate(restaurant.owner_id, { status: 'active' });
    }

    // Gửi thông báo cho chủ quán
    await Notification.create({
      user_id: restaurant.owner_id,
      title: status === 'approved' ? 'Hồ sơ cửa hàng đã được duyệt!' : 'Hồ sơ cửa hàng bị từ chối',
      message: status === 'approved' 
        ? 'Chúc mừng! Cửa hàng của bạn đã có thể bắt đầu bán hàng.' 
        : `Hồ sơ bị từ chối. Lý do: ${reason || 'Vui lòng cập nhật lại giấy tờ pháp lý.'}`,
      type: 'system'
    });

    res.status(200).json({ status: 'success', message: `Đã ${status} hồ sơ cửa hàng!`, restaurant });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};