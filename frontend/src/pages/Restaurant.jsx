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
  const [foods, setFoods] = useState([]);
  const [newFood, setNewFood] = useState({ name: '', price: '', category: '', image: '', description: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);

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

          // Nếu đã được duyệt, tải thêm danh sách món ăn của họ từ database
          if (restaurant.status === 'approved') {
            const foodsRes = await API.get('/restaurants/my-foods');
            if (foodsRes.data.status === 'success') {
              setFoods(foodsRes.data.data || []);
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
    
    // Core dishes list to simulate stats on
    const baseItems = [
      { id: '1', name: 'Cơm Tấm Sườn Bì Chả', category: 'Cơm văn phòng', price: 45000, rating: 4.8, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300', baseSales: 15 },
      { id: '2', name: 'Phở Bò Tái Lăn', category: 'Món nước', price: 55000, rating: 4.9, image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=300', baseSales: 12 },
      { id: '3', name: 'Trà Sữa Trân Châu Đường Đen', category: 'Trà sữa & Đồ uống', price: 35000, rating: 4.7, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=300', baseSales: 25 },
      { id: '4', name: 'Bánh Mì Đặc Biệt', category: 'Đồ ăn nhanh', price: 25000, rating: 4.6, image: 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?q=80&w=300', baseSales: 20 },
      { id: '5', name: 'Gà Rán Sốt Cay Hàn Quốc', category: 'Đồ ăn nhanh', price: 39000, rating: 4.8, image: 'https://images.unsplash.com/photo-1626645738196-c2a7c8d08f58?q=80&w=300', baseSales: 18 },
      { id: '6', name: 'Pizza Hải Sản Nhiệt Đới', category: 'Đồ ăn nhanh', price: 189000, rating: 4.9, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=300', baseSales: 8 },
      { id: '7', name: 'Cà Phê Muối TasteByte', category: 'Trà sữa & Đồ uống', price: 29000, rating: 4.5, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300', baseSales: 22 },
      { id: '8', name: 'Bún Chả Hà Nội', category: 'Món nước', price: 45000, rating: 4.7, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=300', baseSales: 14 }
    ];

    // Mix in database-created foods if any exist
    // This allows newly added foods by merchant to show up in stats (even with 0 or low base sales)
    const activeItems = [...baseItems];
    foods.forEach(f => {
      // Avoid duplication
      if (!activeItems.find(item => item.name.toLowerCase() === f.name.toLowerCase())) {
        activeItems.push({
          id: f._id,
          name: f.name,
          category: f.category,
          price: f.price,
          rating: 4.5,
          image: f.image || 'https://via.placeholder.com/300',
          baseSales: 2, // New database items have smaller initial mock sales
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

  return (
    <div style={{ backgroundColor: '#0b0f19', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', color: '#ffffff', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>
      <Navbar cart={[]} isLoggedIn={localIsLoggedIn} openPendingModal={() => {}} />

      {/* 🔴 TOAST ALERT BOX THÔNG BÁO THÀNH CÔNG */}
      {successMsg && (
        <div style={{ position: 'fixed', top: '25px', right: '25px', backgroundColor: '#111827', color: '#ffffff', borderLeft: '4px solid #10b981', borderTop: '1px solid #1f2937', borderRight: '1px solid #1f2937', borderBottom: '1px solid #1f2937', padding: '15px 25px', borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 99999, fontSize: '14px', fontWeight: '500' }}>
          {successMsg}
        </div>
      )}

      <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '30px auto', padding: '0 15px', boxSizing: 'border-box' }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#10b981', fontWeight: 'bold' }}>
            ⏳ Đang tải thông tin trạng thái từ máy chủ...
          </div>
        ) : regStatus === 'pending' ? (

          /* ================= GIAO DIỆN 1: NẾU HỒ SƠ ĐANG CHỜ XÉT DUYỆT ================= */
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', padding: '50px 20px', textAlign: 'center', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
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

        ) : regStatus === 'approved' ? (

          /* ================= GIAO DIỆN XÉT DUYỆT THÀNH CÔNG: PANEL CHỦ CỬA HÀNG ================= */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', textAlign: 'left' }}>
            
            {/* 1. Thẻ hồ sơ nhà hàng */}
            <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '32px' }}>🏪</span>
                  <h2 style={{ color: '#10b981', margin: 0, fontSize: '24px', fontWeight: '800' }}>{shopData?.store_name}</h2>
                  <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '12px', fontWeight: 'bold', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                    Đã Kích Hoạt 🟢
                  </span>
                </div>
                <p style={{ margin: '5px 0', color: '#94a3b8', fontSize: '14px' }}><b>Chủ đại diện:</b> {shopData?.merchant_name}</p>
                <p style={{ margin: '5px 0', color: '#94a3b8', fontSize: '14px' }}><b>Địa chỉ hoạt động:</b> {shopData?.address}</p>
              </div>
              <button 
                onClick={handleEditProfile}
                style={{ backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #374151', padding: '10px 20px', fontSize: '14px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', fontWeight: '600' }}
                onMouseOver={(e) => { e.target.style.borderColor = '#ffffff'; e.target.style.color = '#ffffff'; }}
                onMouseOut={(e) => { e.target.style.borderColor = '#374151'; e.target.style.color = '#94a3b8'; }}
              >
                ✏️ Cập nhật hồ sơ
              </button>
            </div>

            {/* 2. KHỐI THỐNG KÊ DOANH THU (REVENUE PANEL) */}
            <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '25px', borderBottom: '1px solid #1f2937', paddingBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '20px', fontWeight: '700' }}>📊 Báo Cáo Doanh Thu Cửa Hàng</h3>
                  <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Thống kê doanh số bán và đơn đặt hàng theo mốc thời gian.</p>
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
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>💰 TỔNG DOANH THU</span>
                  <h2 style={{ fontSize: '28px', color: '#10b981', margin: '8px 0 0 0', fontWeight: '800' }}>
                    {analytics.totalRevenue.toLocaleString('vi-VN')}đ
                  </h2>
                </div>
                <div style={{ backgroundColor: '#0b0f19', padding: '22px', borderRadius: '10px', border: '1px solid #1f2937' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#94a3b8' }}>📦 TỔNG ĐƠN HÀNG</span>
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
                <h4 style={{ margin: '0 0 12px 0', color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>📈 Biểu đồ doanh thu hàng ngày</h4>
                {renderSVGChart()}
              </div>

            </div>

            {/* 3. QUẢN LÝ MÓN ĂN & MENU CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>

              {/* Danh sách món ăn dạng Card Grid */}
              <div style={{ backgroundColor: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                {/* Header hàng ngang: tiêu đề bên trái, nút đăng ký bên phải */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', color: '#ffffff', fontWeight: '700', fontSize: '18px' }}>🍔 Thực đơn & Hiệu suất bán hàng</h3>
                    <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Hiển thị lượt bán, xếp hạng uy tín và gắn huy chương HOT 🔥 cho Top 5 doanh thu.</p>
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
                        
                        {/* Biểu tượng ảnh món ăn */}
                        <div style={{ position: 'relative', width: '100%', height: '160px', overflow: 'hidden' }}>
                          <img src={food.image || 'https://via.placeholder.com/300'} alt={food.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          
                          {/* NHÃN HOT - GÓC TRÊN BÊN PHẢI (Top 5 doanh thu) */}
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

                        {/* Chi tiết nội dung */}
                        <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '700', color: '#ffffff' }}>{food.name}</h4>
                            
                            {/* Đánh giá sao */}
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

                        {/* Trạng thái nếu món đó là món mới của DB */}
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

            </div>

          </div>

        ) : (

          /* ================= GIAO DIỆN 3: CHƯA ĐĂNG KÝ ================= */
          <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
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
      
      {/* ➕ MODAL ĐĂNG KÝ MÓN ĂN MỚI */}
      {showAddFoodModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(11, 15, 25, 0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: '#111827', width: '500px', maxWidth: '90%', padding: '30px', borderRadius: '12px', border: '1px solid #1f2937', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', boxSizing: 'border-box', position: 'relative', textAlign: 'left' }}>
            
            {/* Nút X đóng Modal */}
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
                  setShowAddFoodModal(false); // Đóng modal sau khi tạo thành công
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
      `}</style>
    </div>
  );
};

export default Restaurant;