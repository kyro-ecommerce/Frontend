// src/services/order.service.js
import { runIdempotent } from "./idempotentRequest.js";
import { getTokenFromLocalStorage } from "./util";

function actorScope() {
  try { return JSON.parse(atob(getTokenFromLocalStorage().split(".")[1].replace(/-/g,"+").replace(/_/g,"/"))).id; }
  catch { return "anonymous"; }
}

import { api } from "../../config/user/ApiConfig";

export const orderService = {
    createOrder: async (addressId, paymentMethod, cartItemIds, cartVersion, expectedTotalDiscountedPrice) => {
        try {
            if (!addressId) {
                throw new Error("Address ID is required to create an order.");
            }
            const payload = { addressId, paymentMethod, cartItemIds: [...cartItemIds].sort((a,b) => a-b), cartVersion, expectedTotalDiscountedPrice };
            const response = await runIdempotent(`order:${actorScope()}`, payload,
                key => api.post(`/orders`, payload, { headers: { "Idempotency-Key": key } }));
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
            const response = await api.get("/users/me/addresses");
            return response;
        } catch (error) {
            console.error('Lỗi khi lấy địa chỉ (Service):', error.response || error);
            throw error;
        }
    },

    addAddress: async (addressData) => {
        try {
            const response = await api.post("/users/me/addresses", addressData);
            return response;
        } catch (error) {
            console.error('Lỗi khi thêm địa chỉ (Service):', error.response || error);
            throw error;
        }
    },

    deleteAddress: async (addressId) => {
        try {
            const response = await api.delete(`/users/me/addresses/${addressId}`);
            return response;
        } catch (error) {
            console.error('Lỗi khi xóa địa chỉ (Service):', error.response || error);
            throw error;
        }
    },

    updateAddress: async (addressId, addressData) => {
        try {
            const response = await api.put(`/users/me/addresses/${addressId}`, addressData);
            return response;
        } catch (error) {
            console.error('Lỗi khi sửa địa chỉ (Service):', error.response || error);
            throw error;
        }
    },

    createVNPayPayment: async (orderId) => {
        try {
            const response = await runIdempotent(`payment:${actorScope()}`, { orderId },
                key => api.post(`/orders/${orderId}/payments`, null, { headers: { "Idempotency-Key": key } }));
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
            const response = await api.get(`/payment-providers/vnpay/callback`, {
                params: vnpayParams 
            });
            console.log("[OrderService] VNPAY Callback response:", response);
            return response;
        } catch (error) {
            console.error('Lỗi khi xử lý VNPAY callback (Service):', error.response || error.message, error);
            throw error;
        }
    },

    getAllOrders: async ({ status, search, page = 0, size = 10 } = {}) => {
        try {
            const response = await api.get("/orders", {
                params: {
                    status: status && status !== "all" ? status : undefined,
                    search: search && search.trim() ? search.trim() : undefined,
                    page,
                    size,
                    sort: "orderDate,desc"
                }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },
    cancelOrder: async (orderId) => { 
        try {
            const response = await api.patch(`/orders/${orderId}/status`, { status: "CANCELLED" });
            return response;
        } catch (error) {
            throw error;
        }
    },
};
