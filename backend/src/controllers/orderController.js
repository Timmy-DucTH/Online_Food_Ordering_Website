const mongoose = require('mongoose');
const Order = require('../models/order');
const User = require('../models/user');
const Restaurant = require('../models/restaurant');

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
      return {
        item_id: itemId,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price || 0,
        buyer_id: finalCreatorId
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

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy mã đơn hàng này!' });
    }

    order.status = status;
    await order.save();

    // TỰ ĐỘNG ĐÁNH GIÁ CHỈ SỐ UY TÍN DỰA TRÊN TRẠNG THÁI CUỐI CỦA ĐƠN HÀNG (QĐ 3)
    if (status === 'completed') {
      // Hoàn thành đơn hàng: Cộng 1 điểm uy tín cho cả khách và chủ quán
      await User.findByIdAndUpdate(order.creator_id, { $inc: { credit_score: 1 } });
      const rest = await Restaurant.findById(order.store_id);
      if (rest) await User.findByIdAndUpdate(rest.owner_id, { $inc: { credit_score: 1 } });
    } 
    else if (status === 'cancelled' && reason === 'Đơn ảo/Hủy không lý do') {
      // Khách hàng hủy đơn không lý do hoặc tạo đơn ảo: Trừ nặng 5 điểm uy tín
      await User.findByIdAndUpdate(order.creator_id, { $inc: { credit_score: -5 } });
      
      // HỆ THỐNG TỰ ĐỘNG KHÓA TÀI KHOẢN (QĐ 4): Kiểm tra xem điểm uy tín có bị tụt xuống dưới 30 điểm không
      const userCheck = await User.findById(order.creator_id);
      if (userCheck && userCheck.credit_score < 30) {
        userCheck.status = 'banned';
        await userCheck.save();
      }
    }

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