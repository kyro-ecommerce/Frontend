// src/hooks/useDashboard.jsx
import {useCallback, useEffect, useState} from "react";
import {dashboardService} from "../services/index.js";


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
            const productStatsResponse = await dashboardService.getProductStats();
            if (productStatsResponse.status === 200) {
                setDashboardData(prevData => ({
                    ...prevData,
                    productStats: productStatsResponse.data.data || {}
                }));
            }

            // Lấy doanh thu theo tuần
            const weeklyRevenueResponse = await dashboardService.getWeeklyRevenue();
            if (weeklyRevenueResponse.status === 200) {
                setDashboardData(prevData => ({
                    ...prevData,
                    weeklyRevenue: weeklyRevenueResponse.data.data.data || []
                }));
            }

            // Lấy doanh thu theo tháng
            const monthlyRevenueResponse = await dashboardService.getMonthlyRevenue();
            if (monthlyRevenueResponse.status === 200) {
                setDashboardData(prevData => ({
                    ...prevData,
                    monthlyRevenue: monthlyRevenueResponse.data.data.data || []
                }));
            }

            // Lấy doanh thu theo category
            const categoryRevenueResponse = await dashboardService.getRevenueByCategory();
            if (categoryRevenueResponse.status === 200) {
                setDashboardData(prevData => ({
                    ...prevData,
                    categoryRevenue: categoryRevenueResponse.data.data.categories || {}
                }));
            }

            // Lấy đơn hàng gần đây
            const recentOrdersResponse = await dashboardService.getRecentOrders();
            if (recentOrdersResponse.status === 200) {
                setDashboardData(prevData => ({
                    ...prevData,
                    recentOrders: recentOrdersResponse.data.data || []
                }));
            }

            /// Lấy sản phẩm bán chạy
            const topSellingProductsResponse = await dashboardService.getTopSellingProducts();
            if (topSellingProductsResponse.status === 200) {
                setDashboardData(prevData => ({
                    ...prevData,
                    topSellingProducts: topSellingProductsResponse.data.data || []
                }));
            }

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