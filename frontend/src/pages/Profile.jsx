import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Profile = () => {
  const navigate = useNavigate();

  const [username] = useState(localStorage.getItem('userEmail')?.split('@')[0] || 'duyquang536');
  const [fullName, setFullName] = useState('Nguyễn Duy Quang');
  const [email] = useState(localStorage.getItem('userEmail') || 'duyquang536@gmail.com');
  const [phone, setPhone] = useState('0987654321');
  const [gender, setGender] = useState('Nam');
  
  const [birthDay, setBirthDay] = useState('27');
  const [birthMonth, setBirthMonth] = useState('05');
  const [birthYear, setBirthYear] = useState('2000');

  const [showModal, setShowModal] = useState(false);

  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const years = Array.from({ length: 100 }, (_, i) => String(2026 - i));

  const handleSave = (e) => {
    e.preventDefault();
    alert('Cập nhật hồ sơ tài khoản thành công!');
  };

  const formatEmail = (str) => {
    const [name, domain] = str.split('@');
    if (name.length <= 2) return str;
    return `${name.substring(0, 2)}******@${domain}`;
  };

  const sideMenuItemStyle = {
    padding: '10px 0 10px 28px',
    fontSize: '14px',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'block',
    transition: 'color 0.2s'
  };

  const formLabelStyle = {
    width: '25%',
    textAlign: 'right',
    color: '#94a3b8',
    fontSize: '14px',
    paddingRight: '20px',
    fontWeight: '500'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0b0f19',
    border: '1px solid #1f2937',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', width: '100%', color: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar cart={[]} isLoggedIn={true} openPendingModal={() => setShowModal(true)} />

      {/* THÂN TRANG PROFILE */}
      <div style={{ maxWidth: '1200px', margin: '30px auto', display: 'flex', gap: '30px', padding: '0 15px' }}>
        
        {/* ================= CỘT TRÁI: SIDEBAR MENU ================= */}
        <div style={{ width: '220px', flexShrink: 0, backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '15px', borderBottom: '1px solid #1f2937' }}>
            <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{username}</div>
              <div style={{ fontSize: '12px', color: '#10b981', cursor: 'pointer', marginTop: '2px' }}>✏️ Sửa Hồ Sơ</div>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', color: '#10b981', marginBottom: '12px' }}>
              <span>👤 Hồ sơ cá nhân</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ ...sideMenuItemStyle, color: '#10b981', fontWeight: '600', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', paddingLeft: '15px' }}>Hồ Sơ</span>
              <span style={sideMenuItemStyle} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#94a3b8'} onClick={() => setShowModal(true)}>Ngân Hàng</span>
              <span style={sideMenuItemStyle} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#94a3b8'} onClick={() => setShowModal(true)}>Địa Chỉ</span>
              <span style={sideMenuItemStyle} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#94a3b8'} onClick={() => setShowModal(true)}>Đổi Mật Khẩu</span>
              <span style={sideMenuItemStyle} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#94a3b8'} onClick={() => setShowModal(true)}>Cài Đặt Thông Báo</span>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: KHUNG CHI TIẾT (DARK CARD) ================= */}
        <div style={{ flex: 1, backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '35px', boxSizing: 'border-box' }}>
          
          <div style={{ borderBottom: '1px solid #1f2937', paddingBottom: '18px', marginBottom: '35px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>Hồ Sơ Của Tôi</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
          </div>

          <div style={{ display: 'flex', width: '100%', gap: '40px' }}>
            
            {/* FORM TRÁI */}
            <form onSubmit={handleSave} style={{ width: '65%', display: 'flex', flexDirection: 'column', gap: '25px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={formLabelStyle}>Tên đăng nhập</div>
                <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>{username}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={formLabelStyle}>Tên</div>
                <div style={{ flex: 1 }}>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#1f2937'} required />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={formLabelStyle}>Email</div>
                <div style={{ fontSize: '14px', color: '#ffffff', display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span>{formatEmail(email)}</span>
                  <span style={{ color: '#10b981', textDecoration: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }} onClick={() => setShowModal(true)}>Thay đổi</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={formLabelStyle}>Số điện thoại</div>
                <div style={{ flex: 1 }}>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#1f2937'} required />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={formLabelStyle}>Giới tính</div>
                <div style={{ display: 'flex', gap: '25px', fontSize: '14px', color: '#ffffff' }}>
                  {['Nam', 'Nữ', 'Khác'].map((g) => (
                    <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} style={{ accentColor: '#10b981', cursor: 'pointer', transform: 'scale(1.1)' }} /> {g}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={formLabelStyle}>Ngày sinh</div>
                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                  <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} style={{ ...inputStyle, width: '30%', cursor: 'pointer' }}>
                    {days.map(d => <option key={d} value={d} style={{backgroundColor: '#111827'}}>Ngày {d}</option>)}
                  </select>
                  <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} style={{ ...inputStyle, width: '30%', cursor: 'pointer' }}>
                    {months.map(m => <option key={m} value={m} style={{backgroundColor: '#111827'}}>Tháng {m}</option>)}
                  </select>
                  <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} style={{ ...inputStyle, width: '40%', cursor: 'pointer' }}>
                    {years.map(y => <option key={y} value={y} style={{backgroundColor: '#111827'}}>Năm {y}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px' }}>
                <div style={formLabelStyle}></div>
                <button type="submit" style={{ padding: '12px 40px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }} onMouseOver={(e) => e.target.style.backgroundColor = '#059669'} onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}>
                  Lưu thay đổi
                </button>
              </div>

            </form>

            <div style={{ width: '1px', backgroundColor: '#1f2937' }}></div>

            {/* AVATAR PHẢI */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '20px' }}>
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', backgroundColor: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', color: '#94a3b8', border: '2px dashed #374151', marginBottom: '20px' }}>
                👤
              </div>
              <button type="button" onClick={() => setShowModal(true)} style={{ padding: '8px 18px', backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #374151', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => { e.target.style.borderColor = '#10b981'; e.target.style.color = '#10b981'; }} onMouseOut={(e) => { e.target.style.borderColor = '#374151'; e.target.style.color = '#ffffff'; }}>
                Chọn Ảnh
              </button>
              <div style={{ marginTop: '15px', fontSize: '13px', color: '#94a3b8', textAlign: 'center', lineHeight: '1.6' }}>
                Dung lượng file tối đa 1 MB<br />Định dạng: .JPEG, .PNG
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL HỆ THỐNG */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', padding: '30px', borderRadius: '12px', textAlign: 'center', maxWidth: '400px', width: '90%' }}>
            <div style={{ fontSize: '45px', marginBottom: '10px' }}>⚙️</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#10b981', fontWeight: '600' }}>Thông Báo Hệ Thống</h3>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', margin: '0 0 25px 0' }}>
              Hệ thống đang cập nhật, vui lòng chờ!
            </p>
            <button 
              onClick={() => setShowModal(false)}
              style={{ padding: '10px 40px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
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