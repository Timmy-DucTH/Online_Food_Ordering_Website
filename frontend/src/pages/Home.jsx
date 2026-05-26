import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FoodCard from '../components/FoodCard';

const Home = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const foodList = [
    { id: 1, name: 'Burger Bò Đặc Biệt', price: 55000, rating: 4.8, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500' },
    { id: 2, name: 'Pizza Hải Sản Size L', price: 189000, rating: 4.9, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500' },
    { id: 3, name: 'Mì Ý Sốt Bò Bằm', price: 45000, rating: 4.5, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=500' },
    { id: 4, name: 'Trà Sữa Trân Châu', price: 35000, rating: 4.7, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=500' },
    { id: 5, name: 'Gà Rán Giòn Cay', price: 39000, rating: 4.6, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c8d08f58?q=80&w=500' },
    { id: 6, name: 'Salad Rau Củ Quả', price: 29000, rating: 4.2, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500' },
  ];

  const addToCart = (foodItem) => {
    setCart((prevCart) => {
      const isExist = prevCart.find(item => item.id === foodItem.id);
      if (isExist) {
        return prevCart.map(item => 
          item.id === foodItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...foodItem, quantity: 1 }];
    });
  };

  const updateQuantity = (id, change) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            return { ...item, quantity: item.quantity + change };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  return (
    /* ĐÃ SỬA CHUẨN ĐỒ ĐỒNG BỘ: Màu nền xám nhạt toàn trang rộng vô hạn ra 2 bên lề màn hình */
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', width: '100%', position: 'relative', margin: 0, padding: 0 }}>
      
      <Navbar 
        cart={cart} 
        updateQuantity={updateQuantity} 
        removeFromCart={removeFromCart} 
        openPendingModal={() => setShowModal(true)} 
      />
      
      {/* KHU VỰC NỘI DUNG CHÍNH (Căn giữa tối đa 1200px y hệt Shopee) */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 10px' }}>
        
        {/* BANNER RECTANGLE QUẢNG CÁO (Đổi sang dải Gradient xanh lạnh vô cùng dịu mắt) */}
        <div style={{ backgroundColor: '#2b4c7e', color: 'white', padding: '50px 20px', textAlign: 'center', borderRadius: '3px', marginBottom: '25px', backgroundImage: 'linear-gradient(135deg, #2b4c7e 0%, #1a365d 100%)' }}>
          <h2 style={{ fontSize: '36px', margin: '0 0 10px 0', fontWeight: '700' }}>Bạn muốn ăn gì hôm nay? 😋</h2>
          <p style={{ fontSize: '16px', opacity: 0.85, margin: 0, fontWeight: '300' }}>Hàng ngàn món ngon đang chờ bạn đặt tại TasteByte</p>
        </div>

        {/* TIÊU ĐỀ KHU VỰC DANH MỤC */}
        <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderBottom: '1px solid #f2f2f2', borderRadius: '3px 3px 0 0', fontWeight: 'bold', color: '#888', fontSize: '14px', textTransform: 'uppercase' }}>
          Món ngon gợi ý cho bạn
        </div>
        
        {/* LƯỚI SẢN PHẨM (Nền trắng bọc các Food Card bên trong) */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '0 0 3px 3px', boxShadow: '0 1px 1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {foodList.map(food => (
              <FoodCard 
                key={food.id} 
                item={food} 
                addToCart={addToCart} 
                handleBuyNow={() => setShowModal(true)} 
              />
            ))}
          </div>
        </div>

      </div>

      {/* CUSTOM BOX DIỆN MẠO MỚI (ĐỒNG BỘ MÀU XANH LẠNH) */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '45px', marginBottom: '10px' }}>⚙️</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#2b4c7e', fontWeight: '600' }}>Thông Báo Hệ Thống</h3>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Hệ thống chưa cập nhật, vui lòng chờ!
            </p>
            <button 
              onClick={() => setShowModal(false)}
              style={{ padding: '10px 40px', backgroundColor: '#2b4c7e', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
      
      <footer style={{ textAlign: 'center', padding: '40px 0', color: '#888', fontSize: '14px', maxWidth: '1200px', margin: '0 auto' }}>
        © 2026 TasteByte - Đồ án Công nghệ phần mềm Nhóm 8
      </footer>
    </div>
  );
};

export default Home;