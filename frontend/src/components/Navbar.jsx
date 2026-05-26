import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ cart = [], updateQuantity, removeFromCart, openPendingModal, isLoggedIn }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.location.href = '/'; 
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const menuItemStyle = {
    padding: '10px 15px',
    color: '#333',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#2b4c7e', boxShadow: '0 1px 1px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '6px 10px', fontSize: '13px', color: '#e0e8f5' }}>
        <div></div> 
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer' }} onClick={openPendingModal}>🔔 Thông Báo</span>
          <span style={{ cursor: 'pointer' }} onClick={openPendingModal}>❓ Hỗ Trợ</span>
          
          {!isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              <span onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>Đăng Ký / Đăng Nhập</span>
            </div>
          ) : (
            <div 
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', color: '#2b4c7e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>U</div>
              <span>{localStorage.getItem('userEmail') || 'duyquang536'}</span>

              {isUserMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, width: '160px', backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', padding: '5px 0', zIndex: 1002, border: '1px solid #e8e8e8', textAlign: 'left' }}>
                  {/* 🌟 ĐÃ SỬA: Khi click sẽ chuyển hướng chuẩn sang trang profile */}
                  <div onClick={() => navigate('/profile')} style={menuItemStyle} onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                    Hồ sơ cá nhân
                  </div>
                  <div onClick={openPendingModal} style={menuItemStyle} onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                    🏪 Cửa Hàng
                  </div>
                  <div onClick={openPendingModal} style={menuItemStyle} onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                    Đơn Mua
                  </div>
                  <div onClick={handleLogout} style={{ ...menuItemStyle, color: '#ff424e', borderTop: '1px solid #f0f0f0' }} onMouseOver={(e) => e.target.style.backgroundColor = '#fff1f1'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                    Đăng Xuất
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 10px 20px 10px' }}>
        <h1 style={{ color: '#fff', margin: 0, cursor: 'pointer', fontSize: '30px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/home')}>
          TasteByte <span style={{ fontSize: '24px' }}>🍔</span>
        </h1>

        <div style={{ flex: 1, margin: '0 50px', display: 'flex', backgroundColor: '#ffffff', padding: '4px', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.05)' }}>
          <input type="text" placeholder="TasteByte bao ship 0Đ - Đăng ký ngay!" style={{ flex: 1, border: 'none', padding: '10px 15px', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', color: '#333333' }} />
          <button onClick={openPendingModal} style={{ backgroundColor: '#2b4c7e', color: 'white', border: 'none', padding: '0 25px', borderRadius: '2px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>🔍</button>
        </div>

        {/* GIỎ HÀNG THẢ XUỐNG TẠM THỜI TRÁNH CRASH */}
        <div style={{ position: 'relative', padding: '10px 20px', cursor: 'pointer' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <span style={{ fontSize: '28px', color: 'white' }}>🛒</span>
          {isHovered && (
            <div style={{ position: 'absolute', top: '100%', right: 0, width: '300px', backgroundColor: 'white', padding: '15px', borderRadius: '4px', boxShadow: '0 5px 20px rgba(0,0,0,0.15)', color: '#333', fontSize: '14px' }}>
              Chưa có sản phẩm nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;