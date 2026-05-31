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

// Don hang ca nhan / nhom
export const createOrder = (orderData) => API.post('/orders/create', orderData);

// Mang xa hoi
export const getPosts = () => API.get('/posts');
export const createPost = (postData) => API.post('/posts', postData);
export const reactPost = (postId, userData) => API.patch(`/posts/${postId}/react`, userData);
export const addPostComment = (postId, commentData) => API.post(`/posts/${postId}/comments`, commentData);

// Review / danh gia
export const createReview = (reviewData) => API.post('/reviews', reviewData);
export const getRestaurantReviews = (restaurantId) => API.get(`/reviews/restaurant/${restaurantId}`);
export const replyReview = (reviewId, replyData) => API.patch(`/reviews/${reviewId}/reply`, replyData);

// Thong bao
export const createNotification = (notificationData) => API.post('/notifications', notificationData);
export const getUserNotifications = (userId) => API.get(`/notifications/user/${userId}`);
export const markNotificationAsRead = (notificationId) => API.patch(`/notifications/${notificationId}/read`);
export const markAllNotificationsAsRead = (userId) => API.patch(`/notifications/user/${userId}/read-all`);

// Bao cao
export const getRevenueReport = (restaurantId, params) => API.get(`/reports/restaurants/${restaurantId}/revenue`, { params });
export const getTopSellingItems = (restaurantId) => API.get(`/reports/restaurants/${restaurantId}/top-items`);

export default API;
