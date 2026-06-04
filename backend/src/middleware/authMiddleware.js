const jwt = require('jsonwebtoken');
const User = require('../models/user');

// 1. Middleware xác thực xem người dùng đã đăng nhập chưa (Kiểm tra Token)
const verifyToken = async (req, res, next) => {
  // Lấy token từ header "Authorization: Bearer <TOKEN>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập! Không tìm thấy token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Giải mã mã hóa token bằng JWT_SECRET của bạn
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'OFOW_DO_AN_CONG_NGHE_PHAN_MEM_NHOM_8_2026');
    
    // Tìm người dùng trong database để kiểm tra trạng thái khóa tài khoản thực tế
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại hoặc đã bị xóa khỏi hệ thống!' });
    }

    // Kiểm tra khóa tạm thời
    if (user.banned_until) {
      if (new Date() < user.banned_until) {
        const formattedDate = new Date(user.banned_until).toLocaleString('vi-VN');
        return res.status(403).json({
          status: 'banned',
          message: `Tài khoản của bạn đã bị khóa tạm thời bởi Admin cho đến ${formattedDate}. Lý do: ${user.ban_reason || 'Không có lý do cụ thể'}`
        });
      } else {
        // Tự động mở khóa nếu đã hết hạn
        user.banned_until = null;
        user.status = 'active';
        user.ban_reason = '';
        await user.save();
      }
    }

    // Kiểm tra khóa vĩnh viễn hoặc khóa do điểm uy tín
    if (user.status === 'banned') {
      return res.status(403).json({
        status: 'banned',
        message: user.ban_reason 
          ? `Tài khoản của bạn đã bị khóa vĩnh viễn! Lý do: ${user.ban_reason}`
          : `Tài khoản của bạn đã bị khóa! Lý do: Chỉ số uy tín hiện tại thấp hơn quy định (< 30 điểm).`
      });
    }

    // Lưu thông tin user giải mã được (id, role,...) vào đối tượng req để các hàm sau sử dụng
    req.user = decoded; 
    next();
  } catch (error) {
    console.error('Lỗi xác thực Token:', error.message);
    return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
};

// 2. Middleware CHỈ CHO PHÉP ADMIN HỆ THỐNG vào
const isAdmin = (req, res, next) => {
  // req.user được lấy từ middleware verifyToken chạy trước đó
  if (req.user && req.user.role === 'admin') {
    next(); // Hợp lệ, cho phép đi tiếp
  } else {
    return res.status(403).json({ message: 'Từ chối truy cập! Chức năng này chỉ dành cho Admin.' });
  }
};

// 3. Middleware CHO PHÉP CẢ MERCHANT VÀ ADMIN (Ví dụ: Thêm/Sửa/Xóa món ăn)
const isMerchantOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'merchant' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({ message: 'Từ chối truy cập! Bạn cần quyền Chủ quán hoặc Admin.' });
  }
};

module.exports = { verifyToken, isAdmin, isMerchantOrAdmin };