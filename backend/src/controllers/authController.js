const User = require('../models/user'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =================================================================
// 💡 HÀM HỖ TRỢ: TỰ ĐỘNG KIỂM TRA ĐIỂM UY TÍN & CẬP NHẬT TRẠNG THÁI (MỤC 3)
// =================================================================
// Hàm này giúp tự động chuyển trạng thái sang 'banned' nếu điểm < 30.
// Sau này ở các file khác (ví dụ: orderController khi khách bùng hàng), chỉ cần gọi hàm này.
const updateWithCreditScore = async (user, pointsToSubtract) => {
  user.credit_score -= pointsToSubtract;
  
  if (user.credit_score < 30) {
    user.status = 'banned';
  } else {
    user.status = 'active'; // Phục hồi nếu điểm được cộng lại >= 30
  }
  
  await user.save();
  return user;
};


// =================================================================
// 1. CHỨC NĂNG ĐĂNG KÝ TÀI KHOẢN (POST /api/auth/register)
// =================================================================
exports.register = async (req, res) => {
  try {
    const { phone, full_name, email, password, role } = req.body;

    // RÀNG BUỘC: Kiểm tra tên đăng nhập (Email) trùng lặp
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

    // XỬ LÝ MỤC 4: BẢO MẬT PHÂN QUYỀN (CHẶN HACK QUYỀN ADMIN/MERCHANT)
    // Nếu người dùng cố tình truyền role là 'admin' hoặc 'merchant' từ Postman/Frontend, 
    // hệ thống sẽ tự động ép về quyền mặc định là 'customer' (Khách hàng).
    let finalRole = 'customer';
    if (role && role !== 'admin' && role !== 'merchant') {
      finalRole = role; // Cho phép các role hợp lệ khác nếu có (ví dụ: shipper)
    }

    // KHỞI TẠO ĐỐI TƯỢNG NGƯỜI DÙNG MỚI XUỐNG MONGO DB
    const newUser = new User({
      phone,
      full_name,
      email,
      password: hashedPassword,  // Lưu mật khẩu sau khi băm hóa
      role: finalRole,           // Sử dụng role an toàn đã qua bộ lọc kiểm duyệt
      credit_score: 100,         // Điểm uy tín ban đầu mặc định bằng 100 theo QĐ 3
      status: 'active'           // Trạng thái hoạt động ban đầu
    });

    await newUser.save();

    // Ẩn mật khẩu đã mã hóa trước khi phản hồi dữ liệu trả về cho client
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      message: '🎉 Đăng ký tài khoản hệ thống thành công với phân quyền an toàn!',
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

    // KIỂM TRA RÀNG BUỘC MỤC 3 & QĐ 4: Chặn tuyệt đối nếu tài khoản bị khóa do tụt điểm uy tín < 30
    if (user.status === 'banned' || user.credit_score < 30) {
      // Đảm bảo đồng bộ trạng thái trong DB đề phòng có độ trễ dữ liệu
      if (user.status !== 'banned') {
        user.status = 'banned';
        await user.save();
      }
      
      return res.status(403).json({
        status: 'fail',
        message: `Tài khoản này đã bị khóa! Lý do: Chỉ số uy tín hiện tại (${user.credit_score} điểm) thấp hơn mức quy định (< 30 điểm).`
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


// =================================================================
// 🌟 VỊ TRÍ CHÈN MỚI: 3. CHỨC NĂNG ĐỔI MẬT KHẨU TÀI KHOẢN (POST /api/auth/change-password)
// =================================================================
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; // Lấy từ authMiddleware sau khi xác thực xong JWT token

    // 1. Tìm thông tin chi tiết người dùng
    const user = await User.findById(userId);
    if (!user) {
      return res.status(444).json({
        status: 'fail',
        message: 'Tài khoản người dùng không tồn tại hoặc đã bị xóa khỏi hệ thống!'
      });
    }

    // 2. So sánh đối chiếu mật khẩu cũ xem khớp hay không
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        status: 'fail',
        message: 'Mật khẩu hiện tại nhập vào không chính xác!'
      });
    }

    // 3. Ràng buộc bảo mật: Mật khẩu mới không được giống hệt mật khẩu cũ
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        status: 'fail',
        message: 'Mật khẩu mới không được trùng lặp với mật khẩu đang sử dụng!'
      });
    }

    // 4. Tiến hành băm mã hóa mật khẩu mới trước khi lưu xuống DB
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: '🔒 Cập nhật đổi mật khẩu tài khoản bảo mật thành công!'
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Đã xảy ra lỗi hệ thống trong quá trình xử lý đổi mật khẩu!',
      error: error.message
    });
  }
};


// Xuất bản thêm hàm kiểm tra điểm ra ngoài để các controller khác (nhux Order) có thể tái sử dụng dễ dàng
exports.updateWithCreditScore = updateWithCreditScore;