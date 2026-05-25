const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');
// Gọi file .env của backend để lấy link database bí mật
require('dotenv').config({ path: path.join(__dirname, '../backend/src/.env') }); 

// Import Model 'user' thực tế từ backend để đồng bộ
const User = require('../backend/src/models/user');

// Dữ liệu mẫu thô
const mockUsers = [
  { phone: "0901234567", full_name: "Nguyễn Văn Khách", email: "khachhang@gmail.com", role: "customer", credit_score: 100, status: "active" },
  { phone: "0907654321", full_name: "Trần Thị Chủ Quán", email: "chuquan@gmail.com", role: "merchant", credit_score: 100, status: "active" }
];

async function seedDatabase() {
  try {
    console.log("⏳ Đang kết nối tới MongoDB Atlas Cloud...");
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://duydq206_db_user:duydq206@cluster0.imdxhvp.mongodb.net/OFOW_Database?retryWrites=true&w=majority");
    
    console.log("🧹 Đang dọn sạch dữ liệu cũ trong bảng users...");
    await User.deleteMany({}); 
    
    // Băm mật khẩu mặc định "12345678" cho tất cả người dùng mẫu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("12345678", salt);
    const usersWithPassword = mockUsers.map(user => ({ ...user, password: hashedPassword }));
    
    console.log("🚀 Đang tự động nạp dữ liệu users mẫu mới...");
    await User.insertMany(usersWithPassword);
    
    console.log("🎉 Tự động nạp dữ liệu mẫu hoàn tất thành công!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Quá trình tự động nạp dữ liệu thất bại:", error);
    process.exit(1);
  }
}

seedDatabase();