import { useState } from 'react'; // 🌟 Đã xóa bỏ import useEffect không cần thiết
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Restaurant = () => {
  const navigate = useNavigate();
  const [localIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  
  // 🌟 ĐOẠN CODE ĐÚNG Ở TRANG RESTAURANT.JSX:
  // 1. Kiểm tra trạng thái: Nhãn phải viết THƯỜNG hoàn toàn 'restaurantStatus'
  const [regStatus] = useState(() => {
    return localStorage.getItem('restaurantStatus') || 'none';
  });

  // 2. Kiểm tra dữ liệu: Nhãn phải đúng là 'pendingRestaurantData'
  const [shopData] = useState(() => {
    if (localStorage.getItem('restaurantStatus') === 'pending') {
      const data = localStorage.getItem('pendingRestaurantData');
      return data ? JSON.parse(data) : null;
    }
    return null;
  });

  // ❌ ĐOẠN USEEFFECT (DÒNG 14 - 24) GÂY LỖI ĐÃ ĐƯỢC XÓA BỎ HOÀN TOÀN Ở ĐÂY

  const handleEditProfile = () => {
    navigate('/restaurant/onboarding'); // Quay lại trang form để sửa
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Navbar cart={[]} isLoggedIn={localIsLoggedIn} openPendingModal={() => {}} />

      <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '20px auto', padding: '0 15px', boxSizing: 'border-box' }}>
        
        {/* ================= GIAO DIỆN 1: NẾU HỒ SƠ ĐANG CHỜ XÉT DUYỆT ================= */}
        {regStatus === 'pending' ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '6px', padding: '50px 20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '65px', marginBottom: '15px' }}>⏳</div>
            <h2 style={{ color: '#2b4c7e', fontSize: '24px', fontWeight: '600', margin: '0 0 10px 0' }}>
              Hồ Sơ Đăng Ký Đang Được Xét Duyệt!
            </h2>
            <p style={{ color: '#666666', fontSize: '15px', margin: '0 0 35px 0', lineHeight: '1.5' }}>
              Hệ thống đang kiểm tra tính xác thực dữ liệu của quán ăn <b>{shopData?.shopName || 'Cửa hàng của bạn'}</b>.
            </p>
            
            {/* Hộp tóm tắt thông tin hồ sơ đang gửi */}
            <div style={{ maxWidth: '550px', margin: '0 auto 35px auto', textAlign: 'left', backgroundColor: '#fafafa', padding: '22px', borderRadius: '4px', border: '1px solid #eef2f6' }}>
              <div style={{ fontWeight: '600', color: '#333', fontSize: '15px', marginBottom: '12px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                📋 Chi tiết hồ sơ gửi đi:
              </div>
              <p style={{ margin: '6px 0', color: '#555', fontSize: '14px' }}><b>Tên cửa hàng:</b> {shopData?.shopName}</p>
              <p style={{ margin: '6px 0', color: '#555', fontSize: '14px' }}><b>Địa chỉ hoạt động:</b> {shopData?.shopAddress}</p>
              <p style={{ margin: '6px 0', color: '#555', fontSize: '14px' }}><b>Người đại diện pháp lý:</b> {shopData?.ownerName}</p>
              <p style={{ margin: '6px 0', color: '#555', fontSize: '14px' }}><b>Số điện thoại:</b> {shopData?.phone}</p>
              <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                <b>Trạng thái hệ thống:</b> <span style={{ color: '#f39c12', fontWeight: 'bold', backgroundColor: '#fef5e7', padding: '3px 8px', borderRadius: '3px' }}>⏳ Đang chờ phê duyệt</span>
              </p>
            </div>

            {/* Nút bấm chỉnh sửa lại hồ sơ */}
            <button 
              onClick={handleEditProfile}
              style={{ 
                backgroundColor: '#ffffff', 
                color: '#2b4c7e', 
                border: '1px solid #2b4c7e', 
                padding: '12px 35px', 
                fontSize: '14px', 
                fontWeight: '600', 
                borderRadius: '4px', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#2b4c7e'; e.target.style.color = '#fff'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = '#ffffff'; e.target.style.color = '#2b4c7e'; }}
            >
              ✏️ Thay đổi hồ sơ đăng ký
            </button>
          </div>
        ) : (

          /* ================= GIAO DIỆN 2: CHƯA ĐĂNG KÝ (GIAO DIỆN CHÀO MỪNG CŨ) ================= */
          <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}>
            <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '30px' }}>
              <div style={{ width: '140px', height: '140px', backgroundColor: '#fff5f5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                <span style={{ fontSize: '70px' }}>🏪</span>
              </div>
              <span style={{ position: 'absolute', top: '15px', left: '10px', fontSize: '24px' }}>✨</span>
              <span style={{ position: 'absolute', bottom: '20px', right: '10px', fontSize: '24px' }}>📝</span>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: '500', color: '#333333', margin: '0 0 12px 0' }}>
              Chào mừng đến với TasteByte Store!
            </h2>

            <p style={{ fontSize: '15px', color: '#666666', margin: '0 0 40px 0', lineHeight: '1.5' }}>
              Vui lòng cung cấp thông tin để thành lập tài khoản người bán trên TasteByte
            </p>

            <button 
              onClick={() => navigate('/restaurant/onboarding')}
              style={{ backgroundColor: '#2b4c7e', color: '#ffffff', border: 'none', padding: '12px 45px', fontSize: '15px', fontWeight: '500', borderRadius: '2px', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            >
              Bắt đầu đăng ký
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Restaurant;