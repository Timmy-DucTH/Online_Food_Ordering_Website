const User = require('../models/user');
const AccountLog = require('../models/accountLog');

// NGHIỆP VỤ 6: Admin chủ động khóa/mở khóa tài khoản người dùng khi phát hiện vi phạm (BM3, QĐ4) [cite: 124, 139, 141, 143]
exports.toggleUserBanStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action_type, reason, duration_days } = req.body; // action_type: 'ban' hoặc 'unban'

    if (!['ban', 'unban'].includes(action_type)) {
      return res.status(400).json({ status: 'fail', message: 'Hành động xử lý không hợp lệ!' });
    }

    const targetStatus = action_type === 'ban' ? 'banned' : 'active';
    const user = await User.findByIdAndUpdate(userId, { status: targetStatus }, { new: true });

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Không tìm thấy người dùng!' });
    }

    // GHI LẠI NHẬT KÝ KHÓA TÀI KHOẢN (BM 3) [cite: 139]
    await AccountLog.create({
      user_id: userId,
      action_type,
      reason, [cite: 140]
      duration_days: duration_days || null,
      performed_by: 'ADMIN_PANEL'
    });

    res.status(200).json({
      status: 'success',
      message: `Đã thực hiện lệnh [${action_type.toUpperCase()}] thành công đối với tài khoản ${user.email}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};