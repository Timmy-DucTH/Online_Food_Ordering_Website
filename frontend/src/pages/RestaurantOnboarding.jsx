import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';

const RestaurantOnboarding = () => {
  const navigate = useNavigate();
  const [localIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Đọc dữ liệu cũ ngay khi khởi tạo
  const [savedDataSnapshot] = useState(() => {
    const saved = localStorage.getItem('pendingRestaurantData');
    return saved ? JSON.parse(saved) : null;
  });

  // 1. Khởi tạo formData
  const [formData, setFormData] = useState({
    shopName: savedDataSnapshot?.shopName || '',
    shopAddress: savedDataSnapshot?.shopAddress || '',
    ownerName: savedDataSnapshot?.ownerName || '',
    ownerCCCD: savedDataSnapshot?.ownerCCCD || '',
    phone: savedDataSnapshot?.phone || '',
    email: savedDataSnapshot?.email || localStorage.getItem('userEmail') || '',
    businessType: savedDataSnapshot?.businessType || 'Cá nhân',
    taxCode: savedDataSnapshot?.taxCode || '',
  });

  // 2. Khởi tạo ảnh đại diện
  const [shopAvatar, setShopAvatar] = useState(savedDataSnapshot?.shopAvatar || null);

  // 3. Khởi tạo giấy phép
  const [businessLicense, setBusinessLicense] = useState(savedDataSnapshot?.businessLicense || null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, setFile) => {
    const file = e?.target?.files?.[0]; 
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setFile(reader.result); 
      }
    };
    reader.onerror = () => {
      console.error("Lỗi trong quá trình đọc file ảnh.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submissionData = {
        store_name: formData.shopName,
        merchant_name: formData.ownerName,
        address: formData.shopAddress,
        license_image: businessLicense || 'https://via.placeholder.com/150',
        hygiene_image: shopAvatar || 'https://via.placeholder.com/150'
      };

      const res = await API.post('/restaurants/register', submissionData);
      if (res.data.status === 'success') {
        localStorage.setItem('restaurantStatus', 'pending');
        localStorage.setItem('pendingRestaurantData', JSON.stringify({
          shopName: formData.shopName,
          shopAddress: formData.shopAddress,
          ownerName: formData.ownerName,
          phone: formData.phone,
          email: formData.email
        }));
        setShowSuccessModal(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi gửi hồ sơ đăng ký!');
    }
  };

  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    navigate('/restaurant'); 
  };

  // Thiết kế CSS Inline hệ thống Dark Mode
  const inputStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#0b0f19',
    border: '1px solid #1f2937',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
    marginTop: '8px',
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#94a3b8',
    display: 'block'
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', color: '#ffffff', fontFamily: 'system-ui, sans-serif' }}>
      <Navbar cart={[]} isLoggedIn={localIsLoggedIn} openPendingModal={() => {}} />

      <div style={{ flex: 1, maxWidth: '850px', width: '100%', margin: '30px auto', padding: '0 15px', boxSizing: 'border-box' }}>
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          
          <h2 style={{ color: '#10b981', margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
            🏪 Đăng Ký Trở Thành Người Bán TasteByte
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 30px 0' }}>
            Vui lòng điền thông tin chính xác để hệ thống phê duyệt hồ sơ của bạn một cách nhanh nhất.
          </p>

          {/* KHỐI 1: THÔNG TIN QUÁN */}
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981', borderBottom: '1px solid #1f2937', paddingBottom: '8px', marginBottom: '20px' }}>1. Thông tin Cửa hàng</div>
          
          <div style={{ display: 'flex', gap: '25px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>Ảnh đại diện Shop <span style={{ color: '#ef4444' }}>*</span></label>
              <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', border: '2px dashed #374151', backgroundColor: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}>
                {shopAvatar ? (
                  <img src={shopAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '30px', color: '#4b5563' }}>📸</span>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setShopAvatar)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}>Tên Shop (Tên Quán ăn) <span style={{ color: '#ef4444' }}>*</span></label>
              <input required type="text" name="shopName" value={formData.shopName} onChange={handleInputChange} placeholder="Ví dụ: Cơm Tấm TasteByte - Chi Nhánh Quận 1" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#1f2937'} />
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Địa chỉ chính xác của Shop <span style={{ color: '#ef4444' }}>*</span></label>
            <input required type="text" name="shopAddress" value={formData.shopAddress} onChange={handleInputChange} placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#1f2937'} />
          </div>

          {/* KHỐI 2: ĐỊNH DANH CHỦ SHOP */}
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981', borderBottom: '1px solid #1f2937', paddingBottom: '8px', marginBottom: '20px' }}>2. Thông tin Định danh Chủ sở hữu</div>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}>Họ và tên chủ Shop <span style={{ color: '#ef4444' }}>*</span></label>
              <input required type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="Nhập đầy đủ họ và tên trên CCCD" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#1f2937'} />
            </div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}>Số Căn cước công dân (CCCD) <span style={{ color: '#ef4444' }}>*</span></label>
              <input required type="text" name="ownerCCCD" value={formData.ownerCCCD} onChange={handleInputChange} placeholder="Nhập 12 số CCCD" maxLength={12} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#1f2937'} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}>Số điện thoại liên hệ <span style={{ color: '#ef4444' }}>*</span></label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#1f2937'} />
            </div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}>Địa chỉ Email liên hệ <span style={{ color: '#ef4444' }}>*</span></label>
              <input required type="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#1f2937'} />
            </div>
          </div>

          {/* KHỐI 3: PHÁP LÝ & THUẾ */}
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981', borderBottom: '1px solid #1f2937', paddingBottom: '8px', marginBottom: '20px' }}>3. Giấy tờ Pháp lý & Thông tin Thuế</div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Loại hình kinh doanh <span style={{ color: '#ef4444' }}>*</span></label>
            <select name="businessType" value={formData.businessType} onChange={handleInputChange} style={{ ...inputStyle, cursor: 'pointer' }} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#1f2937'}>
              <option value="Cá nhân" style={{ backgroundColor: '#111827' }}>Cá nhân (Quán nhỏ, hộ gia đình)</option>
              <option value="Hộ kinh doanh / Công ty" style={{ backgroundColor: '#111827' }}>Hộ kinh doanh / Công ty</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#0b0f19', borderRadius: '6px', border: '1px solid #1f2937' }}>
            <label style={labelStyle}>Giấy phép đăng ký kinh doanh (Ảnh chụp)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setBusinessLicense)} style={{ fontSize: '13px', marginTop: '10px', color: '#94a3b8' }} />
            {businessLicense && (
              <div style={{ width: '120px', height: '80px', border: '1px solid #1f2937', borderRadius: '6px', overflow: 'hidden', marginTop: '10px' }}>
                <img src={businessLicense} alt="License" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>Mã số thuế (Nếu có)</label>
            <input type="text" name="taxCode" value={formData.taxCode} onChange={handleInputChange} placeholder="Bỏ trống nếu chưa đăng ký thuế cá nhân/doanh nghiệp" style={inputStyle} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = '#1f2937'} />
          </div>

          {/* NÚT THAO TÁC FORM */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid #1f2937', paddingTop: '20px' }}>
            <button type="button" onClick={() => navigate('/restaurant')} style={{ backgroundColor: 'transparent', color: '#ffffff', border: '1px solid #374151', padding: '12px 30px', fontSize: '14px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={(e) => e.target.style.borderColor = '#ffffff'} onMouseOut={(e) => e.target.style.borderColor = '#374151'}>
              Hủy bỏ
            </button>
            <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px 40px', fontSize: '14px', fontWeight: '600', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#059669'} onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}>
              Gửi hồ sơ đăng ký
            </button>
          </div>
        </form>
      </div>

      {/* HỘP THÔNG BÁO TỰ CHẾ (CUSTOM SUCCESS MODAL) - CHÍNH GIỮA MÀN HÌNH */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', padding: '40px', borderRadius: '12px', textAlign: 'center', maxWidth: '450px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🚀</div>
            <h3 style={{ color: '#10b981', fontSize: '22px', margin: '0 0 15px 0', fontWeight: '600' }}>Gửi hồ sơ thành công!</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '30px', fontSize: '14px' }}>
              Hồ sơ đăng ký mở cửa hàng của bạn đã được chuyển tới bộ phận xét duyệt. TasteByte sẽ thẩm định và phản hồi trong thời gian sớm nhất!
            </p>
            <button 
              onClick={handleConfirmSuccess}
              style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 60px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              Xác nhận (OK)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOnboarding;