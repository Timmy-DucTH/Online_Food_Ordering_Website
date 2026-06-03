import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createOrderAPI } from '../services/api';

const MOCK_FRIENDS = [
  { id: '65bf80010000000000000001', username: 'duyquang', name: 'Đỗ Duy Quang' },
  { id: '65bf80010000000000000002', username: 'duchuy', name: 'Nguyễn Đức Huy' },
  { id: '65bf80010000000000000003', username: 'quynhanh', name: 'Lê Quỳnh Anh' }
];

const DATABASE_USERS = [
  { id: '65bf80010000000000000001', username: 'duyquang', name: 'Đỗ Duy Quang' },
  { id: '65bf80010000000000000002', username: 'duchuy', name: 'Nguyễn Đức Huy' },
  { id: '65bf80010000000000000003', username: 'quynhanh', name: 'Lê Quỳnh Anh' },
  { id: '65bf80010000000000000004', username: 'haidang', name: 'Lê Võ Hải Đăng' },
  { id: '65bf80010000000000000005', username: 'vankhach', name: 'Trần Văn Khách' },
  { id: '65bf80010000000000000006', username: 'anvat', name: 'Phạm Thị Ăn Vặt' }
];

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy danh sách món ăn được truyền từ Navbar sang, lưu vào state để có thể thêm bớt món ăn
  const [selectedItems, setSelectedItems] = useState(location.state?.selectedItems || []);

  // --- STATE QUẢN LÝ THÔNG TIN KHÁCH HÀNG ---
  const [shippingInfo, setShippingInfo] = useState({
    name: 'Duy Quang',
    phone: '0923456789',
    address: '',
    note: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('COD'); // Mặc định: Tiền mặt
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- STATE ĐẶT HÀNG NHÓM (GROUP ORDER) ---
  const [orderType, setOrderType] = useState('single'); // single hoặc group
  const [selectedFriends, setSelectedFriends] = useState([]); // Array of ObjectIds
  const [paymentSplit, setPaymentSplit] = useState('equal'); // equal (chia đều) hoặc individual (tự trả)

  // --- STATE QUẢN LÝ THÀNH VIÊN ĐẶT CHUNG & THÊM MÓN ---
  const [friends, setFriends] = useState(MOCK_FRIENDS);
  const [searchFriendQuery, setSearchFriendQuery] = useState('');
  const [availableFoods, setAvailableFoods] = useState([]);
  const [searchFoodQuery, setSearchFoodQuery] = useState('');

  useEffect(() => {
    const fetchAvailableFoods = async () => {
      try {
        const res = await fetch('/api/foods');
        const data = await res.json();
        if (data.status === 'success') {
          setAvailableFoods(data.foods);
        }
      } catch (err) {
        console.error('Error fetching foods on checkout:', err);
      }
    };
    fetchAvailableFoods();
  }, []);

  const handleAddFriendBySearch = () => {
    if (!searchFriendQuery.trim()) return;
    const query = searchFriendQuery.trim().toLowerCase();
    
    // Check if friend is already in friends list
    const isAlreadyInList = friends.some(f => f.username.toLowerCase() === query);
    if (isAlreadyInList) {
      const foundFriend = friends.find(f => f.username.toLowerCase() === query);
      if (foundFriend && !selectedFriends.includes(foundFriend.id)) {
        setSelectedFriends(prev => [...prev, foundFriend.id]);
      }
      setSearchFriendQuery('');
      return;
    }

    // Try finding in database users
    const matchedDbUser = DATABASE_USERS.find(u => u.username.toLowerCase() === query);
    if (matchedDbUser) {
      setFriends(prev => [...prev, matchedDbUser]);
      if (!selectedFriends.includes(matchedDbUser.id)) {
        if (selectedFriends.length >= 19) {
          showError('Quy định hệ thống: Đơn đặt hàng theo nhóm không vượt quá 20 thành viên!');
          return;
        }
        setSelectedFriends(prev => [...prev, matchedDbUser.id]);
      }
    } else {
      // Add a custom friend if user typed a completely new username
      const customId = 'custom_' + Date.now();
      const customFriend = {
        id: customId,
        username: query,
        name: query
      };
      setFriends(prev => [...prev, customFriend]);
      if (selectedFriends.length >= 19) {
        showError('Quy định hệ thống: Đơn đặt hàng theo nhóm không vượt quá 20 thành viên!');
        return;
      }
      setSelectedFriends(prev => [...prev, customId]);
    }
    setSearchFriendQuery('');
  };

  const handleSelectFriendSuggestion = (user) => {
    const isAlreadyInList = friends.some(f => f.id === user.id);
    if (!isAlreadyInList) {
      setFriends(prev => [...prev, user]);
    }
    if (!selectedFriends.includes(user.id)) {
      if (selectedFriends.length >= 19) {
        showError('Quy định hệ thống: Đơn đặt hàng theo nhóm không vượt quá 20 thành viên!');
        return;
      }
      setSelectedFriends(prev => [...prev, user.id]);
    }
    setSearchFriendQuery('');
  };

  // ==========================================
  // STATE QUẢN LÝ MODAL THÔNG BÁO LỖI GIỮA MÀN HÌNH
  // ==========================================
  const [showErrModal, setShowErrModal] = useState(false);
  const [errModalMsg, setErrModalMsg] = useState('');

  const showError = (msg) => {
    setErrModalMsg(msg);
    setShowErrModal(true);
  };

  // --- TÍNH TOÁN HÓA ĐƠN ---
  const totalMoney = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = totalMoney > 0 ? 15000 : 0; // Phí ship 15k
  const finalTotal = totalMoney + shippingFee;

  // --- PHÂN BỔ TIỀN THANH TOÁN (BM6) ---
  const totalPeople = selectedFriends.length + 1; // Nhóm + Trưởng nhóm
  const splitShipFee = shippingFee / totalPeople;

  const paymentAllocationList = [];
  if (orderType === 'group') {
    if (paymentSplit === 'equal') {
      const equalShare = finalTotal / totalPeople;
      // Trưởng nhóm
      paymentAllocationList.push({
        name: 'Bạn (Trưởng nhóm)',
        itemsCost: totalMoney / totalPeople,
        shipCost: splitShipFee,
        totalPay: equalShare
      });
      // Thành viên
      selectedFriends.forEach(friendId => {
        const friend = friends.find(f => f.id === friendId);
        paymentAllocationList.push({
          name: friend ? `@${friend.username}` : 'Thành viên',
          itemsCost: totalMoney / totalPeople,
          shipCost: splitShipFee,
          totalPay: equalShare
        });
      });
    } else {
      // Phân bổ tự trả theo món (phân chia món ăn xoay vòng hoặc phân tách)
      // Mặc định phân bổ: Món 1 cho Trưởng nhóm, Món 2 cho Bạn 1, Món 3 cho Bạn 2, xoay vòng
      const allocationMap = { me: 0 };
      selectedFriends.forEach(fid => { allocationMap[fid] = 0; });

      selectedItems.forEach((item, index) => {
        const personKey = index === 0 ? 'me' : selectedFriends[(index - 1) % selectedFriends.length] || 'me';
        allocationMap[personKey] += item.price * item.quantity;
      });

      // Trưởng nhóm
      paymentAllocationList.push({
        name: 'Bạn (Trưởng nhóm)',
        itemsCost: allocationMap['me'],
        shipCost: splitShipFee,
        totalPay: allocationMap['me'] + splitShipFee
      });
      // Thành viên
      selectedFriends.forEach(friendId => {
        const friend = friends.find(f => f.id === friendId);
        const cost = allocationMap[friendId] || 0;
        paymentAllocationList.push({
          name: friend ? `@${friend.username}` : 'Thành viên',
          itemsCost: cost,
          shipCost: splitShipFee,
          totalPay: cost + splitShipFee
        });
      });
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleFriend = (friendId) => {
    setSelectedFriends(prev => {
      if (prev.includes(friendId)) {
        return prev.filter(id => id !== friendId);
      } else {
        // Giới hạn 20 người bao gồm cả chủ nhóm (QĐ8) => Tối đa 19 bạn bè
        if (prev.length >= 19) {
          showError('Quy định hệ thống: Đơn đặt hàng theo nhóm không vượt quá 20 thành viên!');
          return prev;
        }
        return [...prev, friendId];
      }
    });
  };

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (!shippingInfo.address.trim()) {
      showError('Vui lòng nhập địa chỉ giao hàng để TasteByte gửi shipper đến nhé! 📍');
      return;
    }
    
    setLoading(true);
    try {
      // Chuẩn hóa item để đính kèm buyer_id đúng đắn nếu là đơn hàng nhóm
      const processedItems = selectedItems.map((item, index) => {
        let buyerId = 'me'; // Default
        if (orderType === 'group' && selectedFriends.length > 0) {
          buyerId = index === 0 ? 'me' : selectedFriends[(index - 1) % selectedFriends.length] || 'me';
        }
        return {
          ...item,
          buyer_id: buyerId === 'me' ? undefined : buyerId // backend will auto-assign creator_id if buyer_id is not custom ObjectId
        };
      });

      const orderPayload = {
        shipping_address: shippingInfo.address,
        payment_method: paymentMethod,
        items: processedItems,
        note: shippingInfo.note,
        order_type: orderType,
        members: orderType === 'group' ? selectedFriends : []
      };
      
      const res = await createOrderAPI(orderPayload);
      if (res.data.status === 'success') {
        setShowSuccessModal(true);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate('/home'); 
  };

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
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', padding: '30px 10px', color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* TIÊU ĐỀ TRANG */}
        <h2 style={{ color: '#10b981', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px', fontWeight: '800' }}>
          <span onClick={() => navigate('/home')} style={{ cursor: 'pointer', fontSize: '22px', backgroundColor: '#111827', padding: '5px 12px', borderRadius: '6px', border: '1px solid #1f2937' }}>⬅️</span> 
          Thủ Tục Thanh Toán Đơn Hàng
        </h2>

        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
          
          {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG & PHƯƠNG THỨC */}
          <div style={{ flex: '1.3', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. CHỌN LOẠI ĐƠN HÀNG (CÁ NHÂN HOẶC NHÓM) */}
            <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '8px', border: '1px solid #1f2937', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#00e676', borderBottom: '2px solid #10b981', paddingBottom: '8px', fontWeight: '700' }}>
                👥 Loại Đơn Hàng
              </h3>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                <button
                  onClick={() => setOrderType('single')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                    backgroundColor: orderType === 'single' ? '#10b981' : '#1f2937',
                    color: orderType === 'single' ? '#fff' : '#94a3b8',
                    border: '1.5px solid ' + (orderType === 'single' ? '#10b981' : '#374151'),
                    transition: '0.2s'
                  }}
                >
                  🍔 Đơn hàng cá nhân
                </button>
                <button
                  onClick={() => setOrderType('group')}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                    backgroundColor: orderType === 'group' ? '#10b981' : '#1f2937',
                    color: orderType === 'group' ? '#fff' : '#94a3b8',
                    border: '1.5px solid ' + (orderType === 'group' ? '#10b981' : '#374151'),
                    transition: '0.2s'
                  }}
                >
                  🧑‍🤝‍🧑 Đặt hàng nhóm (Group Order)
                </button>
              </div>

              {/* Giao diện cài đặt Đặt hàng nhóm */}
              {orderType === 'group' && (
                <div style={{ marginTop: '20px', backgroundColor: '#0b0f19', padding: '20px', borderRadius: '8px', border: '1px solid #1f2937' }}>
                  {/* Tìm kiếm bạn bè đặt chung */}
                  <div style={{ marginBottom: '15px', position: 'relative' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '5px' }}>
                      Tìm kiếm bạn bè đặt chung theo username:
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        type="text"
                        placeholder="Nhập username (ví dụ: haidang, anvat...)"
                        value={searchFriendQuery}
                        onChange={(e) => setSearchFriendQuery(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: '#0b0f19',
                          border: '1px solid #1f2937',
                          borderRadius: '6px',
                          color: '#fff',
                          outline: 'none',
                          fontSize: '13px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddFriendBySearch}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          padding: '0 15px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '13px'
                        }}
                      >
                        Thêm
                      </button>
                    </div>
                    {/* Suggestions dropdown */}
                    {searchFriendQuery.trim() && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '6px',
                        zIndex: 10,
                        marginTop: '5px',
                        maxHeight: '150px',
                        overflowY: 'auto',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                      }}>
                        {DATABASE_USERS.filter(u => 
                          u.username.toLowerCase().includes(searchFriendQuery.toLowerCase())
                        ).map(u => (
                          <div
                            key={u.id}
                            onClick={() => handleSelectFriendSuggestion(u)}
                            style={{
                              padding: '10px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #374151',
                              color: '#e2e8f0',
                              fontSize: '13px'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          >
                            @{u.username} ({u.name})
                          </div>
                        ))}
                        {DATABASE_USERS.filter(u => 
                          u.username.toLowerCase().includes(searchFriendQuery.toLowerCase())
                        ).length === 0 && (
                          <div
                            onClick={() => handleSelectFriendSuggestion({ id: 'custom_' + Date.now(), username: searchFriendQuery, name: searchFriendQuery })}
                            style={{
                              padding: '10px',
                              cursor: 'pointer',
                              color: '#10b981',
                              fontStyle: 'italic',
                              fontSize: '13px'
                            }}
                          >
                            Thêm bạn mới: @{searchFriendQuery}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#00e676', display: 'block', marginBottom: '10px' }}>Chọn bạn bè đặt chung:</label>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {friends.map(friend => {
                      const isChecked = selectedFriends.includes(friend.id);
                      return (
                        <label key={friend.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2e8f0', cursor: 'pointer', fontSize: '14px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleFriend(friend.id)}
                            style={{ accentColor: '#00e676', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          @{friend.username}
                        </label>
                      );
                    })}
                  </div>

                  {selectedFriends.length > 0 && (
                    <>
                      <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#00e676', display: 'block', marginBottom: '10px' }}>Chọn phương thức phân bổ thanh toán:</label>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button
                          type="button"
                          onClick={() => setPaymentSplit('equal')}
                          style={{
                            flex: 1, padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                            backgroundColor: paymentSplit === 'equal' ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
                            color: paymentSplit === 'equal' ? '#00e676' : '#94a3b8',
                            border: '1px solid ' + (paymentSplit === 'equal' ? '#00e676' : '#374151'),
                            transition: '0.2s'
                          }}
                        >
                          Chia đều hóa đơn ⚖️
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentSplit('individual')}
                          style={{
                            flex: 1, padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                            backgroundColor: paymentSplit === 'individual' ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
                            color: paymentSplit === 'individual' ? '#00e676' : '#94a3b8',
                            border: '1px solid ' + (paymentSplit === 'individual' ? '#00e676' : '#374151'),
                            transition: '0.2s'
                          }}
                        >
                          Tự trả theo món ăn 🍽️
                        </button>
                      </div>

                      {/* Bảng phân bổ chi tiết */}
                      <div style={{ borderTop: '1px solid #1f2937', paddingTop: '15px' }}>
                        <h4 style={{ color: '#ffffff', fontSize: '13px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BẢNG PHÂN BỔ TIỀN THANH TOÁN</h4>
                        
                        <div style={{ backgroundColor: '#111827', borderRadius: '6px', padding: '12px', border: '1px solid #1f2937' }}>
                          {paymentAllocationList.map((alloc, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: i < paymentAllocationList.length - 1 ? '1px dashed #1f2937' : 'none' }}>
                              <span style={{ color: '#cbd5e1' }}>{alloc.name}</span>
                              <span style={{ fontWeight: 'bold', color: '#00e676' }}>
                                {Math.round(alloc.totalPay).toLocaleString()}đ 
                                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'normal', marginLeft: '4px' }}>
                                  ({Math.round(alloc.itemsCost).toLocaleString()}đ món + {Math.round(alloc.shipCost).toLocaleString()}đ ship)
                                </span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

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

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: paymentMethod === 'wallet' ? '1px solid #10b981' : '1px solid #1f2937', borderRadius: '8px', backgroundColor: paymentMethod === 'wallet' ? 'rgba(16,185,129,0.05)' : 'transparent', cursor: 'pointer' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} style={{ width: '18px', height: '18px', accentColor: '#00e676' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#e2e8f0' }}>Ví điện tử MoMo 🌟</strong>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Thanh toán qua Ví MoMo giả lập trực tuyến</span>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: paymentMethod === 'card' ? '1px solid #10b981' : '1px solid #1f2937', borderRadius: '8px', backgroundColor: paymentMethod === 'card' ? 'rgba(16,185,129,0.05)' : 'transparent', cursor: 'pointer' }}>
                  <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} style={{ width: '18px', height: '18px', accentColor: '#00e676' }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '14px', color: '#e2e8f0' }}>Thẻ tín dụng / Thẻ ghi nợ 💳</strong>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>Hỗ trợ Visa, Mastercard, JCB thanh toán quốc tế</span>
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i));
                          }}
                          style={{
                            backgroundColor: '#1f2937',
                            color: '#fff',
                            border: 'none',
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 'bold' }}>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
                          }}
                          style={{
                            backgroundColor: '#1f2937',
                            color: '#fff',
                            border: 'none',
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedItems(prev => prev.filter(i => i.id !== item.id));
                          }}
                          style={{
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            border: 'none',
                            marginLeft: '10px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#00e676', fontSize: '14px' }}>
                      {(item.price * item.quantity).toLocaleString()}đ
                    </span>
                  </div>
                ))}
              </div>

              {/* Thêm món ăn vào đơn hàng bằng Tìm Kiếm */}
              <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #1f2937', marginBottom: '20px', position: 'relative' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
                  ➕ Tìm kiếm và thêm món ăn khác:
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên món ăn (ví dụ: cơm tấm, ramen, trà sữa...)"
                  value={searchFoodQuery}
                  onChange={(e) => setSearchFoodQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#0b0f19',
                    border: '1px solid #1f2937',
                    borderRadius: '6px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
                
                {/* Suggestions list for foods */}
                {searchFoodQuery.trim() && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    zIndex: 20,
                    marginTop: '5px',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.4)'
                  }}>
                    {availableFoods
                      .filter(f => f.name.toLowerCase().includes(searchFoodQuery.toLowerCase()))
                      .map(food => (
                        <div
                          key={food._id}
                          onClick={() => {
                            setSelectedItems(prev => {
                              const existing = prev.find(item => item.id === food._id);
                              if (existing) {
                                return prev.map(item => item.id === food._id ? { ...item, quantity: item.quantity + 1 } : item);
                              }
                              return [...prev, {
                                id: food._id,
                                _id: food._id,
                                name: food.name,
                                price: food.price,
                                quantity: 1,
                                restaurant_id: food.restaurant_id
                              }];
                            });
                            setSearchFoodQuery('');
                          }}
                          style={{
                            padding: '10px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #374151',
                            color: '#e2e8f0',
                            fontSize: '13px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ fontWeight: 'bold' }}>{food.name}</div>
                          <div style={{ fontSize: '11px', color: '#00e676', marginTop: '2px' }}>
                            {food.price.toLocaleString()}đ
                            <span style={{ color: '#94a3b8', marginLeft: '8px' }}>
                              ({food.restaurant_name || (food.restaurant_id?.store_name) || 'Quán ăn'})
                            </span>
                          </div>
                        </div>
                      ))}
                    {availableFoods.filter(f => f.name.toLowerCase().includes(searchFoodQuery.toLowerCase())).length === 0 && (
                      <div style={{ padding: '10px', color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>
                        Không tìm thấy món ăn nào phù hợp
                      </div>
                    )}
                  </div>
                )}
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
                disabled={loading}
                style={{ width: '100%', backgroundColor: loading ? '#4b5563' : '#10b981', color: 'white', border: 'none', padding: '14px 0', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: loading ? 'none' : '0 4px 12px rgba(16,185,129,0.3)', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => { if (!loading) e.target.style.backgroundColor = '#059669'; }}
                onMouseOut={(e) => { if (!loading) e.target.style.backgroundColor = '#10b981'; }}
              >
                {loading ? '⏳ ĐANG KHỞI TẠO ĐƠN HÀNG...' : '🚀 XÁC NHẬN ĐẶT ĐƠN HÀNG'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ❌ MODAL THÔNG BÁO LỖI GIỮA TRANG */}
      {showErrModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(3, 7, 18, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#111827', width: '420px', padding: '32px', borderRadius: '16px', border: '1px solid #ef444440', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h4 style={{ fontSize: '20px', margin: '0 0 12px 0', color: '#ef4444', fontWeight: '800' }}>Thông Báo</h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px 0', fontWeight: '500' }}>
              {errModalMsg}
            </p>
            <button
              onClick={() => setShowErrModal(false)}
              style={{ padding: '10px 32px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseOver={(e) => e.target.style.opacity = '0.85'}
              onMouseOut={(e) => e.target.style.opacity = '1'}
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}

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
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                {paymentMethod === 'COD' ? 'Vui lòng chuẩn bị sẵn số tiền mặt:' : 'Trạng thái thanh toán:'}
              </span>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#00e676', marginTop: '3px' }}>
                {paymentMethod === 'COD' ? `${finalTotal.toLocaleString()}đ` : 'Đã thanh toán trực tuyến ✓'}
              </div>
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