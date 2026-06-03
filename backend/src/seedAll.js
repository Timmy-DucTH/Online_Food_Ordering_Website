const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('./models/user');
const Restaurant = require('./models/restaurant');
const Food = require('./models/food');
const Order = require('./models/order');
const Review = require('./models/review');
const Post = require('./models/post');
const Message = require('./models/message');
const Notification = require('./models/notification');
const AccountLog = require('./models/accountLog');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://duydq206_db_user:duydq206@ac-i6bszkv-shard-00-00.imdxhvp.mongodb.net:27017,ac-i6bszkv-shard-00-01.imdxhvp.mongodb.net:27017,ac-i6bszkv-shard-00-02.imdxhvp.mongodb.net:27017/OFOW_Database?ssl=true&replicaSet=atlas-14ieg5-shard-0&authSource=admin&retryWrites=true&w=majority";

// Unsplash high quality viewable food/drink images
const foodImages = {
  burger: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600',
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600',
  rice: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600',
  pho: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=600',
  friedChicken: 'https://images.unsplash.com/photo-1626645738196-c2a7c8d08f58?q=80&w=600',
  sushi: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600',
  bubbleTea: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?q=80&w=600',
  coffee: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600',
  dessert: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=600',
  juice: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?q=80&w=600'
};

const licenseImages = {
  license: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600',
  hygiene: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=600'
};

async function seed() {
  try {
    console.log("⏳ Connecting to MongoDB Database...");
    await mongoose.connect(MONGODB_URI);
    console.log("🎉 Database connected successfully!");

    console.log("🧹 Cleaning out existing collections...");
    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await Food.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Post.deleteMany({});
    await Message.deleteMany({});
    await Notification.deleteMany({});
    await AccountLog.deleteMany({});
    console.log("✓ Existing collections cleaned.");

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync("12345678", salt);

    console.log("🚀 Seeding Users...");
    const users = await User.insertMany([
      // Admin
      { phone: "0222233333", full_name: "Nhóm 8 Admin", email: "admin@gmail.com", password: passwordHash, role: "admin", credit_score: 100, status: "active" },
      
      // Merchants
      { phone: "0907654321", full_name: "Trần Thị Chủ Quán", email: "chuquan1@gmail.com", password: passwordHash, role: "merchant", credit_score: 100, status: "active" },
      { phone: "0908889999", full_name: "Nguyễn Văn Tiệm", email: "chuquan2@gmail.com", password: passwordHash, role: "merchant", credit_score: 100, status: "active" },
      { phone: "0907776666", full_name: "Lê Thị Trà Sữa", email: "chuquan3@gmail.com", password: passwordHash, role: "merchant", credit_score: 100, status: "active" },
      
      // Customers
      { phone: "0987654321", full_name: "Nguyễn Duy Quang", email: "duyquang536@gmail.com", password: passwordHash, role: "customer", credit_score: 100, status: "active" },
      { phone: "0981112222", full_name: "Nguyễn Đức Huy", email: "duchuy@gmail.com", password: passwordHash, role: "customer", credit_score: 100, status: "active" },
      { phone: "0983334444", full_name: "Lê Võ Hải Đăng", email: "haidang@gmail.com", password: passwordHash, role: "customer", credit_score: 100, status: "active" },
      { phone: "0912345678", full_name: "Trần Văn Khách", email: "vankhach@gmail.com", password: passwordHash, role: "customer", credit_score: 100, status: "active" },
      { phone: "0918765432", full_name: "Phạm Thị Ăn Vặt", email: "anvat@gmail.com", password: passwordHash, role: "customer", credit_score: 95, status: "active" },
      { phone: "0923334445", full_name: "Hoàng Văn Bùng", email: "vanbung@gmail.com", password: passwordHash, role: "customer", credit_score: 25, status: "banned" }
    ]);

    const admin = users[0];
    const m1 = users[1];
    const m2 = users[2];
    const m3 = users[3];
    const c1 = users[4];
    const c2 = users[5];
    const c3 = users[6];
    const c4 = users[7];
    const c5 = users[8];
    const cBanned = users[9];

    console.log("🚀 Seeding Restaurants...");
    const restaurants = await Restaurant.insertMany([
      {
        owner_id: m1._id,
        store_name: "Cơm Tấm Sài Gòn 1990",
        merchant_name: m1.full_name,
        address: "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh",
        license_image: licenseImages.license,
        hygiene_image: licenseImages.hygiene,
        owner_username: "chuquan1",
        status: "approved"
      },
      {
        owner_id: m2._id,
        store_name: "Uchiha Sushi & Ramen",
        merchant_name: m2.full_name,
        address: "456 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
        license_image: licenseImages.license,
        hygiene_image: licenseImages.hygiene,
        owner_username: "chuquan2",
        status: "approved"
      },
      {
        owner_id: m3._id,
        store_name: "TasteByte Tea & Coffee",
        merchant_name: m3.full_name,
        address: "789 Đường Sư Vạn Hạnh, Quận 10, TP. Hồ Chí Minh",
        license_image: licenseImages.license,
        hygiene_image: licenseImages.hygiene,
        owner_username: "chuquan3",
        status: "approved"
      }
    ]);

    const r1 = restaurants[0];
    const r2 = restaurants[1];
    const r3 = restaurants[2];

    console.log("🚀 Seeding Foods...");
    const foods = await Food.create([
      // Cơm Tấm Sài Gòn 1990
      {
        name: "Cơm Tấm Sườn Bì Chả Đặc Biệt",
        price: 45000,
        category: "Cơm",
        image: foodImages.rice,
        description: "Cơm tấm dẻo ngon kèm sườn nướng lu mật ong vàng giòn, bì thính heo ba chỉ, chả trứng béo ngậy kèm đồ chua ngon lành.",
        rating: 4.8,
        status: "approved",
        restaurant_id: r1._id,
        restaurant_name: r1.store_name
      },
      {
        name: "Cơm Thịt Kho Tàu Trứng Cút",
        price: 40000,
        category: "Cơm",
        image: foodImages.rice,
        description: "Thịt ba chỉ kho tàu đậm đà cùng trứng cút bổ dưỡng, chuẩn vị cơm nhà truyền thống Việt Nam.",
        rating: 4.5,
        status: "approved",
        restaurant_id: r1._id,
        restaurant_name: r1.store_name
      },
      {
        name: "Phở Bò Tái Nạm Cổ Truyền",
        price: 50000,
        category: "Món nước",
        image: foodImages.pho,
        description: "Bánh phở tươi ngon chan nước hầm xương mực ngọt lịm kèm bò tái nạm gầu giòn ngọt.",
        rating: 4.7,
        status: "approved",
        restaurant_id: r1._id,
        restaurant_name: r1.store_name
      },

      // Uchiha Sushi & Ramen
      {
        name: "Ramen Xá Xíu Shoyu Cao Cấp",
        price: 75000,
        category: "Món nước",
        image: foodImages.pho,
        description: "Sợi mì ramen tươi Nhật Bản dai ngon chan nước dùng Shoyu thanh tao, topping thịt xá xíu hầm mềm chảy, măng kho và trứng ngâm tương ngon miệng.",
        rating: 4.9,
        status: "approved",
        restaurant_id: r2._id,
        restaurant_name: r2.store_name
      },
      {
        name: "Set Sushi Cá Hồi Combo L",
        price: 155000,
        category: "Khác",
        image: foodImages.sushi,
        description: "12 miếng sushi & sashimi cá hồi tươi ngon kèm rong biển, gừng hồng Nhật Bản và mù tạt cay nồng.",
        rating: 4.8,
        status: "approved",
        restaurant_id: r2._id,
        restaurant_name: r2.store_name
      },
      {
        name: "Burger Bò Phô Mai Double Cheddar",
        price: 55000,
        category: "Burger",
        image: foodImages.burger,
        description: "Burger bò Úc nướng bơ tỏi đẫm 2 lớp phô mai cheddar tan chảy quyến rũ.",
        rating: 4.6,
        status: "approved",
        restaurant_id: r2._id,
        restaurant_name: r2.store_name
      },
      {
        name: "Pizza Hải Sản Viền Phô Mai",
        price: 139000,
        category: "Pizza",
        image: foodImages.pizza,
        description: "Pizza đế mỏng viền ngập tràn phô mai thơm ngậy kết hợp tôm sú, mực tươi sốt marinara đậm đà.",
        rating: 4.7,
        status: "approved",
        restaurant_id: r2._id,
        restaurant_name: r2.store_name
      },

      // TasteByte Tea & Coffee
      {
        name: "Trà Sữa Trân Châu Đường Đen Hoàng Gia",
        price: 35000,
        category: "Trà sữa",
        image: foodImages.bubbleTea,
        description: "Trà sữa Ô Long Đài Loan béo ngậy kèm trân châu hoàng kim đường nâu dẻo dai nhai cực cuốn.",
        rating: 4.8,
        status: "approved",
        restaurant_id: r3._id,
        restaurant_name: r3.store_name
      },
      {
        name: "Cà Phê Muối Kem Béo Độc Quyền",
        price: 29000,
        category: "Cà phê",
        image: foodImages.coffee,
        description: "Cà phê Robusta Tây Nguyên đậm đặc kết hợp lớp kem mặn béo ngậy quyến rũ.",
        rating: 4.7,
        status: "approved",
        restaurant_id: r3._id,
        restaurant_name: r3.store_name
      },
      {
        name: "Trà Đào Cam Sả Đá Tuyết",
        price: 32000,
        category: "Đồ uống khác",
        image: foodImages.juice,
        description: "Trà đào thơm ngát kết hợp cam tươi sả đập dập và đá tuyết thanh mát giải nhiệt mùa hè.",
        rating: 4.6,
        status: "approved",
        restaurant_id: r3._id,
        restaurant_name: r3.store_name
      },
      {
        name: "Bánh Mouse Dâu Tây Tráng Miệng",
        price: 25000,
        category: "Tráng miệng",
        image: foodImages.dessert,
        description: "Bánh bông lan mousse dâu tây chua ngọt thơm mềm mịn màng.",
        rating: 4.5,
        status: "approved",
        restaurant_id: r3._id,
        restaurant_name: r3.store_name
      }
    ]);

    const f1 = foods[0]; // Com tam
    const f2 = foods[2]; // Pho bo
    const f3 = foods[3]; // Ramen
    const f4 = foods[7]; // Tra sua
    const f5 = foods[8]; // Ca phe

    console.log("🚀 Seeding Orders...");
    const order1 = new Order({
      store_id: r1._id,
      creator_id: c1._id,
      order_type: "single",
      items: [
        { item_id: f1._id, name: f1.name, quantity: 2, price: f1.price, buyer_id: c1._id },
        { item_id: f2._id, name: f2.name, quantity: 1, price: f2.price, buyer_id: c1._id }
      ],
      shipping_address: "Ký túc xá khu B ĐHQG, Dĩ An, Bình Dương",
      distance_km: 4,
      shipping_fee: 20000,
      subtotal: 140000,
      total_price: 160000,
      payment_method: "COD",
      status: "completed",
      note: "Giao trước giờ cơm tối giúp mình nha shipper"
    });

    const order2 = new Order({
      store_id: r3._id,
      creator_id: c2._id,
      order_type: "single",
      items: [
        { item_id: f4._id, name: f4.name, quantity: 1, price: f4.price, buyer_id: c2._id },
        { item_id: f5._id, name: f5.name, quantity: 2, price: f5.price, buyer_id: c2._id }
      ],
      shipping_address: "Lầu 6, Tòa nhà Bitexco, Quận 1, TP. HCM",
      distance_km: 2,
      shipping_fee: 10000,
      subtotal: 93000,
      total_price: 103000,
      payment_method: "wallet",
      status: "completed",
      note: "Kem béo để riêng hộ quán nhé"
    });

    const order3 = new Order({
      store_id: r2._id,
      creator_id: c3._id,
      order_type: "group",
      members: [c1._id, c2._id],
      items: [
        { item_id: f3._id, name: f3.name, quantity: 1, price: f3.price, buyer_id: c3._id },
        { item_id: f3._id, name: f3.name, quantity: 1, price: f3.price, buyer_id: c1._id },
        { item_id: f3._id, name: f3.name, quantity: 1, price: f3.price, buyer_id: c2._id }
      ],
      shipping_address: "Đại học Công nghệ Thông tin, Linh Trung, Thủ Đức",
      distance_km: 6,
      shipping_fee: 30000,
      subtotal: 225000,
      total_price: 255000,
      payment_method: "card",
      status: "pending",
      note: "Đơn đặt chung nhóm lớp"
    });

    const order4 = new Order({
      store_id: r1._id,
      creator_id: c5._id,
      order_type: "single",
      items: [
        { item_id: f1._id, name: f1.name, quantity: 1, price: f1.price, buyer_id: c5._id }
      ],
      shipping_address: "50 Đường Lê Duẩn, Quận 1, TP. HCM",
      distance_km: 3,
      shipping_fee: 15000,
      subtotal: 45000,
      total_price: 60000,
      payment_method: "COD",
      status: "cancelled",
      note: "Hủy đơn hàng vì bận họp đột xuất"
    });

    await order1.save();
    await order2.save();
    await order3.save();
    await order4.save();

    console.log("🚀 Seeding Reviews...");
    await Review.insertMany([
      {
        order_id: order1._id,
        customer_id: c1._id,
        store_id: r1._id,
        rating: 5,
        comment: "Món ăn ngon dã man sườn ướp đậm vị mềm ngọt, phở nước lèo thơm quế hồi ngon tuyệt vời!",
        reply_from_store: "Cảm ơn bạn rất nhiều vì sự ủng hộ quý báu! Nhà hàng 1990 sẽ luôn cố gắng nâng cao dịch vụ."
      },
      {
        order_id: order2._id,
        customer_id: c2._id,
        store_id: r3._id,
        rating: 4,
        comment: "Trà sữa đậm vị ngọt mát rất ngon, cafe muối kem mặn ngậy béo thơm, đóng gói chắc chắn.",
        reply_from_store: "Dạ TasteByte xin chân thành cảm ơn đánh giá yêu thương của bạn ạ! Lần tới nhớ ghé ủng hộ quán nha."
      }
    ]);

    console.log("🚀 Seeding Community Posts...");
    await Post.insertMany([
      {
        author_id: c1._id,
        content: "Chiều nay mới đặt Cơm Tấm Sườn Bì Chả bên quán Com Tam Sai Gon 1990. Thực sự sườn nướng ở đây siêu đỉnh, ướp đẫm mật ong mềm mọng nước, không bị khô xíu nào luôn. Mọi người nên thử nhé!!! 🤤🤤🤤",
        images: [foodImages.rice],
        reacts: [c2._id, c3._id],
        Comments: [
          { user_id: c2._id, content: "Nhìn thèm quá bạn ơi, mai phải đặt thử mới được!" },
          { user_id: c3._id, content: "Chỗ này bán sạch sẽ, ship nhanh cực kỳ nữa." }
        ]
      },
      {
        author_id: r3._id,
        content: "Chào cả nhà yêu! TasteByte Coffee & Tea hôm nay ra mắt combo Cà Phê Muối Kem Béo đặc biệt giảm giá 15% kèm trân châu hoàng kim dai giòn sần sật. Ghé mua ngay nha khách iu ☕🥤🍩",
        images: [foodImages.coffee],
        reacts: [c1._id],
        Comments: [
          { user_id: c1._id, content: "Hồi nãy uống thử rồi ngon béo mịn lắm ad!" }
        ]
      }
    ]);

    console.log("🚀 Seeding Messages...");
    await Message.insertMany([
      { sender_id: c1._id, receiver_id: m1._id, content: "Dạ chào quán ạ, cơm tấm của mình có thể cho thêm sườn được không?" },
      { sender_id: m1._id, receiver_id: c1._id, content: "Chào bạn, nếu muốn thêm sườn bạn vui lòng đặt thêm topping sườn nướng trong thực đơn nhé." },
      { sender_id: c1._id, receiver_id: m1._id, content: "Dạ vâng mình cám ơn quán, mình đặt đơn đây nha." },
      
      { sender_id: c2._id, receiver_id: m3._id, content: "Quán cho mình hỏi trà đào sả có đá xay tuyết sẵn không vậy?" },
      { sender_id: m3._id, receiver_id: c2._id, content: "Chào bạn, món trà đào hồng đài đá tuyết có xay tuyết cực kì mát lạnh nhé ạ." }
    ]);

    console.log("🚀 Seeding Notifications...");
    await Notification.insertMany([
      {
        user_id: c1._id,
        title: "Đơn hàng hoàn thành thành công!",
        message: "Đơn hàng #COM-TAM-1990 của bạn đã được tài xế giao nhận hoàn tất. Hãy để lại đánh giá món ăn nhé!",
        type: "order_status",
        is_read: false
      },
      {
        user_id: c2._id,
        title: "Khuyến mãi cực hời hôm nay!",
        message: "TasteByte Tea & Coffee vừa giảm giá 15% tất cả menu đồ uống hôm nay. Click để đặt ngay!",
        type: "discount",
        is_read: true
      },
      {
        user_id: cBanned._id,
        title: "Tài khoản bị khóa cảnh báo",
        message: "Tài khoản của bạn đã bị khóa do điểm uy tín sụt giảm quá thấp (< 30 điểm).",
        type: "system",
        is_read: false
      }
    ]);

    console.log("🚀 Seeding AccountLogs...");
    await AccountLog.insertMany([
      {
        user_id: cBanned._id,
        action_type: "ban",
        reason: "Hệ thống tự động khóa do điểm uy tín tụt dốc không phanh xuống mức cảnh báo (< 30 điểm)",
        performed_by: "SYSTEM_MONITOR"
      }
    ]);

    console.log("🎉 All data seeded successfully! The database is populated with realistic connected data.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
}

seed();
