import FoodCard from './FoodCard';

const OrderMenu = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  CATEGORIES,
  loading,
  error,
  filteredFoods,
  addToCart,
  handleDirectCheckout
}) => {
  return (
    <div>
      {/* HERO BANNER */}
      <div style={{
        padding: '56px 24px', textAlign: 'center', borderRadius: '16px',
        marginBottom: '28px',
        background: 'linear-gradient(135deg, #064e3b 0%, #0d1a2d 60%, #0b0f19 100%)',
        border: '1px solid #065f46', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-30px', left: '-30px', width: '160px', height: '160px',
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <h2 style={{ fontSize: '36px', margin: '0 0 10px', fontWeight: '800', color: '#fff', position: 'relative' }}>
          Bạn muốn ăn gì hôm nay? 😋
        </h2>
        <p style={{ fontSize: '16px', color: '#34d399', margin: '0', fontWeight: '400', position: 'relative' }}>
          Hàng ngàn món ngon từ các cửa hàng uy tín — giao siêu tốc tới tay bạn
        </p>
      </div>

      {/* CATEGORY PILLS */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: '600',
              cursor: 'pointer', transition: '0.2s',
              backgroundColor: selectedCategory === cat ? '#10b981' : '#1f2937',
              color: selectedCategory === cat ? '#fff' : '#94a3b8',
              border: selectedCategory === cat ? '1.5px solid #10b981' : '1.5px solid #374151'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SECTION HEADER */}
      <div style={{
        backgroundColor: '#111827', padding: '13px 20px', borderRadius: '10px 10px 0 0',
        fontWeight: '700', color: '#34d399', border: '1px solid #1f2937', borderBottom: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <span>🟢 MÓN NGON GỢI Ý CHO BẠN</span>
        {!loading && (
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '400' }}>
            {filteredFoods.length} món
          </span>
        )}
      </div>

      <div style={{
        backgroundColor: '#111827', padding: '24px', borderRadius: '0 0 10px 10px',
        border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
            <p style={{ fontSize: '15px' }}>Đang tải danh sách món ăn...</p>
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#ef4444' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>❌</div>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredFoods.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
            <p style={{ fontSize: '16px', marginBottom: '6px' }}>Không tìm thấy món ăn phù hợp</p>
            <p style={{ fontSize: '13px' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}

        {!loading && !error && filteredFoods.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {filteredFoods.map(food => (
              <FoodCard
                key={food._id}
                item={food}
                addToCart={addToCart}
                handleBuyNow={() => handleDirectCheckout(food)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderMenu;
