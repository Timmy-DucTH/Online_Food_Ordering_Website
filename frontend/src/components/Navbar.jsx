import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ cart, updateQuantity, removeFromCart, openPendingModal }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={{ width: '100%', backgroundColor: '#2b4c7e', boxShadow: '0 1px 1px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 1000 }}>
      
      {/* THANH TOP BAR PHỤ - ĐÃ BỎ PHẦN TẢI ỨNG DỤNG */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '6px 10px', fontSize: '13px', color: '#e0e8f5' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          <span style={{ cursor: 'pointer' }} onClick={openPendingModal}>Trở thành Người bán TasteByte</span>
          {/* Đã xóa dòng "Tải ứng dụng" ở đây */}
        </div>
        
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer' }} onClick={openPendingModal}>🔔 Thông Báo</span>
          <span style={{ cursor: 'pointer' }} onClick={openPendingModal}>❓ Hỗ Trợ</span>
          
          {/* Menu Dropdown Tài khoản */}
          <div 
            style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            onMouseEnter={() => setIsUserMenuOpen(true)}
            onMouseLeave={() => setIsUserMenuOpen(false)}
          >
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', color: '#2b4c7e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>U</div>
            <span>duyquang536</span>

            {isUserMenuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, width: '150px', backgroundColor: 'white', borderRadius: '2px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', padding: '5px 0', zIndex: 1002, border: '1px solid #e8e8e8' }}>
                <div onClick={openPendingModal} style={{ padding: '10px 15px', color: '#333', fontSize: '14px', transition: '0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#f8f8f8'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>Tài Khoản Của Tôi</div>
                <div onClick={openPendingModal} style={{ padding: '10px 15px', color: '#333', fontSize: '14px', transition: '0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#f8f8f8'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>Đơn Mua</div>
                <div onClick={handleLogout} style={{ padding: '10px 15px', color: '#ff424e', fontSize: '14px', borderTop: '1px solid #f0f0f0', transition: '0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#f8f8f8'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>Đăng Xuất</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 10px 20px 10px' }}>
        
        {/* LOGO */}
        <h1 style={{ color: '#fff', margin: 0, cursor: 'pointer', fontSize: '30px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/home')}>
          TasteByte <span style={{ fontSize: '24px' }}>🍔</span>
        </h1>

        {/* THANH TÌM KIẾM KHUNG TRẮNG KIỂU SHOPEE */}
        <div style={{ flex: 1, margin: '0 50px', display: 'flex', backgroundColor: '#ffffff', padding: '4px', borderRadius: '2px', boxShadow: '0 1px 1px rgba(0,0,0,0.05)' }}>
        <input 
            type="text" 
            placeholder="TasteByte bao ship 0Đ - Đăng ký ngay!" 
            style={{ 
            flex: 1, 
            border: 'none', 
            padding: '10px 15px', 
            fontSize: '14px', 
            outline: 'none',
            /* CỰC KỲ QUAN TRỌNG: Ép màu nền TRẮNG và màu chữ ĐEN cho input để chống Dark Mode của trình duyệt */
            backgroundColor: '#ffffff', 
            color: '#333333' 
            }} 
        />
        <button 
            onClick={openPendingModal}
            style={{ backgroundColor: '#2b4c7e', color: 'white', border: 'none', padding: '0 25px', borderRadius: '2px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
        >
            🔍
        </button>
        </div>

        {/* ICON GIỎ HÀNG */}
        <div 
          style={{ position: 'relative', padding: '10px 20px', cursor: 'pointer' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{ fontSize: '28px', color: 'white' }}>🛒</span>
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: '-5px', right: '-10px', backgroundColor: '#fff', color: '#2b4c7e', fontSize: '12px', fontWeight: 'bold', padding: '1px 7px', borderRadius: '10px', border: '2px solid #2b4c7e', lineHeight: '1' }}>
                {totalItems}
              </span>
            )}
          </div>

          {/* Popover danh sách sản phẩm */}
          {isHovered && (
            <div style={{ position: 'absolute', top: '100%', right: 0, width: '380px', backgroundColor: 'white', boxShadow: '0 5px 20px rgba(0,0,0,0.15)', borderRadius: '4px', padding: '15px', zIndex: 1001, border: '1px solid #dbdbdb', color: '#333' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#888' }}>
                  <p style={{ fontSize: '40px', margin: 0 }}>🛒</p>
                  <p style={{ marginTop: '10px', fontSize: '14px' }}>Chưa có sản phẩm nào</p>
                </div>
              ) : (
                <div>
                  <h5 style={{ margin: '0 0 12px 0', borderBottom: '1px solid #f2f2f2', paddingBottom: '10px', color: '#888', fontSize: '13px', fontWeight: '400' }}>Sản phẩm mới thêm</h5>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {cart.map((item) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #f2f2f2' }}>
                        <img src={item.image} alt={item.name} style={{ width: '42px', height: '42px', borderRadius: '2px', border: '1px solid #e8e8e8', objectFit: 'cover', marginRight: '10px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', flex: '1', minWidth: 0, paddingRight: '10px' }}>
                          <span style={{ fontWeight: '500', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                          <span style={{ fontSize: '13px', color: '#2b4c7e', fontWeight: 'bold', marginTop: '2px' }}>{(item.price * item.quantity).toLocaleString()}đ</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button onClick={() => updateQuantity(item.id, -1)} style={{ border: '1px solid #ddd', backgroundColor: '#fff', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>➖</button>
                          <span style={{ minWidth: '15px', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} style={{ border: '1px solid #ddd', backgroundColor: '#fff', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>➕</button>
                          <button onClick={() => removeFromCart(item.id)} style={{ border: 'none', backgroundColor: 'transparent', color: '#999', cursor: 'pointer', fontSize: '13px', marginLeft: '5px' }}>Xóa</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f2f2f2' }}>
                    <span style={{ fontSize: '13px', color: '#666' }}>Tổng cộng: {totalItems} món ăn</span>
                    <button onClick={openPendingModal} style={{ backgroundColor: '#2b4c7e', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '2px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>Xem Giỏ Hàng</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Navbar;