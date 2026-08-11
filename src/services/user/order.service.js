// src/services/order.service.js
import { api } from "../../config/user/ApiConfig";

export const orderService = {
    createOrder: async (addressId, paymentMethod, cartItemIds, cartVersion, expectedTotalDiscountedPrice) => {
        try {
            if (!addressId) {
                throw new Error("Address ID is required to create an order.");
            }
            const response = await api.post(`/orders`, { addressId, paymentMethod, cartItemIds, cartVersion, expectedTotalDiscountedPrice });
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
            const response = await api.get("/users/addresses");
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

    deleteAddress: async (addressId) => {
        try {
            const response = await api.delete(`/users/addresses/${addressId}`);
            return response;
        } catch (error) {
            console.error('Lỗi khi xóa địa chỉ (Service):', error.response || error);
            throw error;
        }
    },

    updateAddress: async (addressId, addressData) => {
        try {
            const response = await api.put(`/users/addresses/${addressId}`, addressData);
            return response;
        } catch (error) {
            console.error('Lỗi khi sửa địa chỉ (Service):', error.response || error);
            throw error;
        }
    },

    createVNPayPayment: async (orderId) => {
        try {
            const response = await api.post(`/payments/${orderId}`);
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
            console.log("[OrderService] Calling VNPAY Callback with params:", vnpayParams);
            const response = await api.get(`/payments/vnpay-callback`, { 
                params: vnpayParams 
            });
            console.log("[OrderService] VNPAY Callback response:", response);
            return response;
        } catch (error) {
            console.error('Lỗi khi xử lý VNPAY callback (Service):', error.response || error.message, error);
            throw error;
        }
    },

    getAllOrders: async () => { 
        try {
            const response = await api.get("/orders");
            return response;
        } catch (error) {
            throw error;
        }
    },
    getPendingOrders: async () => { 
        try {
            const response = await api.get("/orders/pending");
            return response;
        } catch (error) {
            throw error;
        }
    },
    getShippingOrders: async () => { 
        try {
            const response = await api.get("/orders/shipped");
            return response;
        } catch (error) {
            throw error;
        }
    },
    getDeliveredOrders: async () => { 
        try {
            const response = await api.get("/orders/delivered");
            return response;
        } catch (error) {
            throw error;
        }
    },
    getCancelledOrders: async () => { 
        try {
            const response = await api.get("/orders/cancelled");
            return response;
        } catch (error) {
            throw error;
        }
    },
    getConfirmedOrders: async () => { 
        try {
            const response = await api.get("/orders/confirmed");
            return response;
        } catch (error) {
            throw error;
        }
    },
    cancelOrder: async (orderId) => { 
        try {
            const response = await api.put(`/orders/${orderId}/cancel`);
            return response;
        } catch (error) {
            throw error;
        }
    },
};
