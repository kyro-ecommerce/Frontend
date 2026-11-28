import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOrderContext } from "../../store/user/OrderContext";

const DEFAULT_PAGE_SIZE = 10;

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
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchTerm.trim();
      setDebouncedSearch((prev) => {
        if (prev !== trimmed) {
          setCurrentPage(0);
        }
        return trimmed;
      });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    clearOrderError();
    fetchUserOrders(selectedStatus, currentPage, debouncedSearch, DEFAULT_PAGE_SIZE);
  }, [selectedStatus, currentPage, debouncedSearch, fetchUserOrders, clearOrderError]);

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
    filteredOrders: orders,
    orderPagination,
    isLoading,
    error,
    selectedStatus,
    setSelectedStatus,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    statusFilters,
    formatCurrency,
    getStatusText,
    handleViewOrderDetails,
    clearOrderError,
    navigate
  };
};
