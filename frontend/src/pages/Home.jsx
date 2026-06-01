import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FoodCard from '../components/FoodCard';

const CATEGORIES = ['Tất cả', 'Burger', 'Pizza', 'Cơm', 'Món nước', 'Trà sữa', 'Cà phê', 'Tráng miệng', 'Đồ ăn nhanh', 'Đồ uống khác', 'Khác'];

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState(null);

  // --- SOCIAL MEDIA STATES ---
  const [activeTab, setActiveTab] = useState('order'); // order, feed, communities, chat, notifications
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  
  // Feed States
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [commentsOpen, setCommentsOpen] = useState({}); // postId -> bool
  const [commentInputs, setCommentInputs] = useState({}); // postId -> text
  const [postLoading, setPostLoading] = useState(false);

  // Notifications States
  const [notifications, setNotifications] = useState([]);
  
  // Chat States
  const [chatContacts, setChatContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [virtualMessages, setVirtualMessages] = useState({
    'system_default_1': [
      { sender_id: 'system_default_1', receiver_id: 'me', content: 'Xin chào! Đây là kênh Hỗ trợ & Phản hồi tự động của Hệ thống TasteByte. Hãy để lại tin nhắn nếu bạn cần trợ giúp nhé!', createdAt: new Date(Date.now() - 1800000).toISOString() }
    ],
    'driver_default_1': [
      { sender_id: 'driver_default_1', receiver_id: 'me', content: 'Chào bạn, mình là shipper Hùng, lát nữa giao đồ ăn mình sẽ gọi điện nhé!', createdAt: new Date(Date.now() - 3600000).toISOString() }
    ],
    'store_default_1': [
      { sender_id: 'store_default_1', receiver_id: 'me', content: 'Kính chào quý khách! TasteByte Support sẵn sàng hỗ trợ giải đáp mọi thắc mắc của bạn.', createdAt: new Date(Date.now() - 7200000).toISOString() }
    ]
  });

  // Communities States
  const [activeCommunity, setActiveCommunity] = useState(null);
  const communitiesList = [
    {
      id: 'milktea',
      name: 'Hội mê trà sữa 🥤',
      description: 'Nơi hội tụ của các tín đồ trà sữa trân châu đường đen, matcha chi ngậy...',
      members: 1420,
      activeToday: 48,
      posts: [
        { author: 'Lê Minh Anh', avatar: '👩', content: 'Mọi người cho hỏi trà sữa Gong Cha dạo này có vị mới gì ngon không? Thấy review Matcha Latte ngon lắm.', likes: 24, replies: 5 },
        { author: 'Trần Hoàng', avatar: '👨', content: 'Topping trân châu hoàng kim của Koi The vẫn là chân ái cuộc đời!!!', likes: 45, replies: 12 }
      ]
    },
    {
      id: 'brokenrice',
      name: 'Hội nghiện sườn bì chả 🍖',
      description: 'Tìm kiếm dĩa cơm tấm ngon nhất Sài Gòn/Hà Nội. Cơm tấm phải có nước mắm kẹo!',
      members: 2310,
      activeToday: 62,
      posts: [
        { author: 'Nguyễn Duy', avatar: '👨', content: 'Cơm tấm bãi rác quận 4 đắt xắt ra miếng nhưng sườn ướp ngon cực kì.', likes: 89, replies: 18 },
        { author: 'Vy Nguyễn', avatar: '👩', content: 'Ai biết chỗ bán cơm tấm ngon khu vực Thủ Đức không ạ? Thèm sườn nướng mỡ hành quá.', likes: 12, replies: 7 }
      ]
    },
    {
      id: 'vegetarian',
      name: 'Cộng đồng ăn chay 🌱',
      description: 'Chia sẻ các địa điểm ăn chay thanh tịnh, công thức món chay bổ dưỡng mỗi ngày.',
      members: 950,
      activeToday: 15,
      posts: [
        { author: 'Diệu Thảo', avatar: '👩', content: 'Hôm nay tự nấu bún riêu chay từ đậu hũ và nấm đùi gà ngon xỉu luôn cả nhà ơi.', likes: 38, replies: 4 }
      ]
    }
  ];

  // Hot food reviews (Right Sidebar)
  const hotReviews = [
    { id: 1, title: 'Trà sữa KOI Thé béo ngậy', author: 'Minh Thư (KOL)', rating: 5, img: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300' },
    { id: 2, title: 'Cơm Tấm sườn nướng mật ong', author: 'Khoai Lang Thang', rating: 4.8, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300' }
  ];

  // Online Friends List
  const onlineFriends = [
    { id: 'driver_default_1', _id: 'driver_default_1', name: 'Shipper Nguyễn Văn Hùng', avatar: '🛵', role: 'driver', isVirtual: true },
    { id: 'store_default_1', _id: 'store_default_1', name: 'TasteByte Customer Support', avatar: '🟢', role: 'merchant', isVirtual: true }
  ];

  // Fetch real food data from API
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/foods');
        const data = await res.json();
        if (data.status === 'success') {
          setFoods(data.foods);
        } else {
          setError('Không thể tải danh sách món ăn.');
        }
      } catch (err) {
        setError('Lỗi kết nối máy chủ.');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  // Fetch User profile info
  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setCurrentUser(data.data);
        }
      })
      .catch(err => console.error('Error loading profile:', err));
    }
  }, [isLoggedIn]);

  // Handle redirect/state passing from other pages (e.g. Navbar support click)
  useEffect(() => {
    if (location.state && location.state.tab) {
      setActiveTab(location.state.tab);
      const selectContactId = location.state.selectContactId;
      if (selectContactId) {
        if (selectContactId === 'system_default_1') {
          const systemContact = {
            _id: 'system_default_1',
            full_name: '🛡️ Hệ thống TasteByte',
            email: 'system@tastebyte.vn',
            role: 'system',
            isVirtual: true
          };
          setSelectedContact(systemContact);
          setChatMessages(virtualMessages['system_default_1'] || [
            { sender_id: 'system_default_1', receiver_id: 'me', content: 'Xin chào! Đây là kênh Hỗ trợ & Phản hồi tự động của Hệ thống TasteByte. Hãy để lại tin nhắn nếu bạn cần trợ giúp nhé!', createdAt: new Date().toISOString() }
          ]);
        }
      }
      // Clear location state to prevent running on every render/reload
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate]);

  // Load feed posts
  const loadPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.status === 'success') {
        setPosts(data.data);
      }
    } catch (e) {
      console.error('Error fetching posts:', e);
    }
  };

  // Fetch notifications
  const loadNotifications = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications(data.data);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  // Sync social details on tab switch
  useEffect(() => {
    if (activeTab === 'feed') {
      loadPosts();
    } else if (activeTab === 'chat') {
      // Load chat contacts
      fetch('/api/messages/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setChatContacts(data.data);
        }
      })
      .catch(err => console.error('Error fetching contacts:', err));
    }
  }, [activeTab]);

  // Periodic notifications check
  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);



  const checkAuthAndExecute = (callback) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return false;
    }
    if (callback) callback();
    return true;
  };

  // Add food to cart
  const addToCart = (foodItem) => {
    checkAuthAndExecute(() => {
      const normalized = { ...foodItem, id: foodItem._id || foodItem.id };
      setCart((prevCart) => {
        const isExist = prevCart.find(item => item.id === normalized.id);
        if (isExist) {
          return prevCart.map(item =>
            item.id === normalized.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevCart, { ...normalized, quantity: 1 }];
      });
    });
  };

  const handleDirectCheckout = (foodItem) => {
    checkAuthAndExecute(() => {
      const directItem = { ...foodItem, id: foodItem._id || foodItem.id, quantity: 1 };
      navigate('/checkout', {
        state: { selectedItems: [directItem] }
      });
    });
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  // Filter foods by category and search
  const filteredFoods = foods.filter(food => {
    const matchCat = selectedCategory === 'Tất cả' || food.category === selectedCategory;
    const matchSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.restaurant_id?.store_name || food.restaurant_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // --- SOCIAL MEDIA LOGIC & HANDLERS ---

  // Handle Post Creation
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return navigate('/login');
    if (!newPostContent.trim()) return;

    setPostLoading(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content: newPostContent,
          images: newPostImage.trim() ? [newPostImage] : []
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setNewPostContent('');
        setNewPostImage('');
        loadPosts();
      } else {
        alert(data.message || 'Lỗi đăng bài viết.');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối tới máy chủ.');
    } finally {
      setPostLoading(false);
    }
  };

  // Toggle Like on Post
  const handleLikePost = async (postId) => {
    if (!isLoggedIn) return navigate('/login');
    try {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPosts(prev => prev.map(p => p._id === postId ? data.data : p));
      }
    } catch (e) {
      console.error('Error liking post:', e);
    }
  };

  // Toggle Comments Drawer
  const toggleComments = (postId) => {
    setCommentsOpen(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Handle Add Comment
  const handleAddComment = async (postId) => {
    if (!isLoggedIn) return navigate('/login');
    const content = commentInputs[postId];
    if (!content || !content.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPosts(prev => prev.map(p => p._id === postId ? data.data : p));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (e) {
      console.error('Error adding comment:', e);
    }
  };

  // Delete Post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setPosts(prev => prev.filter(p => p._id !== postId));
      } else {
        alert(data.message || 'Lỗi khi xóa bài đăng');
      }
    } catch (e) {
      console.error('Error deleting post:', e);
    }
  };

  // Mark notification as read
  const handleMarkNotificationRead = async (notifyId) => {
    try {
      const res = await fetch(`/api/notifications/${notifyId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setNotifications(prev => prev.map(n => n._id === notifyId ? { ...n, is_read: true } : n));
      }
    } catch (e) {
      console.error(e);
    }
  };



  // Select chat contact
  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    if (contact.isVirtual) {
      setChatMessages(virtualMessages[contact._id] || []);
    } else {
      setChatMessages([]);
      fetchMessages(contact._id);
    }
  };

  // Fetch real messages
  const fetchMessages = (otherUserId) => {
    fetch(`/api/messages/${otherUserId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        setChatMessages(data.data);
      }
    })
    .catch(err => console.error('Error loading messages:', err));
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedContact) return;

    const text = newMessageText.trim();
    setNewMessageText('');

    if (selectedContact.isVirtual) {
      // Simulate local message
      const myMsg = {
        _id: 'temp_msg_' + Date.now(),
        sender_id: 'me',
        receiver_id: selectedContact._id,
        content: text,
        createdAt: new Date().toISOString()
      };

      setVirtualMessages(prev => {
        const updated = {
          ...prev,
          [selectedContact._id]: [...(prev[selectedContact._id] || []), myMsg]
        };
        setChatMessages(updated[selectedContact._id]);
        return updated;
      });

      // Simulate bot reply
      setTimeout(() => {
        const query = text.toLowerCase();
        let botReply = '';

        if (selectedContact._id === 'system_default_1') {
          if (query.includes('đơn hàng') || query.includes('mua') || query.includes('món')) {
            botReply = 'Hệ thống đã nhận thông tin. Để kiểm tra chi tiết đơn hàng hoặc yêu cầu chỉnh sửa, bạn hãy nhắn tin trực tiếp với Cửa hàng hoặc Shipper giao hàng nhé!';
          } else if (query.includes('chào') || query.includes('hello') || query.includes('hi')) {
            botReply = 'Xin chào! Tôi là Trợ lý Hệ thống tự động của TasteByte. Rất hân hạnh được hỗ trợ bạn. Bạn có câu hỏi gì cần hỗ trợ không?';
          } else if (query.includes('lỗi') || query.includes('hỏng') || query.includes('không được')) {
            botReply = 'Chúng tôi rất tiếc vì sự cố bạn gặp phải. Kỹ thuật viên hệ thống đã nhận thông báo lỗi và đang khắc phục. Xin vui lòng đợi trong giây lát!';
          } else {
            botReply = 'Cảm ơn bạn đã phản hồi tới Hệ thống TasteByte. Yêu cầu của bạn đã được lưu lại và chuyển tiếp đến bộ phận CSKH để xử lý sớm nhất.';
          }
        } else if (selectedContact._id === 'driver_default_1') {
          if (query.includes('đồ ăn') || query.includes('khi nào') || query.includes('bao lâu')) {
            botReply = 'Mình đang nhận hàng tại quán rồi nhé, tầm 5 - 10 phút nữa mình giao qua liền nha!';
          } else if (query.includes('tương ớt') || query.includes('nhiều tương')) {
            botReply = 'Dạ vâng, để mình nói quán cho thêm nhiều tương ớt/tương cà cho bạn nha.';
          } else {
            botReply = 'Dạ vâng, mình đã ghi nhận thông tin rồi ạ. Mình đang giao gấp!';
          }
        } else if (selectedContact._id === 'store_default_1') {
          if (query.includes('đổi') || query.includes('hủy') || query.includes('hoàn')) {
            botReply = 'Yêu cầu của bạn đã được chuyển đến bộ phận hỗ trợ đơn hàng. Chúng tôi sẽ phản hồi trong giây lát.';
          } else if (query.includes('shipper') || query.includes('tài xế')) {
            botReply = 'Bộ phận CSKH đang gọi shipper hỗ trợ đơn hàng của bạn. Xin vui lòng chờ chút nhé!';
          } else {
            botReply = 'TasteByte Support cám ơn bạn, chúng tôi luôn online 24/7 để đồng hành cùng đơn hàng của bạn!';
          }
        }

        const botMsg = {
          _id: 'bot_msg_' + Date.now(),
          sender_id: selectedContact._id,
          receiver_id: 'me',
          content: botReply,
          createdAt: new Date().toISOString()
        };

        setVirtualMessages(prev => {
          const updated = {
            ...prev,
            [selectedContact._id]: [...(prev[selectedContact._id] || []), botMsg]
          };
          setChatMessages(updated[selectedContact._id]);
          return updated;
        });
      }, 1500);

    } else {
      // Real database message API call
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            receiver_id: selectedContact._id,
            content: text
          })
        });
        const data = await res.json();
        if (data.status === 'success') {
          setChatMessages(prev => [...prev, data.data]);
        }
      } catch (err) {
        console.error('Error sending message:', err);
      }
    }
  };

  // --- STYLING HELPERS ---
  const sidebarItemStyle = (tabName) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    color: activeTab === tabName ? '#00e676' : '#94a3b8',
    backgroundColor: activeTab === tabName ? 'rgba(0, 230, 118, 0.1)' : 'transparent',
    border: activeTab === tabName ? '1px solid rgba(0, 230, 118, 0.2)' : '1px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '8px',
    textDecoration: 'none',
    position: 'relative'
  });

  return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', width: '100%', margin: 0, padding: 0, color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <Navbar
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        openPendingModal={() => setShowModal(true)}
        isLoggedIn={isLoggedIn}
        notifications={notifications}
        setNotifications={setNotifications}
      />

      {/* CORE 3-COLUMN LAYOUT CONTAINER */}
      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto', padding: '24px 16px', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* ==============================================
            LEFT SIDEBAR: SOCIAL & ORDER MENU
            ============================================== */}
        <div style={{ width: '20%', minWidth: '200px', flexShrink: 0, backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', paddingLeft: '8px' }}>Chức Năng</h4>
          
          <div 
            style={sidebarItemStyle('order')} 
            onClick={() => setActiveTab('order')}
            onMouseEnter={(e) => { if (activeTab !== 'order') e.currentTarget.style.backgroundColor = '#1f2937'; }}
            onMouseLeave={(e) => { if (activeTab !== 'order') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span>🍽️</span> Đặt Món Ăn
          </div>

          <h4 style={{ margin: '16px 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', paddingLeft: '8px' }}>Mạng Xã Hội</h4>
          
          <div 
            style={sidebarItemStyle('feed')} 
            onClick={() => setActiveTab('feed')}
            onMouseEnter={(e) => { if (activeTab !== 'feed') e.currentTarget.style.backgroundColor = '#1f2937'; }}
            onMouseLeave={(e) => { if (activeTab !== 'feed') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span>📰</span> Bảng Tin (Feed)
          </div>

          <div 
            style={sidebarItemStyle('communities')} 
            onClick={() => setActiveTab('communities')}
            onMouseEnter={(e) => { if (activeTab !== 'communities') e.currentTarget.style.backgroundColor = '#1f2937'; }}
            onMouseLeave={(e) => { if (activeTab !== 'communities') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span>👥</span> Nhóm Cộng Đồng
          </div>

          <div 
            style={sidebarItemStyle('chat')} 
            onClick={() => {
              if (!isLoggedIn) return navigate('/login');
              setActiveTab('chat');
            }}
            onMouseEnter={(e) => { if (activeTab !== 'chat') e.currentTarget.style.backgroundColor = '#1f2937'; }}
            onMouseLeave={(e) => { if (activeTab !== 'chat') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span>💬</span> Nhắn Tin (Chat)
          </div>


        </div>

        {/* ==============================================
            MIDDLE COLUMN: INTERACTIVE VIEWPORTS
            ============================================== */}
        <div style={{ flex: 1, minWidth: '400px' }}>
          
          {/* TAB 1: ORDER FLOW (ORIGINAL CONTENT) */}
          {activeTab === 'order' && (
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
                <p style={{ fontSize: '16px', color: '#34d399', margin: '0 0 28px', fontWeight: '400', position: 'relative' }}>
                  Hàng ngàn món ngon từ các cửa hàng uy tín — giao siêu tốc tới tay bạn
                </p>

                {/* Search bar */}
                <div style={{ position: 'relative', maxWidth: '480px', margin: '0 auto' }}>
                  <span style={{
                    position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '18px', pointerEvents: 'none'
                  }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Tìm món ăn hoặc cửa hàng..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%', padding: '14px 16px 14px 46px', borderRadius: '12px',
                      border: '1.5px solid #065f46', backgroundColor: 'rgba(17,24,39,0.8)',
                      color: '#f1f5f9', fontSize: '15px', outline: 'none', boxSizing: 'border-box',
                      backdropFilter: 'blur(8px)'
                    }}
                  />
                </div>
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
          )}

          {/* TAB 2: NEWS FEED */}
          {activeTab === 'feed' && (
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
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="Link hình ảnh món ăn (tùy chọn)..."
                      value={newPostImage}
                      onChange={e => setNewPostImage(e.target.value)}
                      style={{ flex: 1, minWidth: '200px', padding: '8px 12px', backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '8px', color: '#f1f5f9', outline: 'none', fontSize: '13px' }}
                    />
                    <button
                      type="submit"
                      disabled={postLoading || !newPostContent.trim()}
                      style={{ padding: '8px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', transition: '0.2s', opacity: (postLoading || !newPostContent.trim()) ? 0.6 : 1 }}
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
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxH: '250px', overflowY: 'auto' }}>
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
          )}

          {/* TAB 3: COMMUNITIES VIEW */}
          {activeTab === 'communities' && (
            <div>
              {activeCommunity ? (
                // Selected Community Detail View
                <div style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <button 
                    onClick={() => setActiveCommunity(null)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', border: 'none', color: '#00e676', cursor: 'pointer', fontWeight: 'bold', marginBottom: '16px', fontSize: '14px' }}
                  >
                    ⬅️ Quay lại danh sách nhóm
                  </button>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '24px' }}>{activeCommunity.name}</h2>
                      <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0 0 0' }}>{activeCommunity.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontWeight: 'bold', color: '#00e676', fontSize: '18px' }}>{activeCommunity.members}</span>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>Thành viên ({activeCommunity.activeToday} đang online)</span>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '16px', color: '#00e676', margin: '0 0 16px 0' }}>Bài đăng sôi nổi gần đây</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activeCommunity.posts.map((cp, idx) => (
                      <div key={idx} style={{ backgroundColor: '#0b0f19', border: '1px solid #1f2937', borderRadius: '10px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <span style={{ fontSize: '16px' }}>{cp.avatar}</span>
                          <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#e2e8f0' }}>{cp.author}</span>
                          <span style={{ fontSize: '10px', color: '#64748b', marginLeft: 'auto' }}>1 giờ trước</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '0 0 12px 0', lineHeight: '1.5' }}>{cp.content}</p>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                          <span>❤️ {cp.likes} Lượt thích</span>
                          <span>💬 {cp.replies} Lượt bình luận</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Communities Directory List
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  {communitiesList.map(comm => (
                    <div 
                      key={comm.id}
                      onClick={() => setActiveCommunity(comm)}
                      style={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '12px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1f2937'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ margin: '0 0 6px 0', color: '#f1f5f9', fontSize: '18px' }}>{comm.name}</h3>
                          <p style={{ color: '#cbd5e1', fontSize: '13px', margin: 0 }}>{comm.description}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                          🧑‍🤝‍🧑 {comm.members}
                        </div>
                      </div>
                      <div style={{ marginTop: '12px', borderTop: '1px solid #1f2937', paddingTop: '10px', fontSize: '12px', color: '#64748b' }}>
                        Có <strong>{comm.activeToday} bài viết/tương tác</strong> trong hôm nay. Nhấn để tham gia thảo luận.
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHAT SYSTEM */}
          {activeTab === 'chat' && (
            <div style={{ display: 'flex', height: '550px', backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              {/* Chat - Left Pane: Contact list */}
              <div style={{ width: '35%', borderRight: '1px solid #1f2937', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '14px', borderBottom: '1px solid #1f2937', fontWeight: 'bold', color: '#00e676', fontSize: '15px' }}>Hội thoại</div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {chatContacts.length === 0 ? (
                    <div style={{ padding: '20px', color: '#64748b', fontSize: '13px', textAlign: 'center' }}>Không tìm thấy người liên lạc.</div>
                  ) : (
                    chatContacts.map(c => {
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
                            transition: '0.2s'
                          }}
                          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#1f2937'; }}
                          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', border: c.isVirtual ? '1px solid #00e676' : '1px solid #64748b' }}>
                            {c.role === 'merchant' ? '🏪' : c.role === 'driver' ? '🛵' : '👤'}
                          </div>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.full_name}</div>
                            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'capitalize' }}>{c.role === 'customer' ? 'Khách' : c.role === 'merchant' ? 'Cửa Hàng' : c.role === 'driver' ? 'Shipper' : c.role}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
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
          )}



        </div>

        {/* ==============================================
            RIGHT SIDEBAR: FRIENDS & TRENDING HOT REVIEWS
            ============================================== */}
        <div style={{
          width: rightSidebarOpen ? '20%' : '0px',
          minWidth: rightSidebarOpen ? '220px' : '0px',
          opacity: rightSidebarOpen ? 1 : 0,
          pointerEvents: rightSidebarOpen ? 'all' : 'none',
          flexShrink: 0,
          backgroundColor: '#111827',
          border: rightSidebarOpen ? '1px solid #1f2937' : 'none',
          borderRadius: '14px',
          padding: rightSidebarOpen ? '16px' : '0px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Online Friends List */}
          <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>Bạn bè online</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {onlineFriends.map(friend => (
              <div 
                key={friend.id} 
                onClick={() => {
                  if (!isLoggedIn) return navigate('/login');
                  setActiveTab('chat');
                  handleSelectContact(friend);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1f2937'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: '1px solid #64748b' }}>
                    {friend.avatar}
                  </div>
                  <span style={{ position: 'absolute', bottom: 0, right: 0, width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00e676', border: '1.5px solid #111827' }} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{friend.name}</span>
              </div>
            ))}
          </div>

          {/* Trending KOL Reviews */}
          <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', borderBottom: '1px solid #1f2937', paddingBottom: '8px' }}>HOT REVIEW</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {hotReviews.map(rev => (
              <div 
                key={rev.id} 
                onClick={() => {
                  setActiveTab('feed');
                  loadPosts();
                }}
                style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#0b0f19', border: '1px solid #1f2937' }}
              >
                <img src={rev.img} alt={rev.title} style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
                <div style={{ padding: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#00e676', fontWeight: 'bold' }}>{rev.author}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#f1f5f9', margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rev.title}</div>
                  <div style={{ fontSize: '10px', color: '#eab308' }}>★ {rev.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Toggle Right Sidebar button floating */}
        <button
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(16,185,129,0.4)',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: '0.2s',
          }}
          title={rightSidebarOpen ? "Thu gọn sidebar" : "Mở rộng sidebar"}
        >
          {rightSidebarOpen ? '➡️' : '👥'}
        </button>

      </div>



      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#111827', padding: '30px', borderRadius: '12px',
            boxShadow: '0 4px 25px rgba(0,0,0,0.5)', textAlign: 'center',
            maxWidth: '400px', width: '90%', border: '1px solid #1f2937'
          }}>
            <div style={{ fontSize: '45px', marginBottom: '10px' }}>⚙️</div>
            <h3 style={{ margin: '0 0 10px', color: '#10b981', fontWeight: '700' }}>Thông Báo Hệ Thống</h3>
            <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', margin: '0 0 20px' }}>
              Tính năng đang liên kết cổng dữ liệu API mã hóa, vui lòng quay lại sau!
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: '10px 40px', backgroundColor: '#10b981', color: 'white',
                border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
              }}
            >Xác nhận</button>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: '14px', maxWidth: '1200px', margin: '0 auto' }}>
        © 2026 TasteByte - Đồ án Công nghệ phần mềm Nhóm 8
      </footer>
    </div>
  );
};

export default Home;