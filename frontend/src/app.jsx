import { useState } from 'react';
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

  const openPendingModal = () => setShowPendingModal(true);
  const closePendingModal = () => setShowPendingModal(false);

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
    </BrowserRouter>
  );
}

export default App;