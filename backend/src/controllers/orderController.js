const mongoose = require('mongoose');
const Order = require('../models/order');
const User = require('../models/user');
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

      const Notification = require('../models/notification');
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


// NGHIỆP VỤ 4: Khởi tạo/Lập đơn hàng cá nhân hoặc đơn hàng nhóm (BM5, BM6, QĐ6, QĐ7, QĐ8)
exports.createOrder = async (req, res) => {
  try {
    const { restaurant_id, creator_id, order_type, shipping_address, distance_km, items, members } = req.body;

    // Tự động gán creator_id từ token người dùng
    const finalCreatorId = creator_id || req.user.id;

    // Tự động tìm cửa hàng hoạt động nếu frontend gửi đơn mock không có restaurant_id
    let finalStoreId = restaurant_id;
    if (!finalStoreId) {
      const activeRest = await Restaurant.findOne({ status: 'approved' });
      if (activeRest) {
        finalStoreId = activeRest._id;
      } else {
        const anyRest = await Restaurant.findOne();
        if (anyRest) {
          finalStoreId = anyRest._id;
        } else {
          return res.status(400).json({
            status: 'fail',
            message: 'Hệ thống chưa có cửa hàng nào hoạt động để nhận đơn!'
          });
        }
      }
    }

    // Tự động ước lượng khoảng cách ngẫu nhiên từ 2 - 9 km nếu không truyền
    let finalDistance = distance_km;
    if (finalDistance === undefined || finalDistance === null || finalDistance === 0) {
      finalDistance = Math.floor(Math.random() * 8) + 2; // 2 - 9 km
    }

    // RÀNG BUỘC QĐ 6: Khoảng cách không được vượt quá 15km
    if (finalDistance > 15) {
      return res.status(400).json({
        status: 'fail',
        message: 'Hệ thống từ chối đặt hàng: Khoảng cách từ cửa hàng đến bạn vượt quá 15km!'
      });
    }

    // RÀNG BUỘC QĐ 8: Đơn đặt hàng theo nhóm không vượt quá 20 thành viên
    if (order_type === 'group' && members && (members.length + 1) > 20) {
      return res.status(400).json({
        status: 'fail',
        message: 'Hệ thống từ chối: Số lượng thành viên tham gia đặt chung vượt quá giới hạn 20 người!'
      });
    }

    // Chuẩn hóa danh sách món ăn từ giỏ hàng (map ObjectId hợp lệ)
    const formattedItems = (items || []).map(item => {
      let itemId = item.item_id || item.id || item._id;
      if (!mongoose.Types.ObjectId.isValid(itemId)) {
        itemId = new mongoose.Types.ObjectId(); // Tự sinh ObjectId hợp lệ cho món ăn mock
      }
      let buyerId = item.buyer_id;
      if (!buyerId || !mongoose.Types.ObjectId.isValid(buyerId)) {
        buyerId = finalCreatorId;
      }
      return {
        item_id: itemId,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price || 0,
        buyer_id: buyerId
      };
    });

    // TỰ ĐỘNG TÍNH TOÁN THEO QĐ 7
    // 1. Thành tiền món ăn = tổng (số lượng * đơn giá) của các món
    let subtotal = 0;
    formattedItems.forEach(item => {
      subtotal += item.quantity * item.price;
    });

    // 2. Phí vận chuyển = 5,000đ/km
    const shipping_fee = finalDistance * 5000;

    // 3. Tổng tiền đơn hàng = thành tiền món ăn + phí vận chuyển
    const total_price = subtotal + shipping_fee;

    // Lưu đơn hàng vào database
    const newOrder = new Order({
      store_id: finalStoreId,
      creator_id: finalCreatorId,
      order_type: order_type || 'single',
      members: order_type === 'group' ? members : [],
      items: formattedItems,
      shipping_address,
      distance_km: finalDistance,
      shipping_fee,
      subtotal,
      total_price,
      status: 'pending'
    });

    await newOrder.save();

    res.status(201).json({
      status: 'success',
      message: '🛒 Đơn hàng đã được ghi nhận thành công trên hệ thống!',
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// NGHIỆP VỤ 5: Cập nhật trạng thái đơn hàng và tự động tính điểm uy tín (QĐ 3)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, reason } = req.body; // 'completed', 'cancelled',...
    const Notification = require('../models/notification');

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy mã đơn hàng này!' });
    }

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
    else if (status === 'cancelled' && reason === 'Đơn ảo/Hủy không lý do') {
      // Khách hàng hủy đơn không lý do hoặc tạo đơn ảo: Trừ nặng 5 điểm uy tín
      await adjustCreditScore(order.creator_id, -5);
      await checkAndBanUser(order.creator_id);
    }

    await order.save();

    res.status(200).json({
      status: 'success',
      message: `Cập nhật trạng thái đơn hàng thành công sang [${status}]. Hệ thống đã đồng bộ điểm uy tín!`,
      data: order
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Lấy danh sách đơn hàng đã đặt của tài khoản hiện tại
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ creator_id: userId })
      .populate('store_id', 'store_name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      orders
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Lỗi đồng bộ danh sách lịch sử đơn hàng!',
      error: error.message
    });
  }
};