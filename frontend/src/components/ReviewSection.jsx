import React, { useState, useEffect } from 'react';

const ReviewSection = ({ restaurantId }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL 
          ? `${import.meta.env.VITE_API_BASE_URL}/reviews/restaurant/${restaurantId}`
          : `http://localhost:5000/api/reviews/restaurant/${restaurantId}`;
          
        const res = await fetch(apiUrl);
        const data = await res.json();
        
        if (data.success || data.status === 'success') {
          setReviews(data.data || data.reviews || []);
        }
      } catch (err) {
        setError('Không thể tải đánh giá lúc này.');
      } finally {
        setLoading(false);
      }
    };
    if (restaurantId) fetchReviews();
  }, [restaurantId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return alert('Vui lòng nhập nội dung đánh giá!');

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token'); 
      const apiUrl = import.meta.env.VITE_API_BASE_URL 
        ? `${import.meta.env.VITE_API_BASE_URL}/reviews`
        : 'http://localhost:5000/api/reviews';

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ restaurantId, rating, comment })
      });

      const data = await res.json();
      if (res.ok && (data.success || data.status === 'success')) {
        setReviews([data.data || data.review, ...reviews]);
        setComment('');
        setRating(5);
        alert('Cảm ơn bạn đã đánh giá!');
      } else {
        alert(data.message || 'Có lỗi xảy ra khi gửi đánh giá.');
      }
    } catch (err) {
      alert('Lỗi kết nối máy chủ!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', color: '#ffffff' }}>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>
        ⭐ Đánh giá từ khách hàng
      </h3>

      {/* HIỂN THỊ DANH SÁCH ĐÁNH GIÁ CŨ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto', marginBottom: '20px' }}>
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Đang tải đánh giá...</p>
        ) : error ? (
          <p style={{ color: '#ef4444' }}>{error}</p>
        ) : reviews.length === 0 ? (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        ) : (
          reviews.map((rev, index) => (
            <div key={rev._id || index} style={{ backgroundColor: '#0b0f19', padding: '15px', borderRadius: '8px', border: '1px solid #1f2937' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{rev.userId?.full_name || 'Khách hàng ẩn danh'}</span>
                <span style={{ color: '#fbbf24', fontSize: '16px' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
              </div>
              <p style={{ margin: '0 0 8px 0', color: '#e2e8f0', fontSize: '14px', lineHeight: '1.5', textAlign: 'left' }}>{rev.comment}</p>
              
              {rev.reply_from_store && (
                <div style={{ marginTop: '10px', padding: '10px 12px', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid #10b981', borderRadius: '4px', fontSize: '13px', color: '#10b981', textAlign: 'left', marginBottom: '8px' }}>
                  <strong>🏪 Phản hồi từ quán:</strong> {rev.reply_from_store}
                </div>
              )}

              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FORM GỬI ĐÁNH GIÁ MỚI */}
      <form onSubmit={handleSubmitReview} style={{ borderTop: '1px solid #1f2937', paddingTop: '20px' }}>
        <h4 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' }}>Viết đánh giá của bạn</h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <span style={{ marginRight: '15px', color: '#94a3b8', fontSize: '14px' }}>Chất lượng:</span>
          <div style={{ display: 'flex', gap: '5px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{ 
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', padding: 0,
                  color: star <= rating ? '#fbbf24' : '#475569', transition: 'color 0.2s'
                }}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows="3"
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#ffffff', fontSize: '14px', outline: 'none', resize: 'vertical' }}
          placeholder="Chia sẻ trải nghiệm của bạn về cửa hàng nhé..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        
        <button
          type="submit"
          disabled={submitting}
          style={{ marginTop: '15px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 24px', fontSize: '14px', fontWeight: 'bold', borderRadius: '6px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, transition: 'background-color 0.2s' }}
        >
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>
    </div>
  );
};

export default ReviewSection;