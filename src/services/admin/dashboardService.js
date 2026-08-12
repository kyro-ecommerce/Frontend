// src/services/dashboardService.js
import api from './api';

export const getProductStats = () => api.get("/admin/analytics/products/summary");
export const getWeeklyRevenue = () => api.get("/admin/analytics/orders/summary");
export const getMonthlyRevenue = () => api.get("/admin/analytics/orders/summary");
export const getRevenueByCategory = () => api.get("/admin/analytics/products/revenue-by-category");
export const getRecentOrders = () => api.get("/admin/orders?page=0&size=5");
export const getTopSellingProducts = () => api.get("/admin/analytics/products/top-selling?limit=5");

export const getRevenueByDateRange = async (startDate, endDate) => {
    try {
        const response = await api.get("/admin/analytics/orders/daily-revenue", {
            params: {
                startDate,
                endDate
            }
        });
        return response.data?.data || response.data || [];
    } catch (err) {
        console.error("Error fetching revenue by date range:", err);
        return [];
    }
};
