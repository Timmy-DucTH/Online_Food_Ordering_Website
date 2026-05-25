const Order = require('../models/order');
const mongoose = require('mongoose');

// =================================================================
// NGHIỆP VỤ 7: Lập báo cáo doanh thu theo mốc thời gian (BM8, QĐ10)
// =================================================================
exports.getRevenueReport = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { startDate, endDate } = req.query; // Nhận định dạng YYYY-MM-DD từ FrontEnd

    // RÀNG BUỘC QĐ 10: Ngày bắt đầu bắt buộc phải nhỏ hơn ngày kết thúc
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Lỗi cấu hình: Mốc ngày bắt đầu lập báo cáo phải nhỏ hơn ngày kết thúc!'
      });
    }

    // SỬ DỤNG AGGREGATION PIPELINE CỦA MONGODB ĐỂ TÍNH TOÁN TẬP HỢP DỮ LIỆU
    const report = await Order.aggregate([
      {
        $match: {
          restaurant_id: new mongoose.Types.ObjectId(restaurantId),
          status: 'completed', // QĐ 10: Chỉ tính toán trên các đơn hàng đã giao thành công
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        }
      },
      {
        $group: {
          _id: '$restaurant_id',
          totalRevenue: { $sum: '$total_price' }, // Tính tổng doanh thu gồm cả món ăn và ship
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Nếu mảng trả về có dữ liệu thì lấy phần tử đầu tiên, ngược lại mặc định bằng 0
    const resultData = report.length > 0 ? report[0] : { totalRevenue: 0, totalOrders: 0 };

    res.status(200).json({
      status: 'success',
      message: '📊 Kết xuất dữ liệu báo cáo doanh thu thành công!',
      data: {
        startDate,
        endDate,
        total_revenue: resultData.totalRevenue,
        total_orders: resultData.totalOrders
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Có lỗi xảy ra khi tính toán doanh thu!',
      error: error.message 
    });
  }
};

// =================================================================
// NGHIỆP VỤ 8: Thống kê danh sách món ăn yêu thích/được đặt nhiều nhất (BM9)
// =================================================================
exports.getTopSellingItems = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const topItems = await Order.aggregate([
      {
        $match: {
          restaurant_id: new mongoose.Types.ObjectId(restaurantId),
          status: 'completed' // Chỉ thống kê dựa trên đơn hàng mua thành công thực tế
        }
      },
      { 
        $unwind: '$items' // Phá vỡ mảng lồng items con thành các bản ghi rời độc lập
      }, 
      {
        $group: {
          _id: '$items.name', // Nhóm theo tên món ăn
          totalQuantity: { $sum: '$items.quantity' } // Cộng dồn số lượng đặt
        }
      },
      { 
        $sort: { totalQuantity: -1 } // Sắp xếp giảm dần từ món bán nhiều nhất xuống dưới
      }, 
      { 
        $limit: 5 // Chỉ lấy top 5 món ăn tiêu biểu đứng đầu
      }
    ]);

    res.status(200).json({
      status: 'success',
      message: '🏆 Thống kê danh sách món ăn bán chạy nhất của quán thành công!',
      data: topItems
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Có lỗi xảy ra khi thống kê món ăn!',
      error: error.message 
    });
  }
};