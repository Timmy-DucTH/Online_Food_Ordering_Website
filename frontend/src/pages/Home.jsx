import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FoodCard from '../components/FoodCard';

const Home = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // Khởi trạng thái đăng nhập bảo mật
  const [isLoggedIn] = useState(() => !!localStorage.getItem('token'));

  const foodList = [
    { id: 1, name: 'Burger Bò Đặc Biệt', price: 55000, rating: 4.8, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500' },
    { id: 2, name: 'Pizza Hải Sản Size L', price: 189000, rating: 4.9, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500' },
    { id: 3, name: 'Mì Ý Sốt Bò Bằm', price: 45000, rating: 4.5, image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5855?q=80&w=500' },
    { id: 4, name: 'Trà Sữa Trân Châu', price: 35000, rating: 4.7, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=500' },
    { id: 5, name: 'Gà Rán Giòn Cay', price: 39000, rating: 4.6, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c8d08f58?q=80&w=500' },
    { id: 6, name: 'Salad Rau Củ Quả', price: 29000, rating: 4.2, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500' },
  ];

  // Chặn bảo vệ kiểm tra đăng nhập
  const checkAuthAndExecute = (callback) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return false;
    }
    if (callback) callback();
    return true;
  };

  // Thêm vào giỏ hàng thông thường
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

  // Hàm đặt hàng mua ngay trực tiếp, phi thẳng sang Checkout
  const handleDirectCheckout = (foodItem) => {
    checkAuthAndExecute(() => {
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
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', width: '100%', position: 'relative', margin: 0, padding: 0, color: '#f8fafc' }}>
      <Navbar 
        cart={cart} 
        updateQuantity={updateQuantity} 
        removeFromCart={removeFromCart} 
        clearCart={clearCart} 
        openPendingModal={() => setShowModal(true)} 
        isLoggedIn={isLoggedIn} 
      />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 10px' }}>
        {/* BANNER GREEN TECH GRADIENT */}
        <div style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '12px', marginBottom: '25px', backgroundImage: 'linear-gradient(135deg, #064e3b 0%, #0b0f19 100%)', border: '1px solid #065f46' }}>
          <h2 style={{ fontSize: '38px', margin: '0 0 10px 0', fontWeight: '800', color: '#ffffff' }}>Bạn muốn ăn gì hôm nay? 😋</h2>
          <p style={{ fontSize: '16px', color: '#34d399', margin: 0, fontWeight: '400' }}>Hàng ngàn món ngon siêu tốc được mã hóa tại vũ trụ TasteByte</p>
        </div>

        <div style={{ backgroundColor: '#111827', padding: '15px 20px', borderRadius: '8px 8px 0 0', fontWeight: 'bold', color: '#34d399', border: '1px solid #1f2937', borderBottom: 'none', textAlign: 'left' }}>
          🟢 MÓN NGON GỢI Ý CHO BẠN
        </div>
        
        <div style={{ backgroundColor: '#111827', padding: '20px', borderRadius: '0 0 8px 8px', border: '1px solid #1f2937', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {foodList.map(food => (
              <FoodCard 
                key={food.id} 
                item={food} 
                addToCart={addToCart} 
                handleBuyNow={() => handleDirectCheckout(food)} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* MODAL HỆ THỐNG */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#111827', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 25px rgba(0,0,0,0.5)', textAlign: 'center', maxWidth: '400px', width: '90%', border: '1px solid #1f2937' }}>
            <div style={{ fontSize: '45px', marginBottom: '10px' }}>⚙️</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#10b981', fontWeight: '700' }}>Thông Báo Hệ Thống</h3>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Tính năng đang liên kết cổng dữ liệu API mã hóa, vui lòng quay lại sau!
            </p>
            <button 
              onClick={() => setShowModal(false)}
              style={{ padding: '10px 40px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
      
      <footer style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '14px', maxWidth: '1200px', margin: '0 auto' }}>
        © 2026 TasteByte - Đồ án Công nghệ phần mềm Nhóm 8
      </footer>
    </div>
  );
};

export default Home;