const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: path.join(__dirname, '../backend/src/.env') });

const User = require('../backend/src/models/user');
const Restaurant = require('../backend/src/models/restaurant');
const Menu = require('../backend/src/models/menu');
const Order = require('../backend/src/models/order');
const Review = require('../backend/src/models/review');
const Post = require('../backend/src/models/post');
const Notification = require('../backend/src/models/notification');
const AccountLog = require('../backend/src/models/accountLog');

// Dữ liệu mẫu thô
const mockUsers = [
  { phone: "0901234567", full_name: "Nguyễn Văn Khách", email: "khachhang@gmail.com", role: "customer", credit_score: 100, status: "active" },
  { phone: "0907654321", full_name: "Trần Thị Chủ Quán", email: "chuquan@gmail.com", role: "merchant", credit_score: 100, status: "active" },
  { phone: "0222233333", full_name: "Nhóm 8", email: "admin@gmail.com", role: "admin", credit_score: 100, status: "active"}
];

async function seedDatabase() {
  try {
    const data = readMockData();

    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    console.log('Clearing existing OFOW data...');
    await clearDatabase();

    console.log('Seeding users...');
    await User.insertMany(await prepareUsers(data.users || []));

    console.log('Seeding restaurants and menus...');
    await Restaurant.insertMany(data.restaurants || []);
    await Menu.insertMany(data.menus || []);

    console.log('Seeding orders, reviews, posts, notifications, account logs...');
    await Order.insertMany(data.orders || []);
    await Review.insertMany(data.reviews || []);
    await Post.insertMany(data.posts || []);
    await Notification.insertMany(data.notifications || []);
    await AccountLog.insertMany(data.accountLogs || []);

    console.log('Database seeded successfully.');
    console.log('Demo accounts all use password: 12345678');
  } catch (error) {
    console.error('Database seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
