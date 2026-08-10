// src/hooks/useOrders.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { orderService } from "../../services/admin/index.js";

export const useOrders = () => {
    // State management
    const [rawOrders, setRawOrders] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
    });
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });

    // Additional client-side filters
    const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
    const [priceRangeFilter, setPriceRangeFilter] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    // Fetch orders with backend filtering
    const fetchOrders = useCallback(async (page = 0, size = 10) => {
        try {
            setIsLoading(true);
            setError(null);

            // Convert filter status for API
            const apiStatus = filter === "all" ? "" : filter;

            const response = await orderService.getAllOrders(
                page,
                size,
                searchTerm,
                apiStatus,
                dateRange.start,
                dateRange.end
            );

            if (response.status === 200) {
                const responseData = response.data?.data || response.data || {};
                const orderList = responseData.content || responseData.orders || (Array.isArray(responseData) ? responseData : []);
                setRawOrders(orderList);

                const currentPage = responseData.number ?? responseData.currentPage ?? 0;
                const totalPages = responseData.totalPages ?? 1;
                const totalElements = responseData.totalElements ?? orderList.length;
                const pageSize = responseData.size ?? size;

                setPagination({
                    currentPage,
                    totalPages,
                    totalElements,
                    pageSize,
                    hasNext: !responseData.last,
                    hasPrevious: !responseData.first
                });
            } else {
                throw new Error("Cannot load orders data");
            }
        } catch (err) {
            console.error("Error loading orders:", err);
            setError("Cannot load orders. Please try again.");
            setRawOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [filter, searchTerm, dateRange, pagination.pageSize]);

    // Apply client-side filters & sorting
    const orders = useMemo(() => {
        let result = [...rawOrders];

        // 1. Filter by Payment Method (COD, VNPAY)
        if (paymentMethodFilter && paymentMethodFilter !== "all") {
            result = result.filter(order =>
                order.paymentMethod?.toUpperCase() === paymentMethodFilter.toUpperCase()
            );
        }

        // 2. Filter by Payment Status (PENDING, COMPLETED, FAILED, REFUNDED)
        if (paymentStatusFilter && paymentStatusFilter !== "all") {
            result = result.filter(order =>
                order.paymentStatus?.toUpperCase() === paymentStatusFilter.toUpperCase()
            );
        }

        // 3. Filter by Price Range
        if (priceRangeFilter && priceRangeFilter !== "all") {
            result = result.filter(order => {
                const price = order.totalDiscountedPrice ?? order.originalPrice ?? 0;
                if (priceRangeFilter === "under_1m") return price < 1000000;
                if (priceRangeFilter === "1m_5m") return price >= 1000000 && price <= 5000000;
                if (priceRangeFilter === "5m_20m") return price > 5000000 && price <= 20000000;
                if (priceRangeFilter === "above_20m") return price > 20000000;
                return true;
            });
        }

        // 4. Sort By
        result.sort((a, b) => {
            const timeA = a.orderDate ? new Date(a.orderDate).getTime() : 0;
            const timeB = b.orderDate ? new Date(b.orderDate).getTime() : 0;
            const priceA = a.totalDiscountedPrice ?? a.originalPrice ?? 0;
            const priceB = b.totalDiscountedPrice ?? b.originalPrice ?? 0;

            if (sortBy === "oldest") {
                if (timeA !== timeB) return timeA - timeB;
                return (a.id || 0) - (b.id || 0);
            } else if (sortBy === "price_desc") {
                if (priceA !== priceB) return priceB - priceA;
                return timeB - timeA;
            } else if (sortBy === "price_asc") {
                if (priceA !== priceB) return priceA - priceB;
                return timeB - timeA;
            } else {
                // Default: newest
                if (timeA !== timeB) return timeB - timeA;
                return (b.id || 0) - (a.id || 0);
            }
        });

        return result;
    }, [rawOrders, paymentMethodFilter, paymentStatusFilter, priceRangeFilter, sortBy]);

    // Fetch stats separately for more accurate data
    const fetchStats = useCallback(async () => {
        try {
            const response = await orderService.getOrderStats(dateRange.start, dateRange.end);
            if (response.status === 200) {
                const statsData = response.data?.data || response.data || {};
                setStats(statsData);
            }
        } catch (err) {
            console.error("Error loading stats:", err);
        }
    }, [dateRange]);

    // Effects for data fetching
    useEffect(() => {
        fetchOrders(0, pagination.pageSize);
    }, [filter, searchTerm, dateRange]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleSearch = useCallback((term, startDate, endDate) => {
        setSearchTerm(term || "");
        setDateRange({
            start: startDate || "",
            end: endDate || ""
        });
        setPagination(prev => ({ ...prev, currentPage: 0 }));
    }, []);

    // Handle pagination
    const handlePageChange = useCallback((newPage) => {
        fetchOrders(newPage, pagination.pageSize);
    }, [fetchOrders]);

    // Reset all filters to default
    const resetAllFilters = useCallback(() => {
        setFilter("all");
        setSearchTerm("");
        setDateRange({ start: "", end: "" });
        setPaymentMethodFilter("all");
        setPaymentStatusFilter("all");
        setPriceRangeFilter("all");
        setSortBy("newest");
    }, []);

    // Handle status change
    const handleStatusChange = useCallback(async (orderId, actionOrStatus) => {
        try {
            let response;
            const upper = String(actionOrStatus).toUpperCase();

            if (["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].includes(upper)) {
                response = await orderService.updateOrderStatus(orderId, upper);
            } else {
                switch (actionOrStatus) {
                    case "confirm":
                        response = await orderService.confirmOrder(orderId);
                        break;
                    case "ship":
                        response = await orderService.shipOrder(orderId);
                        break;
                    case "deliver":
                        response = await orderService.deliverOrder(orderId);
                        break;
                    case "cancel":
                        response = await orderService.cancelOrder(orderId);
                        break;
                    default:
                        response = await orderService.updateOrderStatus(orderId, upper);
                }
            }

            if (response && (response.status === 200 || response.status === 204)) {
                fetchOrders(pagination.currentPage, pagination.pageSize);
                fetchStats();
                return true;
            }
            return false;
        } catch (err) {
            console.error(`Error changing order status ${orderId}:`, err);
            setError(`Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.`);
            return false;
        }
    }, [fetchOrders, fetchStats, pagination.currentPage, pagination.pageSize]);

    // Handle delete order
    const handleDeleteOrder = useCallback(async (orderId) => {
        try {
            const response = await orderService.deleteOrder(orderId);
            if (response.status === 200 || response.status === 204) {
                fetchOrders(pagination.currentPage, pagination.pageSize);
                fetchStats();
                return true;
            }
            return false;
        } catch (err) {
            console.error(`Error deleting order ${orderId}:`, err);
            setError(`Không thể xóa đơn hàng. Vui lòng thử lại.`);
            return false;
        }
    }, [fetchOrders, fetchStats, pagination.currentPage, pagination.pageSize]);

    // View order details
    const handleViewOrder = useCallback(async (orderId) => {
        try {
            const orderToView = rawOrders.find(order => order.id === orderId);
            return orderToView;
        } catch (err) {
            console.error("Error viewing order details:", err);
            setError("Cannot load order details. Please try again.");
            return null;
        }
    }, [rawOrders]);

    return {
        // State
        orders,
        pagination,
        stats,
        isLoading,
        error,
        filter,
        searchTerm,
        dateRange,

        // Additional Filter States
        paymentMethodFilter,
        setPaymentMethodFilter,
        paymentStatusFilter,
        setPaymentStatusFilter,
        priceRangeFilter,
        setPriceRangeFilter,
        sortBy,
        setSortBy,

        // Actions
        setFilter,
        handleSearch,
        handleStatusChange,
        handleDeleteOrder,
        handleViewOrder,
        handlePageChange,
        resetAllFilters,

        // Utilities
        refreshOrders: () => fetchOrders(pagination.currentPage, pagination.pageSize)
    };
};