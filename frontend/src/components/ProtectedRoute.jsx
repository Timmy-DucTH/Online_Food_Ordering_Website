import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  // Lấy role được lưu ở localStorage lúc đăng nhập thành công
  const userRole = localStorage.getItem('userRole'); 

  // Nếu chưa đăng nhập, đá về trang Login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu role hiện tại không nằm trong danh sách được phép truy cập, đá về trang Home
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/home" replace />;
  }

  // Nếu hợp lệ, cho phép render các trang con bên trong
  return <Outlet />;
};

export default ProtectedRoute;