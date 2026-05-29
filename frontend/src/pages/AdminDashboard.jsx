import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api'; 

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // ==========================================
  // CÁC STATE QUẢN LÝ DỮ LIỆU ĐỘNG TỪ BACKEND
  // ==========================================
  const [users, setUsers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  
  // State quản lý Trạng thái tải và Thông báo lỗi hệ thống
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // =========================================================================
  // EFFECT 1: TỰ ĐỘNG NẠP DỮ LIỆU THỜI GIAN THỰC MỖI KHI CHUYỂN TAB
  // =========================================================================
  useEffect(() => {
    const fetchTabData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        if (activeTab === 'overview' || activeTab === 'users') {
          const res = await API.get('/admin/users');
          setUsers(res.data.users || []);
        }
        if (activeTab === 'foods') {
          const res = await API.get('/admin/foods'); // API Admin lấy danh sách món ăn (bao gồm chờ duyệt)
          setFoods(res.data.foods || []);
        }
        if (activeTab === 'overview' || activeTab === 'orders') {
          const res = await API.get('/admin/orders');
          setOrders(res.data.orders || []);
        }
        if (activeTab === 'restaurants') {
          const res = await API.get('/admin/restaurants'); // API Lấy danh sách cửa hàng
          setRestaurants(res.data.data || []);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Không thể đồng bộ dữ liệu với máy chủ backend!');
      } finally {
        setLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab]);

  // =========================================================================
  // EFFECT 2: TỰ ĐỘNG ẨN HỘP THÔNG BÁO THÀNH CÔNG SAU 3 GIÂY
  // =========================================================================
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // ==========================================
  // HÀM NGHIỆP VỤ 1: QUẢN LÝ NGƯỜI DÙNG
  // ==========================================
  const handleToggleBlockUser = async (userId, currentStatus) => {
    try {
      const endpoint = currentStatus === 'banned' ? `/admin/users/${userId}/unban` : `/admin/users/${userId}/ban`;
      const res = await API.put(endpoint);
      if (res.data.status === 'success') {
        setSuccessMsg(res.data.message || 'Cập nhật trạng thái người dùng thành công!');
        setUsers(users.map(u => u._id === userId ? { ...u, status: currentStatus === 'banned' ? 'active' : 'banned' } : u));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi thao tác phân quyền tài khoản!');
    }
  };

  // ==========================================
  // HÀM NGHIỆP VỤ 2: QUẢN LÝ THỰC ĐƠN MÓN ĂN (DUYỆT / XÓA)
  // ==========================================
  const handleApproveFood = async (foodId, status) => {
    try {
      const res = await API.put(`/admin/foods/${foodId}/approve`, { status });
      if (res.data.status === 'success') {
        setSuccessMsg(`✓ Đã cập nhật trạng thái món ăn thành: ${status === 'approved' ? 'Phê duyệt' : 'Từ chối'}`);
        setFoods(foods.map(f => f._id === foodId ? { ...f, status } : f));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Thao tác duyệt món ăn thất bại!');
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm('Bạn có chắc chắn muốn gỡ món ăn này khỏi thực đơn cửa hàng không?')) return;
    try {
      const res = await API.delete(`/admin/foods/${foodId}`);
      if (res.data.status === 'success') {
        setSuccessMsg('🗑️ Đã xóa món ăn thành công!');
        setFoods(foods.filter(f => f._id !== foodId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa món ăn thất bại!');
    }
  };

  // ==========================================
  // HÀM NGHIỆP VỤ 3: DUYỆT HỒ SƠ ĐĂNG KÝ CỬA HÀNG
  // ==========================================
  const handleApproveRestaurant = async (restaurantId, status) => {
    try {
      const res = await API.put(`/admin/restaurants/${restaurantId}/approve`, { status });
      if (res.data.status === 'success') {
        setSuccessMsg(`✓ Đã cập nhật trạng thái hồ sơ nhà hàng thành: ${status === 'approved' ? 'Duyệt' : 'Từ chối'}`);
        setRestaurants(restaurants.map(r => r._id === restaurantId ? { ...r, status } : r));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Duyệt hồ sơ nhà hàng thất bại!');
    }
  };

  // ==========================================
  // HÀM NGHIỆP VỤ 4: ĐIỀU PHỐI VẬN ĐƠN & PHẠT BÙNG HÀNG
  // ==========================================
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await API.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.status === 'success') {
        setSuccessMsg(`📦 Đơn hàng đã được chuyển trạng thái sang: [${newStatus}]`);
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        
        if (newStatus === 'cancelled') {
          setSuccessMsg('⚠️ Đơn hàng bị hủy! Hệ thống tự động trừ điểm uy tín của tài khoản này.');
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Cập nhật tiến độ vận đơn thất bại!');
    }
  };

  // Đăng xuất xóa bộ nhớ tạm sạch sẽ
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // ==========================================
  // LOGIC ĐẾM THỐNG KÊ TỰ ĐỘNG THEO DỮ LIỆU THẬT
  // ==========================================
  const totalUsersCount = users.length;
  const bannedUsersCount = users.filter(u => u.status === 'banned').length;
  const activeOrdersCount = orders.filter(o => o.status === 'completed').length;

  // Kiểu dáng Table mẫu dùng chung (Dark Theme)
  const tableThStyle = { padding: '12px 15px', borderBottom: '2px solid #1f2937', color: '#94a3b8', fontSize: '14px', fontWeight: '600' };
  const tableTdStyle = { padding: '12px 15px', borderBottom: '1px solid #1f2937', color: '#f8fafc', fontSize: '14px' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19', color: '#ffffff', fontFamily: 'system-ui, sans-serif', textAlign: 'left' }}>
      
      {/* 🔴 TOAST ALERT BOX THÔNG BÁO THÀNH CÔNG */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '25px', right: '25px', backgroundColor: '#111827', color: '#ffffff', borderLeft: '4px solid #10b981', borderTop: '1px solid #1f2937', borderRight: '1px solid #1f2937', borderBottom: '1px solid #1f2937', padding: '15px 25px', borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 99999, fontSize: '14px', fontWeight: '500' }}>
          {successMsg}
        </div>
      )}

      {/* 🟢 SIDEBAR - THANH QUẢN TRỊ BÊN TRÁI (Dark Sidebar) */}
      <div style={{ width: '260px', backgroundColor: '#111827', borderRight: '1px solid #1f2937', padding: '25px 15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
        <div>
          <h2 style={{ color: '#10b981', margin: '0 0 30px 0', fontSize: '24px', fontWeight: '800', textAlign: 'center' }}>
            TasteByte <span style={{ fontSize: '14px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '3px 8px', borderRadius: '12px' }}>Admin</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={() => setActiveTab('overview')} style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'overview' ? '#10b981' : 'transparent', color: activeTab === 'overview' ? 'white' : '#94a3b8', transition: 'all 0.2s' }}>
              📊 Tổng Quan Hệ Thống
            </button>
            <button onClick={() => setActiveTab('restaurants')} style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'restaurants' ? '#10b981' : 'transparent', color: activeTab === 'restaurants' ? 'white' : '#94a3b8', transition: 'all 0.2s' }}>
              🏪 Xét Duyệt Cửa Hàng
            </button>
            <button onClick={() => setActiveTab('users')} style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'users' ? '#10b981' : 'transparent', color: activeTab === 'users' ? 'white' : '#94a3b8', transition: 'all 0.2s' }}>
              👥 Quản Lý Người Dùng
            </button>
            <button onClick={() => setActiveTab('foods')} style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'foods' ? '#10b981' : 'transparent', color: activeTab === 'foods' ? 'white' : '#94a3b8', transition: 'all 0.2s' }}>
              🍔 Quản Lý Món Ăn
            </button>
            <button onClick={() => setActiveTab('orders')} style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'orders' ? '#10b981' : 'transparent', color: activeTab === 'orders' ? 'white' : '#94a3b8', transition: 'all 0.2s' }}>
              📦 Quản Lý Đơn Hàng
            </button>
          </div>
        </div>

        <div>
          <button onClick={() => navigate('/home')} style={{ width: '100%', padding: '10px', backgroundColor: '#1f2937', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px', fontWeight: '500', textAlign: 'center', transition: 'background-color 0.2s' }}>
            🏠 Về Trang Chủ Khách
          </button>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', border: '1px solid rgba(225, 29, 72, 0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center', transition: 'all 0.2s' }}>
            🚪 Đăng Xuất Admin
          </button>
        </div>
      </div>

      {/* 💻 MAIN CONTENT - NỘI DUNG CHÍNH BÊN PHẢI */}
      <div style={{ flex: 1, padding: '40px 30px', overflowY: 'auto', boxSizing: 'border-box' }}>
        
        {/* Header trên */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1f2937', paddingBottom: '15px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: '#ffffff', margin: 0, fontWeight: 'bold' }}>Hệ Thống Quản Trị Trung Tâm</h1>
            <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '14px' }}>Chào mừng trở lại, Tổng quản trị TasteByte.</p>
          </div>
        </div>

        {/* Khối hiển thị lỗi tập trung nếu Backend gặp sự cố */}
        {errorMsg && (
          <div style={{ padding: '15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', marginBottom: '25px', fontSize: '14px', fontWeight: '500' }}>
            ⚠️ Lỗi đồng bộ: {errorMsg}. Vui lòng kiểm tra lại kết nối Terminal của Node.js Backend!
          </div>
        )}

        {loading && <div style={{ color: '#10b981', fontWeight: 'bold', marginBottom: '20px' }}>⏳ Đang tải tài nguyên thời gian thực từ cơ sở dữ liệu MongoDB...</div>}

        {/* ================= TAB 1: TỔNG QUAN HỆ THỐNG ================= */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#94a3b8' }}>💰 DOANH THU THỰC TẾ (CHƯA TÍNH HUỶ)</span>
                <h2 style={{ fontSize: '28px', color: '#10b981', margin: '10px 0 0 0', fontWeight: '800' }}>
                  {orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.totalPrice || 0), 0).toLocaleString('vi-VN')}đ
                </h2>
              </div>
              <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#94a3b8' }}>📦 ĐƠN HÀNG HOÀN THÀNH</span>
                <h2 style={{ fontSize: '28px', color: '#ffffff', margin: '10px 0 0 0', fontWeight: '800' }}>{activeOrdersCount} đơn</h2>
              </div>
              <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#94a3b8' }}>👥 TÀI KHOẢN THÀNH VIÊN</span>
                <h2 style={{ fontSize: '28px', color: '#ffffff', margin: '10px 0 0 0', fontWeight: '800' }}>{totalUsersCount} người</h2>
              </div>
              <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#e11d48' }}>⚠️ TÀI KHOẢN ĐANG BỊ KHÓA</span>
                <h2 style={{ fontSize: '28px', color: '#e11d48', margin: '10px 0 0 0', fontWeight: '800' }}>{bannedUsersCount} tài khoản</h2>
              </div>
            </div>

            <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#ffffff', fontWeight: '600' }}>📈 Quy chế giám sát Middleware</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
                Hệ thống vận hành ổn định. Điểm uy tín mặc định ban đầu của mỗi khách hàng khi đăng ký tài khoản là **100 điểm**. 
                Nếu khách hàng tiến hành bùng đơn hoặc hủy đơn hàng vô căn cứ, Admin đổi trạng thái đơn sang <span style={{ color: '#e11d48', fontWeight: '600' }}>Canceled (Đã hủy)</span>, 
                hệ thống sẽ ngay lập tức tự động khấu trừ điểm uy tín cá nhân. Khi điểm chạm mốc dưới **30 điểm**, tài khoản sẽ tự động chuyển sang danh sách đen nguy cơ cao.
              </p>
            </div>
          </div>
        )}

        {/* ================= TAB 2: XÉT DUYỆT CỬA HÀNG ================= */}
        {activeTab === 'restaurants' && (
          <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#ffffff', fontWeight: '600' }}>🏪 Xét Duyệt Đăng Ký Cửa Hàng</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Duyệt hoặc từ chối hồ sơ đăng ký hợp tác làm chủ cửa hàng trên TasteByte.</p>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0b0f19' }}>
                    <th style={tableThStyle}>Tên Cửa Hàng</th>
                    <th style={tableThStyle}>Chủ Hộ / Email</th>
                    <th style={tableThStyle}>Địa Chỉ</th>
                    <th style={tableThStyle}>Giấy Phép KD</th>
                    <th style={tableThStyle}>Ảnh VSATTP / Đại Diện</th>
                    <th style={tableThStyle}>Trạng Thái</th>
                    <th style={tableThStyle}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', borderBottom: '1px solid #1f2937' }}>Không tìm thấy hồ sơ đăng ký cửa hàng nào.</td></tr>
                  ) : (
                    restaurants.map((rest) => (
                      <tr key={rest._id}>
                        <td style={tableTdStyle}><b>{rest.store_name}</b></td>
                        <td style={tableTdStyle}>
                          <div><b>{rest.merchant_name}</b></div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>{rest.owner_id?.email}</div>
                        </td>
                        <td style={tableTdStyle}>{rest.address}</td>
                        <td style={tableTdStyle}>
                          <a href={rest.license_image} target="_blank" rel="noreferrer">
                            <img src={rest.license_image || 'https://via.placeholder.com/50'} alt="license" style={{ width: '50px', height: '40px', borderRadius: '4px', objectFit: 'cover', cursor: 'pointer', border: '1px solid #1f2937' }} />
                          </a>
                        </td>
                        <td style={tableTdStyle}>
                          <a href={rest.hygiene_image} target="_blank" rel="noreferrer">
                            <img src={rest.hygiene_image || 'https://via.placeholder.com/50'} alt="hygiene" style={{ width: '50px', height: '40px', borderRadius: '4px', objectFit: 'cover', cursor: 'pointer', border: '1px solid #1f2937' }} />
                          </a>
                        </td>
                        <td style={tableTdStyle}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                            backgroundColor: rest.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : rest.status === 'pending' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(225, 29, 72, 0.1)',
                            color: rest.status === 'approved' ? '#10b981' : rest.status === 'pending' ? '#f59e0b' : '#e11d48'
                          }}>
                            {rest.status === 'pending' ? '⌛ Chờ duyệt' : rest.status === 'approved' ? '✓ Đã duyệt' : '✕ Từ chối'}
                          </span>
                        </td>
                        <td style={tableTdStyle}>
                          {rest.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => handleApproveRestaurant(rest._id, 'approved')}
                                style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#10b981', color: 'white', transition: 'all 0.2s' }}
                              >
                                ✓ Duyệt
                              </button>
                              <button 
                                onClick={() => handleApproveRestaurant(rest._id, 'rejected')}
                                style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: 'rgba(225, 29, 72, 0.15)', color: '#e11d48', transition: 'all 0.2s' }}
                              >
                                ✕ Từ chối
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: QUẢN LÝ NGƯỜI DÙNG & ĐIỂM UY TÍN ================= */}
        {activeTab === 'users' && (
          <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#ffffff', fontWeight: '600' }}>👥 Danh sách Thành viên & Điểm uy tín</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Theo dõi điểm uy tín thưởng/phạt và khóa các tài khoản vi phạm chính sách TasteByte.</p>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0b0f19' }}>
                    <th style={tableThStyle}>Họ và Tên</th>
                    <th style={tableThStyle}>Email</th>
                    <th style={tableThStyle}>Số Điện Thoại</th>
                    <th style={tableThStyle}>Quyền (Role)</th>
                    <th style={tableThStyle}>Điểm Uy Tín</th>
                    <th style={tableThStyle}>Trạng Thái</th>
                    <th style={tableThStyle}>Thao Tác Hành Vi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', borderBottom: '1px solid #1f2937' }}>Không tìm thấy người dùng nào trong cơ sở dữ liệu.</td></tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id}>
                        <td style={tableTdStyle}><b>{user.full_name}</b></td>
                        <td style={tableTdStyle}>{user.email}</td>
                        <td style={tableTdStyle}>{user.phone}</td>
                        <td style={tableTdStyle}>
                          <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '8px', fontWeight: 'bold', backgroundColor: user.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : user.role === 'merchant' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.1)', color: user.role === 'admin' ? '#ef4444' : user.role === 'merchant' ? '#10b981' : '#94a3b8' }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={tableTdStyle}>
                          <span style={{ fontWeight: 'bold', color: user.credit_score < 50 ? '#e11d48' : '#10b981', backgroundColor: user.credit_score < 50 ? 'rgba(225, 29, 72, 0.1)' : 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                            {user.credit_score ?? 100} điểm
                          </span>
                        </td>
                        <td style={tableTdStyle}>
                          <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold', backgroundColor: user.status === 'banned' ? 'rgba(225, 29, 72, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: user.status === 'banned' ? '#e11d48' : '#10b981' }}>
                            {user.status === 'banned' ? 'Đã Khóa 🚫' : 'Hoạt Động 🟢'}
                          </span>
                        </td>
                        <td style={tableTdStyle}>
                          <button 
                            onClick={() => handleToggleBlockUser(user._id, user.status)}
                            style={{ padding: '6px 12px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', backgroundColor: user.status === 'banned' ? '#10b981' : 'rgba(225, 29, 72, 0.15)', color: user.status === 'banned' ? 'white' : '#e11d48', transition: 'all 0.2s' }}
                          >
                            {user.status === 'banned' ? '🔓 Mở Khóa' : '🔒 Khóa Tài Khoản'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: QUẢN LÝ MÓN ĂN (PHÊ DUYỆT & GỠ BỎ) ================= */}
        {activeTab === 'foods' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Bảng Danh Sách Món Ăn */}
            <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#ffffff', fontWeight: '600' }}>🍔 Quản lý danh mục thực đơn và Phê duyệt</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Admin không được quyền thêm món ăn, chỉ có quyền xóa món ăn hệ thống và xét duyệt món ăn do chủ cửa hàng (merchant) đăng lên.</p>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0b0f19' }}>
                      <th style={tableThStyle}>Hình ảnh</th>
                      <th style={tableThStyle}>Tên Món Ăn</th>
                      <th style={tableThStyle}>Danh Mục</th>
                      <th style={tableThStyle}>Giá Bán</th>
                      <th style={tableThStyle}>Cửa Hàng</th>
                      <th style={tableThStyle}>Trạng Thái</th>
                      <th style={tableThStyle}>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.length === 0 ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', borderBottom: '1px solid #1f2937' }}>Chưa có món ăn nào trong database.</td></tr>
                    ) : (
                      foods.map((food) => (
                        <tr key={food._id}>
                          <td style={tableTdStyle}><img src={food.image || 'https://via.placeholder.com/50'} alt="food" style={{ width: '50px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} /></td>
                          <td style={tableTdStyle}><b>{food.name}</b></td>
                          <td style={tableTdStyle}><span style={{ backgroundColor: '#0b0f19', padding: '3px 8px', border: '1px solid #1f2937', borderRadius: '6px', fontSize: '13px', color: '#94a3b8' }}>{food.category}</span></td>
                          <td style={tableTdStyle}><span style={{ color: '#10b981', fontWeight: '600' }}>{Number(food.price).toLocaleString('vi-VN')}đ</span></td>
                          <td style={tableTdStyle}><span style={{ color: '#e2e8f0', fontSize: '13px' }}>{food.restaurant_name || 'TasteByte (Hệ thống)'}</span></td>
                          <td style={tableTdStyle}>
                            <span style={{ 
                              padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                              backgroundColor: food.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : food.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(225, 29, 72, 0.1)',
                              color: food.status === 'approved' ? '#10b981' : food.status === 'pending' ? '#f59e0b' : '#e11d48'
                            }}>
                              {food.status === 'pending' ? '⌛ Chờ duyệt' : food.status === 'approved' ? '✓ Đã duyệt' : '✕ Từ chối'}
                            </span>
                          </td>
                          <td style={tableTdStyle}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {food.status === 'pending' && (
                                <button onClick={() => handleApproveFood(food._id, 'approved')} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                                  ✓ Duyệt món
                                </button>
                              )}
                              <button onClick={() => handleDeleteFood(food._id)} style={{ padding: '6px 12px', backgroundColor: 'rgba(225, 29, 72, 0.15)', color: '#e11d48', border: '1px solid rgba(225, 29, 72, 0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}>
                                🗑️ Xóa món
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: QUẢN LÝ ĐƠN HÀNG & DUYỆT TRẠNG THÁI ================= */}
        {activeTab === 'orders' && (
          <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h3 style={{ margin: '0 0 6px 0', color: '#ffffff', fontWeight: '600' }}>📦 Quản lý dòng vận đơn giao hàng</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Kiểm duyệt trạng thái luồng vận chuyển thức ăn. Nếu khách hàng cố tình bùng đơn, chuyển sang trạng thái Canceled để kích hoạt trừ điểm uy tín.</p>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0b0f19' }}>
                    <th style={tableThStyle}>Mã Đơn</th>
                    <th style={tableThStyle}>Khách Hàng (Email)</th>
                    <th style={tableThStyle}>Tổng Tiền</th>
                    <th style={tableThStyle}>Địa Chỉ Giao Nhận</th>
                    <th style={tableThStyle}>Trạng Thái</th>
                    <th style={tableThStyle}>Cập Nhật Vận Đơn</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', borderBottom: '1px solid #1f2937' }}>Hệ thống chưa phát sinh bất kỳ đơn đặt hàng nào.</td></tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id}>
                        <td style={tableTdStyle}><code style={{ color: '#ffffff', fontWeight: 'bold' }}>#{order._id?.substring(18)}</code></td>
                        <td style={tableTdStyle}>{order.user_id?.email || 'Ẩn danh'}</td>
                        <td style={tableTdStyle}><span style={{ color: '#10b981', fontWeight: '700' }}>{order.totalPrice?.toLocaleString('vi-VN')}đ</span></td>
                        <td style={tableTdStyle}><span style={{ fontSize: '13px', color: '#94a3b8' }}>{order.address || 'Tại quầy cửa hàng'}</span></td>
                        <td style={tableTdStyle}>
                          <span style={{ 
                            padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                            backgroundColor: order.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : order.status === 'pending' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(225, 29, 72, 0.1)',
                            color: order.status === 'completed' ? '#10b981' : order.status === 'pending' ? '#f59e0b' : '#e11d48'
                          }}>
                            {order.status === 'pending' ? '⌛ Chờ duyệt' : order.status === 'completed' ? '✓ Thành công' : '✕ Đã hủy'}
                          </span>
                        </td>
                        <td style={tableTdStyle}>
                          <select 
                            value={order.status} 
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            style={{ padding: '6px', borderRadius: '6px', border: '1px solid #1f2937', fontSize: '13px', backgroundColor: '#0b0f19', color: '#ffffff', cursor: 'pointer', outline: 'none' }}
                          >
                            <option value="pending" style={{ backgroundColor: '#0b0f19' }}>⌛ Chờ xử lý</option>
                            <option value="completed" style={{ backgroundColor: '#0b0f19' }}>✓ Đã giao hàng</option>
                            <option value="cancelled" style={{ backgroundColor: '#0b0f19' }}>❌ Hủy / Bùng hàng (Trừ uy tín)</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;