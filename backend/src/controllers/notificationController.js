const Notification = require('../models/notification');

exports.createNotification = async (req, res) => {
  try {
    const { user_id, title, message, type } = req.body;

    if (!user_id || !title || !message) {
      return res.status(400).json({
        status: 'fail',
        message: 'Vui long nhap day du user_id, title va message!'
      });
    }

    const notification = await Notification.create({
      user_id,
      title,
      message,
      type: type || 'system'
    });

    res.status(201).json({
      status: 'success',
      message: 'Gui thong bao thanh cong!',
      data: notification
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    const notifications = await Notification.find({ user_id: userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      message: 'Lay danh sach thong bao thanh cong!',
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ status: 'fail', message: 'Khong tim thay thong bao!' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Da danh dau thong bao la da doc!',
      data: notification
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Notification.updateMany(
      { user_id: userId, is_read: false },
      { is_read: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Da danh dau tat ca thong bao la da doc!'
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
