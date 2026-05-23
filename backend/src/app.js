const express = require('express');
const cors = require('cors');

// Khởi tạo ứng dụng Express
const app = express();

// ==========================================
// 1. CẤU HÌNH CÁC MIDDLEWARES HỆ THỐNG
// ==========================================

// CORS (Cross-Origin Resource Sharing): Cho phép ứng dụng Frontend (React chạy ở port 3000 hoặc 5173) 
// có thể gọi API lên Backend (chạy ở port 5000) mà không bị trình duyệt chặn lại.
app.use(cors());

// express.json(): Bộ giải mã giúp Backend hiểu được dữ liệu định dạng JSON do Frontend gửi lên 
// (Ví dụ: Khi khách hàng điền Form Đăng ký [cite: 126] hoặc tạo Đơn hàng[cite: 148], dữ liệu gửi lên dạng JSON sẽ được dịch ra thành Object trong code).
app.use(express.json());

// express.urlencoded(): Giúp xử lý dữ liệu gửi lên từ các form HTML truyền thống.
app.use(express.urlencoded({ extended: true }));


// ==========================================
// 2. KHAI BÁO CÁC ĐƯỜNG DẪN API (ROUTES)
// ==========================================

// API kiểm tra (Health Check): Dùng để test xem ứng dụng backend đã sống chưa.
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: "success",
    message: "Hệ thống Website Đặt đồ ăn trực tuyến (OFOW) đang hoạt động ổn định!" [cite: 119]
  });
});

// Nơi đăng ký các cụm API nghiệp vụ chính (Khi nào bạn viết thư mục routes/ thì mở comment ra)
// app.use('/api/auth', require('./routes/authRoutes'));       // Quản lý Đăng ký/Đăng nhập (BM1) [cite: 126]
// app.use('/api/stores', require('./routes/storeRoutes'));     // Quản lý Đối tác/Cửa hàng (BM2) [cite: 133]
// app.use('/api/menus', require('./routes/menuRoutes'));       // Quản lý Thực đơn/Món ăn (BM4) [cite: 144]
// app.use('/api/orders', require('./routes/orderRoutes'));     // Quản lý Đơn hàng cá nhân/nhóm (BM6) [cite: 148, 155]


// ==========================================
// 3. MIDDLEWARE XỬ LÝ LỖI TẬP TRUNG (Error Handler)
// ==========================================
// Bất kỳ lỗi nào xảy ra trong quá trình chạy API (Ví dụ: lỗi sập mạng, lỗi truy vấn sai...) 
// đều sẽ tự động được gom về đây để xử lý, tránh làm sập luôn toàn bộ server.
app.use((err, req, res, next) => {
  console.error("💥 Lỗi hệ thống phát sinh:", err.stack);
  res.status(500).json({ 
    status: "error",
    message: "Đã xảy ra lỗi nội bộ từ phía máy chủ!" 
  });
});

// Xuất ứng dụng app ra để file server.js có thể nạp vào và chạy
module.exports = app;