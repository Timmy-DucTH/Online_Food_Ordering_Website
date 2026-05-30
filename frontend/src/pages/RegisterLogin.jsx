import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, forgotPasswordAPI } from '../services/api'; // Gọi api thật từ file cấu hình axios

const RegisterLogin = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ==========================================
  // STATE QUẢN LÝ MODAL THÔNG BÁO GIỮA MÀN HÌNH
  // ==========================================
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', type: 'success' });
  const [pendingRedirect, setPendingRedirect] = useState(null);

  // Hiệu ứng tự động chuyển hướng sau khi Modal thông báo đăng nhập hiện lên
  useEffect(() => {
    if (showModal && pendingRedirect) {
      const timer = setTimeout(() => {
        setShowModal(false);
        window.location.href = pendingRedirect;
      }, 2000); // Đợi 2 giây để người dùng kịp đọc thông báo giữa trang
      return () => clearTimeout(timer);
    }
  }, [showModal, pendingRedirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      if (isForgotPassword) {
        const res = await forgotPasswordAPI(forgotEmail);
        if (res.data.status === 'success') {
          setForgotSuccess(true);
          setModalContent({
            title: '📬 Yêu Cầu Thành Công',
            message: 'Mật khẩu tạm thời mới đã được cấp. Vui lòng check hộp thư của bạn (hoặc Console Terminal của Backend).',
            type: 'success'
          });
          setShowModal(true);
        }
      } else if (isRegister) {
        const res = await registerUser({ phone, full_name: fullName, email, password });
        if (res.data.status === 'success') {
          // Kích hoạt hiển thị thông báo giữa màn hình thay cho alert()
          setModalContent({
            title: '🎉 Đăng Ký Thành Công',
            message: 'Tài khoản của bạn đã được khởi tạo trên hệ thống TasteByte. Vui lòng tiến hành đăng nhập.',
            type: 'success'
          });
          setPendingRedirect(null); // Không tự chuyển hướng ngay để người dùng bấm nút Đóng
          setShowModal(true);

          setIsRegister(false);
          setFullName('');
          setPhone('');
        }
      } else {
        const res = await loginUser({ email, password });
        if (res.data.status === 'success') {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('role', res.data.data.role);
          localStorage.setItem('user', JSON.stringify(res.data.data));
          localStorage.setItem('userEmail', res.data.data.email);

          if (setIsLoggedIn) setIsLoggedIn(true);

          // Cài đặt nội dung hộp thông báo giữa trang
          setModalContent({
            title: '👋 Đăng Nhập Thành Công',
            message: `Chào mừng trở lại, ${res.data.data.full_name || 'Thành viên'}! Hệ thống đang chuyển hướng bạn trong giây lát...`,
            type: 'success'
          });

          // Lưu luồng phân tuyến rẽ nhánh vào hàng đợi chờ hiệu ứng hoàn tất
          if (res.data.data.role === 'admin') {
            setPendingRedirect('/admin');
          } else {
            setPendingRedirect('/home');
          }
          setShowModal(true);
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra trong quá trình xử lý!');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px',
    border: '1px solid #1f2937', 
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    outline: 'none',
    backgroundColor: '#0b0f19',
    color: '#ffffff',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0b0f19', display: 'flex', flexDirection: 'column', color: '#ffffff', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
      
      {/* 🌟 HỘP THÔNG BÁO GIỮA TRANG CHUYÊN NGHIỆP (CUSTOM POPUP MODAL) */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(3, 7, 18, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#111827', width: '400px', padding: '30px', borderRadius: '16px', border: '1px solid #1f2937', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', boxSizing: 'border-box', animation: 'fadeIn 0.3s ease-out' }}>
            <h4 style={{ fontSize: '22px', margin: '0 0 12px 0', color: '#10b981', fontWeight: '800' }}>
              {modalContent.title}
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px 0', fontWeight: '500' }}>
              {modalContent.message}
            </p>
            {!pendingRedirect && (
              <button 
                onClick={() => setShowModal(false)}
                style={{ padding: '10px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                Đóng & Tiếp Tục
              </button>
            )}
            {pendingRedirect && (
              <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '3px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            )}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ backgroundColor: '#111827', padding: '20px 0', borderBottom: '1px solid #1f2937', width: '100%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
          <h1 style={{ color: '#10b981', margin: 0, cursor: 'pointer', fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }} onClick={() => navigate('/home')}>
            TasteByte <span style={{ fontSize: '20px' }}>🟢</span>
          </h1>
          <span style={{ fontSize: '20px', color: '#1f2937', margin: '0 15px' }}>|</span>
          <span style={{ fontSize: '18px', color: '#ffffff', fontWeight: 'bold' }}>
            {isRegister ? 'Đăng Ký Thành Viên' : 'Đăng Nhập Hệ Thống'}
          </span>
        </div>
      </header>

      {/* THÂN FORM VỚI GRADIENT NỀN TỐI */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '60px 20px', backgroundImage: 'radial-gradient(circle at center, #111827 0%, #0b0f19 100%)' }}>
        
        <div style={{ backgroundColor: '#111827', width: '450px', padding: '40px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', boxSizing: 'border-box' }}>
          
          <h3 style={{ fontSize: '24px', color: '#ffffff', margin: '0 0 30px 0', fontWeight: 'bold', textAlign: 'center' }}>
            {isForgotPassword ? 'QUÊN MẬT KHẨU' : isRegister ? 'TẠO TÀI KHOẢN' : 'ĐĂNG NHẬP'}
          </h3>

          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {isForgotPassword ? (
            forgotSuccess ? (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ fontSize: '48px', margin: '10px 0' }}>📬</div>
                <h4 style={{ color: '#10b981', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>VUI LÒNG KIỂM TRA EMAIL!</h4>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                  Hệ thống đã gửi mật khẩu tạm thời mới đến email của bạn. Vui lòng check hòm thư (hoặc Terminal của Backend) và sử dụng mật khẩu đó để đăng nhập.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setForgotSuccess(false);
                    setEmail(forgotEmail);
                    setPassword('');
                    setErrorMsg('');
                  }}
                  style={{
                    width: '100%',
                    padding: '14px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                >
                  Quay lại đăng nhập
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, textAlign: 'center', lineHeight: '1.5' }}>
                  Vui lòng cung cấp email tài khoản của bạn để nhận mật khẩu tạm thời mới.
                </p>
                <input 
                  type="email" 
                  placeholder="Nhập email của bạn" 
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={inputStyle} 
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#1f2937'}
                />

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                  <button 
                    type="submit" 
                    style={{ 
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#10b981', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      fontSize: '15px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                  >
                    Gửi mật khẩu mới
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setErrorMsg('');
                    }}
                    style={{ 
                      width: '100%',
                      padding: '14px',
                      backgroundColor: 'transparent', 
                      color: '#94a3b8', 
                      border: '1px solid #1f2937', 
                      borderRadius: '8px', 
                      fontSize: '15px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.color = '#ffffff';
                      e.target.style.borderColor = '#94a3b8';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.color = '#94a3b8';
                      e.target.style.borderColor = '#1f2937';
                    }}
                  >
                    Quay lại Đăng nhập
                  </button>
                </div>
              </form>
            )
          ) : (
            <>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
                
                <input 
                  type="email" 
                  placeholder="Email / Tên đăng nhập" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle} 
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#1f2937'}
                />

                {isRegister && (
                  <>
                    <input 
                      type="text" 
                      placeholder="Họ và tên người dùng" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={inputStyle} 
                      onFocus={(e) => e.target.style.borderColor = '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = '#1f2937'}
                    />
                    <input 
                      type="tel" 
                      placeholder="Số điện thoại liên hệ" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={inputStyle} 
                      onFocus={(e) => e.target.style.borderColor = '#10b981'}
                      onBlur={(e) => e.target.style.borderColor = '#1f2937'}
                    />
                  </>
                )}

                <div style={{ width: '100%' }}>
                  <input 
                    type="password" 
                    placeholder={isRegister ? "Mật khẩu bảo mật (tối thiểu 8 ký tự)" : "Mật khẩu bảo mật"}
                    required
                    minLength={isRegister ? 8 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle} 
                    onFocus={(e) => e.target.style.borderColor = '#10b981'}
                    onBlur={(e) => e.target.style.borderColor = '#1f2937'}
                  />
                  {isRegister && (
                    <p style={{ margin: '6px 0 0 2px', fontSize: '12px', color: password.length > 0 && password.length < 8 ? '#ef4444' : '#6b7280', fontWeight: '500', transition: 'color 0.2s' }}>
                      {password.length > 0 && password.length < 8
                        ? `⚠️ Cần thêm ${8 - password.length} ký tự nữa (tối thiểu 8 ký tự)`
                        : password.length >= 8
                        ? '✅ Độ dài mật khẩu hợp lệ'
                        : '🔒 Mật khẩu phải có ít nhất 8 ký tự'}
                    </p>
                  )}
                </div>

                {/* Phần quên mật khẩu nằm dưới ô nhập mật khẩu và trên nút đăng nhập */}
                {!isRegister && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-5px' }}>
                    <span 
                      onClick={() => {
                        setIsForgotPassword(true);
                        setForgotEmail(email); // tự động điền email nếu đã nhập sẵn
                        setErrorMsg('');
                      }} 
                      style={{ color: '#10b981', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Quên mật khẩu?
                    </span>
                  </div>
                )}

                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                  <button 
                    type="submit" 
                    style={{ 
                      width: '100%',
                      padding: '14px',
                      backgroundColor: '#10b981', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      fontSize: '15px', 
                      fontWeight: 'bold', 
                      cursor: 'pointer', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                  >
                    {isRegister ? 'Đăng Ký Ngay' : 'Đăng Nhập'}
                  </button>
                </div>
              </form>

              {/* CHUYỂN ĐỔI FORM */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '30px', fontSize: '14px', color: '#94a3b8', fontWeight: '500' }}>
                <span>{isRegister ? 'Bạn đã có tài khoản?' : 'Bạn mới biết đến TasteByte?'}</span>
                <span 
                  onClick={() => setIsRegister(!isRegister)} 
                  style={{ color: '#10b981', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  {isRegister ? 'Đăng nhập' : 'Đăng ký ngay'}
                </span>
              </div>
            </>
          )}

        </div>
      </div>

      {/* THÊM TÚI CSS ANIMATION TRỰC TIẾP TRONG JSX ĐỂ HOẠT HỌA XOAY VÀ PHAI MỜ */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <footer style={{ backgroundColor: '#111827', textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '13px', borderTop: '1px solid #1f2937' }}>
        © 2026 TasteByte - Đồ án Công nghệ phần mềm Nhóm 8
      </footer>
    </div>
  );
};

export default RegisterLogin;