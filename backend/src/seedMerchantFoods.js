const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Restaurant = require('./models/restaurant');
const Food = require('./models/food');

const MONGODB_URI = process.env.MONGODB_URI;

// Danh sách các món mẫu phong phú thuộc nhiều danh mục để gieo hạt (seed)
const sampleFoodsPool = [
  // Cơm văn phòng
  {
    name: 'Cơm Tấm Sườn Bì Chả Đặc Biệt',
    category: 'Cơm văn phòng',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400',
    description: 'Cơm tấm dẻo thơm, sườn heo nướng mật ong vàng ruộm, bì thính heo ba chỉ, chả trứng hấp béo bùi kèm đồ chua giòn ngọt.'
  },
  {
    name: 'Cơm Gà Hải Nam Hoàng Gia',
    category: 'Cơm văn phòng',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=400',
    description: 'Cơm nấu nước luộc gà thơm dẻo béo ngậy, đùi gà ta luộc da giòn vàng ươm chấm kèm sốt gừng tỏi ớt gia truyền Sing.'
  },
  {
    name: 'Cơm Thăn Bò Né Bơ Tỏi',
    category: 'Cơm văn phòng',
    price: 60000,
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=400',
    description: 'Thịt thăn bò mềm tẩm ướp tiêu đen áp chảo thơm lừng bơ tỏi ăn kèm cơm trắng nóng hổi và xà lách dầu giấm ngon tuyệt.'
  },
  {
    name: 'Cơm Đùi Vịt Quay Sốt Tiêu Đen',
    category: 'Cơm văn phòng',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1514944224746-6bba5b09e5c2?q=80&w=400',
    description: 'Đùi vịt quay da giòn bóng bẩy, thịt vịt ngọt bùi hòa quyện nước sốt tiêu đen đậm đà kèm rau luộc theo mùa.'
  },

  // Món nước
  {
    name: 'Phở Bò Tái Nạm Cổ Truyền',
    category: 'Món nước',
    price: 50000,
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=400',
    description: 'Bánh phở tươi mềm, nước dùng xương hầm trong 24 tiếng ngọt thanh nguyên chất thơm mùi quế hồi tiêu rừng nức mũi.'
  },
  {
    name: 'Bún Chả Hà Nội Hương Than',
    category: 'Món nước',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=400',
    description: 'Thịt dọi và chả viên nướng sém cạnh trên than hoa đượm khói thơm lừng thả bát nước mắm chua ngọt đu đủ xanh.'
  },
  {
    name: 'Hủ Tiếu Nam Vang Đặc Biệt',
    category: 'Món nước',
    price: 48000,
    image: 'https://images.unsplash.com/photo-1618449840645-3011746d37b6?q=80&w=400',
    description: 'Sợi hủ tiếu dai mướt chan nước hầm xương mực ngọt lịm, phủ tôm sú tươi, trứng cút, thịt băm, gan heo luộc chín tới.'
  },
  {
    name: 'Bún Riêu Cua Bắp Bò Giò Heo',
    category: 'Món nước',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?q=80&w=400',
    description: 'Nước dùng riêu cua đồng chua dịu béo ngậy gạch cua giã tay, topping bắp bò hoa giòn sần sật, giò nách heo dai giòn ngon miệng.'
  },

  // Đồ ăn nhanh
  {
    name: 'Burger Bò Phô Mai Double Cheddar',
    category: 'Đồ ăn nhanh',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400',
    description: 'Bánh burger nướng bơ mềm, 2 lớp thịt bò Angus xay áp chảo đẫm phô mai Cheddar chảy tràn quyến rũ kèm hành tây caramel ngọt dịu.'
  },
  {
    name: 'Pizza Hải Sản Viền Phô Mai Size L',
    category: 'Đồ ăn nhanh',
    price: 189000,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400',
    description: 'Đế bánh pizza mỏng giòn rụm, viền cuộn phô mai Mozzarella béo ngậy, topping ngập tràn tôm sú, mực ống và sốt cà chua thảo mộc.'
  },
  {
    name: 'Gà Rán Giòn Sốt Cay Tỏi Hàn Quốc',
    category: 'Đồ ăn nhanh',
    price: 39000,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c8d08f58?q=80&w=400',
    description: 'Đùi gà ta chiên bột giòn rụm bên ngoài mọng nước ngọt thịt bên trong, rưới sốt cay nồng tỏi mật ong Hàn Quốc.'
  },
  {
    name: 'Khoai Tây Lắc Phô Mai Sợi Giòn',
    category: 'Đồ ăn nhanh',
    price: 29000,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=400',
    description: 'Khoai tây cắt lát chiên ngập dầu giòn tan lắc đều bột phô mai mặn ngọt thơm phức kèm sốt mayonnaise béo ngậy.'
  },

  // Trà sữa & Đồ uống
  {
    name: 'Trà Sữa Trân Châu Đường Đen TasteByte',
    category: 'Trà sữa & Đồ uống',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400',
    description: 'Cốt trà sữa ô long Đài Loan cao cấp béo ngậy, trân châu hoàng kim nấu đường nâu Okinawa dẻo dai nhai cực đã.'
  },
  {
    name: 'Trà Đào Hồng Đài Đá Tuyết',
    category: 'Trà sữa & Đồ uống',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400',
    description: 'Trà hồng đào thanh mát hòa quyện đá xay tuyết dịu êm, topping 3 lát đào vàng giòn ngọt ngập trong ly.'
  },
  {
    name: 'Cà Phê Muối Kem Béo Cao Cấp',
    category: 'Trà sữa & Đồ uống',
    price: 29000,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400',
    description: 'Cà phê phin Robusta Tây Nguyên đậm đặc thơm lừng, bên trên phủ lớp kem sữa muối mặn ngọt béo mịn làm siêu lòng tín đồ.'
  },
  {
    name: 'Sinh Tố Bơ Sáp Dừa Tươi Đá Nhuyễn',
    category: 'Trà sữa & Đồ uống',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=400',
    description: 'Bơ sáp Đắk Lắk chín cây dẻo thơm xay nhuyễn mịn cùng sữa đặc kem dừa béo ngậy thơm ngon bổ dưỡng.'
  }
];

async function seedMerchantFoods() {
  try {
    console.log("Connecting to database...", MONGODB_URI.substring(0, 30) + "...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB Atlas.");

    // Lấy toàn bộ danh sách nhà hàng có trong database
    const listRestaurants = await Restaurant.find();
    if (listRestaurants.length === 0) {
      console.log("Database has no restaurants registered yet. Please onboard some restaurants first!");
      process.exit(0);
    }

    console.log(`Found ${listRestaurants.length} restaurants in database. Starting unique foods generation...`);

    // Xóa sạch các món ăn mẫu giả lập cũ (nếu có trùng lặp tên mẫu)
    // Để giữ lại món ăn tự thêm của người dùng thật, chúng ta chỉ chèn món mới nếu quán chưa có bất kỳ món ăn nào!
    for (let i = 0; i < listRestaurants.length; i++) {
      const rest = listRestaurants[i];
      const existingFoods = await Food.find({ restaurant_id: rest._id });
      
      console.log(`Processing restaurant: "${rest.store_name}" (Status: ${rest.status})`);
      
      // Seed ngẫu nhiên 3 món ăn độc đáo khác nhau từ danh sách món mẫu
      // Xáo trộn mảng để chọn ngẫu nhiên
      const shuffled = [...sampleFoodsPool].sort(() => 0.5 - Math.random());
      const selectedFoods = shuffled.slice(0, 3 + (i % 2)); // 3 hoặc 4 món ăn tùy quán

      let seededCount = 0;
      for (const sample of selectedFoods) {
        // Kiểm tra xem món ăn này có tên trùng chưa trong quán để tránh chèn lặp
        const dup = await Food.findOne({ restaurant_id: rest._id, name: sample.name });
        if (!dup) {
          await Food.create({
            name: sample.name,
            price: sample.price,
            category: sample.category,
            image: sample.image,
            description: sample.description,
            status: 'approved', // Mặc định tự động phê duyệt để hiển thị cho Khách hàng
            restaurant_id: rest._id,
            restaurant_name: rest.store_name
          });
          seededCount++;
        }
      }
      console.log(`-> Seeded successfully ${seededCount} unique food items for "${rest.store_name}".`);
    }

    console.log("-----------------------------------------");
    console.log("🎉 Seeding completed successfully! All restaurants now have unique sample food menus.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error.message);
    process.exit(1);
  }
}

seedMerchantFoods();
