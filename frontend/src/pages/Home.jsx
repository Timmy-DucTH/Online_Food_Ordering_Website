import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FoodCard from '../components/FoodCard';

const CATEGORIES = ['Tất cả', 'Burger', 'Pizza', 'Cơm', 'Mì & Phở', 'Đồ uống', 'Tráng miệng', 'Khác'];

const Home = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoggedIn] = useState(() => !!localStorage.getItem('token'));

  // Fetch real food data from API
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/foods');
        const data = await res.json();
        if (data.status === 'success') {
          setFoods(data.foods);
        } else {
          setError('Không thể tải danh sách món ăn.');
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

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
      // Normalize _id -> id for Navbar compatibility
      const normalized = { ...foodItem, id: foodItem._id || foodItem.id };
      setCart((prevCart) => {
        const isExist = prevCart.find(item => item.id === normalized.id);
        if (isExist) {
          return prevCart.map(item =>
            item.id === normalized.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevCart, { ...normalized, quantity: 1 }];
      });
    });
  };

  const handleDirectCheckout = (foodItem) => {
    checkAuthAndExecute(() => {
      const directItem = { ...foodItem, id: foodItem._id || foodItem.id, quantity: 1 };
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

  const clearCart = () => setCart([]);

  // Filter foods by category and search
  const filteredFoods = foods.filter(food => {
    const matchCat = selectedCategory === 'Tất cả' || food.category === selectedCategory;
    const matchSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.restaurant_id?.store_name || food.restaurant_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', width: '100%', margin: 0, padding: 0, color: '#f8fafc' }}>
      <Navbar
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        openPendingModal={() => setShowModal(true)}
        isLoggedIn={isLoggedIn}
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
        {/* HERO BANNER */}
        <div style={{
          padding: '56px 24px', textAlign: 'center', borderRadius: '16px',
          marginBottom: '28px',
          background: 'linear-gradient(135deg, #064e3b 0%, #0d1a2d 60%, #0b0f19 100%)',
          border: '1px solid #065f46', position: 'relative', overflow: 'hidden'
        }}>
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', bottom: '-30px', left: '-30px', width: '160px', height: '160px',
            borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <h2 style={{ fontSize: '36px', margin: '0 0 10px', fontWeight: '800', color: '#fff', position: 'relative' }}>
            Bạn muốn ăn gì hôm nay? 😋
          </h2>
          <p style={{ fontSize: '16px', color: '#34d399', margin: '0 0 28px', fontWeight: '400', position: 'relative' }}>
            Hàng ngàn món ngon từ các cửa hàng uy tín — giao siêu tốc tới tay bạn
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
            <span style={{
              position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '18px', pointerEvents: 'none'
            }}>🔍</span>
            <input
              type="text"
              placeholder="Tìm món ăn hoặc cửa hàng..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '14px 16px 14px 46px', borderRadius: '12px',
                border: '1.5px solid #065f46', backgroundColor: 'rgba(17,24,39,0.8)',
                color: '#f1f5f9', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                backdropFilter: 'blur(8px)'
              }}
            />
          </div>
        </div>

        {/* CATEGORY PILLS */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', transition: '0.2s',
                backgroundColor: selectedCategory === cat ? '#10b981' : '#1f2937',
                color: selectedCategory === cat ? '#fff' : '#94a3b8',
                border: selectedCategory === cat ? '1.5px solid #10b981' : '1.5px solid #374151'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SECTION HEADER */}
        <div style={{
          backgroundColor: '#111827', padding: '13px 20px', borderRadius: '10px 10px 0 0',
          fontWeight: '700', color: '#34d399', border: '1px solid #1f2937', borderBottom: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span>🟢 MÓN NGON GỢI Ý CHO BẠN</span>
          {!loading && (
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '400' }}>
              {filteredFoods.length} món
            </span>
          )}
        </div>

        <div style={{
          backgroundColor: '#111827', padding: '24px', borderRadius: '0 0 10px 10px',
          border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          {/* Loading state */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
              <p style={{ fontSize: '15px' }}>Đang tải danh sách món ăn...</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#ef4444' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>❌</div>
              <p>{error}</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredFoods.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
              <p style={{ fontSize: '16px', marginBottom: '6px' }}>Không tìm thấy món ăn phù hợp</p>
              <p style={{ fontSize: '13px' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}

          {/* Food grid */}
          {!loading && !error && filteredFoods.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '20px' }}>
              {filteredFoods.map(food => (
                <FoodCard
                  key={food._id}
                  item={food}
                  addToCart={addToCart}
                  handleBuyNow={() => handleDirectCheckout(food)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#111827', padding: '30px', borderRadius: '12px',
            boxShadow: '0 4px 25px rgba(0,0,0,0.5)', textAlign: 'center',
            maxWidth: '400px', width: '90%', border: '1px solid #1f2937'
          }}>
            <div style={{ fontSize: '45px', marginBottom: '10px' }}>⚙️</div>
            <h3 style={{ margin: '0 0 10px', color: '#10b981', fontWeight: '700' }}>Thông Báo Hệ Thống</h3>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', margin: '0 0 20px' }}>
              Tính năng đang liên kết cổng dữ liệu API mã hóa, vui lòng quay lại sau!
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: '10px 40px', backgroundColor: '#10b981', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
              }}
            >Xác nhận</button>
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