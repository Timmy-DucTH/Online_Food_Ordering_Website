const Order = require('../models/order');
const User = require('../models/user');
const Restaurant = require('../models/restaurant');

// NGHIỆP VỤ 4: Khởi tạo/Lập đơn hàng cá nhân hoặc đơn hàng nhóm (BM5, BM6, QĐ6, QĐ7, QĐ8)
exports.createOrder = async (req, res) => {
  try {
    const { restaurant_id, creator_id, order_type, shipping_address, distance_km, items, members } = req.body;

    // RÀNG BUỘC QĐ 6: Khoảng cách không được vượt quá 15km
    if (distance_km > 15) {
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

    // TỰ ĐỘNG TÍNH TOÁN THEO QĐ 7
    // 1. Thành tiền món ăn = tổng (số lượng * đơn giá) của các món
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.quantity * item.price;
    });

    // 2. Phí vận chuyển = 5,000đ/km
    const shipping_fee = distance_km * 5000;

    // 3. Tổng tiền đơn hàng = thành tiền món ăn + phí vận chuyển
    const total_price = subtotal + shipping_fee;

    // Lưu đơn hàng vào database
    const newOrder = new Order({
      store_id: restaurant_id,
      creator_id,
      order_type: order_type || 'single',
      members: order_type === 'group' ? members : [],
      items,
      shipping_address,
      distance_km,
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