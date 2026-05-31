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
        <Route path="/restaurant" element={<Restaurant />} /> 
        
        <Route path="/restaurant/onboarding" element={<RestaurantOnboarding />} /> 
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '45px', marginBottom: '10px' }}>⚙️</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#2b4c7e', fontWeight: '600' }}>Thông Báo Hệ Thống</h3>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Tính năng đang được đồng bộ dữ liệu Backend, vui lòng quay lại sau!
            </p>
            <button onClick={closePendingModal} style={{ padding: '10px 40px', backgroundColor: '#2b4c7e', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;