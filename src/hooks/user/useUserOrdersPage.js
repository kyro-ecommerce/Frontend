import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderContext } from "../../store/user/OrderContext";

export const useUserOrdersPage = () => {
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

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.trim().toLowerCase();
    const matchCode = order.orderCode?.toLowerCase().includes(term);
    const matchProduct = order.orderItems?.some((item) =>
      item.productTitle?.toLowerCase().includes(term)
    );
    return matchCode || matchProduct;
  });

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount || 0);
  }, []);

  const getStatusText = useCallback((status) => {
    switch(status) {
      case "DELIVERED": return "Đã giao hàng";
      case "SHIPPED": return "Đang vận chuyển";
      case "PENDING": return "Chờ xử lý";
      case "CONFIRMED": return "Đã xác nhận";
      case "CANCELLED": return "Đã hủy";
      default: return status;
    }
  }, []);

  const handleViewOrderDetails = useCallback((orderId) => {
    navigate(`/my-order/${orderId}`);
  }, [navigate]);

  const statusFilters = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ xử lý", value: "PENDING" },
    { label: "Đã xác nhận", value: "CONFIRMED" },
    { label: "Đang vận chuyển", value: "SHIPPED" },
    { label: "Đã giao", value: "DELIVERED" },
    { label: "Đã hủy", value: "CANCELLED" },
  ];

  return {
    orders,
    filteredOrders,
    orderPagination,
    isLoading,
    error,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    statusFilters,
    formatCurrency,
    getStatusText,
    handleViewOrderDetails,
    clearOrderError
  };
};
