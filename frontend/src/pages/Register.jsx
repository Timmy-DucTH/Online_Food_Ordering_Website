import { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    full_name: '',
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
      // Gọi hàm từ file api.js để bắn dữ liệu sang Node.js
      const response = await registerUser(formData);
      setIsError(false);
      setMessage(response.data.message); // "🎉 Đăng ký tài khoản hệ thống thành công..."
      
      // Đăng ký thành công thì tự động chuyển hướng sang trang Login sau 2 giây
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setIsError(true);
      // Lấy câu thông báo lỗi chi tiết do các tầng Middleware/Controller của Backend chặn lại
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra trong quá trình đăng ký!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Arial' }}>
      <h2 style={{ textAlign: 'center', color: '#2ecc71' }}>ĐĂNG KÝ HỆ THỐNG OFOW</h2>
      
      {message && (
        <div style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: isError ? '#ffdddd' : '#ddffdd', color: isError ? '#ff0000' : '#00aa00', textAlign: 'center' }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Họ và Tên:</label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} placeholder="Nguyễn Văn A" required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Số điện thoại (10 số):</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} placeholder="0392XXXXXX" required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Email (Tên đăng nhập):</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} placeholder="example@gmail.com" required />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Mật khẩu (Tối thiểu 8 ký tự):</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} placeholder="******" required />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>Đăng Ký Ngay</button>
      </form>
    </div>
  );
};

export default Register;