// src/hooks/useOrders.jsx
import { useState, useEffect, useCallback } from "react";
import { orderService } from "../services/index.js";

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
                const responseData = response.data.data;
                setOrders(responseData.orders || []);
                setPagination(responseData.pagination || pagination);
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
                setStats(response.data.data || stats);
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
    const handleStatusChange = useCallback(async (orderId, action) => {
        try {
            let response;

            switch (action) {
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
                    throw new Error("Invalid action");
            }

            if (response.status === 200) {
                // Refresh current page to get updated data
                fetchOrders(pagination.currentPage, pagination.pageSize);
                return true;
            }
            return false;
        } catch (err) {
            console.error(`Error changing order status ${orderId}:`, err);
            setError(`Cannot update order status. Please try again.`);
            return false;
        }
    }, [fetchOrders, pagination.currentPage, pagination.pageSize]);

    // Handle delete order
    const handleDeleteOrder = useCallback(async (orderId) => {
        if (!window.confirm("Are you sure you want to delete this order?")) {
            return false;
        }

        try {
            const response = await orderService.deleteOrder(orderId);
            if (response.status === 200) {
                // Refresh current page to get updated data
                fetchOrders(pagination.currentPage, pagination.pageSize);
                return true;
            }
            return false;
        } catch (err) {
            console.error(`Error deleting order ${orderId}:`, err);
            setError(`Cannot delete order. Please try again.`);
            return false;
        }
    }, [fetchOrders, pagination.currentPage, pagination.pageSize]);

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