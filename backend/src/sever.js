// Nạp ứng dụng Express đã cấu hình từ file app.js sang
const app = require('./app');

// Thư viện Mongoose dùng để kết nối và thao tác với cơ sở dữ liệu MongoDB
const mongoose = require('mongoose');

// Thư viện dotenv giúp nạp các biến môi trường bí mật (như chuỗi kết nối database) từ file .env vào code thông qua biến process.env
require('dotenv').config();

// Lấy cổng PORT và Chuỗi kết nối từ file .env, nếu không có PORT trong .env thì mặc định chạy cổng 5000
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Kiểm tra nghiêm ngặt: Nếu quên cấu hình link database trong file .env thì dừng hệ thống ngay lập tức
if (!MONGODB_URI) {
  console.error("❌ LỖI NGHIÊM TRỌNG: Chưa cấu hình chuỗi MONGODB_URI trong file .env!");
  process.exit(1);
}

// ==========================================
// TIẾN HÀNH KẾT NỐI DATABASE & KHỞI CHẠY SERVER
// ==========================================
console.log("⏳ Đang kết nối tới cơ sở dữ liệu MongoDB Atlas...");

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("🎉 KẾT NỐI THÀNH CÔNG TỚI MONGODB ATLAS CLOUD!");
    
    // Đảm bảo nguyên tắc bảo mật và an toàn hệ thống: Chỉ khi database thông suốt, 
    // server mới mở cổng lắng nghe dữ liệu từ người dùng[cite: 197].
    app.listen(PORT, () => {
      console.log(`🚀 Server Backend đang chạy mượt mà tại địa chỉ: http://localhost:${PORT}`);
      console.log(`👉 Kiểm tra API thử nghiệm tại: http://localhost:${PORT}/health`);
    });
  })
  .catch((error) => {
    console.error("❌ LỖI: Không thể kết nối tới cơ sở dữ liệu MongoDB!");
    console.error("Chi tiết lỗi:", error.message);
    process.exit(1); // Dừng chương trình ngay lập tức vì không có database hệ thống không thể hoạt động
  });