// src/services/orderService.js
import api from './api';

export const confirmOrder = (orderId) => api.put(`/admin/orders/${orderId}/confirm`);
export const shipOrder = (orderId) => api.put(`/admin/orders/${orderId}/ship`);
export const deliverOrder = (orderId) => api.put(`/admin/orders/${orderId}/deliver`);
export const cancelOrder = (orderId) => api.put(`/admin/orders/${orderId}/cancel`);
export const updateOrderStatus = (orderId, status) => api.put(`/admin/orders/${orderId}/status`, { status });
export const deleteOrder = (orderId) => api.delete(`/admin/orders/${orderId}`);

export const getOrderStats = (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    return api.get(`/admin/orders/stats?${params.toString()}`);
};

export const getAllOrders = (
    page = 0,
    size = 10,
    search = '',
    status = '',
    startDate = '',
    endDate = '',
    paymentMethod = '',
    paymentStatus = '',
    sortBy = 'orderDate',
    sortDir = 'desc'
) => {
    const params = new URLSearchParams();

    params.append('page', page.toString());
    params.append('size', size.toString());

    if (search) params.append('search', search);
    if (status && status !== 'all') params.append('status', status.toUpperCase());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (paymentMethod && paymentMethod !== 'all') params.append('paymentMethod', paymentMethod.toUpperCase());
    if (paymentStatus && paymentStatus !== 'all') params.append('paymentStatus', paymentStatus.toUpperCase());
    params.append('sort', `${sortBy},${sortDir}`);

    return api.get(`/admin/orders?${params.toString()}`);
};
