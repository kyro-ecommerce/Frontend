// src/services/dashboardService.js
import api from './api';

export const getProductStats = () => api.get("/admin/dashboard/product-stats");
export const getWeeklyRevenue = () => api.get("/admin/dashboard/revenue-by-time/week");
export const getMonthlyRevenue = () => api.get("/admin/dashboard/revenue-by-time/month");
export const getRevenueByCategory = () => api.get("/admin/dashboard/revenue-by-category");
export const getRecentOrders = () => api.get("/admin/dashboard/recent-orders/5");
export const getTopSellingProducts = () => api.get("/admin/dashboard/top-selling-products/5");

export const getRevenueByDateRange = async (startDate, endDate) => {
    const response = await api.get("/admin/dashboard/revenue-by-date-range", {
        params: {
            startDate,
            endDate
        }
    });
    return response.data.data;
}