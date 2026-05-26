import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'; // Vì App.jsx ở ngoài nên dùng đường dẫn ./pages/Home là chính xác
import RegisterLogin from './pages/RegisterLogin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<RegisterLogin />} />
        <Route path="/register" element={<RegisterLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;