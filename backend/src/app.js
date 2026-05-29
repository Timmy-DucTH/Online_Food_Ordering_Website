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
// (Ví dụ: Khi khách hàng điền Form Đăng ký hoặc tạo Đơn hàng, dữ liệu gửi lên dạng JSON sẽ được dịch ra thành Object trong code).
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
    message: "Hệ thống Website Đặt đồ ăn trực tuyến (OFOW) đang hoạt động ổn định!"
  });
});

// Đăng ký các cụm API nghiệp vụ chính kết nối tới thư mục routes/
app.use('/api/auth', require('./routes/authRoutes'));           // Quản lý Đăng ký/Đăng nhập (BM1)
app.use('/api/admin', require('./routes/adminRoutes'));         // Quản trị Admin Dashboard
app.use('/api/foods', require('./routes/foodRoutes'));          // API Món ăn công khai
app.use('/api/restaurants', require('./routes/restaurantRoutes')); // Quản lý Đối tác/Nhà hàng (BM2, BM4)
app.use('/api/orders', require('./routes/orderRoutes'));           // Quản lý Đơn hàng cá nhân/nhóm (BM5, BM6)

// Bạn có thể mở thêm các cụm routes này sau khi tạo file tương ứng:
// app.use('/api/posts', require('./routes/postRoutes'));         // Mạng xã hội & Tương tác (BM7)
// app.use('/api/reports', require('./routes/reportRoutes'));     // Thống kê & Báo cáo doanh thu (BM8, BM9)


// ==========================================
// 3. MIDDLEWARE XỬ LÝ LỖI TẬP TRUNG (Error Handler)
// ==========================================
// Bất kỳ lỗi nào xảy ra trong quá trình chạy API (Ví dụ: lỗi sập mạng, lỗi truy vấn sai...) 
// đều sẽ tự động được gom về đây để xử lý, tránh làm sập luôn toàn bộ server.
app.use((err, req, res, next) => {
  console.error("💥 Lỗi hệ thống phát sinh:", err.stack);
  res.status(500).json({ 
    status: "error",
    message: "Đã xảy ra lỗi nội bộ từ phía máy chủ!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined // Chỉ hiện chi tiết lỗi khi dev
  });
});

// Xuất ứng dụng app ra để file server.js có thể nạp vào và chạy
module.exports = app;