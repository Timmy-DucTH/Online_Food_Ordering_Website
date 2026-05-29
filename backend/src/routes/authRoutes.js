const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// IMPORT MIDDLEWARE BẢO MẬT (Xác thực danh tính qua Token JWT)
// Lưu ý: Tùy theo file authMiddleware.js của bạn export dạng đối tượng { verifyToken } 
// hay export trực tiếp hàm, bạn hãy kiểm tra lại tên hàm cho chính xác nhé (ví dụ: verifyToken, protect,...)
const { verifyToken } = require('../middleware/authMiddleware'); 

// ==========================================
// TRÌNH KIỂM TRA DỮ LIỆU ĐẦU VÀO (MIDDLEWARE)
// ==========================================
const validateRegisterInput = (req, res, next) => {
  const { phone, full_name, email, password } = req.body;

  // 1. Kiểm tra không được để trống
  if (!phone || !full_name || !email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Vui lòng điền đầy đủ tất cả các trường dữ liệu bắt buộc!"
    });
  }

  // 2. Kiểm tra định dạng Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: "error",
      message: "Định dạng Email không hợp lệ! Ví dụ đúng: test@gmail.com"
    });
  }

  // 3. Kiểm tra độ dài mật khẩu (Bảo mật tối thiểu)
  if (password.length < 8) {
    return res.status(400).json({
      status: "error",
      message: "Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên để đảm bảo an toàn!"
    });
  }

  // 4. Kiểm tra định dạng số điện thoại Việt Nam (10 số)
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      status: "error",
      message: "Số điện thoại không đúng định dạng Việt Nam (phải gồm 10 chữ số)!"
    });
  }

  // Nếu dữ liệu sạch và hợp lệ, cho phép đi tiếp vào Controller
  next();
};

// ==========================================
// ĐỊNH NGHĨA CÁC ĐƯỜNG DẪN API (ROUTES)
// ==========================================

// Chèn bộ validateRegisterInput vào giữa để lọc dữ liệu trước khi Đăng ký
router.post('/register', validateRegisterInput, authController.register);

// Tuyến đường Đăng nhập
router.post('/login', authController.login);

// 🌟 TUYẾN ĐƯỜNG MỚI: Quên mật khẩu
router.post('/forgot-password', authController.forgotPassword);

// 🌟 TUYẾN ĐƯỜNG MỚI: Đổi mật khẩu tài khoản bảo mật
// Route này sẽ chặn người dùng chưa đăng nhập nhờ vào verifyToken
router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;