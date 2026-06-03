const Notification = require('../models/notification');

// Get all notifications for logged in user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.find({ user_id: userId })
                                            .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ status: 'fail', message: 'Thông báo không tồn tại!' });
    }

    // Verify ownership
    if (notification.user_id.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'Bạn không có quyền chỉnh sửa thông báo này!' });
    }

    notification.is_read = true;
    await notification.save();

    res.status(200).json({
      status: 'success',
      message: 'Đã đánh dấu thông báo là đã đọc',
      data: notification
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Create custom notification (helper/general use)
exports.createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;
    
    const newNotify = new Notification({
      user_id,
      title,
      message,
      type: type || 'system',
      is_read: false
    });

    await newNotify.save();

    res.status(201).json({
      status: 'success',
      data: newNotify
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Đánh dấu tất cả thông báo của người dùng là đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.updateMany({ user_id: userId, is_read: false }, { is_read: true });

    res.status(200).json({
      status: 'success',
      message: 'Đã đánh dấu tất cả thông báo là đã đọc thành công!'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Xóa tất cả thông báo của người dùng
exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.deleteMany({ user_id: userId });

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa tất cả thông báo thành công!'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Xóa một thông báo theo ID
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ status: 'fail', message: 'Thông báo không tồn tại!' });
    }

    if (notification.user_id.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'Bạn không có quyền xóa thông báo này!' });
    }

    await Notification.deleteOne({ _id: id });

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa thông báo thành công!'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
