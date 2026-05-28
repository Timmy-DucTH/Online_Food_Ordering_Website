import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy danh sách món ăn được truyền từ Navbar sang
  const selectedItems = location.state?.selectedItems || [];

  // --- STATE QUẢN LÝ THÔNG TIN KHÁCH HÀNG ---
  const [shippingInfo, setShippingInfo] = useState({
    name: 'Duy Quang',
    phone: '0923456789',
    address: '',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD'); // Mặc định: Tiền mặt
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // --- TÍNH TOÁN HÓA ĐƠN ---
  const totalMoney = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = totalMoney > 0 ? 15000 : 0; // Phí ship cố định 15k
  const finalTotal = totalMoney + shippingFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!shippingInfo.address.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng để TasteByte gửi shipper đến nhé!');
      return;
    }
    // Kích hoạt Modal đặt hàng thành công
    setShowSuccessModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    // Điều hướng về Home. Navbar sẽ tự động xử lý xóa các món đã mua dựa trên logic gốc
    navigate('/home'); 
  };

  // Nếu không có món nào được chọn mà cố tình vào trang này, đẩy về Home
  if (selectedItems.length === 0) {
    return (
      <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', padding: '20px' }}>
        <h3 style={{ color: '#ff424e', fontSize: '20px' }}>Giỏ hàng checkout trống hoặc đã được xử lý!</h3>
        <button onClick={() => navigate('/home')} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' }}>
          Quay lại mua món ăn 🍔
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', padding: '30px 10px', color: '#f8fafc' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* TIÊU ĐỀ TRANG */}
        <h2 style={{ color: '#10b981', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '800' }}>
          <span onClick={() => navigate('/home')} style={{ cursor: 'pointer', fontSize: '22px', backgroundColor: '#111827', padding: '5px 12px', borderRadius: '6px', border: '1px solid #1f2937' }}>⬅️</span> 
          Thủ Tục Thanh Toán Đơn Hàng
        </h2>

        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
          
          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG & PHƯƠNG THỨC */}
          <div style={{ flex: '1.3', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Form Địa Chỉ */}
            <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '8px', border: '1px solid #1f2937', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#00e676', borderBottom: '2px solid #10b981', paddingBottom: '8px', fontWeight: '700' }}>
                📍 Thông Tin Giao Hàng
              </h3>
              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#94a3b8' }}>Tên Người Nhận</label>
                    <input type="text" name="name" value={shippingInfo.name} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', marginTop: '5px', backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '6px', color: '#fff', outline: 'none' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#94a3b8' }}>Số Điện Thoại</label>
                    <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', marginTop: '5px', backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '6px', color: '#fff', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#00e676' }}>Địa Chỉ Nhận Đồ Ăn *</label>
                  <input type="text" name="address" placeholder="Ví dụ: Lầu 3, Phòng 302, Toà nhà ABC, Số 123 Đường..." value={shippingInfo.address} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', marginTop: '5px', backgroundColor: '#0b0f19', border: '1px solid #10b981', borderRadius: '6px', color: '#fff', outline: 'none', boxShadow: '0 0 8px rgba(16,185,129,0.1)' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#94a3b8' }}>Ghi Chú Cho Tài Xế</label>
                  <textarea name="note" placeholder="Ví dụ: Gõ cửa gọi điện mình ra, không lấy đá, nhiều tương ớt..." value={shippingInfo.note} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: '12px', marginTop: '5px', backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '6px', color: '#fff', outline: 'none', resize: 'none' }}></textarea>
                </div>
              </form>
            </div>

            {/* Phương Thức Thanh Toán */}
            <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '8px', border: '1px solid #1f2937', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#00e676', borderBottom: '2px solid #10b981', paddingBottom: '8px', fontWeight: '700' }}>
                💳 Phương Thức Thanh Toán
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: paymentMethod === 'COD' ? '1px solid #10b981' : '1px solid #1f2937', borderRadius: '8px', backgroundColor: paymentMethod === 'COD' ? 'rgba(16,185,129,0.05)' : 'transparent', cursor: 'pointer' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ width: '18px', height: '18px', accentColor: '#00e676' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#e2e8f0' }}>Tiền mặt khi nhận hàng (COD)</strong>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Thanh toán trực tiếp cho shipper khi nhận đồ ăn bốc khói</span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: paymentMethod === 'MOMO' ? '1px solid #10b981' : '1px solid #1f2937', borderRadius: '8px', backgroundColor: paymentMethod === 'MOMO' ? 'rgba(16,185,129,0.05)' : 'transparent', opacity: 0.5, cursor: 'not-allowed' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'MOMO'} disabled style={{ width: '18px', height: '18px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#94a3b8' }}>Ví điện tử MoMo 🌟 (Bảo trì kết nối)</strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Kết nối tài khoản hoặc quét mã QR thanh toán nhanh</span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div style={{ flex: '1', minWidth: '320px' }}>
            <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '8px', border: '1px solid #1f2937', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', position: 'sticky', top: '100px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#00e676', borderBottom: '2px solid #10b981', paddingBottom: '8px', fontWeight: '700' }}>
                🛒 Đơn Hàng Của Bạn
              </h3>

              {/* List danh sách món ăn */}
              <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '5px', marginBottom: '20px' }}>
                {selectedItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px dashed #1f2937' }}>
                    <div style={{ flex: 1, paddingRight: '10px' }}>
                      <span style={{ fontWeight: '500', color: '#e2e8f0', display: 'block', fontSize: '14px' }}>{item.name}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Số lượng: {item.quantity}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#00e676', fontSize: '14px' }}>
                      {(item.price * item.quantity).toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </div>

              {/* Bảng chi tiết giá tiền */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid #1f2937', paddingBottom: '15px', marginBottom: '15px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Tạm tính tiền món:</span>
                  <span style={{ color: '#fff' }}>{totalMoney.toLocaleString()}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>Phí giao hàng (Shipper):</span>
                  <span style={{ color: '#fff' }}>{shippingFee.toLocaleString()}đ</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#e2e8f0' }}>Tổng thanh toán chốt:</span>
                <span style={{ fontWeight: '800', fontSize: '24px', color: '#00e676', textShadow: '0 0 10px rgba(0,230,118,0.2)' }}>{finalTotal.toLocaleString()}đ</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                style={{ width: '100%', backgroundColor: '#10b981', color: 'white', border: 'none', padding: '14px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                🚀 XÁC NHẬN ĐẶT ĐƠN HÀNG
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 🎉 CUSTOM SUCCESS MODAL - ĐẶT HÀNG THÀNH CÔNG */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: '#111827', padding: '40px 30px', borderRadius: '12px', textAlign: 'center', maxWidth: '450px', width: '90%', border: '1px solid #10b981', boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}>
            <div style={{ fontSize: '60px', marginBottom: '15px' }}>🛵💨🟢</div>
            <h3 style={{ color: '#00e676', fontSize: '24px', margin: '0 0 12px 0', fontWeight: '700' }}>TasteByte Đang Giao Hàng!</h3>
            <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '14px', marginBottom: '15px' }}>
              Đơn hàng của bạn đang được nhà hàng chuẩn bị. Tài xế sẽ ship siêu tốc tới địa chỉ: <br />
              <strong style={{ color: '#ffffff', display: 'block', marginTop: '5px' }}>{shippingInfo.address}</strong>
            </p>
            <div style={{ backgroundColor: '#0b0f19', padding: '12px', borderRadius: '6px', marginBottom: '25px', border: '1px solid #1f2937' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Vui lòng chuẩn bị sẵn số tiền:</span>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#00e676', marginTop: '3px' }}>{finalTotal.toLocaleString()}đ</div>
            </div>
            <button 
              onClick={handleCloseSuccess}
              style={{ backgroundColor: '#10b981', color: 'white', border: 'none', padding: '12px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', width: '100%' }}
            >
              Tuyệt vời, quay lại trang chủ (OK)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;