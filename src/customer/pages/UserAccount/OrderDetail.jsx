// src/pages/UserAccount/OrderDetail.jsx
import React, { useEffect } from "react"; // Bỏ useState nếu currentOrder từ context
import { useParams, useNavigate } from "react-router-dom";
import BreadcrumbNav from "../../components/layout/BreadcrumbNav";
import AccountSidebar from "../../components/features/user/AccountSidebar";
import { useOrderContext } from "../../contexts/OrderContext"; // THÊM
import { useToast } from "../../contexts/ToastContext";
import { CircularProgress, Typography, Button as MuiButton, Box, Paper, Chip, Alert } from '@mui/material'; // THÊM MUI

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    currentOrder: order, // Đổi tên để sử dụng trực tiếp
    isLoading,
    error,
    fetchOrderById,
    cancelUserOrder,
    clearOrderError
  } = useOrderContext(); // THÊM

  useEffect(() => {
    window.scrollTo(0, 0);
    if (orderId) {
      clearOrderError();
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById, clearOrderError]);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount || 0);
  const getStatusText = (status) => { /* ... (giữ nguyên) ... */
    switch(status) {
      case "DELIVERED": return "Đã giao hàng";
      case "SHIPPED": return "Đang vận chuyển";
      case "PENDING": return "Chờ xử lý";
      case "CONFIRMED": return "Đã xác nhận";
      case "CANCELLED": return "Đã hủy";
      default: return status || "Không xác định";
    }
  };
  const getStatusColor = (status) => { /* ... (giữ nguyên) ... */
    switch(status) {
      case "DELIVERED": return "success"; // MUI Chip colors
      case "SHIPPED": return "info";
      case "PENDING": return "warning";
      case "CONFIRMED": return "secondary";
      case "CANCELLED": return "error";
      default: return "default";
    }
  };

  const handleCancelOrder = async () => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      try {
        await cancelUserOrder(orderId);
        showToast("Đơn hàng đã được hủy thành công", "success");
        fetchOrderById(orderId); // Fetch lại để cập nhật trạng thái trên UI
        // navigate('/my-order'); // Có thể không cần navigate nếu chỉ cập nhật trạng thái
      } catch (err) {
        showToast(err.message || "Có lỗi xảy ra khi hủy đơn hàng.", "error");
      }
    }
  };

  // Tạo order history timeline
  const orderHistory = [];
  if (order) {
    if (order.orderDate) orderHistory.push({ status: "PENDING", description: "Đơn hàng đã được đặt", date: order.orderDate });
    if (order.paymentStatus === "COMPLETED" && order.orderStatus !== "PENDING") orderHistory.push({ status: "CONFIRMED", description: "Thanh toán đã hoàn tất", date: order.paymentDetails?.paymentDate || order.orderDate });
    if (order.orderStatus === "SHIPPED" || order.orderStatus === "DELIVERED") orderHistory.push({ status: "SHIPPED", description: "Đơn hàng đang được vận chuyển", date: order.shippingDate || order.orderDate });
    if (order.orderStatus === "DELIVERED" && order.deliveryDate) orderHistory.push({ status: "DELIVERED", description: "Đơn hàng đã được giao thành công", date: order.deliveryDate });
    if (order.orderStatus === "CANCELLED" && order.cancelledDate) orderHistory.push({ status: "CANCELLED", description: "Đơn hàng đã bị hủy", date: order.cancelledDate });
     // Sắp xếp theo ngày
    orderHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
  }


  if (isLoading && !order) {
    return (
      <Box className="flex flex-col pt-3 bg-gray-50 min-h-screen">
        <main className="flex flex-col px-4 sm:px-10 py-6">
          <BreadcrumbNav />
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 mt-6 md:mt-10">
            <AccountSidebar />
            <Box className="flex-1 flex items-center justify-center py-20"><CircularProgress size={50} /></Box>
          </div>
        </main>
      </Box>
    );
  }

  if (error && !isLoading && !order) {
    return (
      <Box className="flex flex-col pt-3 bg-gray-50 min-h-screen">
        <main className="flex flex-col px-4 sm:px-10 py-6">
          <BreadcrumbNav />
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 mt-6 md:mt-10">
            <AccountSidebar />
            <Box className="flex-1 flex flex-col items-center justify-center py-20">
                <Alert severity="error" action={<MuiButton color="inherit" size="small" onClick={() => fetchOrderById(orderId)}>Thử lại</MuiButton>}>
                    {error}
                </Alert>
            </Box>
          </div>
        </main>
      </Box>
    );
  }
   if (!order && !isLoading) { // Sau khi load xong mà vẫn không có order
    return (
        <Box className="flex flex-col pt-3 bg-gray-50 min-h-screen">
            <main className="flex flex-col px-4 sm:px-10 py-6">
            <BreadcrumbNav />
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 mt-6 md:mt-10">
                <AccountSidebar />
                <Box className="flex-1 flex flex-col items-center justify-center py-20">
                    <Typography variant="h6" color="text.secondary">Không tìm thấy thông tin đơn hàng.</Typography>
                    <MuiButton variant="outlined" onClick={() => navigate('/my-order')} sx={{mt:2}}>Quay lại danh sách</MuiButton>
                </Box>
            </div>
            </main>
        </Box>
    );
}


  return (
    <div className="flex flex-col pt-3 bg-gray-50 min-h-screen">
      <main className="flex flex-col px-4 sm:px-10 py-6">
        <BreadcrumbNav />
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 mt-6 md:mt-10">
          <AccountSidebar />
          <div className="flex-1 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Chi tiết đơn hàng #{order.id}</h1>
              <MuiButton variant="outlined" onClick={() => navigate('/my-order')} size="small">Quay lại danh sách</MuiButton>
            </div>

            <Paper elevation={0} sx={{ mb: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ mr: 2, fontWeight: 'medium' }}>Trạng thái:</Typography>
                    <Chip label={getStatusText(order.orderStatus)} color={getStatusColor(order.orderStatus)} size="medium" />
                </Box>
                {/* Timeline (cải thiện nếu có nhiều data hơn) */}
                {orderHistory.length > 0 && (
                    <Box className="mt-4 pl-1">
                    {orderHistory.map((event, index) => (
                        <Box key={index} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:pb-0">
                        <div className={`absolute -left-[9px] mt-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(event.status) === 'default' ? 'bg-gray-300' : `bg-${getStatusColor(event.status)}-500`}`}></div>
                        <Typography variant="subtitle2" className="font-medium text-gray-700">{getStatusText(event.status)}</Typography>
                        <Typography variant="body2" className="text-sm text-gray-500">{event.description}</Typography>
                        <Typography variant="caption" className="text-xs text-gray-400">{new Date(event.date).toLocaleString('vi-VN')}</Typography>
                        </Box>
                    ))}
                    </Box>
                )}
            </Paper>


            <Paper elevation={0} sx={{ mb: 4, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Sản phẩm trong đơn hàng</h2>
              <div className="divide-y divide-gray-200">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-4 py-4">
                    <img src={item.imageUrl || "/Placeholder2.png"} alt={item.productTitle} className="w-24 h-24 object-contain rounded border border-gray-200"/>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.productTitle}</h3>
                      <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                      {item.size && <p className="text-sm text-gray-500">Cấu hình: {item.size}</p>}
                    </div>
                    <div className="text-right sm:min-w-[120px]">
                      <p className="font-semibold text-blue-600">{formatCurrency(item.discountedPrice * item.quantity)}</p>
                      {item.price > item.discountedPrice && <p className="text-sm text-gray-400 line-through">{formatCurrency(item.price * item.quantity)}</p>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-300 space-y-2">
                <div className="flex justify-between"><p className="text-gray-600">Tạm tính:</p><p>{formatCurrency(order.originalPrice)}</p></div>
                <div className="flex justify-between"><p className="text-gray-600">Giảm giá:</p><p className="text-green-600">-{formatCurrency(order.discount)}</p></div>
                <div className="flex justify-between"><p className="text-gray-600">Phí vận chuyển:</p><p className="text-green-600">Miễn phí</p></div>
                <div className="flex justify-between text-lg font-bold mt-2"><p>Tổng cộng:</p><p className="text-red-600">{formatCurrency(order.totalDiscountedPrice)}</p></div>
              </div>
            </Paper>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Thông tin giao hàng</h2>
                <p><strong>Người nhận:</strong> {order.shippingAddress?.fullName}</p>
                <p><strong>Địa chỉ:</strong> {`${order.shippingAddress?.street || ''}, ${order.shippingAddress?.ward || ''}, ${order.shippingAddress?.district || ''}, ${order.shippingAddress?.province || ''}`}</p>
                <p><strong>SĐT:</strong> {order.shippingAddress?.phoneNumber}</p>
                {order.shippingAddress?.note && <p><strong>Ghi chú:</strong> {order.shippingAddress.note}</p>}
              </Paper>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">Thông tin thanh toán</h2>
                <p><strong>Phương thức:</strong> {order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : (order.paymentMethod || "Chưa rõ")}</p>
                <p><strong>Trạng thái TT:</strong> {order.paymentStatus === "COMPLETED" ? "Đã thanh toán" : "Chưa thanh toán"}</p>
                <p><strong>Ngày đặt:</strong> {new Date(order.orderDate).toLocaleString('vi-VN')}</p>
              </Paper>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 justify-end">
              {order.orderStatus === "DELIVERED" && (
                <MuiButton variant="contained" color="success" onClick={() => showToast("Bây giờ bạn có thể đánh giá sản phẩm tại trang chi tiết sản phẩm!", "info")}>
                  Đánh giá
                </MuiButton>
              )}
              {["PENDING", "CONFIRMED"].includes(order.orderStatus) && (
                <MuiButton variant="contained" color="error" onClick={handleCancelOrder} disabled={isLoading}>
                  {isLoading ? <CircularProgress size={20} color="inherit"/> : "Hủy đơn hàng"}
                </MuiButton>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default OrderDetail;