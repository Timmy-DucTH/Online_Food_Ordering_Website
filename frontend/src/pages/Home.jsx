import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FoodCard from '../components/FoodCard';

const Home = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Khởi tạo trạng thái đăng nhập an toàn từ localStorage
  const [isLoggedIn] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? true : false;
  });

  const foodList = [
    { id: 1, name: 'Burger Bò Đặc Biệt', price: 55000, rating: 4.8, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500' },
    { id: 2, name: 'Pizza Hải Seafood Size L', price: 189000, rating: 4.9, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500' },
    { id: 3, name: 'Mì Ý Sốt Bò Bằm', price: 45000, rating: 4.5, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=500' },
    { id: 4, name: 'Trà Sữa Trân Châu', price: 35000, rating: 4.7, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=500' },
    { id: 5, name: 'Gà Rán Giòn Cay', price: 39000, rating: 4.6, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c8d08f58?q=80&w=500' },
    { id: 6, name: 'Salad Rau Củ Quả', price: 29000, rating: 4.2, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500' },
  ];

  const checkAuthAndExecute = (callback) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return false;
    }
    if (callback) callback();
    return true;
  };

  const addToCart = (foodItem) => {
    checkAuthAndExecute(() => {
      setCart((prevCart) => {
        const isExist = prevCart.find(item => item.id === foodItem.id);
        if (isExist) {
          return prevCart.map(item => 
            item.id === foodItem.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevCart, { ...foodItem, quantity: 1 }];
      });
    });
  };

  // 🌟 TÍNH NĂNG ĐỒNG BỘ: Đặt hàng trực tiếp không qua giỏ hàng
  const handleDirectCheckout = (foodItem) => {
    checkAuthAndExecute(() => {
      // Đóng gói sản phẩm với số lượng bằng 1 và bắn thẳng sang trang Checkout
      const directItem = { ...foodItem, quantity: 1 };
      navigate('/checkout', {
        state: { selectedItems: [directItem] }
      });
    });
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return; 
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', width: '100%', position: 'relative', margin: 0, padding: 0 }}>
      <Navbar 
        cart={cart} 
        updateQuantity={updateQuantity} 
        removeFromCart={removeFromCart} 
        clearCart={clearCart} 
        openPendingModal={() => setShowModal(true)} 
        isLoggedIn={isLoggedIn} 
      />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 10px' }}>
        <div style={{ backgroundColor: '#2b4c7e', color: 'white', padding: '50px 20px', textAlign: 'center', borderRadius: '3px', marginBottom: '25px', backgroundImage: 'linear-gradient(135deg, #2b4c7e 0%, #1a365d 100%)' }}>
          <h2 style={{ fontSize: '36px', margin: '0 0 10px 0', fontWeight: '700' }}>Bạn muốn ăn gì hôm nay? 😋</h2>
          <p style={{ fontSize: '16px', opacity: 0.85, margin: 0, fontWeight: '300' }}>Hàng ngàn món ngon đang chờ bạn đặt tại TasteByte</p>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '15px 20px', borderBottom: '1px solid #f2f2f2', borderRadius: '3px 3px 0 0', fontWeight: 'bold', color: '#888', fontSize: '14px', textTransform: 'uppercase' }}>
          Món ngon gợi ý cho bạn
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '0 0 3px 3px', boxShadow: '0 1px 1px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {foodList.map(food => (
              <FoodCard 
                key={food.id} 
                item={food} 
                addToCart={addToCart} 
                // 🌟 ĐÃ SỬA: Thay thế hàm mở modal hệ thống bằng hàm chuyển hướng checkout trực tiếp
                handleBuyNow={() => handleDirectCheckout(food)} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* MODAL THÔNG BÁO TẠM THỜI (Giữ lại cho các tính năng khác cần dùng như Thông Báo/Hỗ Trợ ở Navbar) */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '45px', marginBottom: '10px' }}>⚙️</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#2b4c7e', fontWeight: '600' }}>Thông Báo Hệ Thống</h3>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.5', margin: '0 0 20px 0', fontWeight: '500' }}>
              Hệ thống đang cập nhật, vui lòng chờ!
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