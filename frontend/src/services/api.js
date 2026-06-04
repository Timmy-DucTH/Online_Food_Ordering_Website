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

      // Trường hợp 1: Tài khoản bị khóa bởi Admin -> Hiển thị popup cảnh báo trước
      // QUAN TRỌNG: KHÔNG xóa token ngay ở đây để tránh vòng lặp 401 kích hoạt redirect
      // Token chỉ bị xóa khi user bấm "Đóng & Đăng Xuất" trong modal
      if (status === 403 && data?.status === 'banned') {
        // Chống gọi lặp lại: chỉ dispatch event lần đầu
        if (!window.__accountBanned) {
          window.__accountBanned = true;
          window.dispatchEvent(new CustomEvent('account-banned', {
            detail: { message: data.message || 'Tài khoản của bạn đã bị khóa bởi quản trị viên.' }
          }));
        }
        return Promise.reject(error);
      }

      // Trường hợp 2: Token hết hạn hoặc không hợp lệ (401) -> Đăng xuất im lặng
      // Bỏ qua nếu tài khoản đang trong trạng thái bị khóa (modal đang hiển thị)
      if (status === 401) {
        if (!window.__accountBanned && localStorage.getItem('token')) {
          localStorage.clear();
          window.location.href = '/login';
        }
      }

      // Trường hợp 3: 403 thông thường (sai quyền, không phải bị khóa) -> Bỏ qua, không redirect
      // Trường hợp 4: 404 không tồn tại -> Bỏ qua
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