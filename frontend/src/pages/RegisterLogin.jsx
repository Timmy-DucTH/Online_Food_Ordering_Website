import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/api'; // Gọi api thật từ file cấu hình axios

const RegisterLogin = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      if (isRegister) {
        const res = await registerUser({ phone, full_name: fullName, email, password });
        if (res.data.status === 'success') {
          alert('🎉 Đăng ký thành công! Hệ thống tự động chuyển sang màn hình Đăng nhập.');
          setIsRegister(false);
          // Clean fields
          setFullName('');
          setPhone('');
        }
      } else {
        const res = await loginUser({ email, password });
        if (res.data.status === 'success') {
          // Lưu token và phân quyền vào localStorage
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('role', res.data.data.role);
          localStorage.setItem('user', JSON.stringify(res.data.data));

          if (setIsLoggedIn) setIsLoggedIn(true);

          alert('👋 Đăng nhập thành công!');
          
          // Phân luồng chuyển hướng
          if (res.data.data.role === 'admin') {
            window.location.href = '/admin'; // Nhảy sang Admin dashboard
          } else {
            window.location.href = '/home'; // Khách hàng bình thường về trang chủ
          }
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
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#0b0f19', display: 'flex', flexDirection: 'column', color: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>
      
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
            {isRegister ? 'TẠO TÀI KHOẢN' : 'ĐĂNG NHẬP'}
          </h3>

          {errorMsg && (
            <div style={{ padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', fontWeight: '500', textAlign: 'center' }}>
              ⚠️ {errorMsg}
            </div>
          )}

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

            <input 
              type="password" 
              placeholder="Mật khẩu bảo mật" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle} 
              onFocus={(e) => e.target.style.borderColor = '#10b981'}
              onBlur={(e) => e.target.style.borderColor = '#1f2937'}
            />

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

        </div>
      </div>

      <footer style={{ backgroundColor: '#111827', textAlign: 'center', padding: '20px', color: '#6b7280', fontSize: '13px', borderTop: '1px solid #1f2937' }}>
        © 2026 TasteByte - Đồ án Công nghệ phần mềm Nhóm 8
      </footer>
    </div>
  );
};

export default RegisterLogin;