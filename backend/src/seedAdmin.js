const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const User = require('./models/user');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://duydq206_db_user:duydq206@cluster0.imdxhvp.mongodb.net/OFOW_Database?retryWrites=true&w=majority";

async function seedAdmin() {
  try {
    console.log("Connecting to database:", MONGODB_URI.substring(0, 30) + "...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully.");

    const adminEmail = 'admin@tastebyte.com';
    
    // Check if admin already exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log("Admin account already exists!");
      console.log("Email: admin@tastebyte.com");
      console.log("You can log in with password: adminpassword123");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword123', salt);

    const adminUser = new User({
      phone: '0987654321',
      full_name: 'TasteByte Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      credit_score: 100,
      status: 'active'
    });

    await adminUser.save();
    console.log("Successfully created Admin account!");
    console.log("-------------------------------------");
    console.log("Email: admin@tastebyte.com");
    console.log("Password: adminpassword123");
    console.log("-------------------------------------");
    process.exit(0);
  } catch (error) {
    console.error("Error creating Admin account:", error.message);
    process.exit(1);
  }
}

seedAdmin();
