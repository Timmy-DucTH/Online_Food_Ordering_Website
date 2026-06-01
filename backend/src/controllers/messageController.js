const Message = require('../models/message');
const User = require('../models/user');
const Notification = require('../models/notification');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const sender_id = req.user.id;
    const { receiver_id, content } = req.body;

    if (!receiver_id || !content) {
      return res.status(400).json({ status: 'fail', message: 'Thiếu thông tin người nhận hoặc nội dung!' });
    }

    const newMessage = new Message({
      sender_id,
      receiver_id,
      content
    });

    await newMessage.save();

    // Optionally create a notification for the receiver
    // Don't error out if it fails
    try {
      const sender = await User.findById(sender_id);
      const notify = new Notification({
        user_id: receiver_id,
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
    const { otherUserId } = req.params;

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
    // Find all active users except current user
    const users = await User.find({ _id: { $ne: userId }, status: 'active' })
                            .select('full_name email role')
                            .limit(20);

    // Let's add some virtual driver / store contacts if needed to make it interesting
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
      data: [...users, ...virtualContacts]
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
