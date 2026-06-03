import { useState } from 'react';

const SocialFeed = ({
  posts,
  newPostContent,
  setNewPostContent,
  newPostImage,
  setNewPostImage,
  postLoading,
  handleCreatePost,
  handleLikePost,
  toggleComments,
  commentsOpen,
  commentInputs,
  setCommentInputs,
  handleAddComment,
  handleDeletePost,
  currentUser,
  isLoggedIn
}) => {
  const [fileError, setFileError] = useState('');

  const handleFileChange = (e) => {
    setFileError('');
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra dung lượng dưới 2MB
      if (file.size > 2 * 1024 * 1024) {
        setFileError('Dung lượng ảnh phải dưới 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPostImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {/* Write Post Box */}
      <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#00e676', fontWeight: '700' }}>Tạo Bài Đăng Cộng Đồng</h3>
        <form onSubmit={handleCreatePost}>
          <textarea
            placeholder="Bạn vừa trải nghiệm món ăn gì ngon? Chia sẻ cùng cộng đồng TasteByte nhé..."
            value={newPostContent}
            onChange={e => setNewPostContent(e.target.value)}
            style={{ width: '100%', minHeight: '90px', padding: '12px', backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '8px', color: '#f1f5f9', outline: 'none', resize: 'vertical', fontSize: '14px', boxSizing: 'border-box' }}
          />

          {/* Alert File Error if any */}
          {fileError && (
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#ff424e', fontWeight: 'bold' }}>
              ⚠️ {fileError}
            </p>
          )}

          {/* Image Upload Preview */}
          {newPostImage && (
            <div style={{ position: 'relative', marginTop: '10px', display: 'inline-block', width: '120px', height: '90px', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid #10b981' }}>
              <img src={newPostImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => setNewPostImage('')}
                style={{
                  position: 'absolute', top: '4px', right: '4px',
                  backgroundColor: '#ff424e', color: 'white',
                  border: 'none', borderRadius: '50%', width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', cursor: 'pointer', fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}
                title="Gỡ hình ảnh"
              >
                ✕
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'}
            >
              📷 Chọn ảnh thiết bị
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>

            <span style={{ color: '#64748b', fontSize: '13px' }}>Hoặc</span>

            <input
              type="text"
              placeholder="Dán link URL hình ảnh..."
              value={newPostImage.startsWith('data:image/') ? '' : newPostImage}
              onChange={e => setNewPostImage(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '8px 12px', backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '8px', color: '#f1f5f9', outline: 'none', fontSize: '13px' }}
            />
            
            <button
              type="submit"
              disabled={postLoading || !newPostContent.trim()}
              style={{
                padding: '8px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (postLoading || !newPostContent.trim()) ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: 'all 0.2s',
                opacity: (postLoading || !newPostContent.trim()) ? 0.6 : 1,
                boxShadow: (postLoading || !newPostContent.trim()) ? 'none' : '0 4px 10px rgba(16, 185, 129, 0.2)'
              }}
            >
              {postLoading ? 'Đang đăng...' : 'Đăng Bài 🚀'}
            </button>
          </div>
        </form>
      </div>

      {/* Feed List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', color: '#64748b' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>📢</div>
            <p>Chưa có bài đăng nào trên Bảng tin. Hãy là người đầu tiên chia sẻ món ngon!</p>
          </div>
        ) : (
          posts.map(post => {
            const isLiked = currentUser && post.reacts && post.reacts.includes(currentUser._id);
            return (
              <div key={post._id} style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                {/* Post Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1f2937', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                      {post.author_id?.role === 'merchant' ? '🏪' : '👤'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 'bold', color: '#f1f5f9' }}>{post.author_id?.full_name || 'Khách Hàng Ẩn Danh'}</span>
                        {post.author_id?.role === 'merchant' && <span style={{ fontSize: '10px', backgroundColor: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>Đối Tác</span>}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>

                  {/* Delete Action if owner/admin */}
                  {currentUser && (post.author_id?._id === currentUser._id || currentUser.role === 'admin') && (
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      style={{ backgroundColor: 'transparent', border: 'none', color: '#ff424e', cursor: 'pointer', fontSize: '14px' }}
                      title="Xóa bài viết"
                    >
                      🗑️ Xóa
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#e2e8f0', margin: '0 0 14px 0', whiteSpace: 'pre-line' }}>{post.content}</p>
                
                {/* Attachments */}
                {post.images && post.images.length > 0 && post.images[0] && (
                  <div style={{ width: '100%', maxHeight: '350px', overflow: 'hidden', borderRadius: '8px', marginBottom: '14px', border: '1px solid #1f2937' }}>
                    <img src={post.images[0]} alt="Post media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                )}

                {/* Reactions and actions bar */}
                <div style={{ display: 'flex', gap: '20px', borderTop: '1px solid #1f2937', paddingTop: '12px', fontSize: '13px' }}>
                  <button
                    onClick={() => handleLikePost(post._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', border: 'none', color: isLiked ? '#ef4444' : '#94a3b8', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    <span>{isLiked ? '❤️' : '🤍'}</span> Thích ({post.reacts ? post.reacts.length : 0})
                  </button>

                  <button
                    onClick={() => toggleComments(post._id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    <span>💬</span> Bình luận ({post.Comments ? post.Comments.length : 0})
                  </button>
                </div>

                {/* Comments Drawer */}
                {commentsOpen[post._id] && (
                  <div style={{ marginTop: '14px', borderTop: '1px dashed #1f2937', paddingTop: '14px' }}>
                    {/* Comment Write Box */}
                    {isLoggedIn && (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <input
                          type="text"
                          placeholder="Nhập bình luận phản hồi..."
                          value={commentInputs[post._id] || ''}
                          onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post._id); }}
                          style={{ flex: 1, padding: '8px 12px', backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '6px', color: '#f1f5f9', fontSize: '13px', outline: 'none' }}
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          style={{ padding: '8px 16px', backgroundColor: 'rgba(0, 230, 118, 0.1)', color: '#00e676', border: '1px solid rgba(0, 230, 118, 0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                        >
                          Gửi
                        </button>
                      </div>
                    )}

                    {/* Comment List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
                      {!post.Comments || post.Comments.length === 0 ? (
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0' }}>Chưa có bình luận nào. Hãy bắt đầu cuộc trò chuyện!</p>
                      ) : (
                        post.Comments.map(c => (
                          <div key={c._id} style={{ display: 'flex', gap: '8px', backgroundColor: '#0b0f19', padding: '10px', borderRadius: '8px', border: '1px solid #1f2937' }}>
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                              {c.user_id?.role === 'merchant' ? '🏪' : '👤'}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#f1f5f9' }}>{c.user_id?.full_name || 'Thành Viên'}</span>
                                <span style={{ fontSize: '10px', color: '#64748b' }}>{new Date(c.created_at || Date.now()).toLocaleString('vi-VN')}</span>
                              </div>
                              <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0 }}>{c.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SocialFeed;
