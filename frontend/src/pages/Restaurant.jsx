import { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Restaurant = () => {
  const navigate = useNavigate();
  const [localIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  
  const [regStatus] = useState(() => {
    return localStorage.getItem('restaurantStatus') || 'none';
  });

  const [shopData] = useState(() => {
    if (localStorage.getItem('restaurantStatus') === 'pending') {
      const data = localStorage.getItem('pendingRestaurantData');
      return data ? JSON.parse(data) : null;
    }
    return null;
  });

  const handleEditProfile = () => {
    navigate('/restaurant/onboarding'); 
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', color: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar cart={[]} isLoggedIn={localIsLoggedIn} openPendingModal={() => {}} />

      <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '30px auto', padding: '0 15px', boxSizing: 'border-box' }}>
        
        {/* ================= GIAO DIỆN 1: NẾU HỒ SƠ ĐANG CHỜ XÉT DUYỆT ================= */}
        {regStatus === 'pending' ? (
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '50px 20px', textAlign: 'center', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '65px', marginBottom: '15px' }}>⏳</div>
            <h2 style={{ color: '#10b981', fontSize: '24px', fontWeight: '600', margin: '0 0 10px 0' }}>
              Hồ Sơ Đăng Ký Đang Được Xét Duyệt!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '15px', margin: '0 0 35px 0', lineHeight: '1.5' }}>
              Hệ thống đang kiểm tra tính xác thực dữ liệu của quán ăn <b style={{ color: '#ffffff' }}>{shopData?.shopName || 'Cửa hàng của bạn'}</b>.
            </p>
            
            {/* Hộp tóm tắt thông tin hồ sơ đang gửi */}
            <div style={{ maxWidth: '550px', margin: '0 auto 35px auto', textAlign: 'left', backgroundColor: '#0b0f19', padding: '22px', borderRadius: '8px', border: '1px solid #1f2937' }}>
              <div style={{ fontWeight: '600', color: '#10b981', fontSize: '15px', marginBottom: '12px', borderBottom: '1px solid #1f2937', paddingBottom: '6px' }}>
                📋 Chi tiết hồ sơ gửi đi:
              </div>
              <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Tên cửa hàng:</b> {shopData?.shopName}</p>
              <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Địa chỉ hoạt động:</b> {shopData?.shopAddress}</p>
              <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Người đại diện pháp lý:</b> {shopData?.ownerName}</p>
              <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Số điện thoại:</b> {shopData?.phone}</p>
              <p style={{ margin: '12px 0 0 0', fontSize: '14px' }}>
                <b style={{ color: '#ffffff' }}>Trạng thái hệ thống:</b> <span style={{ color: '#fbbf24', fontWeight: 'bold', backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '13px' }}>⏳ Đang chờ phê duyệt</span>
              </p>
            </div>

            {/* Nút bấm chỉnh sửa lại hồ sơ */}
            <button 
              onClick={handleEditProfile}
              style={{ 
                backgroundColor: 'transparent', 
                color: '#10b981', 
                border: '1px solid #10b981', 
                padding: '12px 35px', 
                fontSize: '14px', 
                fontWeight: '600', 
                borderRadius: '8px', 
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#10b981'; e.target.style.color = '#fff'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#10b981'; }}
            >
              ✏️ Thay đổi hồ sơ đăng ký
            </button>
          </div>
        ) : (

          /* ================= GIAO DIỆN 2: CHƯA ĐĂNG KÝ ================= */
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '30px' }}>
              <div style={{ width: '140px', height: '140px', backgroundColor: '#0b0f19', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '1px solid #1f2937' }}>
                <span style={{ fontSize: '70px' }}>🏪</span>
              </div>
              <span style={{ position: 'absolute', top: '15px', left: '10px', fontSize: '24px' }}>✨</span>
              <span style={{ position: 'absolute', bottom: '20px', right: '10px', fontSize: '24px' }}>📝</span>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 12px 0' }}>
              Chào mừng đến với TasteByte Store!
            </h2>

            <p style={{ fontSize: '15px', color: '#94a3b8', margin: '0 0 40px 0', lineHeight: '1.5', maxWidth: '500px' }}>
              Vui lòng cung cấp thông tin lý lịch cần thiết để thành lập tài khoản người bán trên hệ thống TasteByte.
            </p>

            <button 
              onClick={() => navigate('/restaurant/onboarding')}
              style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '14px 50px', fontSize: '15px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
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