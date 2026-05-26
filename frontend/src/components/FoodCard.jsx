const FoodCard = ({ item, addToCart, handleBuyNow }) => {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', transition: '0.3s', cursor: 'pointer' }}>
      <img src={item.image} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
      <div style={{ padding: '15px' }}>
        <h4 style={{ margin: '0 0 10px 0', height: '40px', overflow: 'hidden' }}>{item.name}</h4>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>{item.price.toLocaleString()}đ</span>
          <span style={{ fontSize: '12px', color: '#888' }}>⭐ {item.rating}</span>
        </div>
        
        {/* HÀNG NÚT BẤM ĐÃ ĐƯỢC TINH CHỈNH GỌN GÀNG */}
        <div style={{ display: 'flex', gap: '10px' }}>
          
          {/* Nút Thêm vào giỏ hàng: Chỉ giữ lại icon 🛒 (Mất chữ) */}
          <button 
            onClick={(e) => {
              e.stopPropagation(); 
              addToCart(item);
            }}
            title="Thêm vào giỏ hàng"
            style={{ width: '45px', height: '40px', padding: '0', backgroundColor: '#e8f8f0', color: '#2ecc71', border: '1px solid #2ecc71', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseOver={(e) => { e.target.style.backgroundColor = '#2ecc71'; e.target.style.color = 'white'; }}
            onMouseOut={(e) => { e.target.style.backgroundColor = '#e8f8f0'; e.target.style.color = '#2ecc71'; }}
          >
            🛒
          </button>

          {/* Nút Đặt hàng ngay */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleBuyNow(item);
            }}
            style={{ flex: '1', height: '40px', padding: '0 10px', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.2s' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#d35400'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#e67e22'}
          >
            ⚡ Đặt ngay
          </button>

        </div>
      </div>
    </div>
  );
};

export default FoodCard;