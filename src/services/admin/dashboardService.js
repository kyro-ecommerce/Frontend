// src/services/dashboardService.js
import api from './api';

export const getProductStats = () => api.get("/admin/products/filter-stats");
export const getWeeklyRevenue = () => api.get("/admin/orders/stats");
export const getMonthlyRevenue = () => api.get("/admin/orders/stats");
export const getRevenueByCategory = () => api.get("/admin/products/revenue-by-category");
export const getRecentOrders = () => api.get("/admin/orders/all?page=0&size=5");
export const getTopSellingProducts = () => api.get("/admin/products/top-selling?limit=5");

export const getRevenueByDateRange = async (startDate, endDate) => {
    try {
        const response = await api.get("/admin/orders/stats", {
            params: {
                startDate,
                endDate
            }
        });
        return response.data?.data || response.data || {};
    } catch (err) {
        console.error("Error fetching revenue by date range:", err);
        return {};
    }
};