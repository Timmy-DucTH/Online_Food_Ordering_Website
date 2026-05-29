// Nạp ứng dụng Express đã cấu hình từ file app.js sang
const app = require('./app');

// Thư viện Mongoose dùng để kết nối và thao tác với cơ sở dữ liệu MongoDB
const mongoose = require('mongoose');

// Thư viện dotenv giúp nạp các biến môi trường từ file .env kế bên file sever.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// =================================================================
// CẤU HÌNH BIẾN MÔI TRƯỜNG VỚI GIÁ TRỊ DỰ PHÒNG AN TOÀN
// =================================================================
const PORT = process.env.PORT || 5000;

// Gán thẳng chuỗi kết nối sạch của bạn vào đây làm phương án chạy dự phòng
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://duydq206_db_user:duydq206@cluster0.imdxhvp.mongodb.net/OFOW_Database?retryWrites=true&w=majority";
// Thiết lập khóa bí mật JWT cho authController
process.env.JWT_SECRET = process.env.JWT_SECRET || "OFOW_DO_AN_CONG_NGHE_PHAN_MEM_NHOM_8_2026";

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