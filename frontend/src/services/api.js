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

// Tự động xử lý khi Token hết hạn, không hợp lệ hoặc tài khoản không còn tồn tại trong Database
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const errorMsg = data?.message || '';
      if (
        status === 401 || 
        status === 403 || 
        (status === 404 && (errorMsg.includes('không tồn tại') || errorMsg.includes('Not Found')))
      ) {
        if (localStorage.getItem('token')) {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Định nghĩa hàm gọi API Đăng ký và Đăng nhập
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (credentials) => API.post('/auth/login', credentials);

// 🌟 HÀM MỚI BỔ SUNG: Gọi API Đổi mật khẩu tài khoản
// Nhận vào object chứa { oldPassword, newPassword }
export const changePasswordAPI = (passwordData) => API.post('/auth/change-password', passwordData);

// 🌟 HÀM MỚI BỔ SUNG: Quên mật khẩu
export const forgotPasswordAPI = (email) => API.post('/auth/forgot-password', { email });

// 🌟 HÀM MỚI BỔ SUNG: Tạo đơn hàng và Lấy lịch sử đơn hàng
export const createOrderAPI = (orderData) => API.post('/orders/create', orderData);
export const getMyOrdersAPI = () => API.get('/orders/my-orders');
export const createReviewAPI = (reviewData) => API.post('/reviews', reviewData);

// 🌟 HÀM MỚI BỔ SUNG: Lấy thông tin tài khoản đăng nhập hiện tại & Báo cáo thống kê thật
export const getProfileAPI = () => API.get('/auth/me');
export const getRevenueReportAPI = (restaurantId, startDate, endDate) => API.get(`/reports/restaurant/${restaurantId}/revenue?startDate=${startDate}&endDate=${endDate}`);
export const getTopSellingItemsAPI = (restaurantId) => API.get(`/reports/restaurant/${restaurantId}/top-items`);

export default API;