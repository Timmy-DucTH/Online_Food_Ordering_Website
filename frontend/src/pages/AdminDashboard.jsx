import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Giả lập dữ liệu hệ thống phục vụ hiển thị
  const stats = {
    totalRevenue: '24,850,000đ',
    totalOrders: 142,
    totalUsers: 89,
    bannedUsers: 3
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'system-ui, sans-serif', textAlign: 'left' }}>
      
      {/* 🟢 SIDEBAR - THANH QUẢN TRỊ BÊN TRÁI */}
      <div style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '25px 15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Logo Brand */}
          <h2 style={{ color: '#10b981', margin: '0 0 30px 0', fontSize: '24px', fontWeight: '800', textAlign: 'center' }}>
            TasteByte <span style={{ fontSize: '14px', backgroundColor: '#e6f4ea', color: '#059669', padding: '3px 8px', borderRadius: '12px' }}>Admin</span>
          </h2>

          {/* Danh sách menu tính năng */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab('overview')}
              style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'overview' ? '#10b981' : 'transparent', color: activeTab === 'overview' ? 'white' : '#64748b', transition: 'all 0.2s' }}
            >
              📊 Tổng Quan Hệ Thống
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'users' ? '#10b981' : 'transparent', color: activeTab === 'users' ? 'white' : '#64748b', transition: 'all 0.2s' }}
            >
              👥 Quản Lý Người Dùng
            </button>
            <button 
              onClick={() => setActiveTab('foods')}
              style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'foods' ? '#10b981' : 'transparent', color: activeTab === 'foods' ? 'white' : '#64748b', transition: 'all 0.2s' }}
            >
              🍔 Quản Lý Món Ăn
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'orders' ? '#10b981' : 'transparent', color: activeTab === 'orders' ? 'white' : '#64748b', transition: 'all 0.2s' }}
            >
              📦 Quản Lý Đơn Hàng
            </button>
          </div>
        </div>

        {/* Nút đăng xuất quay về */}
        <div>
          <button onClick={() => navigate('/home')} style={{ width: '100%', padding: '10px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px', fontWeight: '500', textAlign: 'center' }}>
            🏠 Về Trang Chủ Khách
          </button>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: '#fff1f2', color: '#e11d48', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center' }}>
            🚪 Đăng Xuất Admin
          </button>
        </div>
      </div>

      {/* 💻 MAIN CONTENT - NỘI DUNG CHÍNH BÊN PHẢI */}
      <div style={{ flex: 1, padding: '40px 30px', overflowY: 'auto' }}>
        
        {/* Header trên */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: '#0f172a', margin: 0 }}>Hệ Thống Quản Trị Trung Tâm</h1>
            <p style={{ color: '#64748b', margin: '5px 0 0 0', fontSize: '14px' }}>Chào mừng trở lại, Tổng quản trị TasteByte.</p>
          </div>
          <div style={{ backgroundColor: 'white', padding: '8px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 'bold', color: '#10b981' }}>
            Trạng thái: Online 🟢
          </div>
        </div>

        {/* KHU VỰC HIỂN THỊ TABS LOGIC */}
        {activeTab === 'overview' && (
          <div>
            {/* GRID THẺ THỐNG KÊ */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>💰 TỔNG DOANH THU THÁNG</span>
                <h2 style={{ fontSize: '28px', color: '#10b981', margin: '10px 0 0 0', fontWeight: '800' }}>{stats.totalRevenue}</h2>
              </div>
              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>📦 ĐƠN HÀNG HOÀN THÀNH</span>
                <h2 style={{ fontSize: '28px', color: '#0f172a', margin: '10px 0 0 0', fontWeight: '800' }}>{stats.totalOrders} đơn</h2>
              </div>
              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#64748b' }}>👥 TÀI KHOẢN THÀNH VIÊN</span>
                <h2 style={{ fontSize: '28px', color: '#0f172a', margin: '10px 0 0 0', fontWeight: '800' }}>{stats.totalUsers} người</h2>
              </div>
              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #fff1f2', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#e11d48' }}>⚠️ TÀI KHOẢN BỊ KHÓA (&lt;30đ)</span>
                <h2 style={{ fontSize: '28px', color: '#e11d48', margin: '10px 0 0 0', fontWeight: '800' }}>{stats.bannedUsers} tài khoản</h2>
              </div>
            </div>

            {/* Khối biểu đồ mẫu hoặc ghi chú hoạt động gần đây */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>📈 Biểu Đồ Tăng Trưởng Hoạt Động</h3>
              <p style={{ color: '#64748b', fontSize: '14px' }}>Hệ thống vận hành mượt mà. Điểm uy tín của toàn bộ khách hàng đang được giám sát tự động bằng Middleware xử lý lỗi.</p>
              <div style={{ height: '150px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', color: '#94a3b8', fontWeight: 'bold' }}>
                [Khu vực tích hợp biểu đồ doanh thu Chart.js / Recharts]
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>👥 Quản lý thành viên & Điểm uy tín</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Tại đây Admin có thể xem danh sách User và theo dõi điểm uy tín thưởng/phạt.</p>
            {/* Thêm table CRUD thành viên tại đây */}
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
              Dữ liệu thành viên kết nối từ Mongoose Collection 'users' sẽ hiển thị dạng bảng tại đây.
            </div>
          </div>
        )}

        {activeTab === 'foods' && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>🍔 Danh mục thực đơn cửa hàng</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Thêm, sửa, xóa món ăn, cập nhật giá tiền nhanh chóng.</p>
            {/* Thêm form Thêm món ăn tại đây */}
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
              Bảng quản lý Thêm / Sửa / Xóa món ăn.
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>📦 Quản lý dòng vận đơn giao hàng</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Xét duyệt trạng thái đơn hàng và trừ điểm uy tín nếu tài khoản "bùng hàng".</p>
            <div style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
              Danh sách đơn hàng toàn hệ thống.
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;