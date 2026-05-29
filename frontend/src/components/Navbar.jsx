import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ cart = [], updateQuantity, removeFromCart, clearCart, openPendingModal, isLoggedIn }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Lưu trữ ID những món ăn bị người dùng bỏ tích chọn
  const [unselectedItems, setUnselectedItems] = useState([]);
  
  // Trạng thái hiển thị Custom Modal thanh toán tự chế
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutTotal, setCheckoutTotal] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    window.location.href = '/'; 
  };

  // Hàm đảo ngược trạng thái checkbox (Tích chọn / Bỏ tích) của một món ăn
  const handleToggleSelect = (id, e) => {
    e.stopPropagation(); 
    setUnselectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Hàm tích chọn tất cả / bỏ tích chọn tất cả
  const handleToggleSelectAll = (e) => {
    e.stopPropagation();
    if (cart.length > 0 && cart.every(item => !unselectedItems.includes(item.id))) {
      setUnselectedItems(cart.map(item => item.id)); 
    } else {
      setUnselectedItems([]); 
    }
  };

  // Tính toán trực tiếp số lượng hiển thị trên icon Giỏ hàng
  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Lọc ra danh sách món ĐƯỢC CHỌN
  const selectedCartItems = cart.filter(item => !unselectedItems.includes(item.id));
  const totalSelectedItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalSelectedPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckoutClick = () => {
    if (selectedCartItems.length === 0) return;
    setIsHovered(false); 
    
    // Điều hướng sang trang /checkout và truyền theo danh sách món đã chọn
    navigate('/checkout', { 
      state: { selectedItems: selectedCartItems } 
    });
  };

  const handleConfirmOrder = () => {
    setShowCheckoutModal(false);
    if (clearCart) {
      selectedCartItems.forEach(item => removeFromCart(item.id));
    }
    setUnselectedItems([]); 
  };

  // Style cho menu thả xuống của User (Đã đồng bộ sang Dark Theme & Xanh lá)
  const menuItemStyle = {
    padding: '10px 15px',
    color: '#e2e8f0',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#0b0f19', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)', position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* TOP MINI NAVBAR */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '6px 10px', fontSize: '13px', color: '#94a3b8' }}>
        <div></div> 
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer' }} onClick={openPendingModal}>🔔 Thông Báo</span>
          <span style={{ cursor: 'pointer' }} onClick={openPendingModal}>❓ Hỗ Trợ</span>
          
          {!isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: '#10b981' }}>Đăng Ký / Đăng Nhập</span>
            </div>
          ) : (
            <div 
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>U</div>
              <span style={{ color: '#e2e8f0' }}>{localStorage.getItem('userEmail') || 'duyquang536'}</span>

              {/* USER DROP DOWN MENU */}
              {isUserMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, width: '160px', backgroundColor: '#111827', borderRadius: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', padding: '5px 0', zIndex: 1002, border: '1px solid #1f2937', textAlign: 'left' }}>
                  <div onClick={() => navigate('/profile')} style={menuItemStyle} onMouseOver={(e) => { e.target.style.backgroundColor = '#1f2937'; e.target.style.color = '#00e676'; }} onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#e2e8f0'; }}>
                    Hồ Sơ Cá Nhân
                  </div>
                  
                  <div onClick={() => navigate('/restaurant')} style={menuItemStyle} onMouseOver={(e) => { e.target.style.backgroundColor = '#1f2937'; e.target.style.color = '#00e676'; }} onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#e2e8f0'; }}>
                    🏪 Cửa Hàng
                  </div>
                
                  <div onClick={handleLogout} style={{ ...menuItemStyle, color: '#ff424e', borderTop: '1px solid #1f2937' }} onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 66, 78, 0.1)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                    Đăng Xuất
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 10px 18px 10px' }}>
        {/* LOGO */}
        <h1 style={{ color: '#10b981', margin: 0, cursor: 'pointer', fontSize: '30px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/home')}>
          Taste<span style={{ color: '#00e676' }}>Byte</span> <span style={{ fontSize: '26px' }}>🟢</span>
        </h1>

        {/* SEARCH BAR */}
        <div style={{ flex: 1, margin: '0 50px', display: 'flex', backgroundColor: '#111827', padding: '3px', borderRadius: '6px', border: '1px solid #1f2937' }}>
          <input type="text" placeholder="TasteByte bao ship 0Đ - Khám phá vũ trụ đồ ăn!" style={{ flex: 1, border: 'none', padding: '10px 15px', fontSize: '14px', outline: 'none', backgroundColor: 'transparent', color: '#ffffff' }} />
          <button onClick={openPendingModal} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '0 25px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>🔍</button>
        </div>

        {/* CART CONTAINER */}
        <div style={{ position: 'relative', padding: '10px 20px', cursor: 'pointer' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <span style={{ fontSize: '28px', color: '#10b981' }}>🛒</span>
          {totalItemsInCart > 0 && (
            <span style={{ position: 'absolute', top: '4px', right: '10px', backgroundColor: '#00e676', color: '#0b0f19', borderRadius: '50%', padding: '2px 7px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 0 10px #00e676' }}>
              {totalItemsInCart}
            </span>
          )}
          
          {/* HOVER DROPDOWN BOX GIỎ HÀNG */}
          {isHovered && (
            <div style={{ position: 'absolute', top: '100%', right: 0, width: '420px', backgroundColor: '#111827', padding: '15px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', color: '#ffffff', fontSize: '14px', zIndex: 1005, border: '1px solid #1f2937' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b' }}>Chưa có byte dữ liệu đồ ăn nào trong giỏ</div>
              ) : (
                <div>
                  {/* SELECT ALL */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#00e676' }}>
                      <input 
                        type="checkbox" 
                        checked={cart.length > 0 && cart.every(item => !unselectedItems.includes(item.id))} 
                        onChange={handleToggleSelectAll}
                        style={{ accentColor: '#00e676', cursor: 'pointer' }}
                      />
                      Chọn tất cả ({cart.length})
                    </label>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Đã chọn: {selectedCartItems.length}</span>
                  </div>

                  {/* DANH SÁCH MÓN ĂN */}
                  <div style={{ maxHeight: '240px', overflowY: 'auto', textAlign: 'left' }}>
                    {cart.map((item) => {
                      const isChecked = !unselectedItems.includes(item.id);
                      return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => handleToggleSelect(item.id, e)}
                            style={{ accentColor: '#00e676', cursor: 'pointer' }}
                          />

                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, maxWidth: '140px', fontWeight: '500' }}>
                            {item.name}
                          </span>
                          
                          {/* NÚT TĂNG GIẢM SỐ LƯỢNG */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (updateQuantity) updateQuantity(item.id, item.quantity - 1); }}
                              style={{ width: '22px', height: '22px', backgroundColor: '#1f2937', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              -
                            </button>
                            <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (updateQuantity) updateQuantity(item.id, item.quantity + 1); }}
                              style={{ width: '22px', height: '22px', backgroundColor: '#1f2937', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              +
                            </button>
                          </div>

                          {/* THÀNH GIÁ & XÓA */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                            <span style={{ color: '#00e676', fontWeight: 'bold', fontSize: '13px', minWidth: '70px', textAlign: 'right' }}>
                              {(item.price * item.quantity).toLocaleString()}đ
                            </span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (removeFromCart) removeFromCart(item.id); }}
                              style={{ backgroundColor: 'transparent', border: 'none', color: '#ff424e', fontSize: '15px', cursor: 'pointer' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* THÀNH TIỀN */}
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #1f2937', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '4px' }}>
                      <span>Món đã chọn mua:</span>
                      <span>{totalSelectedItems} món</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                      <span>Tổng tiền tính toán:</span>
                      <span style={{ color: '#00e676', textShadow: '0 0 5px rgba(0,230,118,0.3)' }}>{totalSelectedPrice.toLocaleString()}đ</span>
                    </div>
                  </div>

                  {/* BUTTON CHECKOUT */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCheckoutClick(); }}
                    style={{ width: '100%', backgroundColor: selectedCartItems.length === 0 ? '#4b5563' : '#10b981', color: 'white', border: 'none', padding: '12px 0', borderRadius: '6px', marginTop: '12px', cursor: selectedCartItems.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: selectedCartItems.length === 0 ? 'none' : '0 4px 10px rgba(16,185,129,0.3)' }}
                    disabled={selectedCartItems.length === 0}
                  >
                    💳 Tiến Hành Thanh Toán ({totalSelectedItems})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CUSTOM SUCCESS MODAL */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000 }}>
          <div style={{ backgroundColor: '#111827', padding: '35px', borderRadius: '12px', textAlign: 'center', maxWidth: '420px', width: '90%', border: '1px solid #10b981', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '55px', marginBottom: '15px' }}>🟢🚀</div>
            <h3 style={{ color: '#00e676', fontSize: '22px', margin: '0 0 12px 0', fontWeight: '700' }}>Đặt Đơn Thành Công!</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.5', marginBottom: '8px', fontSize: '14px' }}>
              Hệ thống TasteByte đã tiếp nhận đơn hàng gồm các món bạn chọn và đang điều phối tài xế giao tới bạn.
            </p>
            
            <div style={{ backgroundColor: '#0b0f19', padding: '12px', borderRadius: '6px', textAlign: 'left', marginBottom: '20px', maxHeight: '100px', overflowY: 'auto', fontSize: '13px', border: '1px solid #1f2937' }}>
              <span style={{ fontWeight: 'bold', color: '#10b981' }}>Chi tiết hóa đơn món mua:</span>
              {selectedCartItems.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', marginTop: '4px' }}>
                  <span>• {i.name}</span>
                  <span>x{i.quantity}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#00e676', marginBottom: '25px', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              Tổng thanh toán: {checkoutTotal.toLocaleString()}đ
            </p>
            <button 
              onClick={handleConfirmOrder}
              style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', width: '100%' }}
            >
              Tuyệt vời (OK)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;