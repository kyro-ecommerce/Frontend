// src/services/cart.service.js
import { api } from "../config/ApiConfig";

export const cartService = {
    getCart: async () => {
        try {
            const response = await api.get(`/cart/`);
            return response;
        } catch (error) {
            console.error("Error fetching cart in service:", error.response || error);
            throw error;
        }
    },

    addToCart: async (cartData) => {
        try {
            const response = await api.post(`/cart/add`, cartData);
            return response;
        } catch (error) {
            console.error("Error adding to cart in service:", error.response || error);
            throw error;
        }
    },

    removeFromCart: async (itemId) => {
        try {
            const response = await api.delete(`/cart/remove/${itemId}`);
            return response;
        } catch (error) {
            console.error("Error removing from cart in service:", error.response || error);
            throw error;
        }
    },

    updateCartItem: async (cartUpdateData, itemId) => {
        try {
            const response = await api.put(`/cart/update/${itemId}`, cartUpdateData);
            return response;
        } catch (error) {
            console.error("Error updating cart item in service:", error.response || error);
            throw error;
        }
    },

    clearCart: async () => {
        try {
            const response = await api.delete(`/cart/clear`);
            return response; // API này có thể trả về 204 No Content hoặc cart rỗng
        } catch (error) {
            console.error("Error clearing cart in service:", error.response || error);
            throw error;
        }
    },
};