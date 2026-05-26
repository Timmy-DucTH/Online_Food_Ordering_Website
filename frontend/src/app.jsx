import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home'; // Nạp trang Home vừa tạo

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Kích hoạt trang Home thực thụ */}
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;