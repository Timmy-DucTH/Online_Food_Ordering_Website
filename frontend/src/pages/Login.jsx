import { useState } from 'react';
import { loginUser } from '../services/api'; // Gọi hàm login từ file api.js
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Gửi dữ liệu đăng nhập sang Backend Node.js
      const response = await loginUser(formData);
      setIsError(false);
      setMessage(response.data.message); // "👋 Đăng nhập hệ thống thành công!"

      // 2. MẸO QUAN TRỌNG: Lưu Token JWT vào trình duyệt để giữ phiên đăng nhập
      localStorage.setItem('token', response.data.token);

      // 3. Đăng nhập thành công thì chuyển hướng sang trang chủ (Home) sau 1.5 giây
      setTimeout(() => {
        navigate('/home'); 
      }, 1500);

    } catch (error) {
      setIsError(true);
      // Hiển thị lỗi do Backend chặn (Ví dụ: "Tài khoản bị khóa do điểm uy tín < 30", "Sai tài khoản mật khẩu")
      setMessage(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center', color: '#3498db' }}>ĐĂNG NHẬP HỆ THỐNG OFOW</h2>
      
      {message && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: isError ? '#ffdddd' : '#ddffdd', color: isError ? '#ff0000' : '#00aa00', textAlign: 'center' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email (Tên đăng nhập):</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} placeholder="example@gmail.com" required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Mật khẩu:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} placeholder="******" required />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>Đăng Nhập</button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
        Chưa có tài khoản? <span onClick={() => navigate('/register')} style={{ color: '#3498db', cursor: 'pointer', textDecoration: 'underline' }}>Đăng ký ngay</span>
      </p>
    </div>
  );
};

export default Login;