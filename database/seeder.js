const mongoose = require('mongoose');
// Gọi file .env của backend để lấy link database bí mật
require('dotenv').config({ path: './backend/.env' }); 

// Khai báo cấu trúc tối giản để phục vụ việc nạp dữ liệu mẫu nhanh
const UserSchema = new mongoose.Schema({
  phone: String, full_name: String, email: String, role: String, credit_score: Number, status: String
});
const User = mongoose.model('User', UserSchema);

// Dữ liệu mẫu thô
const mockUsers = [
  { phone: "0901234567", full_name: "Nguyễn Văn Khách", email: "khachhang@gmail.com", role: "customer", credit_score: 100, status: "active" },
  { phone: "0907654321", full_name: "Trần Thị Chủ Quán", email: "chuquan@gmail.com", role: "merchant", credit_score: 100, status: "active" }
];

async function seedDatabase() {
  try {
    console.log("⏳ Đang kết nối tới MongoDB Atlas Cloud...");
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log("🧹 Đang dọn sạch dữ liệu cũ trong bảng users...");
    await User.deleteMany({}); 
    
    console.log("🚀 Đang tự động nạp dữ liệu users mẫu mới...");
    await User.insertMany(mockUsers);
    
    console.log("🎉 Tự động nạp dữ liệu mẫu hoàn tất thành công!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Quá trình tự động nạp dữ liệu thất bại:", error);
    process.exit(1);
  }
}

seedDatabase();