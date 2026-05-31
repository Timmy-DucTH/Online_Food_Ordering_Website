const jwt = require('jsonwebtoken');

// 1. Middleware xác thực xem người dùng đã đăng nhập chưa (Kiểm tra Token)
const verifyToken = (req, res, next) => {
  // Lấy token từ header "Authorization: Bearer <TOKEN>"
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập! Không tìm thấy token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Giải mã mã hóa token bằng JWT_SECRET của bạn
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY_CUA_BAN');
    
    // Lưu thông tin user giải mã được (id, role,...) vào đối tượng req để các hàm sau sử dụng
    req.user = decoded; 
    next();
  } catch (error) {
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