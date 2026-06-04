const ChatMessenger = ({
  chatContacts,
  selectedContact,
  handleSelectContact,
  chatSearchQuery,
  setChatSearchQuery,
  chatMessages,
  newMessageText,
  setNewMessageText,
  handleSendMessage,
  currentUser
}) => {
  return (
    <div style={{ display: 'flex', height: '550px', backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
      {/* Chat - Left Pane: Contact list */}
      <div style={{ width: '35%', minWidth: '150px', borderRight: '1px solid #1f2937', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px', borderBottom: '1px solid #1f2937', fontWeight: 'bold', color: '#00e676', fontSize: '15px', fontFamily: 'var(--sans)', lineHeight: 1.3 }}>Hội thoại</div>
        
        {/* 🔍 Search box (matching email/username only) */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #1f2937' }}>
          <input
            type="text"
            placeholder="Tìm theo username (email)..."
            value={chatSearchQuery}
            onChange={(e) => setChatSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#0b0f19',
              border: '1px solid #1f2937',
              borderRadius: '6px',
              color: '#f1f5f9',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {(() => {
            const filteredContacts = chatContacts.filter(c => {
              if (!chatSearchQuery.trim()) return true;
              return c.email && c.email.toLowerCase().includes(chatSearchQuery.toLowerCase());
            });
            
            if (filteredContacts.length === 0) {
              return <div style={{ padding: '20px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>Không tìm thấy người liên lạc.</div>;
            }
            
            return filteredContacts.map(c => {
              const isActive = selectedContact && selectedContact._id === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => handleSelectContact(c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    borderBottom: '1px solid #1f2937',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'rgba(0, 230, 118, 0.08)' : 'transparent',
                    transition: '0.2s',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#1f2937'; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', border: c.isVirtual ? '1px solid #00e676' : '1px solid #64748b', flexShrink: 0 }}>
                    {c.role === 'merchant' ? '🏪' : c.role === 'driver' ? '🛵' : '👤'}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.full_name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'capitalize' }}>{c.role === 'customer' ? 'Khách' : c.role === 'merchant' ? 'Cửa Hàng' : c.role === 'driver' ? 'Shipper' : c.role}</div>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* Chat - Right Pane: Dialog view */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedContact ? (
          <>
            {/* Header */}
            <div style={{ padding: '14px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0b0f19' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                {selectedContact.role === 'merchant' ? '🏪' : selectedContact.role === 'driver' ? '🛵' : '👤'}
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#f1f5f9' }}>{selectedContact.full_name}</span>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#0b0f19' }}>
              {chatMessages.length === 0 ? (
                <div style={{ margin: 'auto', color: '#64748b', fontSize: '12px', textAlign: 'center' }}>Vẫy tay chào nhau để bắt đầu chat! 👋</div>
              ) : (
                chatMessages.map((m, idx) => {
                  const isMe = m.sender_id === 'me' || (currentUser && m.sender_id === currentUser._id);
                  return (
                    <div
                      key={m._id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                        width: '100%'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '8px 12px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          lineHeight: '1.4',
                          backgroundColor: isMe ? '#10b981' : '#1f2937',
                          color: 'white',
                          borderRadiusStyle: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0'
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Message Box Input */}
            <form onSubmit={handleSendMessage} style={{ padding: '12px', borderTop: '1px solid #1f2937', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Nhập nội dung nhắn..."
                value={newMessageText}
                onChange={e => setNewMessageText(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '8px', color: '#f1f5f9', fontSize: '13px', outline: 'none' }}
              />
              <button
                type="submit"
                style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
              >
                Gửi
              </button>
            </form>
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>💬</div>
            <p style={{ fontSize: '14px' }}>Chọn một đối tác chat ở danh sách bên trái để kết nối</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessenger;
