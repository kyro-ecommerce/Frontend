// src/hooks/useOrders.jsx
import { useState, useEffect, useCallback } from "react";
import { orderService } from "../../services/admin/index.js";

export const useOrders = () => {
    // State management
    const [orders, setOrders] = useState([]);
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
                setOrders(orderList);

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
            setOrders([]);
        } finally {
            setIsLoading(false);
        }
    }, [filter, searchTerm, dateRange, pagination.pageSize]);

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
        setSearchTerm(term || ""); // Ensure empty string instead of undefined
        setDateRange({
            start: startDate || "",
            end: endDate || ""
        });

        // Reset to first page when searching/clearing
        setPagination(prev => ({ ...prev, currentPage: 0 }));
    }, [fetchOrders, pagination.pageSize]);

    // Handle pagination
    const handlePageChange = useCallback((newPage) => {
        fetchOrders(newPage, pagination.pageSize);
    }, [fetchOrders]);

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
                // Refresh current page to get updated data
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
            // Find order in current list or fetch from API if needed
            const orderToView = orders.find(order => order.id === orderId);
            return orderToView;
        } catch (err) {
            console.error("Error viewing order details:", err);
            setError("Cannot load order details. Please try again.");
            return null;
        }
    }, [orders]);

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

        // Actions
        setFilter,
        handleSearch,
        handleStatusChange,
        handleDeleteOrder,
        handleViewOrder,
        handlePageChange,

        // Utilities
        refreshOrders: () => fetchOrders(pagination.currentPage, pagination.pageSize)
    };
};