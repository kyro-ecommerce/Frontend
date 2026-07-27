// src/hooks/useDashboard.jsx
import {useCallback, useEffect, useState} from "react";
import {dashboardService} from "../../services/admin/index.js";


export const useDashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        productStats: {},
        categoryRevenue: {},
        recentOrders: [],
        topSellingProducts: [],
        revenueChartData: []
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isChartLoading, setIsChartLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Lấy thống kê sản phẩm
            try {
                const res = await dashboardService.getProductStats();
                const data = res.data?.data || res.data || {};
                setDashboardData(prevData => ({ ...prevData, productStats: data }));
            } catch (e) { console.warn("Failed fetching product stats:", e); }

            // Lấy doanh thu theo category
            try {
                const res = await dashboardService.getRevenueByCategory();
                const data = res.data?.data || res.data || {};
                setDashboardData(prevData => ({ ...prevData, categoryRevenue: data }));
            } catch (e) { console.warn("Failed fetching category revenue:", e); }

            // Lấy đơn hàng gần đây
            try {
                const res = await dashboardService.getRecentOrders();
                const list = res.data?.content || res.data?.data || res.data || [];
                setDashboardData(prevData => ({ ...prevData, recentOrders: Array.isArray(list) ? list : [] }));
            } catch (e) { console.warn("Failed fetching recent orders:", e); }

            // Lấy sản phẩm bán chạy
            try {
                const res = await dashboardService.getTopSellingProducts();
                const list = res.data?.data || res.data || [];
                setDashboardData(prevData => ({ ...prevData, topSellingProducts: Array.isArray(list) ? list : [] }));
            } catch (e) { console.warn("Failed fetching top selling products:", e); }

        } catch (err) {
            console.error("Lỗi khi tải dữ liệu dashboard:", err);
            setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchRevenueForRange = useCallback(async (startDate, endDate) => {
        try {
            setIsChartLoading(true);
            const chartData = await dashboardService.getRevenueByDateRange(startDate, endDate);
            setDashboardData(prevData => ({
                ...prevData,
                revenueChartData: chartData || []
            }));
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu doanh thu:", err);
        } finally {
            setIsChartLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                await fetchDashboardData();
                const today = new Date();
                const lastWeek = new Date(today);
                lastWeek.setDate(today.getDate() - 6);
                const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD
                await fetchRevenueForRange(formatDate(lastWeek), formatDate(today));
            } catch (err) {
                console.error(err);
                setError("Không thể tải dữ liệu dashboard.");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [fetchDashboardData, fetchRevenueForRange]);

    return {
        dashboardData,
        isLoading,
        isChartLoading,
        error,
        refreshData: fetchDashboardData,
        fetchRevenueForRange
    };
};