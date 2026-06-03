// Nạp ứng dụng Express đã cấu hình từ file app.js sang
const app = require('./app');

// Thư viện Mongoose dùng để kết nối và thao tác với cơ sở dữ liệu MongoDB
const mongoose = require('mongoose');
const dns = require('dns');

// Thư viện dotenv giúp nạp các biến môi trường từ file .env kế bên file sever.js
const path = require('path');
require('dotenv').config();

// =================================================================
// CẤU HÌNH BIẾN MÔI TRƯỜNG VỚI GIÁ TRỊ DỰ PHÒNG AN TOÀN
// =================================================================
const PORT = process.env.PORT || 5000;
const DNS_SERVERS = (process.env.DNS_SERVERS || "8.8.8.8,1.1.1.1")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (DNS_SERVERS.length > 0) {
  dns.setServers(DNS_SERVERS);
}

// Gán thẳng chuỗi kết nối sạch của bạn vào đây làm phương án chạy dự phòng
const MONGODB_URI = process.env.MONGODB_URI;
// Thiết lập khóa bí mật JWT cho authController
if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI. Please set it in backend/.env");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET. Please set it in backend/.env");
  process.exit(1);
}

// ==========================================
// TIẾN HÀNH KẾT NỐI DATABASE & KHỞI CHẠY SERVER
// ==========================================
console.log("⏳ Đang kết nối tới cơ sở dữ liệu MongoDB Atlas Cloud...");

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("🎉 KẾT NỐI THÀNH CÔNG TỚI MONGODB ATLAS CLOUD!");
    
    app.listen(PORT, () => {
      console.log(`🚀 Server Backend đang chạy mượt mà tại địa chỉ: http://localhost:${PORT}`);
      console.log(`👉 Kiểm tra API thử nghiệm tại: http://localhost:${PORT}/health`);
    });
  })
  .catch((error) => {
    console.error("❌ LỖI: Không thể kết nối tới cơ sở dữ liệu MongoDB!");
    console.error("Chi tiết lỗi:", error.message);
    process.exit(1);
  });
