import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Profile = () => {
  const navigate = useNavigate();

  // Khởi tạo các State cho Form giống Shopee
  const [username] = useState(localStorage.getItem('userEmail')?.split('@')[0] || 'duyquang536');
  const [fullName, setFullName] = useState('Nguyễn Duy Quang');
  const [email] = useState(localStorage.getItem('userEmail') || 'duyquang536@gmail.com');
  const [phone, setPhone] = useState('0987654321');
  const [gender, setGender] = useState('Nam');
  
  // State cho Ngày sinh
  const [birthDay, setBirthDay] = useState('27');
  const [birthMonth, setBirthMonth] = useState('05');
  const [birthYear, setBirthYear] = useState('2000');

  // State bật mở modal thông báo hệ thống đang cập nhật
  const [showModal, setShowModal] = useState(false);

  // Hàm tạo danh sách ngày, tháng, năm cho dropdown
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const years = Array.from({ length: 100 }, (_, i) => String(2026 - i)); // Năm hiện tại hệ thống là 2026

  const handleSave = (e) => {
    e.preventDefault();
    alert('Cập nhật hồ sơ tài khoản thành công!');
  };

  // Hàm ẩn một phần email bảo mật giống mẫu (ví dụ: du******@gmail.com)
  const formatEmail = (str) => {
    const [name, domain] = str.split('@');
    if (name.length <= 2) return str;
    return `${name.substring(0, 2)}******@${domain}`;
  };

  // --- HỆ THỐNG STYLE CSS IN JS QUY CHUẨN GIAO DIỆN ---
  const sideMenuItemStyle = {
    padding: '8px 0 8px 28px',
    fontSize: '14px',
    color: '#555',
    cursor: 'pointer',
    display: 'block'
  };

  const formLabelStyle = {
    width: '20%',
    textAlign: 'right',
    color: 'rgba(85, 85, 85, 0.8)',
    fontSize: '14px',
    paddingRight: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #dbdbdb',
    borderRadius: '2px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', width: '100%' }}>
      {/* Kế thừa lại Navbar chung của hệ thống */}
      <Navbar cart={[]} isLoggedIn={true} openPendingModal={() => setShowModal(true)} />

      {/* THÂN TRANG PROFILE CHIA CỘT */}
      <div style={{ maxWidth: '1200px', margin: '20px auto', display: 'flex', gap: '27px', padding: '0 10px' }}>
        
        {/* ================= CỘT TRÁI: SIDEBAR MENU ================= */}
        <div style={{ width: '180px', flexShrink: 0 }}>
          {/* Thông tin User phần đầu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 0', borderBottom: '1px solid #efefef' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: '#2b4c7e' }}>U</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#333', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{username}</div>
              <div style={{ fontSize: '13px', color: '#888', cursor: 'pointer' }}><span style={{ marginRight: '3px' }}>✏️</span>Sửa Hồ Sơ</div>
            </div>
          </div>

          {/* Danh mục menu con đúng yêu cầu (Chỉ giữ lại mục Tài khoản của tôi) */}
          <div style={{ marginTop: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px', color: '#2b4c7e' }}>👤</span>
              <span>Hồ sơ cá nhân</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ ...sideMenuItemStyle, color: '#2b4c7e', fontWeight: '600' }}>Hồ Sơ</span>
              <span style={sideMenuItemStyle} onClick={() => setShowModal(true)}>Ngân Hàng</span>
              <span style={sideMenuItemStyle} onClick={() => setShowModal(true)}>Địa Chỉ</span>
              <span style={sideMenuItemStyle} onClick={() => setShowModal(true)}>Đổi Mật Khẩu</span>
              <span style={sideMenuItemStyle} onClick={() => setShowModal(true)}>Cài Đặt Thông Báo</span>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: KHUNG HỒ SƠ CHI TIẾT ================= */}
        <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', padding: '30px', boxSizing: 'border-box' }}>
          
          {/* Tiêu đề góc trên */}
          <div style={{ borderBottom: '1px solid #efefef', paddingBottom: '18px', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '500', color: '#333' }}>Hồ Sơ Của Tôi</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
          </div>

          {/* Khung chia đôi bên trong form: Trái điền Text - Phải up Avatar */}
          <div style={{ display: 'flex', width: '100%' }}>
            
            {/* PHẦN FORM NHẬP LIỆU (CHIẾM 70%) */}
            <form onSubmit={handleSave} style={{ width: '70%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Tên đăng nhập (Cố định không cho sửa) */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={formLabelStyle}>Tên đăng nhập</div>
                <div style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>{username}</div>
              </div>

              {/* Ô nhập Họ Tên */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={formLabelStyle}>Tên</div>
                <div style={{ width: '70%' }}>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} required />
                </div>
              </div>

              {/* Email (Bảo mật + Text thay đổi) */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={formLabelStyle}>Email</div>
                <div style={{ fontSize: '14px', color: '#333', display: 'flex', gap: '10px' }}>
                  <span>{formatEmail(email)}</span>
                  <span style={{ color: '#2b4c7e', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }} onClick={() => setShowModal(true)}>Thay đổi</span>
                </div>
              </div>

              {/* Số điện thoại */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={formLabelStyle}>Số điện thoại</div>
                <div style={{ width: '70%' }}>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} required />
                </div>
              </div>

              {/* Radio Chọn Giới Tính */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={formLabelStyle}>Giới tính</div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#333' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="radio" name="gender" value="Nam" checked={gender === 'Nam'} onChange={() => setGender('Nam')} style={{ cursor: 'pointer' }} /> Nam
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="radio" name="gender" value="Nữ" checked={gender === 'Nữ'} onChange={() => setGender('Nữ')} style={{ cursor: 'pointer' }} /> Nữ
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="radio" name="gender" value="Khác" checked={gender === 'Khác'} onChange={() => setGender('Khác')} style={{ cursor: 'pointer' }} /> Khác
                  </label>
                </div>
              </div>

              {/* Dropdown Chọn Ngày Sinh */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={formLabelStyle}>Ngày sinh</div>
                <div style={{ display: 'flex', gap: '10px', width: '70%' }}>
                  <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} style={{ ...inputStyle, width: '30%', cursor: 'pointer', padding: '10px' }}>
                    {days.map(d => <option key={d} value={d}>Ngày {d}</option>)}
                  </select>
                  <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} style={{ ...inputStyle, width: '30%', cursor: 'pointer', padding: '10px' }}>
                    {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                  </select>
                  <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} style={{ ...inputStyle, width: '35%', cursor: 'pointer', padding: '10px' }}>
                    {years.map(y => <option key={y} value={y}>Năm {y}</option>)}
                  </select>
                </div>
              </div>

              {/* Nút bấm Lưu quy chuẩn kích thước */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                <div style={formLabelStyle}></div>
                <button type="submit" style={{ padding: '12px 30px', backgroundColor: '#2b4c7e', color: 'white', border: 'none', borderRadius: '2px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#1a365d'} onMouseOut={(e) => e.target.style.backgroundColor = '#2b4c7e'}>
                  Lưu
                </button>
              </div>

            </form>

            {/* VẠCH KẺ DỌC PHÂN CHIA BIÊN GIỚI */}
            <div style={{ width: '1px', backgroundColor: '#efefef', margin: '0 30px' }}></div>

            {/* PHẦN TẢI ẢNH AVATAR TRÒN LỚN (CHIẾM 30%) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '40px' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '45px', color: '#ccc', border: '1px solid #e8e8e8', marginBottom: '20px' }}>
                👤
              </div>
              <button type="button" onClick={() => setShowModal(true)} style={{ padding: '8px 16px', backgroundColor: '#ffffff', color: '#555', border: '1px solid #dbdbdb', borderRadius: '2px', fontSize: '14px', cursor: 'pointer', boxShadow: '0 1px 1px rgba(0,0,0,0.02)' }} onMouseOver={(e) => e.target.style.backgroundColor = '#fafafa'} onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}>
                Chọn Ảnh
              </button>
              <div style={{ marginTop: '15px', fontSize: '13px', color: '#999', textAlign: 'center', lineHeight: '1.6' }}>
                Dụng lượng file tối đa 1 MB<br />Định dạng: .JPEG, .PNG
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL THÔNG BÁO ĐỒNG BỘ CHUNG */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '45px', marginBottom: '10px' }}>⚙️</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#2b4c7e', fontWeight: '600' }}>Thông Báo Hệ Thống</h3>
            <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Hệ thống đang cập nhật, vui lòng chờ!
            </p>
            <button 
              onClick={() => setShowModal(false)}
              style={{ padding: '10px 40px', backgroundColor: '#2b4c7e', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
            >
              Xác nhận
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;