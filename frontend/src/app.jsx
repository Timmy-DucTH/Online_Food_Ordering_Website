import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import RegisterLogin from './pages/RegisterLogin';
import Profile from './pages/Profile';
import Restaurant from './pages/Restaurant';
import RestaurantOnboarding from './pages/RestaurantOnboarding'; 
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard'; // 📊 Import file AdminDashboard vào đây

// =========================================================
// MIDDLEWARE BẢO VỆ TUYẾN ĐƯỜNG ADMIN (CHẶN KHÁCH THƯỜNG)
// =========================================================
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Bạn nhớ lưu role ('admin' hoặc 'user') vào localStorage lúc đăng nhập nhé

  // Nếu không có token hoặc tài khoản không phải là admin -> Đá bay về trang chủ
  if (!token || userRole !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('token');
  });
  
  const [showPendingModal, setShowPendingModal] = useState(false);

  // State cho modal cảnh báo khóa tài khoản
  const [banMessage, setBanMessage] = useState(null);

  const openPendingModal = () => setShowPendingModal(true);
  const closePendingModal = () => setShowPendingModal(false);

  // Hàm xóa toàn bộ dữ liệu phiên đăng nhập (giữ lại theme và các cài đặt khác)
  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('user');        // ⚠️ Quan trọng: key này hay bị bỏ sót!
    localStorage.removeItem('restaurantStatus');
    localStorage.removeItem('pendingRestaurantData');
  };

  // Lắng nghe sự kiện khóa tài khoản từ API interceptor và polling
  useEffect(() => {
    const handleAccountBanned = (event) => {
      const message = event.detail?.message || 'Tài khoản của bạn đã bị khóa bởi quản trị viên.';
      // Chỉ set message để hiển thị modal — KHÔNG setIsLoggedIn(false) ngay
      // vì các trang con (Home.jsx) có guard "if (!isLoggedIn) navigate('/login')"
      // sẽ redirect mất trước khi modal kịp render
      setBanMessage(message);
    };

    window.addEventListener('account-banned', handleAccountBanned);
    return () => {
      window.removeEventListener('account-banned', handleAccountBanned);
    };
  }, []);

  // Polling độc lập kiểm tra trạng thái khóa tài khoản toàn cục (mọi trang)
  // Chạy mỗi 8 giây, hoạt động cả khi backend chưa restart
  useEffect(() => {
    if (!isLoggedIn) return;

    const checkBanStatus = async () => {
      const token = localStorage.getItem('token');
      // Dừng nếu không có token HOẶC modal ban đang hiển thị (tránh gọi lặp)
      if (!token || window.__accountBanned) return;

      try {
        const res = await fetch('/api/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Trường hợp 1: Backend phát hiện ban -> 403
        // QUAN TRỌNG: KHÔNG xóa token ngay - để tránh kích hoạt 401 redirect trước khi modal hiện
        if (res.status === 403) {
          const data = await res.json();
          if (data?.status === 'banned' && !window.__accountBanned) {
            window.__accountBanned = true;
            window.dispatchEvent(new CustomEvent('account-banned', {
              detail: { message: data.message || 'Tài khoản của bạn đã bị khóa bởi quản trị viên.' }
            }));
          }
          return;
        }

        // Trường hợp 2: 200 OK nhưng kiểm tra nội dung thông báo hệ thống
        if (res.status === 200) {
          const data = await res.json();
          if (data?.status === 'success' && Array.isArray(data.data)) {
            const banNotif = data.data.find(n =>
              !n.is_read &&
              n.type === 'system' &&
              (n.title?.includes('bị khóa') || n.title?.includes('bi khoa'))
            );
            if (banNotif && localStorage.getItem('token') && !window.__accountBanned) {
              window.__accountBanned = true;
              window.dispatchEvent(new CustomEvent('account-banned', {
                detail: { message: banNotif.message || banNotif.title || 'Tài khoản của bạn đã bị khóa.' }
              }));
            }
          }
        }
      } catch (e) {
        // Bỏ qua lỗi mạng
      }
    };

    // Chạy ngay khi user vừa đăng nhập
    checkBanStatus();
    const interval = setInterval(checkBanStatus, 8000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  const handleCloseBanModal = () => {
    // Dọn dẹp token và session chỉ khi user bấm nút - tránh race condition với các polling
    clearAuthData();
    window.__accountBanned = false; // Reset flag cho lần đăng nhập sau
    setBanMessage(null);
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* CÁC TUYẾN ĐƯỜNG DÀNH CHO KHÁCH HÀNG THƯỜNG */}
        <Route path="/" element={<Home isLoggedIn={isLoggedIn} openPendingModal={openPendingModal} />} />
        <Route path="/home" element={<Home isLoggedIn={isLoggedIn} openPendingModal={openPendingModal} />} />
        
        <Route path="/login" element={<RegisterLogin setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<RegisterLogin setIsLoggedIn={setIsLoggedIn} />} />
        
        <Route path="/profile" element={<Profile isLoggedIn={isLoggedIn} openPendingModal={openPendingModal} />} /> 
        <Route path="/restaurant" element={<Restaurant openPendingModal={openPendingModal} />} /> 
        
        <Route path="/restaurant/onboarding" element={<RestaurantOnboarding openPendingModal={openPendingModal} />} /> 
        <Route path="/checkout" element={<Checkout />} />
        
        {/* 👑 TUYẾN ĐƯỜNG ADMIN - ĐÃ ĐƯỢC BẢO MẬT CHẶN TRUY CẬP TRÁI PHÉP */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        
      </Routes>

      {/* =====================================================
          🚫 MODAL CẢNH BÁO KHÓA TÀI KHOẢN - TOÀN CỤC
          Hiển thị ngay giữa màn hình khi admin khóa tài khoản
          ===================================================== */}
      {banMessage && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          backgroundColor: 'rgba(3, 7, 18, 0.92)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999999,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <div style={{
            backgroundColor: '#111827',
            border: '1.5px solid #ef4444',
            padding: '40px 35px',
            borderRadius: '18px',
            boxShadow: '0 0 60px rgba(239, 68, 68, 0.25), 0 25px 50px rgba(0, 0, 0, 0.7)',
            textAlign: 'center',
            maxWidth: '480px',
            width: '90%',
            boxSizing: 'border-box',
            animation: 'slideUp 0.35s ease-out'
          }}>
            {/* Icon cảnh báo */}
            <div style={{ fontSize: '62px', marginBottom: '18px', lineHeight: 1 }}>🔒</div>

            {/* Tiêu đề */}
            <h2 style={{
              margin: '0 0 10px 0',
              color: '#ef4444',
              fontWeight: '800',
              fontSize: '22px',
              letterSpacing: '0.3px'
            }}>
              Tài Khoản Đã Bị Khóa
            </h2>

            {/* Đường kẻ phân cách */}
            <div style={{
              width: '50px', height: '3px',
              backgroundColor: '#ef4444',
              borderRadius: '99px',
              margin: '0 auto 20px auto',
              opacity: 0.6
            }} />

            {/* Nội dung lý do khóa */}
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.07)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              padding: '16px 20px',
              marginBottom: '28px',
              textAlign: 'left'
            }}>
              <p style={{
                color: '#fca5a5',
                fontSize: '14px',
                lineHeight: '1.7',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {banMessage}
              </p>
            </div>

            {/* Ghi chú nhỏ */}
            <p style={{
              color: '#64748b',
              fontSize: '12px',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              Bạn sẽ được tự động đăng xuất sau khi đóng thông báo này. Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ TasteByte.
            </p>

            {/* Nút đóng */}
            <button
              onClick={handleCloseBanModal}
              style={{
                width: '100%',
                padding: '14px 0',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '15px',
                letterSpacing: '0.3px',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.35)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.45)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#ef4444';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.35)';
              }}
            >
              Đóng &amp; Đăng Xuất
            </button>
          </div>
        </div>
      )}

      {/* MODAL THÔNG BÁO BẢO TRÌ TOÀN CỤC */}
      {showPendingModal && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(3, 7, 18, 0.85)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          zIndex: 99999, 
          backdropFilter: 'blur(6px)' 
        }}>
          <div style={{ 
            backgroundColor: '#111827', 
            border: '1.5px solid #10b981', 
            padding: '35px', 
            borderRadius: '16px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 15px rgba(16, 185, 129, 0.1)', 
            textAlign: 'center', 
            maxWidth: '420px', 
            width: '90%',
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              fontSize: '54px', 
              marginBottom: '15px',
              animation: 'spin 12s linear infinite',
              display: 'inline-block'
            }}>⚙️</div>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              color: '#10b981', 
              fontWeight: '800',
              fontSize: '22px',
              letterSpacing: '0.5px'
            }}>Thông Báo Hệ Thống</h3>
            <p style={{ 
              color: '#94a3b8', 
              fontSize: '14px', 
              lineHeight: '1.7', 
              margin: '0 0 28px 0',
              fontWeight: '500' 
            }}>
              Tính năng đang được đồng bộ dữ liệu Backend, vui lòng quay lại sau!
            </p>
            <button 
              onClick={closePendingModal} 
              style={{ 
                padding: '12px 45px', 
                backgroundColor: '#10b981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                fontSize: '14px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#10b981';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </BrowserRouter>
  );
}

export default App;