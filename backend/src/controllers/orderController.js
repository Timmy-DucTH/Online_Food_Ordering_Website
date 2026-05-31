const Order = require('../models/order');
const User = require('../models/user');
const Restaurant = require('../models/restaurant');
const AccountLog = require('../models/accountLog');

exports.createOrder = async (req, res) => {
  try {
    const {
      restaurant_id,
      creator_id,
      order_type,
      shipping_address,
      distance_km,
      items,
      members,
      payment_method,
      note
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Don hang phai co it nhat 1 mon an!' });
    }

    if (distance_km > 15) {
      return res.status(400).json({
        status: 'fail',
        message: 'Khoang cach tu cua hang den khach hang vuot qua 15km!'
      });
    }

    if (order_type === 'group' && members && (members.length + 1) > 20) {
      return res.status(400).json({
        status: 'fail',
        message: 'Don dat hang theo nhom khong duoc vuot qua 20 thanh vien!'
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const shipping_fee = distance_km * 5000;
    const total_price = subtotal + shipping_fee;

    const newOrder = new Order({
      store_id: restaurant_id,
      creator_id,
      order_type: order_type || 'single',
      members: order_type === 'group' ? members || [] : [],
      items,
      shipping_address,
      distance_km,
      shipping_fee,
      subtotal,
      total_price,
      payment_method: payment_method || 'COD',
      status: 'pending',
      note
    });

    await newOrder.save();

    res.status(201).json({
      status: 'success',
      message: 'Don hang da duoc ghi nhan thanh cong!',
      data: newOrder
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, reason } = req.body;

    if (!['pending', 'preparing', 'shipping', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Trang thai don hang khong hop le!' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Khong tim thay ma don hang nay!' });
    }

    order.status = status;
    await order.save();

    if (status === 'completed') {
      await User.findByIdAndUpdate(order.creator_id, { $inc: { credit_score: 1 } });
      const restaurant = await Restaurant.findById(order.store_id);
      if (restaurant) {
        await User.findByIdAndUpdate(restaurant.owner_id, { $inc: { credit_score: 1 } });
      }
    } else if (status === 'cancelled' && reason === 'fake_order') {
      await User.findByIdAndUpdate(order.creator_id, { $inc: { credit_score: -5 } });

      const userCheck = await User.findById(order.creator_id);
      if (userCheck && userCheck.credit_score < 30) {
        userCheck.status = 'banned';
        await userCheck.save();
        await AccountLog.create({
          user_id: userCheck._id,
          action_type: 'ban',
          reason: 'He thong tu dong khoa do diem uy tin duoi 30',
          duration_days: 7,
          performed_by: 'SYSTEM'
        });
      }
    }

    res.status(200).json({
      status: 'success',
      message: `Cap nhat trang thai don hang thanh cong sang ${status}.`,
      data: order
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
