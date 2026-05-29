import axios from 'axios';

// Tạo một cấu hình Axios dùng chung cho toàn bộ Frontend
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Trỏ thẳng tới cổng Backend của bạn
  headers: {
    'Content-Type': 'application/json'
  }
});

// Tự động đính kèm Token bảo mật vào mỗi request sau khi đăng nhập thành công
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Định nghĩa hàm gọi API Đăng ký và Đăng nhập
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);

// 🌟 HÀM MỚI BỔ SUNG: Gọi API Đổi mật khẩu tài khoản
// Nhận vào object chứa { oldPassword, newPassword }
export const changePasswordAPI = (passwordData) => API.post('/auth/change-password', passwordData);

export default API;