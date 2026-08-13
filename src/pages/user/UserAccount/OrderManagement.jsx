// src/pages/UserAccount/OrderManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderContext } from "../../../store/user/OrderContext";
import { CircularProgress, Alert } from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const OrderManagement = () => {
  const navigate = useNavigate();
  const {
    orders,
    orderPagination,
    isLoading,
    error,
    fetchUserOrders,
    clearOrderError
  } = useOrderContext();

  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const memoizedFetchUserOrders = useCallback((status, page) => {
    fetchUserOrders(status, page);
  }, [fetchUserOrders]);

  const memoizedClearOrderError = useCallback(() => {
    clearOrderError();
  }, [clearOrderError]);

  useEffect(() => {
    memoizedClearOrderError();
    memoizedFetchUserOrders(selectedStatus, currentPage);
  }, [selectedStatus, currentPage, memoizedFetchUserOrders, memoizedClearOrderError]);

  // Client-side filtering by order ID and product title
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase().replace(/^#/, '');

    // Match order ID
    const matchId = order.id?.toString().includes(term);

    // Match product title in order items
    const matchProduct = order.orderItems?.some((item) =>
      item.productTitle?.toLowerCase().includes(term)
    );

    return matchId || matchProduct;
  });

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount || 0);

  const getStatusBadge = (status) => {
    switch(status) {
      case "DELIVERED":
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">Đã giao hàng</span>;
      case "SHIPPED":
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1 rounded-full">Đang vận chuyển</span>;
      case "PENDING":
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">Chờ xử lý</span>;
      case "CONFIRMED":
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1 rounded-full">Đã xác nhận</span>;
      case "CANCELLED":
        return <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-3 py-1 rounded-full">Đã hủy</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 border border-gray-200 text-xs font-bold px-3 py-1 rounded-full">{status || "Không xác định"}</span>;
    }
  };

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

  const handleViewOrderDetails = (orderId) => navigate(`/my-order/${orderId}`);

  const statusFilters = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ xử lý", value: "PENDING" },
    { label: "Đã xác nhận", value: "CONFIRMED" },
    { label: "Đang vận chuyển", value: "SHIPPED" },
    { label: "Đã giao", value: "DELIVERED" },
    { label: "Đã hủy", value: "CANCELLED" },
  ];

  if (isLoading && orders.length === 0 && !error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
        <CircularProgress size={40} />
        <p className="mt-4 text-xs font-semibold text-gray-600">Đang tải danh sách đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      <h1 className="mb-6 text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Đơn hàng của tôi</h1>

      {/* Pill Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-3">
        {statusFilters.map(filter => (
          <button
            key={filter.value}
            onClick={() => {
              setSelectedStatus(filter.value);
              setCurrentPage(0);
            }}
            className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-2xl transition-all cursor-pointer ${
              selectedStatus === filter.value
                ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <SearchIcon sx={{ fontSize: 20 }} />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo Mã đơn hàng hoặc Tên sản phẩm"
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs sm:text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <ClearIcon sx={{ fontSize: 18 }} />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center my-4">
          <CircularProgress size={24} />
        </div>
      )}

      {error && !isLoading && (
        <Alert
          severity="error"
          sx={{ mb: 4, borderRadius: '16px' }}
          onClose={memoizedClearOrderError}
        >
          {error}
        </Alert>
      )}

      {!isLoading && !error && orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="w-20 h-20 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-4">
            <ReceiptLongOutlinedIcon sx={{ fontSize: 40 }} />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1">
            Chưa có đơn hàng nào
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
            Không có đơn hàng nào {selectedStatus !== 'all' ? `ở trạng thái "${getStatusText(selectedStatus)}"` : ''}.
          </p>
          <button
            onClick={() => navigate('/product/all')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-6 rounded-2xl shadow-md shadow-blue-100 transition-all cursor-pointer"
          >
            Khám phá sản phẩm
          </button>
        </div>
      ) : !isLoading && !error && filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
            <SearchIcon sx={{ fontSize: 32 }} />
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-1">
            Không tìm thấy đơn hàng phù hợp
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-sm mb-5 leading-relaxed">
            Không tìm thấy đơn hàng nào khớp với từ khóa "<span className="font-semibold text-gray-800">{searchTerm}</span>".
          </p>
          <button
            onClick={() => setSearchTerm("")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs py-2 px-5 rounded-2xl transition-all cursor-pointer"
          >
            Xóa tìm kiếm
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-gray-200 transition-all"
            >
              {/* Header card */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 bg-gray-50/70 border-b border-gray-100 gap-2">
                <div>
                  <h3 className="font-extrabold text-gray-900 text-base">Mã đơn: #{order.id}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    Ngày đặt: {order?.orderDate ? new Date(order.orderDate).toLocaleString('vi-VN') : "N/A"}
                  </p>
                </div>
                {getStatusBadge(order.orderStatus)}
              </div>

              {/* Items List */}
              <div className="p-4 sm:p-5 divide-y divide-gray-100">
                {order.orderItems && order.orderItems.map((item, index) => (
                  <div key={item.id || index} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-gray-200 rounded-2xl p-1 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={item.imageUrl || "/Placeholder2.png"}
                        alt={item.productTitle}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">{item.productTitle}</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        SL: <span className="font-semibold text-gray-800">{item.quantity}</span>
                      </p>
                      <p className="font-bold text-red-600 text-sm sm:text-base underline decoration-red-600 underline-offset-2 mt-0.5">
                        {formatCurrency(item.discountedPrice * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer card */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 sm:p-5 border-t border-gray-100 bg-gray-50/40 gap-3">
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>PT Thanh toán: <span className="font-semibold text-gray-800">{order.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : (order.paymentMethod || "COD")}</span></p>
                  <p className="truncate max-w-xs sm:max-w-md text-gray-500">
                    Địa chỉ: {`${order?.shippingAddress?.street || ''}, ${order?.shippingAddress?.ward || ''}, ${order?.shippingAddress?.province || ''}`}
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="text-right">
                    <span className="text-xs text-gray-500 font-medium block">Tổng:</span>
                    <span className="text-base sm:text-lg font-extrabold text-red-600 underline decoration-red-600 underline-offset-2">
                      {formatCurrency(order.totalDiscountedPrice)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewOrderDetails(order.id)}
                    className="bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs py-2.5 px-5 rounded-2xl shadow-md shadow-blue-100 transition-all cursor-pointer shrink-0"
                  >
                    XEM CHI TIẾT
                  </button>
                </div>
              </div>
            </div>
          ))}
          {orderPagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={orderPagination.first || isLoading}
                onClick={() => setCurrentPage(page => page - 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold disabled:opacity-40"
              >
                Trang trước
              </button>
              <span className="text-sm font-semibold text-gray-600">
                Trang {orderPagination.page + 1}/{orderPagination.totalPages}
              </span>
              <button
                type="button"
                disabled={orderPagination.last || isLoading}
                onClick={() => setCurrentPage(page => page + 1)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-bold disabled:opacity-40"
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

