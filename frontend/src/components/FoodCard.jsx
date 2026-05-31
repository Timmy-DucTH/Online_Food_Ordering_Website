import { useState } from 'react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500';

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  return (
    <span style={{ color: '#fbbf24', fontSize: '13px', letterSpacing: '1px' }}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < fullStars) return '★';
        if (i === fullStars && hasHalf) return '½';
        return '☆';
      }).join('')}
      <span style={{ color: '#94a3b8', marginLeft: '4px', fontSize: '12px' }}>{rating.toFixed(1)}</span>
    </span>
  );
};

const FoodDetailModal = ({ food, onClose, addToCart, handleBuyNow }) => {
  const restaurant = food.restaurant_id;
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center',
        alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(4px)', padding: '20px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#111827', borderRadius: '16px', width: '100%', maxWidth: '520px',
          overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          border: '1px solid #1f2937', animation: 'slideUp 0.25s ease-out'
        }}
      >
        {/* Food image */}
        <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
          <img
            src={imgError ? DEFAULT_IMAGE : (food.image || DEFAULT_IMAGE)}
            alt={food.name}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(17,24,39,0.9) 0%, transparent 60%)'
          }} />
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '12px', right: '12px', width: '32px', height: '32px',
              borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1
            }}
          >✕</button>
          {/* Category badge */}
          <span style={{
            position: 'absolute', top: '12px', left: '12px', backgroundColor: '#059669',
            color: '#fff', fontSize: '11px', fontWeight: '700', padding: '4px 10px',
            borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>{food.category || 'Món ăn'}</span>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px 24px' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '800', color: '#f1f5f9', lineHeight: 1.3 }}>
            {food.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <StarRating rating={food.rating || 4.5} />
            <span style={{ fontSize: '12px', color: '#64748b' }}>•</span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>ID: {String(food._id).slice(-6).toUpperCase()}</span>
          </div>

          {/* Description */}
          {food.description && (
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px' }}>
              {food.description}
            </p>
          )}

          {/* Restaurant Info Box */}
          {restaurant && (
            <div style={{
              backgroundColor: '#0f172a', borderRadius: '10px', padding: '14px 16px',
              marginBottom: '18px', border: '1px solid #1e293b'
            }}>
              <div style={{ fontSize: '11px', color: '#475569', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                🏪 Thông tin cửa hàng
              </div>
              <div style={{ color: '#10b981', fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>
                {restaurant.store_name || food.restaurant_name}
              </div>
              {restaurant.address && (
                <div style={{ color: '#94a3b8', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <span style={{ flexShrink: 0 }}>📍</span>
                  <span>{restaurant.address}</span>
                </div>
              )}
              {restaurant.merchant_name && (
                <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px', display: 'flex', gap: '6px' }}>
                  <span>👤</span>
                  <span>Chủ quán: {restaurant.merchant_name}</span>
                </div>
              )}
            </div>
          )}

          {/* Price + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#475569', fontWeight: '600', textTransform: 'uppercase' }}>Giá</div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>
                {(food.price || 0).toLocaleString('vi-VN')}đ
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
              <button
                onClick={() => { addToCart(food); onClose(); }}
                style={{
                  padding: '10px 18px', backgroundColor: 'transparent', color: '#10b981',
                  border: '1.5px solid #10b981', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: '700', fontSize: '14px', transition: '0.2s'
                }}
                onMouseOver={e => { e.currentTarget.style.backgroundColor = '#10b981'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#10b981'; }}
              >
                🛒 Giỏ hàng
              </button>
              <button
                onClick={() => { handleBuyNow(food); onClose(); }}
                style={{
                  padding: '10px 18px', backgroundColor: '#f97316', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontWeight: '700', fontSize: '14px', transition: '0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#ea580c'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#f97316'}
              >
                ⚡ Đặt ngay
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const FoodCard = ({ item, addToCart, handleBuyNow }) => {
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowDetail(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          backgroundColor: '#1a2236',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: hovered ? '0 12px 32px rgba(16,185,129,0.18)' : '0 4px 16px rgba(0,0,0,0.3)',
          transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          cursor: 'pointer',
          border: hovered ? '1px solid #10b98155' : '1px solid #1f2937',
          position: 'relative'
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: '180px', overflow: 'hidden' }}>
          <img
            src={imgError ? DEFAULT_IMAGE : (item.image || DEFAULT_IMAGE)}
            alt={item.name}
            onError={() => setImgError(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.4s ease'
            }}
          />
          {/* Category pill */}
          <span style={{
            position: 'absolute', top: '10px', left: '10px',
            backgroundColor: 'rgba(5,150,105,0.9)', color: '#fff',
            fontSize: '10px', fontWeight: '700', padding: '3px 9px',
            borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px',
            backdropFilter: 'blur(4px)'
          }}>
            {item.category || 'Món ăn'}
          </span>
          {/* Overlay on hover */}
          <div style={{
            position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.35)',
            opacity: hovered ? 1 : 0, transition: 'opacity 0.25s',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '700', letterSpacing: '1px' }}>
              👆 Xem chi tiết
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 15px 15px' }}>
          <h4 style={{
            margin: '0 0 6px', color: '#f1f5f9', fontSize: '15px', fontWeight: '700',
            lineHeight: '1.3', height: '40px', overflow: 'hidden',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
          }}>
            {item.name}
          </h4>

          {/* Restaurant name */}
          {(item.restaurant_id?.store_name || item.restaurant_name) && (
            <div style={{ color: '#10b981', fontSize: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🏪</span>
              <span style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {item.restaurant_id?.store_name || item.restaurant_name}
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#10b981', fontWeight: '800', fontSize: '17px' }}>
              {(item.price || 0).toLocaleString('vi-VN')}đ
            </span>
            <StarRating rating={item.rating || 4.5} />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={e => { e.stopPropagation(); addToCart(item); }}
              title="Thêm vào giỏ hàng"
              style={{
                width: '40px', height: '38px', padding: '0', backgroundColor: 'rgba(16,185,129,0.12)',
                color: '#10b981', border: '1.5px solid #10b981', borderRadius: '8px',
                cursor: 'pointer', fontSize: '16px', transition: '0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}
              onMouseOver={e => { e.currentTarget.style.backgroundColor = '#10b981'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.12)'; e.currentTarget.style.color = '#10b981'; }}
            >🛒</button>

            <button
              onClick={e => { e.stopPropagation(); handleBuyNow(item); }}
              style={{
                flex: 1, height: '38px', padding: '0 10px', backgroundColor: '#f97316',
                color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
                fontWeight: '700', fontSize: '13px', transition: '0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#ea580c'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#f97316'}
            >⚡ Đặt ngay</button>
          </div>
        </div>
      </div>

      {showDetail && (
        <FoodDetailModal
          food={item}
          onClose={() => setShowDetail(false)}
          addToCart={addToCart}
          handleBuyNow={handleBuyNow}
        />
      )}
    </>
  );
};

export default FoodCard;