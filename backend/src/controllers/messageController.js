const Message = require('../models/message');
const User = require('../models/user');
const Notification = require('../models/notification');
const Order = require('../models/order');
const Restaurant = require('../models/restaurant');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({ status: 'fail', message: 'Thiếu thông tin người nhận hoặc nội dung!' });
    }

    // 1. Cho phép nhắn với các tài khoản giả lập/hỗ trợ hệ thống ảo (chỉ shipper và store)
    if (receiver_id === 'driver_default_1' || receiver_id === 'store_default_1') {
      return res.status(201).json({
        status: 'success',
        data: {
          sender_id,
          receiver_id,
          content,
          createdAt: new Date().toISOString()
        }
      });
    }

    let finalReceiverId = receiver_id;
    if (receiver_id === 'system_default_1') {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        finalReceiverId = adminUser._id;
      } else {
        return res.status(404).json({ status: 'fail', message: 'Hệ thống hiện tại chưa có Quản trị viên!' });
      }
    }

    // Kiểm tra quyền nhắn tin
    let isAllowed = false;

    const sender = await User.findById(sender_id);
    const receiver = await User.findById(finalReceiverId);

    // Bất kỳ người dùng nào cũng được phép chat với Admin, và Admin được chat với bất kỳ ai
    if (sender && (sender.role === 'admin' || (receiver && receiver.role === 'admin'))) {
      isAllowed = true;
    }

    // 2. Kiểm tra nếu đã từng có tin nhắn qua lại trong quá khứ
    if (!isAllowed) {
      const alreadyMessaged = await Message.exists({
        $or: [
          { sender_id, receiver_id: finalReceiverId },
          { sender_id: finalReceiverId, receiver_id: sender_id }
        ]
      });
      if (alreadyMessaged) isAllowed = true;
    }

    // 3. Kiểm tra liên kết từ đơn hàng thực tế (Customer <-> Merchant)
    if (!isAllowed) {
      if (sender && receiver) {
        if (sender.role === 'customer' && receiver.role === 'merchant') {
          // Khách gửi cho chủ quán: Tìm các nhà hàng của chủ quán này
          const merchantRestaurants = await Restaurant.find({ owner_id: finalReceiverId }).select('_id');
          const restaurantIds = merchantRestaurants.map(r => r._id);
          if (restaurantIds.length > 0) {
            // Xem khách hàng đã từng đặt đơn tại các nhà hàng này chưa
            isAllowed = await Order.exists({
              store_id: { $in: restaurantIds },
              $or: [{ creator_id: sender_id }, { members: sender_id }]
            });
          }
        } else if (sender.role === 'merchant' && receiver.role === 'customer') {
          // Chủ quán gửi cho khách: Tìm các nhà hàng của chủ quán này
          const merchantRestaurants = await Restaurant.find({ owner_id: sender_id }).select('_id');
          const restaurantIds = merchantRestaurants.map(r => r._id);
          if (restaurantIds.length > 0) {
            // Xem đơn hàng của khách hàng tại các nhà hàng này có tồn tại không
            isAllowed = await Order.exists({
              store_id: { $in: restaurantIds },
              $or: [{ creator_id: finalReceiverId }, { members: finalReceiverId }]
            });
          }
        }
      }
    }

    if (!isAllowed) {
      return res.status(403).json({
        status: 'fail',
        message: 'Bạn chỉ có thể nhắn tin với những người đã từng liên hệ hoặc có liên kết đơn hàng (Cửa hàng / Khách hàng / Shipper)!'
      });
    }

    const newMessage = new Message({
      sender_id,
      receiver_id: finalReceiverId,
      content
    });

    await newMessage.save();

    // Gửi thông báo cho người nhận
    try {
      const notify = new Notification({
        user_id: finalReceiverId,
        title: `Tin nhắn mới từ ${sender ? sender.full_name : 'Người dùng'}`,
        message: content.length > 50 ? `${content.substring(0, 47)}...` : content,
        type: 'system',
        is_read: false
      });
      await notify.save();
    } catch (e) {
      console.error('Error saving notification for message:', e.message);
    }

    res.status(201).json({
      status: 'success',
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get messages between logged in user and another user
exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    let { otherUserId } = req.params;

    if (otherUserId === 'system_default_1') {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        otherUserId = adminUser._id;
      }
    }

    const messages = await Message.find({
      $or: [
        { sender_id: userId, receiver_id: otherUserId },
        { sender_id: otherUserId, receiver_id: userId }
      ]
    }).sort({ createdAt: 1 });

    res.status(200).json({
      status: 'success',
      data: messages
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get list of users to chat with
exports.getChatUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ status: 'fail', message: 'Người dùng không tồn tại' });
    }

    // 1. Lấy ID những người từng nhắn tin qua lại trong lịch sử tin nhắn
    const messages = await Message.find({
      $or: [{ sender_id: userId }, { receiver_id: userId }]
    }).select('sender_id receiver_id');

    const contactedIds = new Set();
    messages.forEach(m => {
      const senderStr = m.sender_id.toString();
      const receiverStr = m.receiver_id.toString();
      if (senderStr !== userId) contactedIds.add(senderStr);
      if (receiverStr !== userId) contactedIds.add(receiverStr);
    });

    // Nếu người dùng hiện tại là Admin, họ chỉ cần hiển thị danh sách những người đã từng liên hệ hỗ trợ
    if (currentUser.role === 'admin') {
      const users = await User.find({
        _id: { $in: Array.from(contactedIds) }
      }).select('full_name email role');
      
      const enrichedUsers = [];
      for (const u of users) {
        const lastMsg = await Message.findOne({
          $or: [
            { sender_id: userId, receiver_id: u._id },
            { sender_id: u._id, receiver_id: userId }
          ]
        }).sort({ createdAt: -1 });
        
        const userObj = u.toObject();
        userObj.lastMessage = lastMsg;
        userObj.needsReply = lastMsg && lastMsg.sender_id.toString() === u._id.toString();
        enrichedUsers.push(userObj);
      }
      
      return res.status(200).json({
        status: 'success',
        data: enrichedUsers
      });
    }

    // 2. Lấy ID liên hệ dựa trên lịch sử đơn hàng (Customer <-> Merchant)
    const orderContactIds = new Set();

    if (currentUser.role === 'customer') {
      // Khách hàng đặt mua: Tìm chủ các cửa hàng họ đã từng đặt đơn
      const orders = await Order.find({
        $or: [{ creator_id: userId }, { members: userId }]
      }).select('store_id');

      const storeIds = orders.map(o => o.store_id);
      if (storeIds.length > 0) {
        const restaurants = await Restaurant.find({ _id: { $in: storeIds } }).select('owner_id');
        restaurants.forEach(r => {
          if (r.owner_id) orderContactIds.add(r.owner_id.toString());
        });
      }
    } else if (currentUser.role === 'merchant') {
      // Chủ cửa hàng: Tìm các khách hàng đã từng đặt từ cửa hàng của họ
      const myRestaurants = await Restaurant.find({ owner_id: userId }).select('_id');
      const myRestaurantIds = myRestaurants.map(r => r._id);

      if (myRestaurantIds.length > 0) {
        const orders = await Order.find({ store_id: { $in: myRestaurantIds } })
                                  .select('creator_id members');
        orders.forEach(o => {
          if (o.creator_id) orderContactIds.add(o.creator_id.toString());
          if (o.members && o.members.length > 0) {
            o.members.forEach(memberId => {
              orderContactIds.add(memberId.toString());
            });
          }
        });
      }
    }

    // Hợp nhất danh sách liên hệ hợp lệ
    const allowedContactIds = Array.from(new Set([...contactedIds, ...orderContactIds]));

    // Query thông tin người dùng từ DB
    let users = [];
    if (allowedContactIds.length > 0) {
      users = await User.find({ 
        _id: { $in: allowedContactIds }, 
        status: 'active' 
      }).select('full_name email role');
    }

    // 3. Thêm các liên hệ giả lập ảo (Virtual contacts)
    const systemContact = {
      _id: 'system_default_1',
      full_name: '🛡️ Hệ thống TasteByte',
      email: 'system@tastebyte.vn',
      role: 'system',
      isVirtual: false // Set to false to trigger real database APIs
    };

    const virtualContacts = [
      {
        _id: 'driver_default_1',
        full_name: 'Shipper Nguyễn Văn Hùng',
        email: 'shipper.hung@tastebyte.vn',
        role: 'driver',
        isVirtual: true
      },
      {
        _id: 'store_default_1',
        full_name: 'TasteByte Customer Support',
        email: 'support@tastebyte.vn',
        role: 'merchant',
        isVirtual: true
      }
    ];

    res.status(200).json({
      status: 'success',
      data: [systemContact, ...users, ...virtualContacts]
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
