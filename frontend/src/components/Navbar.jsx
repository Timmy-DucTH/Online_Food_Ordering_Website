import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ 
  cart = [], 
  updateQuantity, 
  removeFromCart, 
  clearCart, 
  openPendingModal, 
  isLoggedIn,
  notifications: propNotifications,
  setNotifications: propSetNotifications,
  theme = localStorage.getItem('theme') || 'dark'
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Check if current page is Home page
  const isHomePage = window.location.pathname === '/' || window.location.pathname === '/home';

  // Theme colors definition: Green accents for dark theme, Orange accents for light theme
  const navColors = {
    dark: {
      bg: '#0b0f19',
      text: '#e2e8f0',
      panel: '#111827',
      border: '#1f2937',
      inputBg: '#111827',
      inputText: '#ffffff',
      shadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
      menuHover: '#1f2937',
      primary: '#10b981', // green
      logoText: '#00e676', // light neon green
      logoIcon: '🟢',
      glow: 'rgba(16, 185, 129, 0.4)'
    },
    light: {
      bg: '#ffffff',
      text: '#0f172a',
      panel: '#f8fafc',
      border: '#e2e8f0',
      inputBg: '#f1f5f9',
      inputText: '#0f172a',
      shadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
      menuHover: '#f1f5f9',
      primary: '#ea580c', // orange
      logoText: '#ea580c', // orange
      logoIcon: '🍊',
      glow: 'rgba(234, 88, 12, 0.4)'
    }
  };

  const currentTheme = navColors[theme] || navColors.dark;

  // Lưu trữ ID những món ăn bị người dùng bỏ tích chọn
  const [unselectedItems, setUnselectedItems] = useState([]);
  
  // Trạng thái hiển thị Custom Modal thanh toán tự chế
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutTotal] = useState(0);

  // Notification states & hooks
  const [internalNotifications, setInternalNotifications] = useState([]);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [selectedNotify, setSelectedNotify] = useState(null); // For viewing details in a modal
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false); // For delete all confirmation

  const hasPropNotifications = propNotifications !== undefined;
  const notifications = hasPropNotifications ? propNotifications : internalNotifications;
  const setNotifications = hasPropNotifications ? propSetNotifications : setInternalNotifications;

  // Load notifications if not passed as prop
  const loadInternalNotifications = async () => {
    if (hasPropNotifications || !isLoggedIn) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications(data.data);
      }
    } catch (e) {
      console.error('Error loading notifications in navbar:', e);
    }
  };

  useEffect(() => {
    if (isLoggedIn && !hasPropNotifications) {
      loadInternalNotifications();
      const interval = setInterval(loadInternalNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, hasPropNotifications]);

  // Đọc tất cả thông báo
  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Xóa một thông báo
  const handleDeleteOne = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Xóa toàn bộ thông báo
  const handleDeleteAll = async () => {
    try {
      const res = await fetch('/api/notifications/delete-all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications([]);
        setShowDeleteAllConfirm(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Xem chi tiết thông báo
  const handleViewOne = async (notify, e) => {
    e.stopPropagation();
    setSelectedNotify(notify);
    if (!notify.is_read) {
      try {
        const res = await fetch(`/api/notifications/${notify._id}/read`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setNotifications(prev => prev.map(n => n._id === notify._id ? { ...n, is_read: true } : n));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('role');
    window.location.href = '/'; 
  };

  const handleSupportClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    navigate('/home', { state: { tab: 'chat', selectContactId: 'system_default_1' } });
  };

  const handleToggleSelect = (id, e) => {
    e.stopPropagation(); 
    setUnselectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (e) => {
    e.stopPropagation();
    if (cart.length > 0 && cart.every(item => !unselectedItems.includes(item.id))) {
      setUnselectedItems(cart.map(item => item.id)); 
    } else {
      setUnselectedItems([]); 
    }
  };

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
  const selectedCartItems = cart.filter(item => !unselectedItems.includes(item.id));
  const totalSelectedItems = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalSelectedPrice = selectedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckoutClick = () => {
    if (selectedCartItems.length === 0) return;
    setIsHovered(false); 
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

  const menuItemStyle = {
    padding: '10px 15px',
    color: currentTheme.text,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  };

  return (
    <div style={{ 
      width: '100%', backgroundColor: currentTheme.bg, boxShadow: currentTheme.shadow, 
      borderBottom: `1px solid ${currentTheme.border}`, position: 'sticky', top: 0, zIndex: 1000,
      color: currentTheme.text, transition: 'background-color 0.3s, color 0.3s'
    }}>
      {/* TOP MINI NAVBAR */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', padding: '6px 10px', fontSize: '13px', color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
        <div></div> 
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {isLoggedIn ? (
            <div 
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0' }}
              onMouseEnter={() => setIsNotifyOpen(true)}
              onMouseLeave={() => setIsNotifyOpen(false)}
            >
              <span style={{ color: currentTheme.text, display: 'flex', alignItems: 'center', gap: '4px' }}>
                🔔 Thông Báo
                {unreadCount > 0 && (
                  <span style={{ 
                    backgroundColor: '#ff424e', 
                    color: '#ffffff', 
                    borderRadius: '50%', 
                    padding: '1px 6px', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    boxShadow: '0 0 6px rgba(255, 66, 78, 0.6)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </span>

              {/* DROPDOWN CHỨA THÔNG BÁO */}
              {isNotifyOpen && (
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  width: '380px', 
                  backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.96)' : 'rgba(255, 255, 255, 0.98)', 
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  borderRadius: '10px', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 15px rgba(16, 185, 129, 0.1)', 
                  padding: '12px', 
                  zIndex: 1005, 
                  border: `1px solid ${currentTheme.border}`, 
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {/* HEADER DROPDOWN */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${currentTheme.border}`, paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', color: currentTheme.text, fontSize: '14px' }}>🔔 Thông Báo Mới</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead} 
                        style={{ 
                          backgroundColor: 'transparent', 
                          border: 'none', 
                          color: currentTheme.primary, 
                          fontSize: '12px', 
                          cursor: 'pointer',
                          fontWeight: '600',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = `${currentTheme.primary}18`}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>

                  {/* LIST THÔNG BÁO */}
                  <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: '13px' }}>
                        Không có thông báo nào
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n._id}
                          style={{ 
                            display: 'flex', 
                            gap: '10px', 
                            padding: '10px', 
                            borderRadius: '6px', 
                            backgroundColor: n.is_read ? 'transparent' : `${currentTheme.primary}0a`,
                            border: '1px solid',
                            borderColor: n.is_read ? 'transparent' : `${currentTheme.primary}33`,
                            transition: 'all 0.2s',
                            position: 'relative'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = currentTheme.menuHover; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = n.is_read ? 'transparent' : `${currentTheme.primary}0a`; }}
                        >
                          <span style={{ fontSize: '18px', marginTop: '2px' }}>
                            {n.type === 'order_status' ? '🛵' : n.type === 'discount' ? '🧧' : '🔔'}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '13px', color: currentTheme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                                {n.title}
                              </span>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>
                                {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: theme === 'dark' ? '#94a3b8' : '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.4' }}>
                              {n.message}
                            </p>
                            
                            {/* ACTIONS */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                              <span 
                                onClick={(e) => handleViewOne(n, e)}
                                style={{ fontSize: '11px', color: currentTheme.primary, fontWeight: 'bold', cursor: 'pointer' }}
                                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                              >
                                Xem
                              </span>
                              <span 
                                onClick={(e) => handleDeleteOne(n._id, e)}
                                style={{ fontSize: '11px', color: '#ff424e', fontWeight: 'bold', cursor: 'pointer' }}
                                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                              >
                                Xóa
                              </span>
                            </div>
                          </div>
                          {!n.is_read && (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: currentTheme.primary, position: 'absolute', top: '12px', right: '12px' }} />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* FOOTER DROPDOWN */}
                  {notifications.length > 0 && (
                    <div style={{ borderTop: `1px solid ${currentTheme.border}`, paddingTop: '8px', display: 'flex', justifyContent: 'center' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowDeleteAllConfirm(true); }}
                        style={{ 
                          backgroundColor: 'transparent', 
                          border: 'none', 
                          color: '#ff424e', 
                          fontSize: '12px', 
                          cursor: 'pointer',
                          fontWeight: '600',
                          padding: '4px 10px',
                          borderRadius: '4px'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 66, 78, 0.1)'}
                        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        🗑️ Xóa tất cả thông báo
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <span style={{ cursor: 'pointer' }} onClick={openPendingModal}>🔔 Thông Báo</span>
          )}
          <span style={{ cursor: 'pointer' }} onClick={handleSupportClick}>❓ Hỗ Trợ</span>
          
          {!isLoggedIn ? (
            <div style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
              <span onClick={() => navigate('/login')} style={{ cursor: 'pointer', color: currentTheme.primary }}>Đăng Ký / Đăng Nhập</span>
            </div>
          ) : (
            <div 
              style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0' }}
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: currentTheme.primary, color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>U</div>
              <span style={{ color: currentTheme.text }}>{localStorage.getItem('userEmail') || 'duyquang536'}</span>

              {/* USER DROP DOWN MENU */}
              {isUserMenuOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, width: '160px', backgroundColor: currentTheme.panel, borderRadius: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', padding: '5px 0', zIndex: 1002, border: `1px solid ${currentTheme.border}`, textAlign: 'left' }}>
                  {localStorage.getItem('role') === 'admin' && (
                    <div onClick={() => navigate('/admin')} style={menuItemStyle} onMouseOver={(e) => { e.target.style.backgroundColor = currentTheme.menuHover; e.target.style.color = currentTheme.primary; }} onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = currentTheme.text; }}>
                      👑 Quản Trị Hệ Thống
                    </div>
                  )}

                  <div onClick={() => navigate('/profile')} style={menuItemStyle} onMouseOver={(e) => { e.target.style.backgroundColor = currentTheme.menuHover; e.target.style.color = currentTheme.primary; }} onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = currentTheme.text; }}>
                    👤 Hồ Sơ Cá Nhân
                  </div>

                  <div onClick={() => navigate('/profile', { state: { tab: 'orders' } })} style={menuItemStyle} onMouseOver={(e) => { e.target.style.backgroundColor = currentTheme.menuHover; e.target.style.color = currentTheme.primary; }} onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = currentTheme.text; }}>
                    🛒 Đơn Hàng Của Tôi
                  </div>
                  
                  <div onClick={() => navigate('/restaurant')} style={menuItemStyle} onMouseOver={(e) => { e.target.style.backgroundColor = currentTheme.menuHover; e.target.style.color = currentTheme.primary; }} onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = currentTheme.text; }}>
                    🏪 Cửa Hàng
                  </div>
                
                  <div onClick={handleLogout} style={{ ...menuItemStyle, color: '#ff424e', borderTop: `1px solid ${currentTheme.border}` }} onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 66, 78, 0.1)'} onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
                    Đăng Xuất
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MAIN NAVBAR */}
      <div className="navbar-main-container">
        {/* LOGO */}
        <h1 style={{ color: currentTheme.primary, margin: 0, cursor: 'pointer', fontSize: '30px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => navigate('/home')}>
          Taste<span style={{ color: currentTheme.logoText }}>Byte</span> <span style={{ fontSize: '26px' }}>{currentTheme.logoIcon}</span>
        </h1>

        {/* SEARCH BAR (CONDITIONALLY HIDDEN ON HOME TO PREVENT DUPLICATION) */}
        {!isHomePage && (
          <div style={{ flex: 1, margin: '0 50px', display: 'flex', backgroundColor: currentTheme.panel, padding: '3px', borderRadius: '6px', border: `1px solid ${currentTheme.border}` }}>
            <input type="text" placeholder="TasteByte bao ship 0Đ - Khám phá vũ trụ đồ ăn!" style={{ flex: 1, border: 'none', padding: '10px 15px', fontSize: '14px', outline: 'none', backgroundColor: 'transparent', color: currentTheme.inputText }} />
            <button onClick={openPendingModal} style={{ backgroundColor: currentTheme.primary, color: 'white', border: 'none', padding: '0 25px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>🔍</button>
          </div>
        )}

        {/* CART CONTAINER */}
        <div style={{ position: 'relative', padding: '10px 20px', cursor: 'pointer' }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <span style={{ fontSize: '28px', color: currentTheme.primary }}>🛒</span>
          {totalItemsInCart > 0 && (
            <span style={{ position: 'absolute', top: '4px', right: '10px', backgroundColor: currentTheme.primary, color: '#ffffff', borderRadius: '50%', padding: '2px 7px', fontSize: '12px', fontWeight: 'bold', boxShadow: `0 0 10px ${currentTheme.glow}` }}>
              {totalItemsInCart}
            </span>
          )}
          
          {/* HOVER DROPDOWN BOX GIỎ HÀNG */}
          {isHovered && (
            <div style={{ position: 'absolute', top: '100%', right: 0, width: '420px', backgroundColor: currentTheme.panel, padding: '15px', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.6)', color: currentTheme.text, fontSize: '14px', zIndex: 1005, border: `1px solid ${currentTheme.border}` }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b' }}>Chưa có byte dữ liệu đồ ăn nào trong giỏ</div>
              ) : (
                <div>
                  {/* SELECT ALL */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: `1px solid ${currentTheme.border}`, paddingBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', color: currentTheme.primary }}>
                      <input 
                        type="checkbox" 
                        checked={cart.length > 0 && cart.every(item => !unselectedItems.includes(item.id))} 
                        onChange={handleToggleSelectAll}
                        style={{ accentColor: currentTheme.primary, cursor: 'pointer' }}
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
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', borderBottom: `1px solid ${currentTheme.border}`, paddingBottom: '8px' }}>
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => handleToggleSelect(item.id, e)}
                            style={{ accentColor: currentTheme.primary, cursor: 'pointer' }}
                          />

                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', flex: 1, maxWidth: '140px', fontWeight: '500' }}>
                            {item.name}
                          </span>
                          
                          {/* NÚT TĂNG GIẢM SỐ LƯỢNG */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (updateQuantity) updateQuantity(item.id, item.quantity - 1, item.buyer_id); }}
                              style={{ width: '22px', height: '22px', backgroundColor: currentTheme.bg, color: currentTheme.text, border: `1px solid ${currentTheme.border}`, borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              -
                            </button>
                            <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (updateQuantity) updateQuantity(item.id, item.quantity + 1, item.buyer_id); }}
                              style={{ width: '22px', height: '22px', backgroundColor: currentTheme.bg, color: currentTheme.text, border: `1px solid ${currentTheme.border}`, borderRadius: '3px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                              +
                            </button>
                          </div>

                          {/* THÀNH GIÁ & XÓA */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                            <span style={{ color: currentTheme.primary, fontWeight: 'bold', fontSize: '13px', minWidth: '70px', textAlign: 'right' }}>
                              {(item.price * item.quantity).toLocaleString()}đ
                            </span>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if (removeFromCart) removeFromCart(item.id, item.buyer_id); }}
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
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${currentTheme.border}`, fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '4px' }}>
                      <span>Món đã chọn mua:</span>
                      <span>{totalSelectedItems} món</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '16px' }}>
                      <span>Tổng tiền tính toán:</span>
                      <span style={{ color: currentTheme.primary, textShadow: `0 0 5px ${currentTheme.glow}` }}>{totalSelectedPrice.toLocaleString()}đ</span>
                    </div>
                  </div>

                  {/* BUTTON CHECKOUT */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleCheckoutClick(); }}
                    style={{ width: '100%', backgroundColor: selectedCartItems.length === 0 ? '#4b5563' : currentTheme.primary, color: 'white', border: 'none', padding: '12px 0', borderRadius: '6px', marginTop: '12px', cursor: selectedCartItems.length === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: selectedCartItems.length === 0 ? 'none' : `0 4px 10px ${currentTheme.glow}` }}
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
          <div style={{ backgroundColor: currentTheme.panel, padding: '35px', borderRadius: '12px', textAlign: 'center', maxWidth: '420px', width: '90%', border: `1px solid ${currentTheme.primary}`, boxShadow: `0 0 30px ${currentTheme.glow}` }}>
            <div style={{ fontSize: '55px', marginBottom: '15px' }}>🟢🚀</div>
            <h3 style={{ color: currentTheme.primary, fontSize: '22px', margin: '0 0 12px 0', fontWeight: '700' }}>Đặt Đơn Thành Công!</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.5', marginBottom: '8px', fontSize: '14px' }}>
              Hệ thống TasteByte đã tiếp nhận đơn hàng gồm các món bạn chọn và đang điều phối tài xế giao tới bạn.
            </p>
            
            <div style={{ backgroundColor: currentTheme.bg, padding: '12px', borderRadius: '6px', textAlign: 'left', marginBottom: '20px', maxHeight: '100px', overflowY: 'auto', fontSize: '13px', border: `1px solid ${currentTheme.border}` }}>
              <span style={{ fontWeight: 'bold', color: currentTheme.primary }}>Chi tiết hóa đơn món mua:</span>
              {selectedCartItems.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', color: currentTheme.text, marginTop: '4px' }}>
                  <span>• {i.name}</span>
                  <span>x{i.quantity}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: '16px', fontWeight: 'bold', color: currentTheme.primary, marginBottom: '25px', backgroundColor: `${currentTheme.primary}1a`, padding: '10px', borderRadius: '6px', border: `1px solid ${currentTheme.primary}33` }}>
              Tổng thanh toán: {checkoutTotal.toLocaleString()}đ
            </p>
            <button 
              onClick={handleConfirmOrder}
              style={{ backgroundColor: currentTheme.primary, color: 'white', border: 'none', padding: '12px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', width: '100%' }}
            >
              Tuyệt vời (OK)
            </button>
          </div>
        </div>
      )}

      {/* DETAILED NOTIFICATION MODAL */}
      {selectedNotify && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000 }}>
          <div style={{ backgroundColor: currentTheme.panel, padding: '30px', borderRadius: '12px', maxWidth: '450px', width: '90%', border: `1px solid ${currentTheme.primary}`, boxShadow: `0 0 30px ${currentTheme.glow}` }}>
            <div style={{ fontSize: '40px', marginBottom: '15px', textAlign: 'center' }}>
              {selectedNotify.type === 'order_status' ? '🛵' : selectedNotify.type === 'discount' ? '🧧' : '🔔'}
            </div>
            <h3 style={{ color: currentTheme.primary, fontSize: '20px', margin: '0 0 12px 0', fontWeight: '700', textAlign: 'center' }}>
              {selectedNotify.title}
            </h3>
            <p style={{ color: currentTheme.text, lineHeight: '1.6', marginBottom: '25px', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
              {selectedNotify.message}
            </p>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '20px', textAlign: 'right' }}>
              Thời gian: {new Date(selectedNotify.createdAt).toLocaleString('vi-VN')}
            </div>
            <button 
              onClick={() => setSelectedNotify(null)}
              style={{ backgroundColor: currentTheme.primary, color: 'white', border: 'none', padding: '10px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', width: '100%' }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* DELETE ALL NOTIFICATIONS CONFIRMATION MODAL */}
      {showDeleteAllConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 20000 }}>
          <div style={{ backgroundColor: currentTheme.panel, padding: '30px', borderRadius: '12px', maxWidth: '400px', width: '90%', border: '1px solid #ff424e', boxShadow: '0 0 30px rgba(255,66,78,0.2)' }}>
            <div style={{ fontSize: '40px', marginBottom: '15px', textAlign: 'center' }}>⚠️</div>
            <h3 style={{ color: '#ff424e', fontSize: '20px', margin: '0 0 12px 0', fontWeight: '700', textAlign: 'center' }}>
              Xác Nhận Xóa Tất Cả?
            </h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.5', marginBottom: '25px', fontSize: '14px', textAlign: 'center' }}>
              Bạn có chắc chắn muốn xóa toàn bộ thông báo trong hộp thư? Thao tác này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowDeleteAllConfirm(false)}
                style={{ flex: 1, backgroundColor: '#374151', color: '#e2e8f0', border: 'none', padding: '10px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleDeleteAll}
                style={{ flex: 1, backgroundColor: '#ff424e', color: 'white', border: 'none', padding: '10px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', boxShadow: '0 4px 10px rgba(255,66,78,0.2)' }}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
