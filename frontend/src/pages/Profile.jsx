import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
// 🌟 IMPORT HÀM API ĐỔI MẬT KHẨU & LỊCH SỬ ĐƠN HÀNG TỪ SERVICES
import { changePasswordAPI, getMyOrdersAPI, getProfileAPI } from '../services/api';

const Profile = ({ openPendingModal }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Quản lý Tab hiện tại của Sidebar
  const [currentTab, setCurrentTab] = useState(() => {
    return location.state?.tab || 'profile';
  });

  // Tab lọc trạng thái đơn hàng (giống Shopee)
  const [orderStatusTab, setOrderStatusTab] = useState('all');

  // State thông tin người dùng
  const [username, setUsername] = useState(localStorage.getItem('userEmail')?.split('@')[0] || 'duyquang536');
  const [fullName, setFullName] = useState('Nguyễn Duy Quang');
  const [email, setEmail] = useState(localStorage.getItem('userEmail') || 'duyquang536@gmail.com');
  const [phone, setPhone] = useState('0987654321');
  const [gender, setGender] = useState('Nam');
  const [creditScore, setCreditScore] = useState(100);
  
  const [birthDay, setBirthDay] = useState('27');
  const [birthMonth, setBirthMonth] = useState('05');
  const [birthYear, setBirthYear] = useState('2000');

  // Tải thông tin hồ sơ và điểm uy tín từ database khi load trang
  useEffect(() => {
    getProfileAPI()
      .then(res => {
        if (res.data.status === 'success') {
          const user = res.data.data;
          setFullName(user.full_name || '');
          setEmail(user.email || '');
          setUsername(user.email?.split('@')[0] || '');
          setPhone(user.phone || '');
          setCreditScore(user.credit_score ?? 100);
        }
      })
      .catch(err => {
        console.error("Lỗi khi tải thông tin cá nhân:", err);
      });
  }, []);

  // 🌟 CÁC STATE MỚI: QUẢN LÝ FORM ĐỔI MẬT KHẨU
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [toastMessage, setToastMessage] = useState('Cập nhật hồ sơ tài khoản thành công!');

  // State quản lý Toast Box thông báo thành công & Modal bảo trì
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // 🌟 STATE LỊCH SỬ ĐƠN HÀNG
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // Modal xem chi tiết đơn

  // Auto ẩn Toast sau 3 giây
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // 🌟 TẢI LỊCH SỬ ĐƠN HÀNG KHI CHUYỂN SANG TAB ORDERS
  useEffect(() => {
    if (currentTab === 'orders') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrdersLoading(true);
      getMyOrdersAPI()
        .then(res => {
          setOrders(res.data.orders || []);
        })
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [currentTab]);

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const years = Array.from({ length: 100 }, (_, i) => String(2026 - i));

  const handleSave = (e) => {
    e.preventDefault();
    setToastMessage('Cập nhật hồ sơ tài khoản thành công!');
    setShowToast(true); // Bật hộp thông báo thành công (Box) thay cho alert()
  };

  // 🌟 HÀM XỬ LÝ SỰ KIỆN GỬI FORM ĐỔI MẬT KHẨU LÊN BACKEND
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError(''); // Khởi tạo lại trạng thái trống lỗi trước khi kiểm tra

    // Ràng buộc 1: Kiểm tra mật khẩu khớp nhau ở client trước
    if (newPassword !== confirmPassword) {
      setPwdError('Xác nhận mật khẩu mới không trùng khớp!');
      return;
    }

    // Ràng buộc 2: Mật khẩu tối thiểu 8 ký tự đồng bộ bộ lọc validateRegisterInput ở Routes
    if (newPassword.length < 8) {
      setPwdError('Mật khẩu mới phải có độ dài tối thiểu từ 8 ký tự trở lên!');
      return;
    }

    try {
      // Tiến hành gọi API bằng cấu trúc Axios đã dựng sẵn
      const response = await changePasswordAPI({ oldPassword, newPassword });
      
      if (response.data.status === 'success') {
        setToastMessage('🔒 Cập nhật đổi mật khẩu tài khoản thành công!');
        setShowToast(true);
        
        // Làm sạch toàn bộ các ô nhập dữ liệu
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      // Đọc thông báo trả về từ Backend (nếu có lỗi như mật khẩu cũ nhập sai, trùng mật khẩu cũ...)
      setPwdError(err.response?.data?.message || 'Đã xảy ra lỗi hệ thống khi đổi mật khẩu!');
    }
  };

  const formatEmail = (str) => {
    const [name, domain] = str.split('@');
    if (name.length <= 2) return str;
    return `${name.substring(0, 2)}******@${domain}`;
  };

  // Kiểu dáng Menu Sidebar chung
  const getSideItemStyle = (tabName) => ({
    padding: '12px 16px',
    fontSize: '14px',
    color: currentTab === tabName ? '#10b981' : '#94a3b8',
    backgroundColor: currentTab === tabName ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
    fontWeight: currentTab === tabName ? '600' : '500',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'block',
    transition: 'all 0.2s',
    marginBottom: '4px'
  });

  const formLabelStyle = {
    width: '25%',
    textAlign: 'right',
    color: '#94a3b8',
    fontSize: '14px',
    paddingRight: '20px',
    fontWeight: '500'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0b0f19',
    border: '1px solid #1f2937',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', width: '100%', color: '#ffffff', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
      <Navbar cart={[]} isLoggedIn={true} openPendingModal={openPendingModal} />

      {/* ================= TOAST BOX THÔNG BÁO THÀNH CÔNG (GÓC MÀN HÌNH) ================= */}
      {showToast && (
        <div style={{ position: 'fixed', top: '90px', right: '30px', backgroundColor: '#111827', borderLeft: '4px solid #10b981', borderTop: '1px solid #1f2937', borderRight: '1px solid #1f2937', borderBottom: '1px solid #1f2937', padding: '16px 24px', borderRadius: '0 8px 8px 0', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 10001, display: 'flex', alignItems: 'center', gap: '12px', animation: 'slideIn 0.3s ease' }}>
          <span style={{ color: '#10b981', fontSize: '20px' }}>✓</span>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>{toastMessage}</span>
        </div>
      )}

      {/* THÂN TRANG PROFILE */}
      <div style={{ maxWidth: '1200px', margin: '30px auto', display: 'flex', gap: '30px', padding: '0 15px' }}>
        
        {/* ================= CỘT TRÁI: SIDEBAR MENU ================= */}
        <div style={{ width: '240px', flexShrink: 0, backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '18px', borderBottom: '1px solid #1f2937' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{username}</div>
              <div style={{ fontSize: '12px', color: '#10b981', cursor: 'pointer', marginTop: '2px' }} onClick={() => setCurrentTab('profile')}>✏️ Sửa Hồ Sơ</div>
              <div style={{ fontSize: '11px', color: creditScore < 50 ? '#ef4444' : '#10b981', fontWeight: 'bold', marginTop: '4px' }}>🛡️ Uy tín: {creditScore}đ</div>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', color: '#94a3b8', marginBottom: '12px', paddingLeft: '8px' }}>
              <span>👤 Hồ sơ cá nhân</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span 
                style={getSideItemStyle('profile')} 
                onClick={() => setCurrentTab('profile')}
                onMouseOver={(e) => { if(currentTab !== 'profile') e.target.style.color = '#10b981'; }} 
                onMouseOut={(e) => { if(currentTab !== 'profile') e.target.style.color = '#94a3b8'; }}
              >Hồ Sơ</span>
              
              <span 
                style={getSideItemStyle('orders')} 
                onClick={() => setCurrentTab('orders')}
                onMouseOver={(e) => { if(currentTab !== 'orders') e.target.style.color = '#10b981'; }} 
                onMouseOut={(e) => { if(currentTab !== 'orders') e.target.style.color = '#94a3b8'; }}
              >🛒 Đơn Hàng Của Tôi</span>

              <span 
                style={getSideItemStyle('bank')} 
                onClick={() => setCurrentTab('bank')}
                onMouseOver={(e) => { if(currentTab !== 'bank') e.target.style.color = '#10b981'; }} 
                onMouseOut={(e) => { if(currentTab !== 'bank') e.target.style.color = '#94a3b8'; }}
              >Ngân Hàng</span>
              
              <span 
                style={getSideItemStyle('address')} 
                onClick={() => setCurrentTab('address')}
                onMouseOver={(e) => { if(currentTab !== 'address') e.target.style.color = '#10b981'; }} 
                onMouseOut={(e) => { if(currentTab !== 'address') e.target.style.color = '#94a3b8'; }}
              >Địa Chỉ</span>
              
              <span 
                style={getSideItemStyle('password')} 
                onClick={() => setCurrentTab('password')}
                onMouseOver={(e) => { if(currentTab !== 'password') e.target.style.color = '#10b981'; }} 
                onMouseOut={(e) => { if(currentTab !== 'password') e.target.style.color = '#94a3b8'; }}
              >Đổi Mật Khẩu</span>
              
              <span 
                style={getSideItemStyle('notifications')} 
                onClick={() => setCurrentTab('notifications')}
                onMouseOver={(e) => { if(currentTab !== 'notifications') e.target.style.color = '#10b981'; }} 
                onMouseOut={(e) => { if(currentTab !== 'notifications') e.target.style.color = '#94a3b8'; }}
              >Cài Đặt Thông Báo</span>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: KHUNG CHI TIẾT THEO TAB ================= */}
        <div style={{ flex: 1, backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '35px', boxSizing: 'border-box', minHeight: '550px' }}>
          
          {/* TAB 1: HỒ SƠ CHÍNH */}
          {currentTab === 'profile' && (
            <div>
              <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '18px', marginBottom: '35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>Hồ Sơ Của Tôi</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                </div>
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '8px', padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Điểm Uy Tín</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: creditScore < 50 ? '#ef4444' : '#00e676' }}>{creditScore} / 100</span>
                </div>
              </div>

              <div style={{ display: 'flex', width: '100%', gap: '40px' }}>
                {/* FORM TRÁI */}
                <form onSubmit={handleSave} style={{ width: '65%', display: 'flex', flexDirection: 'column', gap: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={formLabelStyle}>Tên đăng nhập</div>
                    <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>{username}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={formLabelStyle}>Tên</div>
                    <div style={{ flex: 1 }}>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#1f2937'} required />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={formLabelStyle}>Email</div>
                    <div style={{ fontSize: '14px', color: '#ffffff', display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <span>{formatEmail(email)}</span>
                      <span style={{ color: '#10b981', textDecoration: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }} onClick={() => setShowModal(true)}>Thay đổi</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={formLabelStyle}>Số điện thoại</div>
                    <div style={{ flex: 1 }}>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#1f2937'} required />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={formLabelStyle}>Giới tính</div>
                    <div style={{ display: 'flex', gap: '25px', fontSize: '14px', color: '#ffffff' }}>
                      {['Nam', 'Nữ', 'Khác'].map((g) => (
                        <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} style={{ accentColor: '#10b981', cursor: 'pointer', transform: 'scale(1.1)' }} /> {g}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={formLabelStyle}>Ngày sinh</div>
                    <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                      <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} style={{ ...inputStyle, width: '30%', cursor: 'pointer' }}>
                        {days.map(d => <option key={d} value={d} style={{backgroundColor: '#111827'}}>Ngày {d}</option>)}
                      </select>
                      <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} style={{ ...inputStyle, width: '30%', cursor: 'pointer' }}>
                        {months.map(m => <option key={m} value={m} style={{backgroundColor: '#111827'}}>Tháng {m}</option>)}
                      </select>
                      <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} style={{ ...inputStyle, width: '40%', cursor: 'pointer' }}>
                        {years.map(y => <option key={y} value={y} style={{backgroundColor: '#111827'}}>Năm {y}</option>)}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px' }}>
                    <div style={formLabelStyle}></div>
                    <button type="submit" style={{ padding: '12px 40px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }} onMouseOver={(e) => e.target.style.backgroundColor = '#059669'} onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}>
                      Lưu thay đổi
                    </button>
                  </div>
                </form>

                <div style={{ width: '1px', backgroundColor: '#1f2937' }}></div>

                {/* AVATAR PHẢI */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '20px' }}>
                  <div style={{ width: '110px', height: '110px', borderRadius: '50%', backgroundColor: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', color: '#94a3b8', border: '2px dashed #374151', marginBottom: '20px' }}>
                    👤
                  </div>
                  <button type="button" onClick={() => setShowModal(true)} style={{ padding: '8px 18px', backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #374151', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.color = '#10b981'; }} onMouseOut={(e) => { e.target.style.borderColor = '#374151'; e.target.style.color = '#ffffff'; }}>
                    Chọn Ảnh
                  </button>
                  <div style={{ marginTop: '15px', fontSize: '13px', color: '#94a3b8', textAlign: 'center', lineHeight: '1.6' }}>
                    Dung lượng file tối đa 1 MB<br />Định dạng: .JPEG, .PNG
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🌟 TAB ĐƠN HÀNG CỦA TÔI — GIAO DIỆN KIỂU SHOPEE */}
          {currentTab === 'orders' && (() => {
            // ===== CẤU HÌNH 7 TAB TRẠNG THÁI =====
            const ORDER_STATUS_TABS = [
              { key: 'all',       label: 'Tất cả' },
              { key: 'pending',   label: 'Chờ thanh toán' },
              { key: 'shipping',  label: 'Vận chuyển' },
              { key: 'delivering',label: 'Chờ giao hàng' },
              { key: 'completed', label: 'Hoàn thành' },
              { key: 'cancelled', label: 'Đã hủy' },
              { key: 'refund',    label: 'Trả hàng/Hoàn tiền' },
            ];

            // Map trạng thái backend → tab key
            const statusToTab = {
              pending:    'pending',
              processing: 'shipping',
              shipping:   'delivering',
              completed:  'completed',
              cancelled:  'cancelled',
              refund:     'refund',
            };

            const statusConfig = {
              pending:    { label: 'Chờ thanh toán', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', dot: '#f59e0b' },
              processing: { label: 'Vận chuyển',     color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  dot: '#3b82f6' },
              shipping:   { label: 'Chờ giao hàng',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', dot: '#8b5cf6' },
              completed:  { label: 'Hoàn thành',     color: '#10b981', bg: 'rgba(16,185,129,0.12)', dot: '#10b981' },
              cancelled:  { label: 'Đã hủy',         color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  dot: '#ef4444' },
              refund:     { label: 'Trả hàng/Hoàn tiền', color: '#f97316', bg: 'rgba(249,115,22,0.12)', dot: '#f97316' },
            };

            // Lọc đơn hàng theo tab đang chọn
            const filteredOrders = orderStatusTab === 'all'
              ? orders
              : orders.filter(o => statusToTab[o.status] === orderStatusTab || o.status === orderStatusTab);

            // Empty state illustration placeholder
            const emptyIllustration = (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '110px', height: '110px', borderRadius: '50%', backgroundColor: 'rgba(148,163,184,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '52px' }}>📋</span>
                  </div>
                  <div style={{ position: 'absolute', top: '8px', right: '8px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                  <div style={{ position: 'absolute', bottom: '12px', left: '6px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                </div>
                <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>
                  Bạn hiện không có {orderStatusTab === 'all' ? 'đơn hàng' : `yêu cầu "${ORDER_STATUS_TABS.find(t => t.key === orderStatusTab)?.label}"`} nào
                </p>
                {orderStatusTab === 'all' && (
                  <button
                    onClick={() => navigate('/home')}
                    style={{ marginTop: '20px', padding: '10px 28px', backgroundColor: '#f97316', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}
                  >Đặt Món Ngay</button>
                )}
              </div>
            );

            return (
              <div style={{ margin: '-35px', minHeight: '550px' }}>

                {/* ===== THANH TAB TRẠNG THÁI ===== */}
                <div style={{ display: 'flex', borderBottom: '1px solid #1f2937', backgroundColor: '#111827', borderRadius: '12px 12px 0 0', overflowX: 'auto' }}>
                  {ORDER_STATUS_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setOrderStatusTab(tab.key)}
                      style={{
                        padding: '16px 18px',
                        fontSize: '13px',
                        fontWeight: orderStatusTab === tab.key ? '600' : '400',
                        color: orderStatusTab === tab.key ? '#f97316' : '#94a3b8',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderBottom: orderStatusTab === tab.key ? '2px solid #f97316' : '2px solid transparent',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                        letterSpacing: '0.01em',
                      }}
                      onMouseOver={e => { if (orderStatusTab !== tab.key) e.currentTarget.style.color = '#e2e8f0'; }}
                      onMouseOut={e => { if (orderStatusTab !== tab.key) e.currentTarget.style.color = '#94a3b8'; }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* ===== NỘI DUNG ===== */}
                <div style={{ padding: '20px 24px' }}>
                  {ordersLoading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                      <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid #1f2937', borderTop: '3px solid #f97316', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }} />
                      <p style={{ margin: 0, fontSize: '14px' }}>Đang tải đơn hàng...</p>
                    </div>
                  ) : filteredOrders.length === 0 ? emptyIllustration : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {filteredOrders.map(order => {
                        const cfg = statusConfig[order.status] || statusConfig.pending;
                        const shortId = order._id?.slice(-12).toUpperCase();
                        const date = new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                        const storeName = order.store_id?.display_name || order.store_id?.store_name || 'TasteByte Store';
                        const firstItem = order.items?.[0];
                        const extraCount = (order.items?.length || 1) - 1;

                        return (
                          <div
                            key={order._id}
                            style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1f2937'; e.currentTarget.style.boxShadow = 'none'; }}
                          >
                            {/* Header card: tên quán + badge trạng thái */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #1f2937' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🏪</div>
                                <span style={{ fontWeight: '600', fontSize: '14px', color: '#ffffff' }}>{storeName}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: cfg.dot }} />
                                <span style={{ fontSize: '13px', color: cfg.color, fontWeight: '600' }}>{cfg.label.toUpperCase()}</span>
                              </div>
                            </div>

                            {/* Body: danh sách món */}
                            <div style={{ padding: '14px 16px' }}>
                              {firstItem && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: extraCount > 0 ? '10px' : 0 }}>
                                  <div style={{ width: '64px', height: '64px', borderRadius: '8px', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>🍽️</div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', marginBottom: '4px' }}>{firstItem.name || 'Món ăn'}</div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>x{firstItem.quantity} · {(firstItem.price || 0).toLocaleString()}đ/món</div>
                                  </div>
                                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#00e676' }}>{((firstItem.quantity || 1) * (firstItem.price || 0)).toLocaleString()}đ</div>
                                </div>
                              )}
                              {extraCount > 0 && (
                                <div style={{ fontSize: '12px', color: '#94a3b8', paddingLeft: '78px', marginBottom: '6px' }}>+{extraCount} sản phẩm khác</div>
                              )}
                            </div>

                            {/* Footer: tổng tiền + actions */}
                            <div style={{ borderTop: '1px solid #1f2937', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>📅 {date} · <span style={{ fontFamily: 'monospace', color: '#475569' }}>#{shortId}</span></div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Thành tiền</div>
                                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#f97316' }}>{(order.total_price || 0).toLocaleString()}đ</div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => navigate('/home')}
                                    style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid #374151', color: '#94a3b8', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'all 0.2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.color = '#94a3b8'; }}
                                  >Mua lại</button>
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    style={{ padding: '8px 16px', backgroundColor: '#f97316', border: 'none', color: '#ffffff', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(249,115,22,0.3)' }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ea6c00'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f97316'}
                                  >Xem chi tiết</button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* TAB 2: NGÂN HÀNG */}
          {currentTab === 'bank' && (
            <div>
              <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '18px', marginBottom: '35px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>Thẻ Ngân Hàng / Ví Liên Kết</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Quản lý tài khoản ngân hàng nhận tiền của bạn</p>
              </div>
              <div style={{ padding: '40px', border: '1px dashed #374151', borderRadius: '8px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>💳</div>
                <p style={{ fontSize: '14px', margin: '0 0 20px 0' }}>Bạn chưa liên kết tài khoản ngân hàng nào.</p>
                <button type="button" onClick={() => setShowModal(true)} style={{ padding: '10px 25px', backgroundColor: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                  + Thêm Tài Khoản Ngân Hàng
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ĐỊA CHỈ */}
          {currentTab === 'address' && (
            <div>
              <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '18px', marginBottom: '35px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>Địa Chỉ Của Tôi</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Quản lý địa chỉ giao hàng và nhận hàng</p>
              </div>
              <div style={{ padding: '40px', border: '1px dashed #374151', borderRadius: '8px', textAlign: 'center', color: '#94a3b8' }}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>📍</div>
                <p style={{ fontSize: '14px', margin: '0 0 20px 0' }}>Bạn chưa cấu hình địa chỉ mặc định.</p>
                <button type="button" onClick={() => setShowModal(true)} style={{ padding: '10px 25px', backgroundColor: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
                  + Thêm Địa Chỉ Mới
                </button>
              </div>
            </div>
          )}

          {/* 🌟 TAB 4: ĐỔI MẬT KHẨU (ĐÃ ĐƯỢC ĐỘNG HÓA LOGIC KẾT NỐI API) */}
          {currentTab === 'password' && (
            <div>
              <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '18px', marginBottom: '35px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>Đổi Mật Khẩu</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người khác</p>
              </div>
              
              {/* Thêm xử lý sự kiện onSubmit */}
              <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Giao diện Alert thông báo lỗi linh hoạt */}
                {pwdError && (
                  <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⚠️ {pwdError}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '14px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Mật khẩu hiện tại</label>
                  <input type="password" style={inputStyle} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Nhập mật khẩu hiện tại" required />
                </div>
                <div>
                  <label style={{ fontSize: '14px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Mật khẩu mới</label>
                  <input type="password" style={inputStyle} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nhập mật khẩu mới" required />
                </div>
                <div>
                  <label style={{ fontSize: '14px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>Xác nhận mật khẩu mới</label>
                  <input type="password" style={inputStyle} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Xác nhận mật khẩu mới" required />
                </div>
                <button type="submit" style={{ padding: '12px 30px', backgroundColor: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', width: 'fit-content', marginTop: '10px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                  Xác nhận thay đổi
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: CÀI ĐẶT THÔNG BÁO */}
          {currentTab === 'notifications' && (
            <div>
              <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '18px', marginBottom: '35px' }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>Cài Đặt Thông Báo</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Cấu hình các kênh nhận thông báo hệ thống</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#10b981', transform: 'scale(1.2)' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Thông báo Email</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Cập nhật đơn hàng, khuyến mãi từ TasteByte qua Email.</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#10b981', transform: 'scale(1.2)' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Thông báo SMS / Đẩy ứng dụng</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Nhận mã OTP và trạng thái tài xế theo thời gian thực.</div>
                  </div>
                </label>
                <button type="button" onClick={() => { setToastMessage('Cập nhật cấu hình nhận thông báo thành công!'); setShowToast(true); }} style={{ padding: '12px 30px', backgroundColor: '#10b981', border: 'none', color: '#fff', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', width: 'fit-content', marginTop: '15px' }}>
                  Lưu thiết lập
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL HỆ THỐNG */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '45px', marginBottom: '10px' }}>⚙️</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#10b981', fontWeight: '600' }}>Thông Báo Hệ Thống</h3>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', margin: '0 0 25px 0' }}>
              Tính năng thay đổi/tải lên tệp tin trực tuyến đang được cập nhật, vui lòng quay lại sau!
            </p>
            <button 
              onClick={() => setShowModal(false)}
              style={{ padding: '10px 40px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}

      {/* 🌟 MODAL CHI TIẾT ĐƠN HÀNG */}
      {selectedOrder && (() => {
        const statusConfig = {
          pending:   { label: '⌛ Chờ duyệt',   color: '#f59e0b' },
          processing:{ label: '📦 Đang xử lý', color: '#3b82f6' },
          shipping:  { label: '🛵 Đang giao',  color: '#8b5cf6' },
          completed: { label: '✅ Đã giao',     color: '#10b981' },
          cancelled: { label: '❌ Đã hủy',      color: '#ef4444' },
        };
        const cfg = statusConfig[selectedOrder.status] || statusConfig.pending;
        const date = new Date(selectedOrder.createdAt).toLocaleString('vi-VN');
        return (
          <div
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10002 }}
            onClick={() => setSelectedOrder(null)}
          >
            <div
              style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '30px', maxWidth: '520px', width: '90%', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', maxHeight: '85vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '18px' }}>Chi Tiết Đơn Hàng</h3>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>#{selectedOrder._id?.slice(-12).toUpperCase()}</span>
                </div>
                <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>

              {/* Meta info */}
              <div style={{ backgroundColor: '#0b0f19', borderRadius: '8px', padding: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Cửa hàng</span>
                  <span style={{ color: '#ffffff', fontWeight: '600' }}>{selectedOrder.store_id?.display_name || selectedOrder.store_id?.store_name || 'TasteByte Store'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Ngày đặt</span>
                  <span style={{ color: '#ffffff' }}>{date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Địa chỉ giao</span>
                  <span style={{ color: '#ffffff', textAlign: 'right', maxWidth: '60%' }}>{selectedOrder.shipping_address || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Trạng thái</span>
                  <span style={{ color: cfg.color, fontWeight: '700' }}>{cfg.label}</span>
                </div>
              </div>

              {/* Danh sách món ăn */}
              <h4 style={{ margin: '0 0 12px 0', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Danh sách món ăn</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: '#0b0f19', borderRadius: '6px' }}>
                    <div>
                      <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>{item.name || `Món #${idx+1}`}</div>
                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>x{item.quantity} × {(item.price || 0).toLocaleString()}đ</div>
                    </div>
                    <span style={{ color: '#00e676', fontWeight: '700', fontSize: '14px' }}>{((item.quantity || 1) * (item.price || 0)).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>

              {/* Tổng cộng */}
              <div style={{ borderTop: '1px solid #1f2937', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Tiền món ăn</span>
                  <span style={{ color: '#fff' }}>{(selectedOrder.subtotal || 0).toLocaleString()}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Phí giao hàng ({selectedOrder.distance_km || 0} km)</span>
                  <span style={{ color: '#fff' }}>{(selectedOrder.shipping_fee || 0).toLocaleString()}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '16px' }}>Tổng thanh toán</span>
                  <span style={{ color: '#00e676', fontWeight: '800', fontSize: '20px' }}>{(selectedOrder.total_price || 0).toLocaleString()}đ</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: '#10b981', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '15px' }}
              >Đóng</button>
            </div>
          </div>
        );
      })()}

      {/* CSS Animation cho Toast Box & Spinner */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Profile;
