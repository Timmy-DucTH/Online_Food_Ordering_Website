import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterLogin = () => {
  const navigate = useNavigate();

  // Mặc định khi vào trang này sẽ luôn hiển thị hộp Đăng Nhập trước
  const [isRegister, setIsRegister] = useState(false);

  // Khai báo các State lưu dữ liệu form (bạn có thể đối chiếu với Register.jsx và Login.jsx cũ)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      // Logic xử lý Đăng ký (Tham chiếu từ Register.jsx cũ của bạn)
      console.log('Đăng ký tài khoản mới:', { email, fullName, phone, password });
      
      // Giả lập lưu thông tin đăng ký vào máy để lưu vết
      localStorage.setItem('registeredUser', JSON.stringify({ email, fullName, phone }));
      
      alert('Đăng ký thành công! Hệ thống tự động chuyển sang màn hình Đăng nhập.');
      setIsRegister(false); // Đăng ký xong tự động co form về màn Đăng nhập luôn
    } else {
      // Logic xử lý Đăng nhập (Tham chiếu từ Login.jsx cũ của bạn)
      console.log('Đăng nhập hệ thống:', { email, password });
      
      // Lưu token giả lập để đánh dấu User đã đăng nhập thành công
      localStorage.setItem('token', 'mock_token_123'); 
      
      // Ép trình duyệt reload và nhảy về trang Home để cập nhật trạng thái đồng bộ
      window.location.href = '/home'; 
    }
  };

  // Kiểu CSS chuẩn cho các ô nhập liệu: Chữ to rõ, bôi đen đậm nét, viền sắc sảo
  const inputStyle = {
    width: '100%',
    padding: '14px',
    border: '1px solid #999', 
    borderRadius: '4px',
    fontSize: '15px',
    fontWeight: '600', // Bôi đen toàn bộ chữ khi gõ dữ liệu
    outline: 'none',
    backgroundColor: '#fff',
    color: '#000', // Chữ hiển thị màu đen đậm
    boxSizing: 'border-box'
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER TRANG CHUẨN ĐỒ ÁN */}
      <header style={{ backgroundColor: '#fff', padding: '20px 0', borderBottom: '1px solid #e8e8e8', width: '100%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
          <h1 style={{ color: '#2b4c7e', margin: 0, cursor: 'pointer', fontSize: '28px', fontWeight: 'bold' }} onClick={() => navigate('/home')}>
            TasteByte <span style={{ fontSize: '22px' }}>🍔</span>
          </h1>
          <span style={{ fontSize: '20px', color: '#ccc', margin: '0 15px' }}>|</span>
          <span style={{ fontSize: '20px', color: '#222', fontWeight: 'bold' }}>
            {isRegister ? 'Đăng Ký' : 'Đăng Nhập'}
          </span>
        </div>
      </header>

      {/* THÂN TRANG - ĐẢM BẢO CĂN GIỮA VÀ ĐỐI XỨNG PHẦN TỬ */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px', backgroundImage: 'linear-gradient(135deg, #2b4c7e 0%, #1a365d 100%)' }}>
        
        {/* HỘP FORM TRẮNG TRUNG TÂM */}
        <div style={{ backgroundColor: '#ffffff', width: '450px', padding: '40px', borderRadius: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.15)', boxSizing: 'border-box' }}>
          
          {/* TIÊU ĐỀ FORM CĂN GIỮA */}
          <h3 style={{ fontSize: '26px', color: '#222', margin: '0 0 30px 0', fontWeight: 'bold', textAlign: 'center' }}>
            {isRegister ? 'Đăng Ký' : 'Đăng Nhập'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            
            {/* 1. Ô EMAIL / TÊN ĐĂNG NHẬP (Luôn đứng đầu) */}
            <input 
              type="email" 
              placeholder="Email/Tên đăng nhập" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle} 
            />

            {/* 🌟 2. PHẦN ĐỘNG: Họ tên & SĐT tự chèn vào giữa khi người dùng chọn Đăng ký */}
            {isRegister && (
              <>
                <input 
                  type="text" 
                  placeholder="Họ và tên" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={inputStyle} 
                />
                <input 
                  type="tel" 
                  placeholder="Số điện thoại" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle} 
                />
              </>
            )}

            {/* 3. Ô MẬT KHẨU (Luôn đứng cuối) */}
            <input 
              type="password" 
              placeholder="Mật khẩu" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle} 
            />

            {/* NÚT BẤM ĐỐI XỨNG GỌN GÀNG - CHỈ DÀI HƠN CHỮ MỘT CHÚT */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <button 
                type="submit" 
                style={{ 
                  display: 'inline-block',
                  padding: '12px 40px', // Đệm vừa vặn giúp nút thon gọn và cân xứng với chữ
                  backgroundColor: '#2b4c7e', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontSize: '15px', 
                  fontWeight: 'bold', // Chữ trên nút bôi đen nổi bật
                  cursor: 'pointer', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 2px 4px rgba(43, 76, 126, 0.2)',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1a365d'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2b4c7e'}
              >
                {isRegister ? 'Đăng Ký' : 'Đăng Nhập'}
              </button>
            </div>
          </form>

          {/* DÒNG ĐIỀU HƯỚNG SWITCH FORM TẠI CHỖ */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '30px', fontSize: '14px', color: '#444', fontWeight: '500' }}>
            <span>{isRegister ? 'Bạn đã có tài khoản?' : 'Bạn mới biết đến TasteByte?'}</span>
            <span 
              onClick={() => setIsRegister(!isRegister)} 
              style={{ color: '#2b4c7e', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isRegister ? 'Đăng nhập' : 'Đăng ký'}
            </span>
          </div>

        </div>
      </div>

      <footer style={{ backgroundColor: '#fff', textAlign: 'center', padding: '20px', color: '#888', fontSize: '13px', borderTop: '1px solid #e8e8e8' }}>
        © 2026 TasteByte - Đồ án Công nghệ phần mềm Nhóm 8
      </footer>
    </div>
  );
};

export default RegisterLogin;