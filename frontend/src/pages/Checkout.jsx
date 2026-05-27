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
  const shippingFee = totalMoney > 0 ? 15000 : 0; // Phí ship cố định 15k, free ship nếu có ưu đãi (tùy bạn chỉnh)
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
    // 🌟 QUAN TRỌNG: Điều hướng về Home. 
    // Các món đã mua sẽ được Navbar tự động xóa dựa trên logic cũ của bạn khi giỏ hàng re-render
    navigate('/home'); 
  };

  // Nếu không có món nào được chọn mà cố tình vào trang này, đẩy về Home
  if (selectedItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
        <h3>Giỏ hàng checkout trống hoặc đã được xử lý!</h3>
        <button onClick={() => navigate('/home')} style={{ backgroundColor: '#2b4c7e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', marginTop: '15px' }}>
          Quay lại mua món ăn 🍔
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', padding: '30px 10px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* TIÊU ĐỀ TRANG */}
        <h2 style={{ color: '#2b4c7e', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span onClick={() => navigate('/home')} style={{ cursor: 'pointer', fontSize: '20px' }}>⬅️</span> 
          Thủ Tục Thanh Toán Đơn Hàng
        </h2>

        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
          
          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG & PHƯƠNG THỨC */}
          <div style={{ flex: '1.3', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Form Địa Chỉ */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#333', borderBottom: '2px solid #2b4c7e', paddingBottom: '8px' }}>
                📍 Thông Tin Giao Hàng
              </h3>
              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#666' }}>Tên Người Nhận</label>
                    <input type="text" name="name" value={shippingInfo.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#666' }}>Số Điện Thoại</label>
                    <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#ff424e' }}>Địa Chỉ Nhận Đồ Ăn *</label>
                  <input type="text" name="address" placeholder="Ví dụ: Lầu 3, Phòng 302, Toà nhà ABC, Số 123 Đường..." value={shippingInfo.address} onChange={handleInputChange} required style={{ width: '100%', padding: '12px', marginTop: '5px', border: '1px solid #ff424e', borderRadius: '4px', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#666' }}>Ghi Chú Cho Tài Xế</label>
                  <textarea name="note" placeholder="Ví dụ: Gõ cửa gọi điện mình ra, không lấy đá, nhiều tương ớt..." value={shippingInfo.note} onChange={handleInputChange} rows="3" style={{ width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #ddd', borderRadius: '4px', resize: 'none' }}></textarea>
                </div>
              </form>
            </div>

            {/* Phương Thức Thanh Toán */}
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#333', borderBottom: '2px solid #2b4c7e', paddingBottom: '8px' }}>
                💳 Phương Thức Thanh Toán
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: paymentMethod === 'COD' ? '1px solid #2b4c7e' : '1px solid #eee', borderRadius: '6px', backgroundColor: paymentMethod === 'COD' ? '#f4f7fb' : 'transparent', cursor: 'pointer' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} style={{ width: '18px', height: '18px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px' }}>Tiền mặt khi nhận hàng (COD)</strong>
                    <span style={{ fontSize: '12px', color: '#888' }}>Thanh toán trực tiếp cho shipper khi nhận đồ ăn bốc khói</span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', border: paymentMethod === 'MOMO' ? '1px solid #2b4c7e' : '1px solid #eee', borderRadius: '6px', backgroundColor: paymentMethod === 'MOMO' ? '#f4f7fb' : 'transparent', opacity: 0.7, cursor: 'pointer' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'MOMO'} onChange={() => setPaymentMethod('MOMO')} style={{ width: '18px', height: '18px' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px' }}>Ví điện tử MoMo 🌟 (Bảo trì)</strong>
                    <span style={{ fontSize: '12px', color: '#888' }}>Kết nối tài khoản hoặc quét mã QR thanh toán nhanh</span>
                  </div>
                </label>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & BILL CHỐT */}
          <div style={{ flex: '1', minWidth: '320px' }}>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: '100px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#333', borderBottom: '2px solid #2b4c7e', paddingBottom: '8px' }}>
                🛒 Đơn Hàng Của Bạn
              </h3>

              {/* List danh sách món ăn */}
              <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '5px', marginBottom: '20px' }}>
                {selectedItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #eee' }}>
                    <div style={{ flex: 1, paddingRight: '10px' }}>
                      <span style={{ fontWeight: '500', color: '#333', display: 'block', fontSize: '14px' }}>{item.name}</span>
                      <span style={{ fontSize: '12px', color: '#888' }}>Số lượng: {item.quantity}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#444', fontSize: '14px' }}>
                      {(item.price * item.quantity).toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </div>

              {/* Bảng chi tiết giá tiền */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                  <span>Tạm tính tiền món:</span>
                  <span>{totalMoney.toLocaleString()}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666' }}>
                  <span>Phí giao hàng (Shipper):</span>
                  <span>{shippingFee.toLocaleString()}đ</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>Tổng thanh toán chốt:</span>
                <span style={{ fontWeight: 'bold', fontSize: '22px', color: '#ff424e' }}>{finalTotal.toLocaleString()}đ</span>
              </div>

              <button 
                onClick={handlePlaceOrder}
                style={{ width: '100%', backgroundColor: '#2b4c7e', color: 'white', border: 'none', padding: '14px 0', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 4px 6px rgba(43,76,126,0.2)', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#1d3557'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#2b4c7e'}
              >
                🚀 XÁC NHẬN ĐẶT ĐƠN HÀNG
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 🎉 CUSTOM SUCCESS MODAL - ĐẶT HÀNG THÀNH CÔNG */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ backgroundColor: 'white', padding: '40px 30px', borderRadius: '12px', textAlign: 'center', maxWidth: '450px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '65px', marginBottom: '15px', animation: 'bounce 1s infinite' }}>🛵💨</div>
            <h3 style={{ color: '#2b4c7e', fontSize: '24px', margin: '0 0 12px 0', fontWeight: 'bold' }}>TasteByte Đang Giao Hàng!</h3>
            <p style={{ color: '#555', lineHeight: '1.6', fontSize: '14px', marginBottom: '15px' }}>
              Đơn hàng của bạn đang được nhà hàng chuẩn bị. Tài xế sẽ ship siêu tốc tới địa chỉ: <br />
              <strong style={{ color: '#333' }}>{shippingInfo.address}</strong>
            </p>
            <div style={{ backgroundColor: '#fff5f5', padding: '10px', borderRadius: '6px', marginBottom: '25px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>Vui lòng chuẩn bị sẵn số tiền:</span>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff424e', marginTop: '3px' }}>{finalTotal.toLocaleString()}đ</div>
            </div>
            <button 
              onClick={handleCloseSuccess}
              style={{ backgroundColor: '#2b4c7e', color: 'white', border: 'none', padding: '12px 0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', width: '100%' }}
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