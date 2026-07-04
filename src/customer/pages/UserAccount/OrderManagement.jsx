// src/pages/UserAccount/OrderManagement.jsx
import React, { useState, useEffect, useCallback } from "react"; // Thêm useCallback
import { useNavigate } from "react-router-dom";
import { useOrderContext } from "../../contexts/OrderContext";
import { CircularProgress, Typography, Button as MuiButton, Box, Alert } from '@mui/material'; // Thêm Alert

const OrderManagement = () => {
  const navigate = useNavigate();
  const {
    orders,
    isLoading,
    error,
    fetchUserOrders,
    clearOrderError
  } = useOrderContext();

  const [selectedStatus, setSelectedStatus] = useState("all");

  // Sử dụng useCallback cho các hàm định nghĩa trong component nếu chúng được truyền vào useEffect
  const memoizedFetchUserOrders = useCallback((status) => {
    fetchUserOrders(status);
  }, [fetchUserOrders]);

  const memoizedClearOrderError = useCallback(() => {
    clearOrderError();
  }, [clearOrderError]);

  useEffect(() => {
    console.log(`[OrderManagement] useEffect triggered. Selected status: ${selectedStatus}`); // Thêm log
    memoizedClearOrderError(); // Xóa lỗi cũ khi component mount hoặc status thay đổi
    memoizedFetchUserOrders(selectedStatus);
  }, [selectedStatus, memoizedFetchUserOrders, memoizedClearOrderError]); // Sử dụng các hàm đã memoized

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
  
  const getStatusText = (status) => {
    switch(status) {
      case "DELIVERED": return "Đã giao hàng";
      case "SHIPPED": return "Đang vận chuyển";
      case "PENDING": return "Chờ xử lý";
      case "CONFIRMED": return "Đã xác nhận";
      case "CANCELLED": return "Đã hủy";
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "SHIPPED": return "bg-blue-100 text-blue-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED": return "bg-purple-100 text-purple-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleViewOrderDetails = (orderId) => navigate(`/my-order/${orderId}`);

  const statusFilters = [
    { label: "Tất cả", value: "all" },
    { label: "Đã xác nhận", value: "CONFIRMED" },
    { label: "Chờ xử lý", value: "PENDING" },
    { label: "Đang vận chuyển", value: "SHIPPED" },
    { label: "Đã giao", value: "DELIVERED" },
    { label: "Đã hủy", value: "CANCELLED" },
  ];

  // Hiển thị loading toàn trang chỉ khi đang tải lần đầu và chưa có đơn hàng nào
  if (isLoading && orders.length === 0 && !error) {
    return (
      <Box className="flex-1 flex flex-col items-center justify-center py-20">
        <CircularProgress size={50} />
        <Typography sx={{ mt: 2 }}>Đang tải đơn hàng của bạn...</Typography>
      </Box>
    );
  }

  return (
    <div className="flex-1">
      <h1 className="mb-6 text-2xl sm:text-3xl font-bold text-gray-800">Đơn hàng của tôi</h1>
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-300 pb-3">
        {statusFilters.map(filter => (
          <MuiButton
            key={filter.value}
            variant={selectedStatus === filter.value ? "contained" : "outlined"}
            onClick={() => setSelectedStatus(filter.value)}
            sx={{ borderRadius: '20px', textTransform: 'none', px:3, py:1 }}
          >
            {filter.label}
          </MuiButton>
        ))}
      </div>

      {/* Hiển thị loading nhỏ khi đang fetch (ví dụ khi đổi tab status) */}
      {isLoading && <Box sx={{display: 'flex', justifyContent: 'center', my: 2}}><CircularProgress size={30}/></Box>}

      {/* Hiển thị lỗi */}
      {error && !isLoading && (
        <Alert 
          severity="error" 
          sx={{my:2}} 
          onClose={memoizedClearOrderError} // Sử dụng hàm đã memoized
        >
            {error}
            <MuiButton 
              size="small" 
              onClick={() => memoizedFetchUserOrders(selectedStatus)} // Sử dụng hàm đã memoized
              sx={{ml:1}}
            >
              Thử lại
            </MuiButton>
        </Alert>
      )}

      {/* Hiển thị khi không có đơn hàng */}
      {!isLoading && !error && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white p-6 rounded-lg shadow">
          <img src="/no-orders.svg" alt="No Orders" className="w-40 h-40 mb-6 text-gray-400"/> {/* Đảm bảo có ảnh này */}
          <Typography variant="h6" className="text-gray-600 mb-4">
            Không có đơn hàng nào {selectedStatus !== 'all' ? `cho trạng thái "${getStatusText(selectedStatus)}"` : ''}.
          </Typography>
          <MuiButton variant="contained" color="primary" onClick={() => navigate('/product/all')}>
            Tiếp tục mua sắm
          </MuiButton>
        </div>
      ) : (
        // Hiển thị danh sách đơn hàng
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white">
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-gray-50 border-b border-gray-200 gap-2">
                <div>
                  <h3 className="font-semibold text-gray-700">Mã đơn: #{order.id}</h3>
                  <p className="text-sm text-gray-500">Ngày đặt: {order?.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : "N/A"}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                  {getStatusText(order.orderStatus)}
                </span>
              </div>
              <div className="p-4">
                {order.orderItems && order.orderItems.map((item, index) => ( // Kiểm tra order.orderItems
                  <div key={item.id || index} className="flex items-center py-3 border-b border-gray-100 last:border-b-0"> {/* Sử dụng item.id nếu có */}
                    <img src={item.imageUrl || "/Placeholder2.png"} alt={item.productTitle} className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded border"/>
                    <div className="ml-4 flex-1">
                      <h4 className="font-medium text-gray-800">{item.productTitle}</h4>
                      <p className="text-sm text-gray-600">SL: {item.quantity}</p>
                      <p className="font-medium text-blue-600">{formatCurrency(item.discountedPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-200 bg-gray-50 gap-3">
                <div className="text-sm text-gray-600">
                    <p>PT Thanh toán: {order.paymentMethod}</p>
                    <p className="truncate max-w-xs sm:max-w-sm md:max-w-md">Địa chỉ: {`${order?.shippingAddress?.street || ''}, ${order?.shippingAddress?.ward || ''}, ...` }</p>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <p className="text-lg font-semibold text-gray-800">Tổng: {formatCurrency(order.totalDiscountedPrice)}</p>
                  <MuiButton
                    variant="contained"
                    size="small"
                    onClick={() => handleViewOrderDetails(order.id)}
                    sx={{ mt: 1, bgcolor: 'rgb(37 99 235)', '&:hover': { bgcolor: 'rgb(29 78 216)' } }}
                  >
                    Xem chi tiết
                  </MuiButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default OrderManagement;