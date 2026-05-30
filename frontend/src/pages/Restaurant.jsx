import { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../services/api';

const Restaurant = () => {
  const navigate = useNavigate();
  const [localIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  
  const [loading, setLoading] = useState(true);
  const [regStatus, setRegStatus] = useState('none');
  const [shopData, setShopData] = useState(null);
  
  // State phục vụ Merchant Dashboard
  const [activeTab, setActiveTab] = useState('overview');
  const [foods, setFoods] = useState([]);
  const [newFood, setNewFood] = useState({ name: '', price: '', category: '', image: '', description: '' });
  const [merchantOrders, setMerchantOrders] = useState([]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);

  // States quản lý modal thông báo lỗi và xác nhận nguy hiểm
  const [showErrModal, setShowErrModal] = useState(false);
  const [errModalMsg, setErrModalMsg] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmCallback, setConfirmCallback] = useState(null);

  const showMerchantError = (msg) => {
    setErrModalMsg(msg);
    setShowErrModal(true);
  };

  const showMerchantConfirm = (msg, callback) => {
    setConfirmMsg(msg);
    setConfirmCallback(() => callback);
    setShowConfirmModal(true);
  };

  // Date selections for Statistics
  const getFormattedDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const [inputStartDate, setInputStartDate] = useState(getFormattedDate(sevenDaysAgo));
  const [inputEndDate, setInputEndDate] = useState(getFormattedDate(today));
  const [startDate, setStartDate] = useState(getFormattedDate(sevenDaysAgo));
  const [endDate, setEndDate] = useState(getFormattedDate(today));
  const [dateError, setDateError] = useState('');

  // Analytics calculated state
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    dailyData: [],
    foodsData: []
  });

  // Tự động kiểm tra trạng thái phê duyệt từ backend
  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      if (!localIsLoggedIn) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/restaurants/my-restaurant');
        if (res.data.status === 'success' && res.data.data) {
          const restaurant = res.data.data;
          setRegStatus(restaurant.status);
          setShopData(restaurant);
          localStorage.setItem('restaurantStatus', restaurant.status);

          // Nếu đã được duyệt, tải thêm danh sách món ăn & đơn hàng từ database
          if (restaurant.status === 'approved') {
            const foodsRes = await API.get('/restaurants/my-foods');
            if (foodsRes.data.status === 'success') {
              setFoods(foodsRes.data.data || []);
            }
            try {
              const ordersRes = await API.get('/restaurants/my-orders');
              if (ordersRes.data.status === 'success') {
                setMerchantOrders(ordersRes.data.orders || []);
              }
            } catch (orderErr) {
              console.error("Lỗi khi tải đơn hàng của cửa hàng:", orderErr);
            }
          }
        } else {
          setRegStatus('none');
          localStorage.removeItem('restaurantStatus');
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin cửa hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantInfo();
  }, [localIsLoggedIn]);

  // Deterministic Mock Stats Generator
  const generateStats = (start, end) => {
    const sDate = new Date(start);
    const eDate = new Date(end);
    
    const diffTime = Math.abs(eDate - sDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const daily = [];
    let tempDate = new Date(sDate);
    
    const getSeededRandom = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return Math.abs(Math.sin(hash)) * 1000;
    };
    
    // Map foods from database to simulate stats on
    // CHEAPER dishes sell more volume, EXPENSIVE dishes sell less volume
    const activeItems = [];
    foods.forEach(f => {
      // Avoid duplication
      if (!activeItems.find(item => item.name.toLowerCase() === f.name.toLowerCase())) {
        const calculatedBaseSales = Math.max(3, Math.round(18 - (f.price / 12000)));
        const seedRating = 4.5 + (getSeededRandom(f.name) % 5) / 10;
        
        activeItems.push({
          id: f._id,
          name: f.name,
          category: f.category,
          price: f.price,
          rating: Number(seedRating.toFixed(1)),
          image: f.image || 'https://via.placeholder.com/300',
          baseSales: calculatedBaseSales,
          status: f.status
        });
      }
    });
    
    const foodSalesMap = {};
    activeItems.forEach(item => {
      foodSalesMap[item.id] = 0;
    });
    
    for (let d = 0; d < diffDays; d++) {
      const dateStr = tempDate.toISOString().split('T')[0];
      const seed = getSeededRandom(dateStr);
      
      let dayRevenue = 0;
      let dayOrders = 0;
      
      activeItems.forEach(item => {
        const factor = 0.5 + (seed % 100) / 100;
        const dailyItemSales = Math.round(item.baseSales * factor);
        
        foodSalesMap[item.id] += dailyItemSales;
        dayRevenue += dailyItemSales * item.price;
        dayOrders += dailyItemSales;
      });
      
      daily.push({
        date: dateStr,
        revenue: dayRevenue,
        orders: dayOrders
      });
      
      tempDate.setDate(tempDate.getDate() + 1);
    }
    
    const computedFoods = activeItems.map(item => {
      const totalSales = foodSalesMap[item.id];
      const revenue = totalSales * item.price;
      return {
        ...item,
        orderCount: totalSales,
        revenue: revenue
      };
    });
    
    // Sort by revenue descending to mark top 5 HOT
    const sortedByRevenue = [...computedFoods].sort((a, b) => b.revenue - a.revenue);
    const top5Ids = sortedByRevenue.slice(0, 5).map(item => item.id);
    
    const finalFoods = computedFoods.map(item => ({
      ...item,
      isHot: top5Ids.includes(item.id)
    }));
    
    const totalRev = daily.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrd = daily.reduce((sum, d) => sum + d.orders, 0);
    
    return {
      totalRevenue: totalRev,
      totalOrders: totalOrd,
      dailyData: daily,
      foodsData: finalFoods
    };
  };

  // Run statistics generator whenever dates change or database foods are loaded
  useEffect(() => {
    if (regStatus === 'approved') {
      const stats = generateStats(startDate, endDate);
      setAnalytics(stats);
    }
  }, [startDate, endDate, regStatus, foods]);

  // Handle stats date adjustment
  const handleApplyDates = (e) => {
    e.preventDefault();
    const s = new Date(inputStartDate);
    const eD = new Date(inputEndDate);
    
    if (isNaN(s.getTime()) || isNaN(eD.getTime())) {
      setDateError('Định dạng ngày bắt đầu hoặc ngày kết thúc không đúng!');
      return;
    }
    if (s > eD) {
      setDateError('Ngày bắt đầu không thể lớn hơn ngày kết thúc!');
      return;
    }
    
    const diffTime = Math.abs(eD - s);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays > 31) {
      setDateError('Khoảng thời gian thống kê tối đa không được vượt quá 1 tháng (31 ngày)!');
      return;
    }
    
    setDateError('');
    setStartDate(inputStartDate);
    setEndDate(inputEndDate);
    setSuccessMsg('📅 Đã cập nhật và đồng bộ chỉ số doanh thu mới!');
  };

  // Ẩn thông báo thành công sau 3 giây
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Gửi đăng ký món ăn lên backend
  const handleAddFoodSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await API.post('/restaurants/foods', newFood);
      if (res.data.status === 'success') {
        setSuccessMsg('🍔 Đăng ký món ăn thành công! Chờ Admin duyệt.');
        setFoods([res.data.data, ...foods]);
        setNewFood({ name: '', price: '', category: '', image: '', description: '' }); // Reset Form
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi tạo món ăn!');
    }
  };

  const handleEditProfile = () => {
    navigate('/restaurant/onboarding'); 
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await API.patch(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.status === 'success') {
        setSuccessMsg(`📦 Đơn hàng đã được chuyển sang trạng thái: [${newStatus}]`);
        setMerchantOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      showMerchantError(err.response?.data?.message || 'Cập nhật tiến độ đơn hàng thất bại!');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const renderSVGChart = () => {
    const data = analytics.dailyData;
    if (!data || data.length === 0) return null;
    
    const maxVal = Math.max(...data.map(d => d.revenue), 1);
    
    const svgWidth = 600;
    const svgHeight = 220;
    const paddingLeft = 65;
    const paddingRight = 20;
    const paddingTop = 25;
    const paddingBottom = 40;
    
    const graphWidth = svgWidth - paddingLeft - paddingRight;
    const graphHeight = svgHeight - paddingTop - paddingBottom;
    
    const stepX = graphWidth / data.length;
    const barWidth = Math.max(8, stepX * 0.6);
    
    return (
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', backgroundColor: '#0b0f19', borderRadius: '12px', padding: '15px 10px', boxSizing: 'border-box' }}>
        {/* Y Axis Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = paddingTop + graphHeight - ratio * graphHeight;
          const val = Math.round(ratio * maxVal);
          return (
            <g key={index}>
              <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#1f2937" strokeWidth="1" strokeDasharray="4 4" />
              <text x={paddingLeft - 10} y={y + 4} fill="#64748b" fontSize="10" textAnchor="end" fontWeight="500">
                {val >= 1000000 ? `${(val / 1000000).toFixed(1)}Mđ` : val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </text>
            </g>
          );
        })}
        
        {/* Bars */}
        {data.map((day, index) => {
          const x = paddingLeft + index * stepX + (stepX - barWidth) / 2;
          const barHeight = (day.revenue / maxVal) * graphHeight;
          const y = paddingTop + graphHeight - barHeight;
          
          const dateParts = day.date.split('-');
          const label = `${dateParts[2]}/${dateParts[1]}`;
          
          return (
            <g key={index}>
              <title>{`${day.date}\nDoanh thu: ${day.revenue.toLocaleString('vi-VN')}đ\nSố đơn: ${day.orders} đơn`}</title>
              
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={barHeight} 
                fill="url(#emeraldGradient)" 
                rx="3" 
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              />
              
              {/* Invisible tooltip zone */}
              <rect
                x={paddingLeft + index * stepX}
                y={paddingTop}
                width={stepX}
                height={graphHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
              />
              
              {/* Labels (skip some if too crowded) */}
              {(data.length <= 10 || index % Math.ceil(data.length / 8) === 0) && (
                <text x={x + barWidth / 2} y={svgHeight - 15} fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="500">
                  {label}
                </text>
              )}
            </g>
          );
        })}
        
        {/* X Axis Base Line */}
        <line x1={paddingLeft} y1={paddingTop + graphHeight} x2={svgWidth - paddingRight} y2={paddingTop + graphHeight} stroke="#1f2937" strokeWidth="2" />
        
        <defs>
          <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // Kiểu dáng Table mẫu dùng chung (Dark Theme)
  const tableThStyle = { padding: '12px 15px', borderBottom: '2px solid #1f2937', color: '#94a3b8', fontSize: '14px', fontWeight: '600', textAlign: 'left' };
  const tableTdStyle = { padding: '12px 15px', borderBottom: '1px solid #1f2937', color: '#f8fafc', fontSize: '14px', textAlign: 'left' };

  return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', width: '100%', color: '#ffffff', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>
      
      {/* 🔴 TOAST ALERT BOX THÔNG BÁO THÀNH CÔNG */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '25px', right: '25px', backgroundColor: '#111827', color: '#ffffff', borderLeft: '4px solid #10b981', borderTop: '1px solid #1f2937', borderRight: '1px solid #1f2937', borderBottom: '1px solid #1f2937', padding: '15px 25px', borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 99999, fontSize: '14px', fontWeight: '500' }}>
          {successMsg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px 0', color: '#10b981', fontWeight: 'bold' }}>
          ⏳ Đang tải thông tin trạng thái từ máy chủ...
        </div>
      ) : regStatus === 'approved' ? (
        
        /* ================= GIAO DIỆN 1: BẢN THIẾT KẾ SIDEBAR CHO QUÁN ĐÃ DUYỆT ================= */
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b0f19', color: '#ffffff', textAlign: 'left' }}>
          
          {/* 🟢 SIDEBAR BÊN TRÁI */}
          <div style={{ width: '260px', backgroundColor: '#111827', borderRight: '1px solid #1f2937', padding: '25px 15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'sticky', top: 0, height: '100vh', boxSizing: 'border-box' }}>
            <div>
              <h2 style={{ color: '#10b981', margin: '0 0 30px 0', fontSize: '22px', fontWeight: '800', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                🏪 TasteByte <span style={{ fontSize: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '3px 8px', borderRadius: '12px', fontWeight: 'bold' }}>Store</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => setActiveTab('overview')} style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'overview' ? '#10b981' : 'transparent', color: activeTab === 'overview' ? 'white' : '#94a3b8', transition: 'all 0.2s' }}>
                  📊 Tổng Quan Cửa Hàng
                </button>
                <button onClick={() => setActiveTab('revenue')} style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'revenue' ? '#10b981' : 'transparent', color: activeTab === 'revenue' ? 'white' : '#94a3b8', transition: 'all 0.2s' }}>
                  💰 Doanh Thu & Biểu Đồ
                </button>
                <button onClick={() => setActiveTab('menu')} style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'menu' ? '#10b981' : 'transparent', color: activeTab === 'menu' ? 'white' : '#94a3b8', transition: 'all 0.2s' }}>
                  🍔 Quản Lý Thực Đơn
                </button>
                <button onClick={() => setActiveTab('orders')} style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'orders' ? '#10b981' : 'transparent', color: activeTab === 'orders' ? 'white' : '#94a3b8', transition: 'all 0.2s' }}>
                  📦 Quản Lý Đơn Hàng
                </button>
                <button onClick={() => setActiveTab('profile')} style={{ width: '100%', padding: '12px 15px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', backgroundColor: activeTab === 'profile' ? '#10b981' : 'transparent', color: activeTab === 'profile' ? 'white' : '#94a3b8', transition: 'all 0.2s' }}>
                  ⚙️ Hồ Sơ Cửa Hàng
                </button>
              </div>
            </div>

            <div>
              <button onClick={() => navigate('/home')} style={{ width: '100%', padding: '10px', backgroundColor: '#1f2937', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginBottom: '10px', fontWeight: '500', textAlign: 'center', transition: 'background-color 0.2s' }}>
                🏠 Về Trang Chủ Khách
              </button>
              <button onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: 'rgba(225, 29, 72, 0.1)', color: '#e11d48', border: '1px solid rgba(225, 29, 72, 0.2)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center', transition: 'all 0.2s' }}>
                🚪 Đăng Xuất Đối Tác
              </button>
            </div>
          </div>

          {/* 💻 NỘI DUNG CHÍNH BÊN PHẢI */}
          <div style={{ flex: 1, padding: '40px 30px', overflowY: 'auto', boxSizing: 'border-box' }}>
            
            {/* Header trên */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1f2937', paddingBottom: '15px' }}>
              <div>
                <h1 style={{ fontSize: '28px', color: '#ffffff', margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🏪</span> {shopData?.store_name}
                </h1>
                <p style={{ color: '#94a3b8', margin: '5px 0 0 0', fontSize: '14px' }}>Chào mừng chủ cửa hàng <b>{shopData?.merchant_name}</b> quay trở lại quản trị hệ thống.</p>
              </div>
              <span style={{ fontSize: '12px', padding: '6px 15px', borderRadius: '20px', fontWeight: 'bold', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                Hoạt Động 🟢
              </span>
            </div>

            {/* ================= TAB 1: TỔNG QUAN CỬA HÀNG ================= */}
            {activeTab === 'overview' && (
              <div>
                {/* 3 Metric cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>💰 TỔNG DOANH THU THỰC TẾ</span>
                    <h2 style={{ fontSize: '28px', color: '#10b981', margin: '10px 0 0 0', fontWeight: '800' }}>
                      {merchantOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total_price || 0), 0).toLocaleString('vi-VN')}đ
                    </h2>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b' }}>Tính trên các đơn hàng thành công thực tế</p>
                  </div>
                  <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>📦 ĐƠN HÀNG HOÀN THÀNH</span>
                    <h2 style={{ fontSize: '28px', color: '#ffffff', margin: '10px 0 0 0', fontWeight: '800' }}>
                      {merchantOrders.filter(o => o.status === 'completed').length} đơn
                    </h2>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b' }}>Đơn hàng đã được tài xế giao nhận hoàn thành</p>
                  </div>
                  <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>🍔 SẢN PHẨM HIỆN CÓ</span>
                    <h2 style={{ fontSize: '28px', color: '#60a5fa', margin: '10px 0 0 0', fontWeight: '800' }}>
                      {foods.length} món
                    </h2>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b' }}>Số món ăn đã được kiểm duyệt phát hành</p>
                  </div>
                </div>

                {/* Profile panel */}
                <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#ffffff', fontSize: '18px', fontWeight: '700', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>🏪 Thông Tin Quán Ăn</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <div>
                      <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Tên cửa hàng:</b> {shopData?.store_name}</p>
                      <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Địa chỉ hoạt động:</b> {shopData?.address}</p>
                    </div>
                    <div>
                      <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Người đại diện pháp lý:</b> {shopData?.merchant_name}</p>
                      <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Loại hình kinh doanh:</b> {shopData?.business_type || 'Cá nhân'}</p>
                    </div>
                  </div>
                  <div style={{ marginTop: '20px', borderTop: '1px solid #1f2937', paddingTop: '20px', display: 'flex', gap: '15px' }}>
                    <button 
                      onClick={() => setActiveTab('profile')}
                      style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 25px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600' }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      📁 Xem hồ sơ chi tiết
                    </button>
                    <button 
                      onClick={handleEditProfile}
                      style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #374151', padding: '10px 25px', fontSize: '13px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600' }}
                      onMouseOver={(e) => { e.target.style.borderColor = '#ffffff'; e.target.style.color = '#ffffff'; }}
                      onMouseOut={(e) => { e.target.style.borderColor = '#374151'; e.target.style.color = '#94a3b8'; }}
                    >
                      ✏️ Chỉnh sửa hồ sơ đăng ký
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: THỐNG KÊ DOANH THU ================= */}
            {activeTab === 'revenue' && (
              <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '25px', borderBottom: '1px solid #1f2937', paddingBottom: '15px' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: '700' }}>📊 Báo Cáo Doanh Thu Giả Lập</h3>
                    <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Thống kê dữ liệu bán hàng và hiệu suất thực đơn theo mốc thời gian.</p>
                  </div>
                  
                  {/* Form lọc thời gian */}
                  <form onSubmit={handleApplyDates} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="date" 
                        value={inputStartDate} 
                        onChange={(e) => setInputStartDate(e.target.value)} 
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #1f2937', backgroundColor: '#0b0f19', color: '#ffffff', outline: 'none', fontSize: '13px', cursor: 'pointer' }}
                      />
                      <span style={{ color: '#64748b' }}>đến</span>
                      <input 
                        type="date" 
                        value={inputEndDate} 
                        onChange={(e) => setInputEndDate(e.target.value)} 
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #1f2937', backgroundColor: '#0b0f19', color: '#ffffff', outline: 'none', fontSize: '13px', cursor: 'pointer' }}
                      />
                    </div>
                    <button type="submit" style={{ padding: '8px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'background-color 0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#059669'} onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}>
                      Áp Dụng
                    </button>
                  </form>
                </div>

                {dateError && (
                  <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', fontWeight: '500' }}>
                    ⚠️ {dateError}
                  </div>
                )}

                {/* Cards Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div style={{ backgroundColor: '#0b0f19', padding: '22px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>💰 TỔNG DOANH THU ƯỚC TÍNH</span>
                    <h2 style={{ fontSize: '28px', color: '#10b981', margin: '8px 0 0 0', fontWeight: '800' }}>
                      {analytics.totalRevenue.toLocaleString('vi-VN')}đ
                    </h2>
                  </div>
                  <div style={{ backgroundColor: '#0b0f19', padding: '22px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>📦 TỔNG ĐƠN HÀNG ƯỚC TÍNH</span>
                    <h2 style={{ fontSize: '28px', color: '#ffffff', margin: '8px 0 0 0', fontWeight: '800' }}>
                      {analytics.totalOrders} đơn
                    </h2>
                  </div>
                  <div style={{ backgroundColor: '#0b0f19', padding: '22px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>📈 GIÁ TRỊ ĐƠN TRUNG BÌNH (AOV)</span>
                    <h2 style={{ fontSize: '28px', color: '#60a5fa', margin: '8px 0 0 0', fontWeight: '800' }}>
                      {analytics.totalOrders > 0 ? Math.round(analytics.totalRevenue / analytics.totalOrders).toLocaleString('vi-VN') : 0}đ
                    </h2>
                  </div>
                </div>

                {/* Chart Visualizer */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>📈 Biểu đồ xu hướng doanh thu hàng ngày</h4>
                  {renderSVGChart()}
                </div>
              </div>
            )}

            {/* ================= TAB 3: QUẢN LÝ THỰC ĐƠN ================= */}
            {activeTab === 'menu' && (
              <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', color: '#ffffff', fontWeight: '700', fontSize: '18px' }}>🍔 Thực đơn & Hiệu suất bán hàng</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Hiển thị lượt bán, xếp hạng uy tín và gắn huy chương HOT 🔥 cho Top 5 món có doanh số lớn nhất.</p>
                  </div>
                  <button
                    onClick={() => setShowAddFoodModal(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)', whiteSpace: 'nowrap' }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                  >
                    <span style={{ fontSize: '16px' }}>＋</span>
                    <span>Đăng ký món mới</span>
                  </button>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                  {analytics.foodsData.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px 0', color: '#64748b' }}>
                      Chưa đăng ký món ăn nào. Vui lòng tạo món ăn đầu tiên!
                    </div>
                  ) : (
                    analytics.foodsData.map((food) => (
                      <div key={food.id} style={{ backgroundColor: '#0b0f19', borderRadius: '10px', border: '1px solid #1f2937', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)'; }}>
                        
                        {/* Ảnh sản phẩm */}
                        <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden' }}>
                          <img src={food.image || 'https://via.placeholder.com/300'} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          
                          {/* Nhãn HOT */}
                          {food.isHot && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ef4444', color: '#ffffff', padding: '5px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 0 12px #ef4444', animation: 'pulse 1.5s infinite', textTransform: 'uppercase' }}>
                              <span>HOT</span>
                              <span>🔥</span>
                            </div>
                          )}

                          {/* Badge danh mục */}
                          <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(11, 15, 25, 0.8)', color: '#94a3b8', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                            {food.category}
                          </div>
                        </div>

                        {/* Chi tiết */}
                        <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>{food.name}</h4>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '12px' }}>
                              <span style={{ color: '#fbbf24', fontSize: '14px' }}>⭐</span>
                              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f8fafc' }}>{food.rating}</span>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>(đánh giá)</span>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid #1f2937', paddingTop: '10px', marginTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', margin: '4px 0' }}>
                              <span>Đơn giá:</span>
                              <b style={{ color: '#10b981' }}>{food.price.toLocaleString('vi-VN')}đ</b>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', margin: '4px 0' }}>
                              <span>Đã bán (trong kì):</span>
                              <b style={{ color: '#f8fafc' }}>{food.orderCount} đơn</b>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', margin: '4px 0' }}>
                              <span>Doanh thu:</span>
                              <b style={{ color: '#fbbf24' }}>{food.revenue.toLocaleString('vi-VN')}đ</b>
                            </div>
                          </div>
                        </div>

                        {/* Trạng thái duyệt món từ database */}
                        {food.status && (
                          <div style={{ padding: '8px 15px', backgroundColor: food.status === 'approved' ? 'rgba(16, 185, 129, 0.05)' : food.status === 'pending' ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)', borderTop: '1px solid #1f2937', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: food.status === 'approved' ? '#10b981' : food.status === 'pending' ? '#f59e0b' : '#ef4444' }}>
                            {food.status === 'pending' ? '⏳ Đang chờ duyệt phát hành' : food.status === 'approved' ? '✓ Đã kiểm duyệt' : '✕ Từ chối phê duyệt'}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ================= TAB 4: QUẢN LÝ ĐƠN HÀNG ================= */}
            {activeTab === 'orders' && (
              <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <h3 style={{ margin: '0 0 6px 0', color: '#ffffff', fontWeight: '700', fontSize: '18px' }}>📦 Quản lý dòng vận đơn giao hàng</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>Theo dõi các đơn đặt hàng trực tuyến của khách tại cửa hàng của bạn. Tiếp nhận đơn và chuyển giao trạng thái sau khi đầu bếp chuẩn bị xong.</p>
                
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0b0f19' }}>
                        <th style={tableThStyle}>Mã Đơn</th>
                        <th style={tableThStyle}>Khách Hàng (Email)</th>
                        <th style={tableThStyle}>Tổng Tiền</th>
                        <th style={tableThStyle}>Khoảng Cách</th>
                        <th style={tableThStyle}>Địa Chỉ Giao Nhận</th>
                        <th style={tableThStyle}>Trạng Thái</th>
                        <th style={tableThStyle}>Cập Nhật Vận Đơn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {merchantOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', borderBottom: '1px solid #1f2937' }}>
                            Cửa hàng chưa nhận được bất kỳ đơn đặt hàng nào trong cơ sở dữ liệu.
                          </td>
                        </tr>
                      ) : (
                        merchantOrders.map((order) => (
                          <tr key={order._id}>
                            <td style={tableTdStyle}>
                              <code style={{ color: '#ffffff', fontWeight: 'bold' }}>#{order._id?.substring(18)}</code>
                            </td>
                            <td style={tableTdStyle}>
                              <div>
                                <b>{order.user_id?.full_name || 'Khách vãng lai'}</b>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{order.user_id?.email || 'Ẩn danh'}</div>
                                {order.user_id?.phone && <div style={{ fontSize: '11px', color: '#64748b' }}>SĐT: {order.user_id?.phone}</div>}
                              </div>
                            </td>
                            <td style={tableTdStyle}>
                              <span style={{ color: '#10b981', fontWeight: '700' }}>{order.total_price?.toLocaleString('vi-VN')}đ</span>
                            </td>
                            <td style={tableTdStyle}>
                              <span style={{ fontSize: '13px', color: '#fbbf24', fontWeight: '500' }}>{order.distance_km || 0} km</span>
                            </td>
                            <td style={tableTdStyle}>
                              <span style={{ fontSize: '13px', color: '#94a3b8' }}>{order.shipping_address || 'Nhận tại quầy'}</span>
                            </td>
                            <td style={tableTdStyle}>
                              <span style={{ 
                                padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                                backgroundColor: order.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : order.status === 'pending' ? 'rgba(217, 119, 6, 0.1)' : 'rgba(225, 29, 72, 0.1)',
                                color: order.status === 'completed' ? '#10b981' : order.status === 'pending' ? '#f59e0b' : '#e11d48'
                              }}>
                                {order.status === 'pending' ? '⌛ Chờ duyệt' : order.status === 'completed' ? '✓ Thành công' : '✕ Đã hủy'}
                              </span>
                            </td>
                            <td style={tableTdStyle}>
                              <select 
                                value={order.status} 
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                                style={{ padding: '6px', borderRadius: '6px', border: '1px solid #1f2937', fontSize: '13px', backgroundColor: '#0b0f19', color: '#ffffff', cursor: 'pointer', outline: 'none' }}
                              >
                                <option value="pending" style={{ backgroundColor: '#0b0f19' }}>⌛ Chờ xử lý</option>
                                <option value="completed" style={{ backgroundColor: '#0b0f19' }}>✓ Đã giao hàng</option>
                                <option value="cancelled" style={{ backgroundColor: '#0b0f19' }}>❌ Hủy đơn ảo</option>
                              </select>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= TAB 5: HỒ SƠ CHI TIẾT ================= */}
            {activeTab === 'profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#ffffff', fontSize: '18px', fontWeight: '700', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>⚙️ Hồ Sơ Pháp Lý Hộ Kinh Doanh</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                    <div>
                      <p style={{ margin: '10px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Tên cửa hàng:</b> {shopData?.store_name}</p>
                      <p style={{ margin: '10px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Địa chỉ đăng ký:</b> {shopData?.address}</p>
                      <p style={{ margin: '10px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Chủ sở hữu:</b> {shopData?.merchant_name}</p>
                    </div>
                    <div>
                      <p style={{ margin: '10px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Loại hình kinh doanh:</b> {shopData?.business_type || 'Cá nhân'}</p>
                      <p style={{ margin: '10px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Mã số thuế:</b> {shopData?.tax_code || 'Chưa cung cấp'}</p>
                      <p style={{ margin: '10px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Trạng thái hồ sơ:</b> <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ Đã kích hoạt hoạt động</span></p>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                  <h3 style={{ margin: '0 0 20px 0', color: '#ffffff', fontSize: '18px', fontWeight: '700', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>📸 Giấy Tờ & Chứng Nhận Quốc Tế</h3>
                  <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <p style={{ margin: '0 0 10px 0', color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>1. Giấy phép Đăng ký kinh doanh:</p>
                      <div style={{ border: '1px solid #1f2937', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#0b0f19', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={shopData?.license_image || 'https://via.placeholder.com/300x200'} alt="Giấy phép kinh doanh" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <p style={{ margin: '0 0 10px 0', color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' }}>2. Chứng nhận An toàn vệ sinh thực phẩm:</p>
                      <div style={{ border: '1px solid #1f2937', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#0b0f19', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={shopData?.hygiene_image || 'https://via.placeholder.com/300x200'} alt="Chứng nhận vệ sinh" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '30px', textAlign: 'right' }}>
                    <button 
                      onClick={handleEditProfile}
                      style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '12px 40px', fontSize: '14px', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                    >
                      ✏️ Gửi lại hồ sơ thẩm định thay đổi
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      ) : (

        /* ================= GIAO DIỆN 2: CHƯA PHÊ DUYỆT (PENDING / NONE) ================= */
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar cart={[]} isLoggedIn={localIsLoggedIn} openPendingModal={() => {}} />

          <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '30px auto', padding: '0 15px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {regStatus === 'pending' ? (
              
              /* ================= GIAO DIỆN 2A: HỒ SƠ ĐANG CHỜ XÉT DUYỆT ================= */
              <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '50px 20px', textAlign: 'center', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', width: '100%', maxWidth: '800px' }}>
                <div style={{ fontSize: '65px', marginBottom: '15px' }}>⏳</div>
                <h2 style={{ color: '#10b981', fontSize: '24px', fontWeight: '600', margin: '0 0 10px 0' }}>
                  Hồ Sơ Đăng Ký Đang Được Xét Duyệt!
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '15px', margin: '0 0 35px 0', lineHeight: '1.5' }}>
                  Hệ thống đang kiểm tra tính xác thực dữ liệu của quán ăn <b style={{ color: '#ffffff' }}>{shopData?.store_name || 'Cửa hàng của bạn'}</b>.
                </p>
                
                <div style={{ maxWidth: '550px', margin: '0 auto 35px auto', textAlign: 'left', backgroundColor: '#0b0f19', padding: '22px', borderRadius: '8px', border: '1px solid #1f2937' }}>
                  <div style={{ fontWeight: '600', color: '#10b981', fontSize: '15px', marginBottom: '12px', borderBottom: '1px solid #1f2937', paddingBottom: '6px' }}>
                    📋 Chi tiết hồ sơ gửi đi:
                  </div>
                  <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Tên cửa hàng:</b> {shopData?.store_name}</p>
                  <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Địa chỉ hoạt động:</b> {shopData?.address}</p>
                  <p style={{ margin: '8px 0', color: '#94a3b8', fontSize: '14px' }}><b style={{ color: '#ffffff' }}>Người đại diện pháp lý:</b> {shopData?.merchant_name}</p>
                  <p style={{ margin: '12px 0 0 0', fontSize: '14px' }}>
                    <b style={{ color: '#ffffff' }}>Trạng thái hệ thống:</b> <span style={{ color: '#fbbf24', fontWeight: 'bold', backgroundColor: 'rgba(251, 191, 36, 0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '13px' }}>⏳ Đang chờ phê duyệt</span>
                  </p>
                </div>

                <button 
                  onClick={handleEditProfile}
                  style={{ 
                    backgroundColor: 'transparent', 
                    color: '#10b981', 
                    border: '1px solid #10b981', 
                    padding: '12px 35px', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.target.style.backgroundColor = '#10b981'; e.target.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#10b981'; }}
                >
                  ✏️ Thay đổi hồ sơ đăng ký
                </button>
              </div>

            ) : (

              /* ================= GIAO DIỆN 2B: CHƯA ĐĂNG KÝ HỒ SƠ ================= */
              <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', width: '100%', maxWidth: '800px' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '30px' }}>
                  <div style={{ width: '140px', height: '140px', backgroundColor: '#0b0f19', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', border: '1px solid #1f2937' }}>
                    <span style={{ fontSize: '70px' }}>🏪</span>
                  </div>
                  <span style={{ position: 'absolute', top: '15px', left: '10px', fontSize: '24px' }}>✨</span>
                  <span style={{ position: 'absolute', bottom: '20px', right: '10px', fontSize: '24px' }}>📝</span>
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', margin: '0 0 12px 0' }}>
                  Chào mừng đến với TasteByte Store!
                </h2>

                <p style={{ fontSize: '15px', color: '#94a3b8', margin: '0 0 40px 0', lineHeight: '1.5', maxWidth: '500px' }}>
                  Vui lòng cung cấp thông tin lý lịch cần thiết để thành lập tài khoản người bán trên hệ thống TasteByte.
                </p>

                <button 
                  onClick={() => navigate('/restaurant/onboarding')}
                  style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '14px 50px', fontSize: '15px', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
                >
                  Bắt đầu đăng ký
                </button>
              </div>

            )}

          </div>
        </div>
      )}

      {/* ➕ MODAL ĐĂNG KÝ MÓN ĂN MỚI */}
      {showAddFoodModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: '#111827', width: '500px', maxWidth: '90%', padding: '30px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', boxSizing: 'border-box', position: 'relative', textAlign: 'left' }}>
            
            <button 
              onClick={() => { setShowAddFoodModal(false); setErrorMsg(''); }}
              style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'transparent', border: 'none', color: '#94a3b8', fontSize: '22px', cursor: 'pointer', outline: 'none' }}
              onMouseOver={(e) => e.target.style.color = '#ffffff'}
              onMouseOut={(e) => e.target.style.color = '#94a3b8'}
            >
              ✕
            </button>

            <h3 style={{ margin: '0 0 8px 0', color: '#ffffff', fontWeight: '700', fontSize: '18px' }}>➕ Đăng Ký Món Ăn Mới</h3>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>
              Điền thông tin món ăn để gửi yêu cầu đăng ký lên ban quản trị TasteByte.
            </p>

            {errorMsg && (
              <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', marginBottom: '15px', fontSize: '13px' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              setErrorMsg('');
              try {
                const res = await API.post('/restaurants/foods', newFood);
                if (res.data.status === 'success') {
                  setSuccessMsg('🍔 Đăng ký món ăn thành công! Chờ Admin duyệt.');
                  setFoods([res.data.data, ...foods]);
                  setNewFood({ name: '', price: '', category: '', image: '', description: '' });
                  setShowAddFoodModal(false);
                }
              } catch (err) {
                setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi tạo món ăn!');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Tên món ăn (Ví dụ: Cơm tấm sườn sụn)" value={newFood.name} onChange={(e) => setNewFood({ ...newFood, name: e.target.value })} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #1f2937', backgroundColor: '#0b0f19', color: '#ffffff', outline: 'none' }} required />
              <input type="number" placeholder="Đơn giá bán lẻ (VNĐ)" value={newFood.price} onChange={(e) => setNewFood({ ...newFood, price: e.target.value })} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #1f2937', backgroundColor: '#0b0f19', color: '#ffffff', outline: 'none' }} required />
              <select value={newFood.category} onChange={(e) => setNewFood({ ...newFood, category: e.target.value })} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #1f2937', backgroundColor: '#0b0f19', color: '#ffffff', outline: 'none', cursor: 'pointer' }} required>
                <option value="" style={{ backgroundColor: '#0b0f19' }}>-- Chọn danh mục món ăn --</option>
                <option value="Đồ ăn nhanh" style={{ backgroundColor: '#0b0f19' }}>Đồ ăn nhanh</option>
                <option value="Món nước" style={{ backgroundColor: '#0b0f19' }}>Món nước</option>
                <option value="Cơm văn phòng" style={{ backgroundColor: '#0b0f19' }}>Cơm văn phòng</option>
                <option value="Trà sữa & Đồ uống" style={{ backgroundColor: '#0b0f19' }}>Trà sữa & Đồ uống</option>
              </select>
              <input type="text" placeholder="URL ảnh minh họa món ăn" value={newFood.image} onChange={(e) => setNewFood({ ...newFood, image: e.target.value })} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #1f2937', backgroundColor: '#0b0f19', color: '#ffffff', outline: 'none' }} required />
              <input type="text" placeholder="Mô tả thành phần dinh dưỡng" value={newFood.description} onChange={(e) => setNewFood({ ...newFood, description: e.target.value })} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #1f2937', backgroundColor: '#0b0f19', color: '#ffffff', outline: 'none' }} />
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => { setShowAddFoodModal(false); setErrorMsg(''); }} style={{ padding: '10px 20px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #374151', borderRadius: '6px', cursor: 'pointer' }}>
                  Hủy
                </button>
                <button type="submit" style={{ padding: '10px 30px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Gửi Đăng Ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ❌ MODAL THÔNG BÁO LỖI GIỮA TRANG - MERCHANT */}
      {showErrModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(3, 7, 18, 0.88)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#111827', width: '420px', padding: '32px', borderRadius: '16px', border: '1px solid rgba(239,68,68,0.25)', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.7)', boxSizing: 'border-box', animation: 'merchantFadeIn 0.3s ease-out' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
            <h4 style={{ fontSize: '20px', margin: '0 0 12px 0', color: '#ef4444', fontWeight: '800' }}>Thao Tác Thất Bại</h4>
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

      {/* ⚠️ MODAL XÁC NHẬN HÀNH ĐỘNG NGUY HIỂM */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(3, 7, 18, 0.88)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999999, backdropFilter: 'blur(4px)' }}>
          <div style={{ backgroundColor: '#111827', width: '440px', padding: '32px', borderRadius: '16px', border: '1px solid rgba(245,158,11,0.25)', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.7)', boxSizing: 'border-box', animation: 'merchantFadeIn 0.3s ease-out' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <h4 style={{ fontSize: '20px', margin: '0 0 12px 0', color: '#f59e0b', fontWeight: '800' }}>Xác Nhận Hành Động</h4>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.7', margin: '0 0 28px 0', fontWeight: '500' }}>
              {confirmMsg}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{ padding: '10px 28px', backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #374151', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.target.style.borderColor = '#94a3b8'; e.target.style.color = '#fff'; }}
                onMouseOut={(e) => { e.target.style.borderColor = '#374151'; e.target.style.color = '#94a3b8'; }}
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => { setShowConfirmModal(false); if (confirmCallback) confirmCallback(); }}
                style={{ padding: '10px 28px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseOver={(e) => e.target.style.opacity = '0.85'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thêm CSS Keyframes cho hiệu ứng nhịp tim pulsing của nút HOT */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
          }
        }

        @keyframes merchantFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Restaurant;