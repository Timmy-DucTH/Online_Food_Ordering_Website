import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const RestaurantOnboarding = () => {
  const navigate = useNavigate();
  const [localIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Đọc dữ liệu cũ ngay khi khởi tạo (Đã gộp dữ liệu nâng cấp để tránh lỗi đồng bộ)
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

  // 2. Khởi tạo ảnh đại diện (Lấy trực tiếp từ chuỗi Base64 cũ nếu có)
  const [shopAvatar, setShopAvatar] = useState(savedDataSnapshot?.shopAvatar || null);

  // 3. Khởi tạo giấy phép (Lấy trực tiếp từ chuỗi Base64 cũ nếu có)
  const [businessLicense, setBusinessLicense] = useState(savedDataSnapshot?.businessLicense || null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🌟 ĐÃ THÊM HÀM NÀY: Xử lý chuyển ảnh sang Base64 để lưu trữ lâu dài không bị vỡ ảnh
  // Cập nhật lại hàm này trong RestaurantOnboarding.jsx
  const handleFileChange = (e, setFile) => {
    // Thêm dấu chấm hỏi ? để bảo vệ nếu e hoặc e.target bị undefined do extension can thiệp
    const file = e?.target?.files?.[0]; 
    
    if (!file) return; // Nếu không có file thực sự thì dừng lại luôn

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Chuẩn bị gói dữ liệu bao gồm cả link ảnh Base64 để lưu
    const submissionData = {
      ...formData,
      shopAvatar,
      businessLicense
    };

    // Lưu trạng thái 'pending' (Đang chờ duyệt) và dữ liệu vào localStorage
    localStorage.setItem('restaurantStatus', 'pending');
    localStorage.setItem('pendingRestaurantData', JSON.stringify(submissionData));
    
    // Mở hộp thông báo tự chế nằm giữa màn hình
    setShowSuccessModal(true);
  };

  const handleConfirmSuccess = () => {
    setShowSuccessModal(false);
    navigate('/restaurant'); // Chuyển hướng người dùng về trang tổng quan Restaurant
  };

  // Kiểu dáng thiết kế (CSS Inline)
  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    marginTop: '6px'
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#333',
    display: 'block'
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <Navbar cart={[]} isLoggedIn={localIsLoggedIn} openPendingModal={() => {}} />

      <div style={{ flex: 1, maxWidth: '850px', width: '100%', margin: '30px auto', padding: '0 15px', boxSizing: 'border-box' }}>
        <form onSubmit={handleSubmit} style={{ backgroundColor: '#ffffff', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '35px' }}>
          
          <h2 style={{ color: '#2b4c7e', margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
            🏪 Đăng Ký Trở Thành Người Bán TasteByte
          </h2>
          <p style={{ color: '#666', fontSize: '14px', margin: '0 0 30px 0' }}>
            Vui lòng điền thông tin chính xác để hệ thống phê duyệt hồ sơ của bạn một cách nhanh nhất.
          </p>

          {/* KHỐI 1: THÔNG TIN QUÁN */}
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#2b4c7e', borderBottom: '1px solid #eef2f6', paddingBottom: '8px', marginBottom: '20px' }}>1. Thông tin Cửa hàng</div>
          
          <div style={{ display: 'flex', gap: '25px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <label style={{ ...labelStyle, marginBottom: '8px' }}>Ảnh đại diện Shop <span style={{ color: 'red' }}>*</span></label>
              <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '50%', border: '2px dashed #ccc', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer' }}>
                {shopAvatar ? (
                  <img src={shopAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '30px', color: '#aaa' }}>📸</span>
                )}
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setShopAvatar)} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}>Tên Shop (Tên Quán ăn) <span style={{ color: 'red' }}>*</span></label>
              <input required type="text" name="shopName" value={formData.shopName} onChange={handleInputChange} placeholder="Ví dụ: Cơm Tấm TasteByte - Chi Nhánh Quận 1" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Địa chỉ chính xác của Shop <span style={{ color: 'red' }}>*</span></label>
            <input required type="text" name="shopAddress" value={formData.shopAddress} onChange={handleInputChange} placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." style={inputStyle} />
          </div>

          {/* KHỐI 2: ĐỊNH DANH CHỦ SHOP */}
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#2b4c7e', borderBottom: '1px solid #eef2f6', paddingBottom: '8px', marginBottom: '20px' }}>2. Thông tin Định danh Chủ sở hữu</div>
          
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}>Họ và tên chủ Shop <span style={{ color: 'red' }}>*</span></label>
              <input required type="text" name="ownerName" value={formData.ownerName} onChange={handleInputChange} placeholder="Nhập đầy đủ họ và tên trên CCCD" style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}>Số Căn cước công dân (CCCD) <span style={{ color: 'red' }}>*</span></label>
              <input required type="text" name="ownerCCCD" value={formData.ownerCCCD} onChange={handleInputChange} placeholder="Nhập 12 số CCCD" maxLength={12} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}>Số điện thoại liên hệ <span style={{ color: 'red' }}>*</span></label>
              <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <label style={labelStyle}>Địa chỉ Email liên hệ <span style={{ color: 'red' }}>*</span></label>
              <input required type="email" name="email" value={formData.email} onChange={handleInputChange} style={inputStyle} />
            </div>
          </div>

          {/* KHỐI 3: PHÁP LÝ & THUẾ */}
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#2b4c7e', borderBottom: '1px solid #eef2f6', paddingBottom: '8px', marginBottom: '20px' }}>3. Giấy tờ Pháp lý & Thông tin Thuế</div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Loại hình kinh doanh <span style={{ color: 'red' }}>*</span></label>
            <select name="businessType" value={formData.businessType} onChange={handleInputChange} style={inputStyle}>
              <option value="Cá nhân">Cá nhân (Quán nhỏ, hộ gia đình)</option>
              <option value="Hộ kinh doanh / Công ty">Hộ kinh doanh / Công ty</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fafafa', borderRadius: '4px', border: '1px solid #eef2f6' }}>
            <label style={labelStyle}>Giấy phép đăng ký kinh doanh (Ảnh chụp)</label>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setBusinessLicense)} style={{ fontSize: '13px', marginTop: '10px' }} />
            {businessLicense && (
              <div style={{ width: '120px', height: '80px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden', marginTop: '10px' }}>
                <img src={businessLicense} alt="License" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>Mã số thuế (Nếu có)</label>
            <input type="text" name="taxCode" value={formData.taxCode} onChange={handleInputChange} placeholder="Bỏ trống nếu chưa đăng ký thuế cá nhân/doanh nghiệp" style={inputStyle} />
          </div>

          {/* NÚT THAO TÁC FORM */}
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <button type="button" onClick={() => navigate('/restaurant')} style={{ backgroundColor: '#ffffff', color: '#555', border: '1px solid #ccc', padding: '12px 30px', fontSize: '14px', borderRadius: '4px', cursor: 'pointer' }}>
              Hủy bỏ
            </button>
            <button type="submit" style={{ backgroundColor: '#2b4c7e', color: '#ffffff', border: 'none', padding: '12px 40px', fontSize: '14px', fontWeight: '600', borderRadius: '4px', cursor: 'pointer' }}>
              Gửi hồ sơ đăng ký
            </button>
          </div>
        </form>
      </div>

      {/* HỘP THÔNG BÁO TỰ CHẾ (CUSTOM SUCCESS MODAL) - CHÍNH GIỮA MÀN HÌNH */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', textAlign: 'center', maxWidth: '450px', width: '90%', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🚀</div>
            <h3 style={{ color: '#2b4c7e', fontSize: '22px', margin: '0 0 15px 0', fontWeight: '600' }}>Gửi hồ sơ thành công!</h3>
            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '30px', fontSize: '14px' }}>
              Hồ sơ đăng ký mở cửa hàng của bạn đã được chuyển tới bộ phận xét duyệt. TasteByte sẽ thẩm định và phản hồi trong thời gian sớm nhất!
            </p>
            <button 
              onClick={handleConfirmSuccess}
              style={{ backgroundColor: '#2b4c7e', color: 'white', border: 'none', padding: '12px 60px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
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