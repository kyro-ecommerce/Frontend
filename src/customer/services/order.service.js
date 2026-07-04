// src/services/order.service.js
import { api } from "../config/ApiConfig";

export const orderService = {
    createOrder: async (addressId) => {
        try {
            if (!addressId) {
                throw new Error("Address ID is required to create an order.");
            }
            const response = await api.post(`/orders/create/${addressId}`);
            return response; 
        } catch (error) {
            console.error('Lỗi khi tạo đơn hàng (Service):', error.response || error);
            throw error;
        }
    },

    getOrderById: async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}`);
            return response;
        } catch (error) {
            console.error(`Lỗi khi lấy đơn hàng ${orderId} (Service):`, error.response || error);
            throw error;
        }
    },

    getAddresses: async () => {
        try {
            const response = await api.get("/users/address");
            return response;
        } catch (error) {
            console.error('Lỗi khi lấy địa chỉ (Service):', error.response || error);
            throw error;
        }
    },

    addAddress: async (addressData) => {
        try {
            const response = await api.post("/users/addresses", addressData);
            return response;
        } catch (error) {
            console.error('Lỗi khi thêm địa chỉ (Service):', error.response || error);
            throw error;
        }
    },

    createVNPayPayment: async (orderId) => {
        try {
            const response = await api.post(`/payment/create/${orderId}`);
            return response;
        } catch (error) {
            console.error(`Lỗi khi tạo thanh toán VNPAY cho đơn ${orderId} (Service):`, error.response || error);
            throw error;
        }
    },

    handleVNPayCallback: async (vnpayParams) => {
        if (!vnpayParams) {
             return Promise.reject(new Error("VNPAY parameters are required for callback"));
        }
        try {
            // SỬA ĐỔI CHÍNH: Đổi từ POST sang GET
            // Axios GET request gửi params trong config object.
            // Không cần truyền body (null) nữa.
            console.log("[OrderService] Calling VNPAY Callback with params:", vnpayParams);
            const response = await api.get(`/payment/vnpay-callback`, { 
                params: vnpayParams 
            });
            console.log("[OrderService] VNPAY Callback response:", response);
            return response;
        } catch (error) {
            console.error('Lỗi khi xử lý VNPAY callback (Service):', error.response || error.message, error);
            throw error;
        }
    },

    getAllOrders: async () => { /* ... Giữ nguyên ... */ 
        try {
            const response = await api.get("/orders/user");
            return response;
        } catch (error) {
            throw error;
        }
    },
    getPendingOrders: async () => { /* ... Giữ nguyên ... */ 
        try {
            const response = await api.get("/orders/pending");
            return response;
        } catch (error) {
            throw error;
        }
    },
    getShippingOrders: async () => { /* ... Giữ nguyên ... */ 
        try {
            const response = await api.get("/orders/shipped");
            return response;
        } catch (error) {
            throw error;
        }
    },
    getDeliveredOrders: async () => { /* ... Giữ nguyên ... */ 
        try {
            const response = await api.get("/orders/delivered");
            return response;
        } catch (error) {
            throw error;
        }
    },
    getCancelledOrders: async () => { /* ... Giữ nguyên ... */ 
        try {
            const response = await api.get("/orders/cancelled");
            return response;
        } catch (error) {
            throw error;
        }
    },
    getConfirmedOrders: async () => { /* ... Giữ nguyên ... */ 
        try {
            const response = await api.get("/orders/confirmed");
            return response;
        } catch (error) {
            throw error;
        }
    },
    cancelOrder: async (orderId) => { /* ... Giữ nguyên ... */ 
        try {
            const response = await api.put(`/orders/cancel/${orderId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
    sendOrderToEmail: async (orderId) => { /* ... Giữ nguyên ... */ 
        try {
            const response = await api.post(`/orders/send-mail/${orderId}`);
            return response;
        } catch (error) {
            throw error;
        }
    },
};