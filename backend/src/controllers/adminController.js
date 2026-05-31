const User = require('../models/user');
const AccountLog = require('../models/accountLog');

exports.toggleUserBanStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action_type, reason, duration_days } = req.body;

    if (!['ban', 'unban'].includes(action_type)) {
      return res.status(400).json({ status: 'fail', message: 'Hanh dong xu ly khong hop le!' });
    }

    const targetStatus = action_type === 'ban' ? 'banned' : 'active';
    const user = await User.findByIdAndUpdate(userId, { status: targetStatus }, { new: true });

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Khong tim thay nguoi dung!' });
    }

    await AccountLog.create({
      user_id: userId,
      action_type,
      reason,
      duration_days: duration_days || null,
      performed_by: 'ADMIN_PANEL'
    });

    res.status(200).json({
      status: 'success',
      message: `Da thuc hien lenh ${action_type.toUpperCase()} thanh cong doi voi tai khoan ${user.email}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
