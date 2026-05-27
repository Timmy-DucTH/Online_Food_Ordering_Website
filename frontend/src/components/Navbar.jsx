import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ cart = [], updateQuantity, removeFromCart, clearCart, openPendingModal, isLoggedIn }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // 🌟 GIẢI PHÁP TỐI ƯU: Chỉ lưu những ID món ăn bị người dùng bỏ tích chọn
  // Món mới thêm vào giỏ mặc định không nằm trong đây -> Tự động được tích chọn mà không cần useEffect
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
    e.stopPropagation(); // Ngăn sự kiện hover/click giỏ hàng bị kích hoạt sai lệch
    setUnselectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Hàm tích chọn tất cả / bỏ tích chọn tất cả
  const handleToggleSelectAll = (e) => {
    e.stopPropagation();
    // Nếu tất cả món trong giỏ đều đang được chọn -> Bấm vào sẽ thành Bỏ chọn tất cả
    if (cart.length > 0 && cart.every(item => !unselectedItems.includes(item.id))) {
      setUnselectedItems(cart.map(item => item.id)); // Cho hết tất cả ID vào danh sách "Bỏ chọn"
    } else {
      setUnselectedItems([]); // Xóa sạch danh sách "Bỏ chọn" = Tích chọn lại tất cả
    }
  };

  // 🌟 TÍNH TOÁN TRỰC TIẾP KHI RENDER (Triệt tiêu re-render thừa)
  // Số lượng hiển thị trên icon Giỏ hàng (Tính tổng toàn bộ giỏ)
  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Lọc ra danh sách món ĐƯỢC CHỌN (Nằm trong giỏ và KHÔNG nằm trong mảng unselectedItems)
  const selectedCartItems = cart.filter(item => !unselectedItems.includes(item.id));
  const totalSelectedItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalSelectedPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckoutClick = () => {
    if (selectedCartItems.length === 0) return;
    
    // Đóng popover giỏ hàng trước khi đi
    setIsHovered(false); 
    
    // 🌟 CHUYỂN TRANG: Chuyển sang /checkout và truyền theo danh sách món đã chọn
    navigate('/checkout', { 
      state: { selectedItems: selectedCartItems } 
    });
  };

  const handleConfirmOrder = () => {
    setShowCheckoutModal(false);
    // Sau khi thanh toán thành công, tiến hành xóa các món đã mua ra khỏi giỏ hàng gốc
    if (clearCart) {
      selectedCartItems.forEach(item => removeFromCart(item.id));
    }
    setUnselectedItems([]); // Reset mảng trạng thái bỏ chọn về trống
  };

  const menuItemStyle = {
    padding: '10px 15px',
    color: '#333',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap'
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#2b4c7e', boxShadow: '0 1px 1px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* TOP MINI NAVBAR */}
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
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 0' }}
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', color: '#2b4c7e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>U</div>
              <span>{localStorage.getItem('userEmail') || 'duyquang536'}</span>

              {/* USER ACCORDION DROP DOWN MENU */}
              {isUserMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, width: '160px', backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', padding: '5px 0', zIndex: 1002, border: '1px solid #e8e8e8', textAlign: 'left' }}>
                  <div onClick={() => navigate('/profile')} style={menuItemStyle} onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                    Hồ Sơ Cá Nhân
                  </div>
                  
                  <div onClick={() => navigate('/restaurant')} style={menuItemStyle} onMouseOver={(e) => e.target.style.backgroundColor = '#f5f5f5'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
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
        {/* LOGO */}
        <h1 style={{ color: '#fff', margin: 0, cursor: 'pointer', fontSize: '30px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/home')}>
          TasteByte <span style={{ fontSize: '24px' }}>🍔</span>
        </h1>

        {/* SEARCH BAR */}
        <div style={{ flex: 1, margin: '0 50px', display: 'flex', backgroundColor: '#ffffff', padding: '4px', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.05)' }}>
          <input type="text" placeholder="TasteByte bao ship 0Đ - Đăng ký ngay!" style={{ flex: 1, border: 'none', padding: '10px 15px', fontSize: '14px', outline: 'none', backgroundColor: '#ffffff', color: '#333333' }} />
          <button onClick={openPendingModal} style={{ backgroundColor: '#2b4c7e', color: 'white', border: 'none', padding: '0 25px', borderRadius: '2px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>🔍</button>
        </div>

        {/* CART FLUID DROP DOWN */}
        <div style={{ position: 'relative', padding: '10px 20px', cursor: 'pointer' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <span style={{ fontSize: '28px', color: 'white' }}>🛒</span>
          {totalItemsInCart > 0 && (
            <span style={{ position: 'absolute', top: '4px', right: '10px', backgroundColor: '#ffffff', color: '#2b4c7e', borderRadius: '50%', padding: '2px 7px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #2b4c7e' }}>
              {totalItemsInCart}
            </span>
          )}
          
          {/* POP-OVER BOX GIỎ HÀNG KHI HOVER */}
          {isHovered && (
            <div style={{ position: 'absolute', top: '100%', right: 0, width: '420px', backgroundColor: 'white', padding: '15px', borderRadius: '4px', boxShadow: '0 5px 20px rgba(0,0,0,0.15)', color: '#333', fontSize: '14px', zIndex: 1005 }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#888' }}>Chưa có sản phẩm nào</div>
              ) : (
                <div>
                  {/* THANH CHỌN TẤT CẢ (SELECT ALL) */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#2b4c7e' }}>
                      <input 
                        type="checkbox" 
                        checked={cart.length > 0 && cart.every(item => !unselectedItems.includes(item.id))} 
                        onChange={handleToggleSelectAll}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      Chọn tất cả ({cart.length})
                    </label>
                    <span style={{ fontSize: '12px', color: '#888' }}>Đã chọn: {selectedCartItems.length}</span>
                  </div>

                  {/* DANH SÁCH MÓN ĂN TRONG GIỎ */}
                  <div style={{ maxHeight: '240px', overflowY: 'auto', paddingRight: '5px' }}>
                    {cart.map((item) => {
                      const isChecked = !unselectedItems.includes(item.id);
                      return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', borderBottom: '1px solid #fcfcfc', paddingBottom: '8px', backgroundColor: isChecked ? '#fdfeff' : 'transparent' }}>
                          
                          {/* CHECKBOX TỪNG MÓN */}
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => handleToggleSelect(item.id, e)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />

                          {/* Tên món */}
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, maxWidth: '130px', fontWeight: '500' }}>
                            {item.name}
                          </span>
                          
                          {/* CỤM NÚT BẤM CỘNG/TRỪ SỐ LƯỢNG */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (updateQuantity) updateQuantity(item.id, item.quantity - 1); }}
                              style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid #ddd', backgroundColor: '#f9f9f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}
                            >
                              -
                            </button>
                            <span style={{ fontSize: '13px', fontWeight: '600', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (updateQuantity) updateQuantity(item.id, item.quantity + 1); }}
                              style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid #ddd', backgroundColor: '#f9f9f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}
                            >
                              +
                            </button>
                          </div>

                          {/* Thành giá & Icon Thùng rác */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                            <span style={{ color: isChecked ? '#ff424e' : '#888', fontWeight: '500', fontSize: '13px', minWidth: '65px', textAlign: 'right' }}>
                              {(item.price * item.quantity).toLocaleString()}đ
                            </span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (removeFromCart) removeFromCart(item.id); }}
                              style={{ backgroundColor: 'transparent', border: 'none', color: '#ff424e', fontSize: '15px', cursor: 'pointer', padding: '2px 4px' }}
                              title="Xóa món ăn"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* THÀNH TIỀN THEO CHECKBOX CỦA MÓN ĐƯỢC CHỌN */}
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee', fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: '4px' }}>
                      <span>Món đã chọn mua:</span>
                      <span>{totalSelectedItems} món</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                      <span>Tổng tiền thanh toán:</span>
                      <span style={{ color: '#ff424e' }}>{totalSelectedPrice.toLocaleString()}đ</span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCheckoutClick(); }}
                    style={{ width: '100%', backgroundColor: selectedCartItems.length === 0 ? '#ccc' : '#2b4c7e', color: 'white', border: 'none', padding: '10px 0', borderRadius: '3px', marginTop: '12px', cursor: selectedCartItems.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    disabled={selectedCartItems.length === 0}
                  >
                    💳 Thanh toán món đã chọn ({totalSelectedItems})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CUSTOM SUCCESS MODAL - NẰM CHÍNH GIỮA MÀN HÌNH CHỈ HIỆN KHI BẤM THANH TOÁN */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000 }}>
          <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '6px', textAlign: 'center', maxWidth: '420px', width: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: '55px', marginBottom: '15px' }}>🎉</div>
            <h3 style={{ color: '#2b4c7e', fontSize: '22px', margin: '0 0 12px 0', fontWeight: '600' }}>Đặt Đơn Thành Công!</h3>
            <p style={{ color: '#666', lineHeight: '1.5', marginBottom: '8px', fontSize: '14px' }}>
              Hệ thống TasteByte đã tiếp nhận đơn hàng gồm các món bạn chọn và đang điều phối tài xế giao tới bạn.
            </p>
            
            {/* Hộp danh sách chi tiết các món vừa mua */}
            <div style={{ backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px', textAlign: 'left', marginBottom: '20px', maxHeight: '100px', overflowY: 'auto', fontSize: '13px' }}>
              <span style={{ fontWeight: 'bold', color: '#2b4c7e' }}>Chi tiết hóa đơn món mua:</span>
              {selectedCartItems.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#555', marginTop: '2px' }}>
                  <span>• {i.name}</span>
                  <span>x{i.quantity}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff424e', marginBottom: '25px', backgroundColor: '#fff5f5', padding: '8px', borderRadius: '4px' }}>
              Tổng thanh toán: {checkoutTotal.toLocaleString()}đ
            </p>
            <button 
              onClick={handleConfirmOrder}
              style={{ backgroundColor: '#2b4c7e', color: 'white', border: 'none', padding: '12px 0', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', width: '100%', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#1d3557'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#2b4c7e'}
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