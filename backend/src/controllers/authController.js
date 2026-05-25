const User = require('../models/user'); // Đã sửa thành chữ 'user' viết thường theo cấu trúc file mới của bạn
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =================================================================
// 1. CHỨC NĂNG ĐĂNG KÝ TÀI KHOẢN (POST /api/auth/register)
// =================================================================
exports.register = async (req, res) => {
  try {
    const { phone, full_name, email, password, role } = req.body;

    // RÀNG BUỘC THEO QĐ 1: Kiểm tra độ dài mật khẩu (Phải từ 8 ký tự trở lên)
    if (!password || password.length < 8) {
      return res.status(400).json({
        status: 'fail',
        message: 'Quy định hệ thống: Mật khẩu bắt buộc phải chứa ít nhất 8 ký tự!'
      });
    }

    // RÀNG BUỘC THEO QĐ 1: Kiểm tra tên đăng nhập (Email) trùng lặp
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Tên đăng nhập (Email) này đã được đăng ký trên hệ thống!'
      });
    }

    // TIẾN HÀNH MÃ HÓA MẬT KHẨU (Bảo mật thông tin dữ liệu)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // KHỞI TẠO ĐỐI TƯỢNG NGƯỜI DÙNG MỚI XUỐNG MONGO DB
    const newUser = new User({
      phone,
      full_name,
      email,
      password: hashedPassword, // Lưu mật khẩu sau khi băm hóa
      role: role || 'customer',  // Mặc định phân quyền ban đầu là khách hàng
      credit_score: 100,         // Điểm uy tín ban đầu mặc định bằng 100 theo QĐ 3
      status: 'active'           // Trạng thái hoạt động bình thường
    });

    await newUser.save();

    // Ẩn mật khẩu đã mã hóa trước khi phản hồi dữ liệu trả về cho client
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      message: '🎉 Đăng ký tài khoản hệ thống thành công!',
      data: newUser
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Đã xảy ra lỗi hệ thống trong quá trình đăng ký tài khoản!',
      error: error.message
    });
  }
};

// =================================================================
// 2. CHỨC NĂNG ĐĂNG NHẬP HỆ THỐNG (POST /api/auth/login)
// =================================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tiến hành truy vấn tìm kiếm người dùng dựa trên email tên đăng nhập
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Tài khoản hoặc mật khẩu đăng nhập không chính xác!'
      });
    }

    // KIỂM TRA RÀNG BUỘC QĐ 4: Nếu tài khoản bị khóa do tụt điểm uy tín < 30 thì chặn truy cập
    if (user.status === 'banned') {
      return res.status(403).json({
        status: 'fail',
        message: 'Tài khoản này đã bị khóa do chỉ số uy tín tụt xuống dưới mức quy định (< 30 điểm)!'
      });
    }

    // Kiểm tra tính hợp lệ của mật khẩu người dùng nhập vào
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'fail',
        message: 'Tài khoản hoặc mật khẩu đăng nhập không chính xác!'
      });
    }

    // KHỞI TẠO MÃ JWT TOKEN ĐỂ DUY TRÌ TRẠNG THÁI PHIÊN ĐĂNG NHẬP
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'OFOW_SUPER_SECRET_KEY', // Khóa bí mật bảo mật hệ thống
      { expiresIn: '1d' } // Mã Token có thời hạn sử dụng trong vòng 24 giờ
    );

    // Ẩn trường bảo mật mật khẩu trước khi trả về
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      message: '👋 Đăng nhập hệ thống thành công!',
      token,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Đã xảy ra lỗi hệ thống trong quá trình xử lý đăng nhập!',
      error: error.message
    });
  }
};