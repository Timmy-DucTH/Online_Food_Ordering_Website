import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FoodCard from '../components/FoodCard';

// ==========================================
// COLOR SYSTEM (SUPPORTING LIGHT & DARK THEME)
// - Dark Theme: Classic green accents (#10b981 / #00e676)
// - Light Theme: Vibrant orange accents (#f97316 / #ea580c)
// ==========================================
const colors = {
  dark: {
    bg: '#0b0f19',
    panel: '#111827',
    border: '#1f2937',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    primary: '#10b981', // Emerald Green
    primaryHover: '#059669',
    primaryGlow: 'rgba(16, 185, 129, 0.2)',
    secondary: '#eab308', // Yellow
    cardBg: '#1f2937',
    inputBg: 'rgba(17, 24, 39, 0.8)',
    shadow: 'rgba(0, 0, 0, 0.4)',
    divider: 'rgba(31, 41, 55, 0.6)',
    activeBg: 'rgba(16, 185, 129, 0.15)',
    activeBorder: '#10b981',
    primaryGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    primaryGradientGlow: 'rgba(16, 185, 129, 0.3)'
  },
  light: {
    bg: '#f8fafc',
    panel: '#ffffff',
    border: '#e2e8f0',
    text: '#0f172a',
    textMuted: '#64748b',
    primary: '#f97316', // Orange
    primaryHover: '#ea580c',
    primaryGlow: 'rgba(249, 115, 22, 0.1)',
    secondary: '#eab308', // Yellow
    cardBg: '#ffffff',
    inputBg: '#f1f5f9',
    shadow: 'rgba(0, 0, 0, 0.08)',
    divider: 'rgba(226, 232, 240, 0.8)',
    activeBg: 'rgba(249, 115, 22, 0.1)',
    activeBorder: '#f97316',
    primaryGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    primaryGradientGlow: 'rgba(249, 115, 22, 0.3)'
  }
};

const vietnameseTextFont = "'Segoe UI', Arial, 'Helvetica Neue', sans-serif";
const emojiTextFont = "'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif";

const CATEGORIES = [
  { name: 'Tất cả', icon: '🍽️' },
  { name: 'Burger', icon: '🍔' },
  { name: 'Pizza', icon: '🍕' },
  { name: 'Cơm', icon: '🍛' },
  { name: 'Món nước', icon: '🍜' },
  { name: 'Trà sữa', icon: '🧋' },
  { name: 'Cà phê', icon: '☕' },
  { name: 'Tráng miệng', icon: '🍰' },
  { name: 'Đồ ăn nhanh', icon: '🍟' },
  { name: 'Đồ uống khác', icon: '🥤' }
];

const initialVirtualMessages = {
  'driver_default_1': [
    { sender_id: 'driver_default_1', receiver_id: 'me', content: 'Chào bạn, mình là shipper Hùng, lát nữa giao đồ ăn mình sẽ gọi điện nhé!', createdAt: new Date(Date.now() - 3600000).toISOString() }
  ],
  'store_default_1': [
    { sender_id: 'store_default_1', receiver_id: 'me', content: 'Kính chào quý khách! TasteByte Support sẵn sàng hỗ trợ giải đáp mọi thắc mắc của bạn.', createdAt: new Date(Date.now() - 7200000).toISOString() }
  ]
};

const Home = ({ openPendingModal }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Theme logic
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const currentTheme = theme === 'dark' ? colors.dark : colors.light;

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    showToast(`Đã chuyển sang Chế độ ${newTheme === 'dark' ? 'Tối' : 'Sáng'}!`);
  };

  // Toast notifications
  const [toasts, setToasts] = useState([]);
  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Location logic
  const [selectedLocation, setSelectedLocation] = useState('Quận 1, TP. Hồ Chí Minh');
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const locationsList = [
    'Quận 1, TP. Hồ Chí Minh',
    'Quận Bình Thạnh, TP. Hồ Chí Minh',
    'Quận 7, TP. Hồ Chí Minh',
    'Cầu Giấy, Hà Nội',
    'Hoàn Kiếm, Hà Nội',
    'Hải Châu, Đà Nẵng'
  ];

  // Carousel logic
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselSlides = [
    {
      title: 'Combo Giảm 50% Cho Đơn Nhóm 👥',
      subtitle: 'Rủ ngay đồng nghiệp order chung để cùng chia sẻ ship 0Đ',
      bg: 'linear-gradient(135deg, #ea580c 0%, #ca8a04 100%)',
      badge: 'HOT DEAL'
    },
    {
      title: 'Freeship 0Đ - Ship Món Ăn Trong 15 Phút 🛵',
      subtitle: 'Ưu đãi đặc biệt từ các thương hiệu được đánh giá cao',
      bg: 'linear-gradient(135deg, #16a34a 0%, #0d9488 100%)',
      badge: 'FREE SHIP'
    },
    {
      title: 'Review Món Ngon - Tag Bán Đơn Liền Tay 📝',
      subtitle: 'Nhận ngay coupon ăn uống khi đăng bài gắn thẻ sản phẩm',
      bg: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
      badge: 'CỘNG ĐỒNG'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  // General States
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
  const [activeTab, setActiveTab] = useState('order'); // order (Trang chủ), feed, chat, orders, notifications
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  
  // Feed States
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [taggedFoodId, setTaggedFoodId] = useState(''); // Tagged food in post
  const [searchTagQuery, setSearchTagQuery] = useState(''); // Search tag for foods
  const [commentsOpen, setCommentsOpen] = useState({}); // postId -> bool
  const [commentInputs, setCommentInputs] = useState({}); // postId -> text
  const [postLoading, setPostLoading] = useState(false);

  // Notifications States
  const [notifications, setNotifications] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Chat States
  const [chatContacts, setChatContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [virtualMessages, setVirtualMessages] = useState(initialVirtualMessages);
  
  // Floating Messenger Widget
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  const [chatPopupContact, setChatPopupContact] = useState(null);
  const [popupNewMessageText, setPopupNewMessageText] = useState('');
  const chatBottomRef = useRef(null);

  // STATE THÔNG BÁO LỖI/CẢNH BÁO GIỮA MÀN HÌNH (THAY THẾ alert())
  const [showErrModal, setShowErrModal] = useState(false);
  const [errModalMsg, setErrModalMsg] = useState('');

  const showError = (msg) => {
    setErrModalMsg(msg);
    setShowErrModal(true);
  };

  // STATE XÁC NHẬN XÓA BÀI VIẾT (THAY THẾ window.confirm())
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // --- GROUP ORDERING STATES ---
  const [groupOrderActive, setGroupOrderActive] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupItems, setGroupItems] = useState([]);
  const [showSplitBillModal, setShowSplitBillModal] = useState(false);

  // Online Friends List Mock
  const onlineFriends = [
    { id: 'friend_koi', name: 'Nguyễn Minh Thư (KOL)', avatar: '🧋', role: 'customer' },
    { id: 'friend_huy', name: 'Lê Quốc Huy', avatar: '😎', role: 'customer' },
    { id: 'friend_hai', name: 'Trần Thanh Hải', avatar: '💻', role: 'customer' },
    { id: 'friend_anh', name: 'Phạm Ngọc Ánh', avatar: '🍓', role: 'customer' }
  ];

  // Hot reviews (Mock data)
  const hotReviews = [
    { id: 1, title: 'Trà sữa KOI Thé béo ngậy', author: 'Minh Thư (KOL)', rating: 5, img: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300' },
    { id: 2, title: 'Cơm Tấm sườn nướng mật ong', author: 'Khoai Lang Thang', rating: 4.8, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300' }
  ];

  // Fetch real messages
  const fetchMessages = useCallback((otherUserId) => {
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
  }, []);

// Fetch real food data from API
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        
        // 1. Sử dụng biến môi trường để trỏ thẳng tới cổng 5000 của Backend
        // (Hoặc nếu VITE_API_BASE_URL lỗi, bạn có thể gõ cứng 'http://localhost:5000/api/foods')
        const apiUrl = import.meta.env.VITE_API_BASE_URL 
          ? `${import.meta.env.VITE_API_BASE_URL}/foods` 
          : 'http://localhost:5000/api/foods';

        const res = await fetch(apiUrl);
        const data = await res.json();
        
        // 2. Chỉnh lại điều kiện khớp với JSON của Backend
        if (data.success === true || data.status === 'success') {
          // Lấy đúng mảng dữ liệu (Hỗ trợ đọc cả 'data' lẫn 'foods')
          setFoods(data.data || data.foods);
        } else {
          setError('Không thể tải danh sách món ăn.');
        }
      } catch (error) {
        console.error("Lỗi fetch:", error); // In lỗi ra console để dễ debug
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

  // Fetch My Orders from Backend
  const loadMyOrders = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      setOrdersLoading(true);
      const res = await fetch('/api/orders/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setMyOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setOrdersLoading(false);
    }
  }, [isLoggedIn]);

  // Handle redirect/state passing from other pages
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
            isVirtual: false
          };
          setSelectedContact(systemContact);
          setChatPopupContact(systemContact);
          setIsChatPopupOpen(true);
          setChatMessages([]);
          fetchMessages('system_default_1');
        }
      }
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, location.pathname, navigate, fetchMessages]);

  // Load feed posts
  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      if (data.status === 'success') {
        setPosts(data.data);
      }
    } catch (e) {
      console.error('Error fetching posts:', e);
    }
  }, []);

  // Fetch notifications
  const loadNotifications = useCallback(async () => {
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
  }, [isLoggedIn]);

  // Sync details on tab switch
  useEffect(() => {
    if (activeTab === 'feed' || activeTab === 'order') {
      loadPosts();
    }
    if (activeTab === 'orders') {
      loadMyOrders();
    }
    if (activeTab === 'notifications') {
      loadNotifications();
    }
    if (activeTab === 'chat') {
      // Load chat contacts
      fetch('/api/messages/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const otherContacts = data.data.filter(c => c._id !== 'system_default_1');
          const systemContact = data.data.find(c => c._id === 'system_default_1') || {
            _id: 'system_default_1',
            full_name: '🛡️ Hệ thống TasteByte',
            email: 'system@tastebyte.vn',
            role: 'system',
            isVirtual: false
          };
          
          systemContact.isVirtual = false;
          const contactList = [systemContact, ...otherContacts];
          setChatContacts(contactList);
          
          if (!selectedContact) {
            setSelectedContact(systemContact);
            setChatMessages([]);
            fetchMessages('system_default_1');
          }
        }
      })
      .catch(err => console.error('Error fetching contacts:', err));
    }
  }, [activeTab, loadPosts, loadNotifications, loadMyOrders, selectedContact, fetchMessages, isLoggedIn]);

  // Periodic check
  useEffect(() => {
    if (isLoggedIn) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, loadNotifications]);

  // Scroll chat popup to bottom when messages update
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

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
      
      if (groupOrderActive) {
        // Add to group cart
        setGroupItems(prev => {
          const isExist = prev.find(item => item.id === normalized.id && item.buyer_id === 'me');
          if (isExist) {
            return prev.map(item =>
              (item.id === normalized.id && item.buyer_id === 'me') ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
          return [...prev, { ...normalized, quantity: 1, buyer_id: 'me', buyer_name: 'Bạn (Chủ nhóm)' }];
        });
        showToast(`Đã thêm "${normalized.name}" vào giỏ hàng nhóm!`);
      } else {
        // Add to single cart
        setCart((prevCart) => {
          const isExist = prevCart.find(item => item.id === normalized.id);
          if (isExist) {
            return prevCart.map(item =>
              item.id === normalized.id ? { ...item, quantity: item.quantity + 1 } : item
            );
          }
          return [...prevCart, { ...normalized, quantity: 1 }];
        });
        showToast(`Đã thêm "${normalized.name}" vào giỏ hàng!`);
      }
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

  const updateQuantity = (id, newQty, buyerId = null) => {
    if (newQty < 1) return;
    if (groupOrderActive) {
      setGroupItems(prev =>
        prev.map(item => (item.id === id && item.buyer_id === buyerId) ? { ...item, quantity: newQty } : item)
      );
    } else {
      setCart(prevCart =>
        prevCart.map(item => (item.id === id ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const removeFromCart = (id, buyerId = null) => {
    if (groupOrderActive) {
      setGroupItems(prev => prev.filter(item => !(item.id === id && item.buyer_id === buyerId)));
    } else {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    }
  };

  // Group Order actions
  const initiateGroupOrder = (friend) => {
    if (!isLoggedIn) return navigate('/login');
    setGroupOrderActive(true);
    setGroupMembers([friend]);
    setGroupItems([]);
    showToast(`Đã tạo phòng đặt chung nhóm với ${friend.name}!`);

    // Simulate chat message
    const welcomeMsg = {
      _id: 'sys_' + Date.now(),
      sender_id: 'system_default_1',
      receiver_id: 'me',
      content: `👥 Phòng đặt chung nhóm với ${friend.name} đã bắt đầu! Đang chờ bạn bè chọn món...`,
      createdAt: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, welcomeMsg]);
    setChatPopupContact({
      _id: 'system_default_1',
      full_name: '🛡️ Hệ thống TasteByte',
      role: 'system',
      isVirtual: true
    });
    setIsChatPopupOpen(true);

    // Simulate friend adding item
    setTimeout(() => {
      const item1 = {
        id: 'mock_koi_id',
        item_id: 'mock_koi_id',
        name: 'Trà sữa KOI Thé béo ngậy',
        price: 60000,
        quantity: 1,
        buyer_id: friend.id,
        buyer_name: friend.name
      };
      setGroupItems(prev => [...prev, item1]);
      showToast(`${friend.name} đã thêm 1 Trà sữa KOI Thé vào giỏ nhóm.`);
      
      setChatMessages(prev => [...prev, {
        _id: 'sys_' + Date.now(),
        sender_id: 'system_default_1',
        receiver_id: 'me',
        content: `⚡ ${friend.name} đã thêm 1 Trà sữa KOI Thé béo ngậy (60.000đ) vào giỏ nhóm.`,
        createdAt: new Date().toISOString()
      }]);
    }, 4000);

    // Simulate another friend joining and adding item
    setTimeout(() => {
      const friend2 = onlineFriends.find(f => f.id === 'friend_huy');
      setGroupMembers(prev => [...prev, friend2]);
      const item2 = {
        id: 'mock_com_id',
        item_id: 'mock_com_id',
        name: 'Cơm Tấm sườn nướng mật ong',
        price: 45000,
        quantity: 1,
        buyer_id: friend2.id,
        buyer_name: friend2.name
      };
      setGroupItems(prev => [...prev, item2]);
      showToast(`${friend2.name} đã thêm 1 Cơm Tấm sườn nướng vào giỏ nhóm.`);

      setChatMessages(prev => [...prev, {
        _id: 'sys_' + Date.now(),
        sender_id: 'system_default_1',
        receiver_id: 'me',
        content: `⚡ ${friend2.name} đã tham gia đặt chung và thêm 1 Cơm Tấm sườn nướng mật ong (45.000đ).`,
        createdAt: new Date().toISOString()
      }]);
    }, 8500);
  };

  const cancelGroupOrder = () => {
    setGroupOrderActive(false);
    setGroupMembers([]);
    setGroupItems([]);
    showToast('Đã hủy phòng đặt hàng nhóm.');
  };

  // Submit group order to backend
  const handleGroupCheckoutSubmit = async () => {
    const itemsList = groupItems.map(item => ({
      item_id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      buyer_id: currentUser ? currentUser._id : null
    }));

    try {
      const activeRest = foods[0]?.restaurant_id?._id || foods[0]?.restaurant_id || null;
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          restaurant_id: activeRest,
          order_type: 'group',
          shipping_address: selectedLocation,
          distance_km: 3,
          items: itemsList,
          members: []
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setShowSplitBillModal(false);
        setGroupOrderActive(false);
        setGroupMembers([]);
        setGroupItems([]);
        showToast('Đặt đơn hàng nhóm thành công!');
        setShowModal(true);
      } else {
        showError(data.message || 'Lỗi khi đặt đơn hàng nhóm.');
      }
    } catch (e) {
      console.error(e);
      showError('Không thể kết nối máy chủ.');
    }
  };

  // Split bill totals calculation
  const getSplitBillDetails = () => {
    const splitMap = {};
    // Add me
    splitMap['me'] = { name: 'Bạn (Chủ nhóm)', itemsTotal: 0, count: 0 };
    groupMembers.forEach(m => {
      splitMap[m.id] = { name: m.name, itemsTotal: 0, count: 0 };
    });

    groupItems.forEach(item => {
      const bId = item.buyer_id || 'me';
      if (!splitMap[bId]) {
        splitMap[bId] = { name: item.buyer_name || 'Thành viên', itemsTotal: 0, count: 0 };
      }
      splitMap[bId].itemsTotal += item.price * item.quantity;
      splitMap[bId].count += item.quantity;
    });

    const subtotal = groupItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const shippingFee = 15000; // Mock shipping fee
    const memberCount = Object.keys(splitMap).length;
    const splitShipFee = Math.round(shippingFee / memberCount);

    const splitList = Object.keys(splitMap).map(id => {
      const userTotal = splitMap[id].itemsTotal;
      return {
        id,
        name: splitMap[id].name,
        itemsTotal: userTotal,
        shipShare: userTotal > 0 ? splitShipFee : 0, // only pay ship if ordered food
        total: userTotal > 0 ? (userTotal + splitShipFee) : 0
      };
    });

    return {
      splitList,
      subtotal,
      shippingFee,
      totalPrice: subtotal + shippingFee
    };
  };

  // Filter foods by category and search
  const filteredFoods = foods.filter(food => {
    const matchCat = selectedCategory === 'Tất cả' || food.category === selectedCategory;
    const matchSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (food.restaurant_id?.display_name || food.restaurant_id?.store_name || food.restaurant_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery.startsWith('#') && food.category.toLowerCase().includes(searchQuery.substring(1).toLowerCase());
    return matchCat && matchSearch;
  });

  // --- SOCIAL MEDIA LOGIC & HANDLERS ---
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return navigate('/login');
    if (!newPostContent.trim()) return;

    setPostLoading(true);
    try {
      const payload = {
        content: newPostContent,
        images: newPostImage.trim() ? [newPostImage] : []
      };
      if (taggedFoodId) {
        payload.linked_food = taggedFoodId;
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setNewPostContent('');
        setNewPostImage('');
        setTaggedFoodId('');
        showToast('Đã đăng tải bài review món ngon lên Feed! 🚀');
        loadPosts();
      } else {
        showError(data.message || 'Lỗi đăng bài viết.');
      }
    } catch (err) {
      console.error(err);
      showError('Không thể kết nối tới máy chủ.');
    } finally {
      setPostLoading(false);
    }
  };

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

  const toggleComments = (postId) => {
    setCommentsOpen(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

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

  const handleDeletePost = (postId) => {
    setPostToDelete(postId);
    setShowConfirmModal(true);
  };

  const executeDeletePost = async () => {
    if (!postToDelete) return;
    setShowConfirmModal(false);
    const postId = postToDelete;
    setPostToDelete(null);
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
        showToast('Đã xóa bài viết.');
      } else {
        showError(data.message || 'Lỗi khi xóa bài đăng');
      }
    } catch (e) {
      console.error('Error deleting post:', e);
      showError('Không thể kết nối máy chủ.');
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

  // Select chat popup contact
  const handleSelectChatPopupContact = (contact) => {
    setChatPopupContact(contact);
    setIsChatPopupOpen(true);
    if (contact.isVirtual || contact.id?.startsWith('friend_')) {
      setChatMessages(virtualMessages[contact._id || contact.id] || []);
    } else {
      setChatMessages([]);
      fetchMessages(contact._id);
    }
  };

  // Send message from chat tab or popup
  const handleSendMessage = async (e, textMessage, receiverContact, clearInputCallback) => {
    e.preventDefault();
    if (!textMessage.trim() || !receiverContact) return;

    const text = textMessage.trim();
    clearInputCallback();

    const contactId = receiverContact._id || receiverContact.id;
    const isVirtual = receiverContact.isVirtual || contactId.startsWith('friend_');

    if (isVirtual) {
      // Local simulated message
      const myMsg = {
        _id: 'temp_msg_' + Date.now(),
        sender_id: 'me',
        receiver_id: contactId,
        content: text,
        createdAt: new Date().toISOString()
      };

      setVirtualMessages(prev => {
        const updated = {
          ...prev,
          [contactId]: [...(prev[contactId] || []), myMsg]
        };
        setChatMessages(updated[contactId]);
        return updated;
      });

      // Bot auto-reply logic
      setTimeout(() => {
        const query = text.toLowerCase();
        let botReply = '';

        if (contactId === 'system_default_1') {
          if (query.includes('đơn hàng') || query.includes('mua') || query.includes('món')) {
            botReply = 'Hệ thống đã nhận thông tin. Để kiểm tra chi tiết đơn hàng hoặc yêu cầu chỉnh sửa, bạn hãy nhắn tin trực tiếp với Cửa hàng hoặc Shipper giao hàng nhé!';
          } else if (query.includes('chào') || query.includes('hello') || query.includes('hi')) {
            botReply = 'Xin chào! Tôi là Trợ lý Hệ thống tự động của TasteByte. Rất hân hạnh được hỗ trợ bạn. Bạn có câu hỏi gì cần hỗ trợ không?';
          } else if (query.includes('lỗi') || query.includes('hỏng') || query.includes('không được')) {
            botReply = 'Chúng tôi rất tiếc vì sự cố bạn gặp phải. Kỹ thuật viên hệ thống đã nhận thông báo lỗi và đang khắc phục. Xin vui lòng đợi trong giây lát!';
          } else {
            botReply = 'Cảm ơn bạn đã phản hồi tới Hệ thống TasteByte. Yêu cầu của bạn đã được lưu lại và chuyển tiếp đến bộ phận CSKH để xử lý sớm nhất.';
          }
        } else if (contactId === 'driver_default_1') {
          if (query.includes('đồ ăn') || query.includes('khi nào') || query.includes('bao lâu')) {
            botReply = 'Mình đang nhận hàng tại quán rồi nhé, tầm 5 - 10 phút nữa mình giao qua liền nha!';
          } else if (query.includes('tương ớt') || query.includes('nhiều tương')) {
            botReply = 'Dạ vâng, để mình nói quán cho thêm nhiều tương ớt/tương cà cho bạn nha.';
          } else {
            botReply = 'Dạ vâng, mình đã ghi nhận thông tin rồi ạ. Mình đang giao gấp!';
          }
        } else if (contactId === 'store_default_1') {
          if (query.includes('đổi') || query.includes('hủy') || query.includes('hoàn')) {
            botReply = 'Yêu cầu của bạn đã được chuyển đến bộ phận hỗ trợ đơn hàng. Chúng tôi sẽ phản hồi trong giây lát.';
          } else if (query.includes('shipper') || query.includes('tài xế')) {
            botReply = 'Bộ phận CSKH đang gọi shipper hỗ trợ đơn hàng của bạn. Xin vui lòng chờ chút nhé!';
          } else {
            botReply = 'TasteByte Support cám ơn bạn, chúng tôi luôn online 24/7 để đồng hành cùng đơn hàng của bạn!';
          }
        } else if (contactId.startsWith('friend_')) {
          if (query.includes('ăn chung') || query.includes('đặt chung') || query.includes('rủ')) {
            botReply = 'Được nha! Bạn khởi tạo phòng đặt chung "Rủ ăn chung" đi, mình bỏ món liền!';
          } else {
            botReply = 'Thèm trà sữa cơm tấm quá nè, đặt chung cho rẻ ship đi!';
          }
        }

        const botMsg = {
          _id: 'bot_msg_' + Date.now(),
          sender_id: contactId,
          receiver_id: 'me',
          content: botReply,
          createdAt: new Date().toISOString()
        };

        setVirtualMessages(prev => {
          const updated = {
            ...prev,
            [contactId]: [...(prev[contactId] || []), botMsg]
          };
          setChatMessages(updated[contactId]);
          return updated;
        });
        showToast(`Tin nhắn mới từ ${receiverContact.full_name || receiverContact.name}`);
      }, 1500);

    } else {
      // Database messaging API call
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            receiver_id: contactId,
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
  const getSidebarItemStyle = (tabName) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 18px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: activeTab === tabName ? currentTheme.primary : currentTheme.textMuted,
    backgroundColor: activeTab === tabName ? currentTheme.activeBg : 'transparent',
    borderLeft: activeTab === tabName ? `4px solid ${currentTheme.activeBorder}` : '4px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    marginBottom: '6px',
    textDecoration: 'none',
    boxShadow: activeTab === tabName ? `0 4px 12px ${currentTheme.primaryGlow}` : 'none'
  });

  return (
    <div className={theme} style={{ backgroundColor: currentTheme.bg, minHeight: '100vh', width: '100%', margin: 0, padding: 0, color: currentTheme.text, fontFamily: "'Inter', sans-serif", transition: 'background-color 0.3s, color 0.3s' }}>
      
      {/* Toast Alert list */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: currentTheme.primaryGradient,
            color: 'white', padding: '12px 24px', borderRadius: '10px',
            boxShadow: `0 10px 25px ${currentTheme.primaryGradientGlow}`, fontWeight: '600',
            fontSize: '14px', animation: 'slideIn 0.3s ease'
          }}>
            {t.message}
          </div>
        ))}
      </div>

      <Navbar
        cart={groupOrderActive ? groupItems : cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        clearCart={() => groupOrderActive ? setGroupItems([]) : setCart([])}
        openPendingModal={openPendingModal}
        isLoggedIn={isLoggedIn}
        notifications={notifications}
        setNotifications={setNotifications}
        theme={theme}
      />

      {/* CORE 3-COLUMN LAYOUT CONTAINER */}
      <div className="home-layout-container">
        
        {/* ==============================================
            LEFT COLUMN (SIDEBAR): SYSTEM NAVIGATION (20%)
            ============================================== */}
        <div className="home-left-column" style={{ 
          backgroundColor: currentTheme.panel, border: `1px solid ${currentTheme.border}`, 
          borderRadius: '16px', padding: '20px 14px', boxShadow: `0 10px 30px ${currentTheme.shadow}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '0 8px' }}>
            <h4 style={{ margin: 0, fontSize: '11px', textTransform: 'uppercase', color: currentTheme.textMuted, letterSpacing: '1px' }}>MENU CHÍNH</h4>
            
            {/* Theme Toggle Button */}
            <button onClick={toggleTheme} style={{
              backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px',
              padding: '6px', borderRadius: '50%', border: `1px solid ${currentTheme.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} title="Đổi giao diện">
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div 
              style={getSidebarItemStyle('order')} 
              onClick={() => setActiveTab('order')}
            >
              <span>🏠</span> Trang Chủ
            </div>

            <div 
              style={getSidebarItemStyle('feed')} 
              onClick={() => setActiveTab('feed')}
            >
              <span>📰</span> Bảng Tin (Feed)
            </div>

            <div 
              style={getSidebarItemStyle('chat')} 
              onClick={() => {
                if (!isLoggedIn) return navigate('/login');
                setActiveTab('chat');
              }}
            >
              <span>💬</span> Tin Nhắn
            </div>

            <div 
              style={getSidebarItemStyle('notifications')} 
              onClick={() => {
                if (!isLoggedIn) return navigate('/login');
                setActiveTab('notifications');
              }}
            >
              <span>🔔</span> Thông Báo
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span style={{ 
                  backgroundColor: '#ff424e', color: 'white', borderRadius: '50%', 
                  padding: '2px 7px', fontSize: '10px', fontWeight: 'bold', marginLeft: 'auto'
                }}>
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </div>


          </div>
        </div>

        {/* ==============================================
            MIDDLE COLUMN: MAIN VIEWPORT (55%)
            ============================================== */}
        <div className="home-middle-column">
          
          {/* ACTIVE TAB: ORDER VIEW (DEFAULT INTEGRATED HOME VIEW) */}
          {(activeTab === 'order' || activeTab === 'feed') && (
            <>
              {/* AREA 1: PROMO CAROUSEL & CATEGORIES */}
              {activeTab === 'order' && (
                <>
                  {/* Banner Carousel */}
                  <div style={{ 
                    position: 'relative', height: '160px', borderRadius: '16px', overflow: 'hidden', 
                    boxShadow: `0 10px 25px ${currentTheme.shadow}`, 
                    background: carouselSlides[carouselIndex].bg,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '24px 32px',
                    color: 'white', transition: 'all 0.5s ease-in-out'
                  }}>
                    <span style={{ 
                      alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800',
                      letterSpacing: '1px', marginBottom: '10px', fontFamily: vietnameseTextFont, lineHeight: 1.2
                    }}>
                      {carouselSlides[carouselIndex].badge}
                    </span>
                    <h3 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: '800', fontFamily: vietnameseTextFont, lineHeight: 1.25, letterSpacing: 0 }}>
                      {carouselSlides[carouselIndex].title}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', opacity: 0.9, fontWeight: '500', fontFamily: vietnameseTextFont, lineHeight: 1.45, letterSpacing: 0 }}>
                      {carouselSlides[carouselIndex].subtitle}
                    </p>

                    {/* Carousel Indicators */}
                    <div style={{ position: 'absolute', bottom: '15px', right: '24px', display: 'flex', gap: '6px' }}>
                      {carouselSlides.map((_, idx) => (
                        <span key={idx} onClick={() => setCarouselIndex(idx)}
                          style={{
                            width: '8px', height: '8px', borderRadius: '50%', cursor: 'pointer',
                            backgroundColor: carouselIndex === idx ? 'white' : 'rgba(255, 255, 255, 0.4)',
                            transition: '0.2s'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Food Search Bar */}
                  <div style={{ position: 'relative', margin: '15px 0' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: currentTheme.textMuted }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Tìm món ăn ngon hoặc quán ăn ưa thích của bạn..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 16px 12px 46px',
                        borderRadius: '12px',
                        border: `1.5px solid ${currentTheme.border}`,
                        backgroundColor: currentTheme.inputBg,
                        color: currentTheme.text,
                        fontSize: '14px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: '0.2s',
                        boxShadow: `0 2px 8px ${currentTheme.shadow}`
                      }}
                      onFocus={(e) => e.target.style.borderColor = currentTheme.primary}
                      onBlur={(e) => e.target.style.borderColor = currentTheme.border}
                    />
                  </div>

                  {/* Quick Categories */}
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.name}
                        onClick={() => setSelectedCategory(cat.name)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
                          padding: '10px 18px', borderRadius: '24px', fontSize: '13px', fontWeight: '700',
                          cursor: 'pointer', transition: 'all 0.2s',
                          backgroundColor: selectedCategory === cat.name ? currentTheme.primary : currentTheme.panel,
                          color: selectedCategory === cat.name ? 'white' : currentTheme.text,
                          border: `1.5px solid ${selectedCategory === cat.name ? currentTheme.primary : currentTheme.border}`,
                          boxShadow: selectedCategory === cat.name ? `0 4px 15px ${currentTheme.primaryGlow}` : 'none'
                        }}
                      >
                        <span style={{ fontSize: '16px' }}>{cat.icon}</span>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* AREA 2: SOCIAL COMMUNITY - "HÔM NAY ĂN GÌ?" */}
              {activeTab === 'feed' && (
                <>
                  {/* Write Post Box */}
                  <div id="writePostBox" style={{ 
                backgroundColor: currentTheme.panel, border: `1px solid ${currentTheme.border}`, 
                borderRadius: '16px', padding: '20px', boxShadow: `0 10px 30px ${currentTheme.shadow}`
              }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', color: currentTheme.primary, fontWeight: '800', fontFamily: vietnameseTextFont, lineHeight: 1.3, letterSpacing: 0 }}>
                  Hôm nay ăn gì? Chia sẻ ngay! <span style={{ fontFamily: emojiTextFont, lineHeight: 1 }}>😋</span>
                </h3>
                <form onSubmit={handleCreatePost}>
                  <textarea
                    placeholder="Vừa phát hiện quán này ngon lắm, mọi người ăn thử đi..."
                    value={newPostContent}
                    onChange={e => setNewPostContent(e.target.value)}
                    style={{ 
                      width: '100%', minHeight: '80px', padding: '12px', 
                      backgroundColor: currentTheme.inputBg, border: `1px solid ${currentTheme.border}`, 
                      borderRadius: '10px', color: currentTheme.text, outline: 'none', 
                      resize: 'none', fontSize: '14px', boxSizing: 'border-box' 
                    }}
                  />
                  
                  {/* Tag Food drop-down & Image selection */}
                  <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
                    {/* File upload from device or Drag & Drop */}
                    <div 
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = currentTheme.primary;
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = currentTheme.border;
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = currentTheme.border;
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            setNewPostImage(uploadEvent.target.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{
                        flex: 1.2,
                        minWidth: '240px',
                        border: `2px dashed ${newPostImage ? currentTheme.primary : currentTheme.border}`,
                        borderRadius: '10px',
                        padding: '8px 10px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: currentTheme.inputBg,
                        color: currentTheme.textMuted,
                        fontSize: '12px',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '50px',
                        boxSizing: 'border-box'
                      }}
                      onClick={() => document.getElementById('device-image-input').click()}
                    >
                      <input 
                        type="file" 
                        id="device-image-input" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (uploadEvent) => {
                              setNewPostImage(uploadEvent.target.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {newPostImage ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={newPostImage} alt="Preview" style={{ width: '38px', height: '38px', objectFit: 'cover', borderRadius: '6px' }} />
                          <span style={{ color: currentTheme.primary, fontWeight: '700' }}>✓ Đã chọn ảnh</span>
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewPostImage('');
                            }} 
                            style={{ color: '#ff424e', fontWeight: 'bold', marginLeft: '5px', cursor: 'pointer' }}
                          >
                            Xóa
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '15px' }}>📸</span>
                          <span>Kéo thả ảnh hoặc click để tải lên ảnh thiết bị</span>
                        </div>
                      )}
                    </div>

                    {/* Autocomplete Tag Food */}
                    <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
                      {taggedFoodId ? (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          backgroundColor: currentTheme.activeBg,
                          border: `1.5px solid ${currentTheme.primary}`,
                          borderRadius: '8px',
                          color: currentTheme.text,
                          fontSize: '13px',
                          height: '50px',
                          boxSizing: 'border-box'
                        }}>
                          <span style={{ fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                            🏷️ {foods.find(f => f._id === taggedFoodId)?.name || 'Món ăn'}
                          </span>
                          <span 
                            onClick={() => {
                              setTaggedFoodId('');
                              setSearchTagQuery('');
                            }}
                            style={{ color: '#ff424e', fontWeight: 'bold', cursor: 'pointer', marginLeft: '10px' }}
                          >
                            ✕
                          </span>
                        </div>
                      ) : (
                        <>
                          <input
                            type="text"
                            placeholder="🔍 Tìm món ăn để gắn thẻ..."
                            value={searchTagQuery}
                            onChange={(e) => setSearchTagQuery(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              backgroundColor: currentTheme.inputBg,
                              border: `1px solid ${currentTheme.border}`,
                              borderRadius: '8px',
                              color: currentTheme.text,
                              outline: 'none',
                              fontSize: '13px',
                              height: '50px',
                              boxSizing: 'border-box'
                            }}
                          />
                          {searchTagQuery.trim() && (
                            <div style={{
                              position: 'absolute',
                              bottom: '100%',
                              left: 0,
                              right: 0,
                              backgroundColor: currentTheme.panel,
                              border: `1px solid ${currentTheme.border}`,
                              borderRadius: '8px',
                              zIndex: 100,
                              marginBottom: '5px',
                              maxHeight: '150px',
                              overflowY: 'auto',
                              boxShadow: `0 -4px 15px ${currentTheme.shadow}`
                            }}>
                              {foods
                                .filter(f => f.name.toLowerCase().includes(searchTagQuery.toLowerCase()))
                                .map(food => (
                                  <div
                                    key={food._id}
                                    onClick={() => {
                                      setTaggedFoodId(food._id);
                                      setSearchTagQuery('');
                                    }}
                                    style={{
                                      padding: '8px 12px',
                                      cursor: 'pointer',
                                      borderBottom: `1px solid ${currentTheme.border}`,
                                      color: currentTheme.text,
                                      fontSize: '12px',
                                      textAlign: 'left',
                                      transition: 'background-color 0.2s',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '10px'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = currentTheme.activeBg}
                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <img 
                                      src={food.image} 
                                      alt={food.name} 
                                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} 
                                    />
                                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                      <span style={{ fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>
                                        {food.name}
                                      </span>
                                      <span style={{ fontSize: '11px', color: currentTheme.primary, marginTop: '2px', fontWeight: '600', display: 'block' }}>
                                        {(food.price || 0).toLocaleString()}đ
                                        <span style={{ color: currentTheme.textMuted, marginLeft: '8px', fontWeight: '400' }}>
                                          ({food.restaurant_name || food.restaurant_id?.store_name || food.restaurant_id?.display_name || 'Cửa hàng'})
                                        </span>
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              {foods.filter(f => f.name.toLowerCase().includes(searchTagQuery.toLowerCase())).length === 0 && (
                                <div style={{ padding: '8px 12px', color: currentTheme.textMuted, fontStyle: 'italic', fontSize: '12px', textAlign: 'left' }}>
                                  Không tìm thấy món ăn nào
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={postLoading || !newPostContent.trim()}
                      style={{ 
                        padding: '8px 24px', background: currentTheme.primaryGradient,
                        color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', 
                        fontWeight: 'bold', fontSize: '13px', transition: '0.2s', 
                        opacity: (postLoading || !newPostContent.trim()) ? 0.6 : 1,
                        boxShadow: `0 4px 15px ${currentTheme.primaryGradientGlow}`
                      }}
                    >
                      {postLoading ? 'Đang đăng...' : 'Đăng Bài 🚀'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Feed Lists */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: vietnameseTextFont, lineHeight: 1.25, letterSpacing: 0 }}>
                  <span style={{ fontFamily: emojiTextFont, lineHeight: 1 }}>📢</span> Bảng Tin Món Ngon Cộng Đồng
                </h3>
                {posts.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', padding: '30px', backgroundColor: currentTheme.panel, 
                    border: `1px solid ${currentTheme.border}`, borderRadius: '16px', color: currentTheme.textMuted 
                  }}>
                    Chưa có bài đăng nào. Hãy là người đầu tiên chia sẻ món ăn ngon!
                  </div>
                ) : (
                  (activeTab === 'order' ? posts.slice(0, 3) : posts).map(post => {
                    const isLiked = currentUser && post.reacts && post.reacts.includes(currentUser._id);
                    return (
                      <div key={post._id} style={{ 
                        backgroundColor: currentTheme.panel, border: `1px solid ${currentTheme.border}`, 
                        borderRadius: '16px', padding: '18px', boxShadow: `0 8px 24px ${currentTheme.shadow}`
                      }}>
                        {/* Post Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ 
                              width: '38px', height: '38px', borderRadius: '50%', backgroundColor: currentTheme.bg, 
                              border: `2px solid ${currentTheme.primary}`, display: 'flex', alignItems: 'center', 
                              justifyContent: 'center', fontSize: '16px', fontWeight: 'bold' 
                            }}>
                              {post.author_id?.role === 'merchant' ? '🏪' : '👤'}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: 'bold', color: currentTheme.text }}>{post.author_id?.full_name || 'Khách Hàng'}</span>
                                {post.author_id?.role === 'merchant' && <span style={{ fontSize: '10px', backgroundColor: currentTheme.primary, color: 'white', padding: '2px 6px', borderRadius: '4px' }}>Đối Tác</span>}
                              </div>
                              <span style={{ fontSize: '11px', color: currentTheme.textMuted }}>{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                          </div>

                          {currentUser && (post.author_id?._id === currentUser._id || currentUser.role === 'admin') && (
                            <button
                              onClick={() => handleDeletePost(post._id)}
                              style={{ backgroundColor: 'transparent', border: 'none', color: '#ff424e', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                            >
                              🗑️ Xóa
                            </button>
                          )}
                        </div>

                        {/* Post Content */}
                        <p style={{ fontSize: '14px', lineHeight: '1.5', color: currentTheme.text, margin: '0 0 12px 0', whiteSpace: 'pre-line' }}>
                          {post.content}
                        </p>
                        
                        {/* Attachments */}
                        {post.images && post.images.length > 0 && post.images[0] && (
                          <div style={{ width: '100%', maxHeight: '280px', overflow: 'hidden', borderRadius: '12px', marginBottom: '12px', border: `1px solid ${currentTheme.border}` }}>
                            <img src={post.images[0]} alt="Review media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          </div>
                        )}

                        {/* TAGGED PRODUCT LINK (UX UNIQUE BENEFIT) */}
                        {post.linked_food && (
                          <div style={{ 
                            backgroundColor: currentTheme.bg, border: `1.5px solid ${currentTheme.border}`,
                            borderRadius: '12px', padding: '12px', marginBottom: '12px', display: 'flex',
                            alignItems: 'center', gap: '12px', justifyContent: 'space-between'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img src={post.linked_food.image} alt={post.linked_food.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{post.linked_food.name}</span>
                                <span style={{ fontSize: '12px', color: currentTheme.primary, fontWeight: '700' }}>{(post.linked_food.price || 0).toLocaleString()}đ</span>
                              </div>
                            </div>
                            <button
                              onClick={() => addToCart(post.linked_food)}
                              style={{
                                padding: '8px 16px', background: currentTheme.primaryGradient,
                                color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                fontWeight: '700', fontSize: '12px', boxShadow: `0 2px 10px ${currentTheme.primaryGradientGlow}`
                              }}
                            >
                              ⚡ Đặt Ngay Món Này
                            </button>
                          </div>
                        )}

                        {/* Reactions and comments actions */}
                        <div style={{ display: 'flex', gap: '20px', borderTop: `1px solid ${currentTheme.border}`, paddingTop: '10px', fontSize: '13px' }}>
                          <button
                            onClick={() => handleLikePost(post._id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', border: 'none', color: isLiked ? '#ff424e' : currentTheme.textMuted, cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            <span>{isLiked ? '❤️' : '🤍'}</span> Thích ({post.reacts ? post.reacts.length : 0})
                          </button>

                          <button
                            onClick={() => toggleComments(post._id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'transparent', border: 'none', color: currentTheme.textMuted, cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            <span>💬</span> Bình luận ({post.Comments ? post.Comments.length : 0})
                          </button>
                        </div>

                        {/* Comments Drawer */}
                        {commentsOpen[post._id] && (
                          <div style={{ marginTop: '12px', borderTop: `1px dashed ${currentTheme.border}`, paddingTop: '12px' }}>
                            {isLoggedIn && (
                              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                                <input
                                  type="text"
                                  placeholder="Phản hồi món ngon..."
                                  value={commentInputs[post._id] || ''}
                                  onChange={e => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                                  onKeyDown={e => { if (e.key === 'Enter') handleAddComment(post._id); }}
                                  style={{ flex: 1, padding: '8px 12px', backgroundColor: currentTheme.inputBg, border: `1px solid ${currentTheme.border}`, borderRadius: '8px', color: currentTheme.text, fontSize: '12px', outline: 'none' }}
                                />
                                <button
                                  onClick={() => handleAddComment(post._id)}
                                  style={{ padding: '8px 14px', backgroundColor: currentTheme.activeBg, color: currentTheme.primary, border: `1px solid ${currentTheme.primary}44`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                >
                                  Gửi
                                </button>
                              </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxH: '200px', overflowY: 'auto' }}>
                              {!post.Comments || post.Comments.length === 0 ? (
                                <p style={{ fontSize: '11px', color: currentTheme.textMuted, margin: '2px 0' }}>Chưa có bình luận.</p>
                              ) : (
                                post.Comments.map(c => (
                                  <div key={c._id} style={{ display: 'flex', gap: '8px', backgroundColor: currentTheme.bg, padding: '8px 10px', borderRadius: '8px', border: `1px solid ${currentTheme.border}` }}>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: currentTheme.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', flexShrink: 0 }}>
                                      👤
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '11px', color: currentTheme.text }}>{c.user_id?.full_name || 'Thành Viên'}</span>
                                        <span style={{ fontSize: '9px', color: currentTheme.textMuted }}>{new Date(c.created_at || Date.now()).toLocaleDateString()}</span>
                                      </div>
                                      <p style={{ fontSize: '11px', color: currentTheme.text, margin: 0 }}>{c.content}</p>
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
                
                {activeTab === 'order' && posts.length > 3 && (
                  <button 
                    onClick={() => setActiveTab('feed')}
                    style={{
                      padding: '10px 0', border: `1px solid ${currentTheme.border}`, 
                      backgroundColor: currentTheme.panel, color: currentTheme.primary,
                      fontWeight: '700', borderRadius: '10px', cursor: 'pointer', fontSize: '13px'
                    }}
                  >
                    Xem thêm nhiều bài review cộng đồng ▾
                  </button>
                )}
              </div>
            </>
          )}

          {/* AREA 3: E-COMMERCE - MÓN NGON GỢI Ý */}
          {activeTab === 'order' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ 
                    backgroundColor: currentTheme.panel, padding: '14px 20px', borderRadius: '12px',
                    fontWeight: '800', color: currentTheme.primary, border: `1px solid ${currentTheme.border}`,
                    fontFamily: vietnameseTextFont, lineHeight: 1.25, letterSpacing: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: `0 4px 15px ${currentTheme.shadow}`
                  }}>
                    <span><span style={{ fontFamily: emojiTextFont, lineHeight: 1 }}>🔥</span> MÓN NGON KHUYẾN NGHỊ GẦN BẠN</span>
                    {!loading && (
                      <span style={{ fontSize: '12px', color: currentTheme.textMuted, fontWeight: '400' }}>
                        Có {filteredFoods.length} món
                      </span>
                    )}
                  </div>

                  <div style={{ 
                    backgroundColor: currentTheme.panel, padding: '20px', borderRadius: '12px',
                    border: `1px solid ${currentTheme.border}`, boxShadow: `0 10px 30px ${currentTheme.shadow}`
                  }}>
                    {loading && (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: currentTheme.textMuted }}>
                        <p style={{ fontSize: '15px' }}>Đang tải danh sách món ăn từ các cửa hàng...</p>
                      </div>
                    )}

                    {!loading && error && (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: '#ef4444' }}>
                        <p>{error}</p>
                      </div>
                    )}

                    {!loading && !error && filteredFoods.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: currentTheme.textMuted }}>
                        <p style={{ fontSize: '15px', marginBottom: '4px' }}>Không tìm thấy món ăn phù hợp</p>
                        <p style={{ fontSize: '12px' }}>Thử lọc từ khóa khác xem sao!</p>
                      </div>
                    )}

                    {!loading && !error && filteredFoods.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
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
            </>
          )}

          {/* TAB 3: FULL SCREEN CHAT MESSENGER */}
          {activeTab === 'chat' && (
            <div style={{ 
              display: 'flex', height: '560px', backgroundColor: currentTheme.panel, 
              border: `1px solid ${currentTheme.border}`, borderRadius: '16px', overflow: 'hidden', 
              boxShadow: `0 10px 30px ${currentTheme.shadow}` 
            }}>
              {/* Chat Left Column */}
              <div style={{ width: '35%', borderRight: `1px solid ${currentTheme.border}`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: `1px solid ${currentTheme.border}`, fontWeight: '800', color: currentTheme.primary, fontSize: '15px' }}>
                  Hội thoại
                </div>
                
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${currentTheme.border}` }}>
                  <input
                    type="text"
                    placeholder="Tìm theo username..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px', backgroundColor: currentTheme.bg,
                      border: `1px solid ${currentTheme.border}`, borderRadius: '8px',
                      color: currentTheme.text, fontSize: '12px', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {chatContacts
                    .filter(c => !chatSearchQuery || (c.email && c.email.toLowerCase().includes(chatSearchQuery.toLowerCase())))
                    .map(c => {
                      const isActive = selectedContact && selectedContact._id === c._id;
                      return (
                        <div key={c._id} onClick={() => handleSelectContact(c)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                            borderBottom: `1px solid ${currentTheme.border}`, cursor: 'pointer',
                            backgroundColor: isActive ? currentTheme.activeBg : 'transparent',
                            transition: '0.2s'
                          }}
                        >
                          <div style={{ 
                            width: '34px', height: '34px', borderRadius: '50%', backgroundColor: currentTheme.bg, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', 
                            border: `1px solid ${currentTheme.border}`, flexShrink: 0
                          }}>
                            {c.role === 'merchant' ? '🏪' : c.role === 'driver' ? '🛵' : '👤'}
                          </div>
                          <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: currentTheme.text, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{c.full_name}</div>
                            <div style={{ fontSize: '10px', color: currentTheme.textMuted, textTransform: 'capitalize' }}>{c.role === 'customer' ? 'Khách hàng' : c.role === 'merchant' ? 'Cửa Hàng' : c.role === 'driver' ? 'Shipper' : c.role}</div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Chat Right Column */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: currentTheme.bg }}>
                {selectedContact ? (
                  <>
                    <div style={{ padding: '14px 18px', borderBottom: `1px solid ${currentTheme.border}`, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: currentTheme.panel }}>
                      <span style={{ fontSize: '18px' }}>{selectedContact.role === 'merchant' ? '🏪' : selectedContact.role === 'driver' ? '🛵' : '👤'}</span>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{selectedContact.full_name}</span>
                    </div>

                    <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {chatMessages.length === 0 ? (
                        <div style={{ margin: 'auto', color: currentTheme.textMuted, fontSize: '12px' }}>Gửi tin nhắn để bắt đầu cuộc trò chuyện! 👋</div>
                      ) : (
                        chatMessages.map((m, idx) => {
                          const isMe = m.sender_id === 'me' || (currentUser && m.sender_id === currentUser._id);
                          return (
                            <div key={m._id || idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                              <div style={{
                                maxWidth: '70%', padding: '10px 14px', borderRadius: '12px', fontSize: '13px',
                                backgroundColor: isMe ? currentTheme.primary : currentTheme.panel,
                                color: isMe ? 'white' : currentTheme.text,
                                border: isMe ? 'none' : `1px solid ${currentTheme.border}`,
                                borderRadiusStyle: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0'
                              }}>
                                {m.content}
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    <form onSubmit={(e) => handleSendMessage(e, newMessageText, selectedContact, () => setNewMessageText(''))} 
                      style={{ padding: '12px', borderTop: `1px solid ${currentTheme.border}`, display: 'flex', gap: '8px', backgroundColor: currentTheme.panel }}>
                      <input
                        type="text"
                        placeholder="Nhập tin nhắn..."
                        value={newMessageText}
                        onChange={e => setNewMessageText(e.target.value)}
                        style={{ 
                          flex: 1, padding: '10px 14px', backgroundColor: currentTheme.bg, 
                          border: `1px solid ${currentTheme.border}`, borderRadius: '8px', 
                          color: currentTheme.text, fontSize: '13px', outline: 'none' 
                        }}
                      />
                      <button type="submit" style={{ padding: '10px 20px', backgroundColor: currentTheme.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Gửi
                      </button>
                    </form>
                  </>
                ) : (
                  <div style={{ margin: 'auto', textAlign: 'center', color: currentTheme.textMuted }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>💬</div>
                    <p>Chọn một người liên lạc từ cột bên trái để trò chuyện.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MY ORDERS VIEW */}
          {activeTab === 'orders' && (
            <div style={{ 
              backgroundColor: currentTheme.panel, border: `1px solid ${currentTheme.border}`, 
              borderRadius: '16px', padding: '24px', boxShadow: `0 10px 30px ${currentTheme.shadow}`
            }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '800', color: currentTheme.primary }}>
                🛒 Lịch Sử Đơn Hàng Của Tôi
              </h3>
              
              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '30px', color: currentTheme.textMuted }}>Đang tải thông tin đơn hàng...</div>
              ) : myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: currentTheme.textMuted }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</div>
                  <p>Bạn chưa đặt đơn hàng nào trên hệ thống.</p>
                  <button onClick={() => setActiveTab('order')} style={{ marginTop: '12px', padding: '8px 20px', backgroundColor: currentTheme.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Đặt món ngay
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {myOrders.map(order => (
                    <div key={order._id} style={{ 
                      border: `1px solid ${currentTheme.border}`, borderRadius: '12px', 
                      padding: '16px', backgroundColor: currentTheme.bg 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${currentTheme.border}`, paddingBottom: '10px', marginBottom: '10px' }}>
                        <div>
                          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Cửa Hàng: {order.store_id?.store_name || 'TasteByte Partner'}</span>
                          <div style={{ fontSize: '11px', color: currentTheme.textMuted, marginTop: '2px' }}>Mã đơn: {order._id}</div>
                        </div>
                        <span style={{
                          backgroundColor: order.status === 'completed' ? '#065f46' : order.status === 'cancelled' ? '#991b1b' : '#854d0e',
                          color: 'white', fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', height: 'fit-content'
                        }}>
                          {order.status === 'completed' ? 'Thành công' : order.status === 'cancelled' ? 'Đã hủy' : 'Đang xử lý'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: currentTheme.textMuted }}>• {item.name} x{item.quantity}</span>
                            <span>{(item.price * item.quantity).toLocaleString()}đ</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px dashed ${currentTheme.border}`, marginTop: '10px', paddingTop: '10px', fontSize: '14px', fontWeight: '700' }}>
                        <span>Tổng thanh toán:</span>
                        <span style={{ color: currentTheme.primary }}>{(order.total_price || 0).toLocaleString()}đ</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DETAILED NOTIFICATIONS VIEW */}
          {activeTab === 'notifications' && (
            <div style={{ 
              backgroundColor: currentTheme.panel, border: `1px solid ${currentTheme.border}`, 
              borderRadius: '16px', padding: '24px', boxShadow: `0 10px 30px ${currentTheme.shadow}`
            }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '800', color: currentTheme.primary }}>
                🔔 Hộp Thư Thông Báo
              </h3>
              
              {notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: currentTheme.textMuted }}>
                  Không có thông báo nào.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.map(n => (
                    <div key={n._id} style={{
                      padding: '14px 18px', borderRadius: '12px', border: `1px solid ${currentTheme.border}`,
                      backgroundColor: n.is_read ? currentTheme.bg : currentTheme.activeBg,
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{n.title}</span>
                        <span style={{ fontSize: '11px', color: currentTheme.textMuted }}>{new Date(n.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: currentTheme.text }}>{n.message}</p>
                      {!n.is_read && <span style={{ position: 'absolute', top: '15px', right: '15px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: currentTheme.primary }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ==============================================
            RIGHT COLUMN (SIDEBAR): MINI CART & INTERACTION (25%)
            ============================================== */}
        <div className="home-right-column" style={{ 
          display: 'flex', flexDirection: 'column', gap: '20px'
        }}>
          


          {/* Trending Reviews */}
          <div style={{ 
            backgroundColor: currentTheme.panel, border: `1px solid ${currentTheme.border}`, 
            borderRadius: '16px', padding: '18px', boxShadow: `0 10px 30px ${currentTheme.shadow}`
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '12px', textTransform: 'uppercase', color: currentTheme.textMuted, letterSpacing: '1px', borderBottom: `1px solid ${currentTheme.border}`, paddingBottom: '8px' }}>
              🔥 REVIEW HẤP DẪN
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hotReviews.map(rev => (
                <div key={rev.id} onClick={() => { setActiveTab('feed'); loadPosts(); }}
                  style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', backgroundColor: currentTheme.bg, border: `1px solid ${currentTheme.border}` }}>
                  <img src={rev.img} alt={rev.title} style={{ width: '100%', height: '70px', objectFit: 'cover' }} />
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontSize: '11px', color: currentTheme.primary, fontWeight: 'bold' }}>{rev.author}</div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: currentTheme.text, margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rev.title}</div>
                    <div style={{ fontSize: '10px', color: '#eab308' }}>★ {rev.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>



      {/* ==============================================
          SPLIT BILL & CHECKOUT MODAL FOR GROUP ORDER
          ============================================== */}
      {showSplitBillModal && (() => {
        const bill = getSplitBillDetails();
        return (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
            alignItems: 'center', zIndex: 10005, backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              backgroundColor: currentTheme.panel, border: `1.5px solid ${currentTheme.border}`,
              padding: '24px', borderRadius: '16px', maxWidth: '480px', width: '90%',
              boxShadow: `0 15px 40px ${currentTheme.shadow}`, color: currentTheme.text,
              fontFamily: vietnameseTextFont, lineHeight: 1.35, letterSpacing: 0
            }}>
              <h3 style={{ color: currentTheme.primary, fontSize: '20px', margin: '0 0 16px 0', fontWeight: '800', textAlign: 'center', fontFamily: vietnameseTextFont, lineHeight: 1.25, letterSpacing: 0 }}>
                <span style={{ fontFamily: emojiTextFont, lineHeight: 1 }}>📊</span> BẢNG CHIA TIỀN HÓA ĐƠN NHÓM
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {bill.splitList.map(member => (
                  <div key={member.id} style={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    padding: '10px 14px', backgroundColor: currentTheme.bg, borderRadius: '10px',
                    border: `1px solid ${currentTheme.border}`
                  }}>
                    <span style={{ fontWeight: '700', fontSize: '13px' }}>{member.name}</span>
                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                      <div>Món ăn: <span style={{ fontWeight: 'bold' }}>{member.itemsTotal.toLocaleString()}đ</span></div>
                      <div style={{ color: currentTheme.textMuted }}>Ship chia: <span style={{ fontWeight: 'bold' }}>{member.shipShare.toLocaleString()}đ</span></div>
                      <div style={{ color: currentTheme.primary, fontWeight: '800', fontSize: '13px', marginTop: '2px', fontFamily: vietnameseTextFont, lineHeight: 1.35, letterSpacing: 0 }}>Cộng: {member.total.toLocaleString()}đ</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total bills summary */}
              <div style={{ 
                borderTop: `1.5px solid ${currentTheme.border}`, paddingTop: '12px', marginBottom: '24px',
                fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Thành tiền các món:</span>
                  <span>{bill.subtotal.toLocaleString()}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Phí ship chia đều:</span>
                  <span>{bill.shippingFee.toLocaleString()}đ</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '900', color: currentTheme.primary, marginTop: '6px', fontFamily: vietnameseTextFont, lineHeight: 1.35, letterSpacing: 0 }}>
                  <span>Tổng tiền thanh toán cả nhóm:</span>
                  <span>{bill.totalPrice.toLocaleString()}đ</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowSplitBillModal(false)}
                  style={{ flex: 1, padding: '12px 0', backgroundColor: currentTheme.bg, color: currentTheme.text, border: `1.5px solid ${currentTheme.border}`, borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontFamily: vietnameseTextFont, lineHeight: 1.2, letterSpacing: 0 }}
                >
                  Quay lại
                </button>
                <button 
                  onClick={handleGroupCheckoutSubmit}
                  style={{ flex: 1, padding: '12px 0', background: currentTheme.primaryGradient, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', boxShadow: `0 4px 15px ${currentTheme.primaryGradientGlow}`, fontFamily: vietnameseTextFont, lineHeight: 1.2, letterSpacing: 0 }}
                >
                  Đặt đơn nhóm <span style={{ fontFamily: emojiTextFont, lineHeight: 1 }}>🚀</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* GENERAL MODAL */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center',
          alignItems: 'center', zIndex: 99999
        }}>
          <div style={{
            backgroundColor: currentTheme.panel, padding: '30px', borderRadius: '16px',
            boxShadow: `0 10px 30px ${currentTheme.shadow}`, textAlign: 'center',
            maxWidth: '400px', width: '90%', border: `1.5px solid ${currentTheme.primary}`
          }}>
            <div style={{ fontSize: '45px', marginBottom: '10px' }}>🚀</div>
            <h3 style={{ margin: '0 0 10px', color: currentTheme.primary, fontWeight: '800' }}>Đặt Đơn Thành Công!</h3>
            <p style={{ color: currentTheme.textMuted, fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px' }}>
              Đơn hàng của bạn đã được ghi nhận. Hệ thống đang tiến hành điều phối cửa hàng chuẩn bị món ăn!
            </p>
            <button
              onClick={() => setShowModal(false)}
              style={{
                padding: '10px 40px', backgroundColor: currentTheme.primary, color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px'
              }}
            >Xác nhận</button>
          </div>
        </div>
      )}

      {/* ❌ MODAL THÔNG BÁO LỖI HỆ THỐNG */}
      {showErrModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(3, 7, 18, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: currentTheme.panel, width: '420px', padding: '32px', borderRadius: '16px', border: `1px solid ${currentTheme.border}`, textAlign: 'center', boxShadow: `0 25px 50px -12px ${currentTheme.shadow}`, boxSizing: 'border-box' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h4 style={{ fontSize: '20px', margin: '0 0 12px 0', color: '#ef4444', fontWeight: '800' }}>Thông Báo</h4>
            <p style={{ color: currentTheme.textMuted, fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px 0', fontWeight: '500' }}>
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

      {/* 🗑️ MODAL XÁC NHẬN XÓA BÀI VIẾT */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(3, 7, 18, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: currentTheme.panel, width: '420px', padding: '32px', borderRadius: '16px', border: `1px solid ${currentTheme.border}`, textAlign: 'center', boxShadow: `0 25px 50px -12px ${currentTheme.shadow}`, boxSizing: 'border-box' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🗑️</div>
            <h4 style={{ fontSize: '20px', margin: '0 0 12px 0', color: '#ef4444', fontWeight: '800' }}>Xác Nhận Xóa</h4>
            <p style={{ color: currentTheme.textMuted, fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px 0', fontWeight: '500' }}>
              Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setPostToDelete(null);
                }}
                style={{ flex: 1, padding: '10px 0', backgroundColor: currentTheme.bg, color: currentTheme.text, border: `1.5px solid ${currentTheme.border}`, borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button
                onClick={executeDeletePost}
                style={{ flex: 1, padding: '10px 0', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Xóa bài viết
              </button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '40px 0', color: currentTheme.textMuted, fontSize: '13px', maxWidth: '1200px', margin: '0 auto' }}>
        © 2026 TasteByte - Đồ án Công nghệ phần mềm Nhóm 8
      </footer>

      {/* Embedded Animations CSS */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Home;
