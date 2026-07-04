// src/services/auth.service.js
import axios from "axios";
import { API_BASE_URL } from "../config/ApiConfig";
import { api } from "../config/ApiConfig";
import {
    getRefreshTokenFromCookie,
    getTokenFromLocalStorage,
} from "./util";

export const authService = {
    register: async (userData) => {
        try {
            // console.log("Đang gửi yêu cầu đăng ký:", userData);
            const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
            // console.log("Initiate registration response:", response.data);
            return response.data; // Trả về dữ liệu từ API (thường là message)
        } catch (error) {
            // console.error("Initiate registration error:", error.response?.data || error.message);
            throw error; // Ném lỗi để Context xử lý
        }
    },

    login: async (userData) => {
        try {
            // console.log("Đang gửi yêu cầu đăng nhập:", userData);
            const response = await axios.post(`${API_BASE_URL}/auth/login`, userData);
            // console.log("Phản hồi từ đăng nhập:", response.data);
            // Service chỉ nên trả về response, việc xử lý token sẽ do AuthContext đảm nhiệm
            return response;
        } catch (error) {
            // console.error("Lỗi đăng nhập:", error);
            // console.error("Dữ liệu lỗi:", error.response?.data);
            throw error;
        }
    },

    getUserProfile: async () => { // Nên là async nếu bạn muốn await nó trong Context
        try {
            const response = await api.get(`${API_BASE_URL}/users/profile`);
            return response; // Trả về toàn bộ response
        } catch (error) {
            throw error;
        }
    },

    refreshToken: async () => {
        try {
            const refreshToken = getRefreshTokenFromCookie();
            if (!refreshToken) {
                throw new Error("Không có refresh token");
            }
            const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
            // Trả về response, AuthContext sẽ xử lý việc lưu token mới
            return response;
        } catch (error) {
            // authService không nên tự clearAllTokens, việc đó do AuthContext quyết định
            throw error;
        }
    },

    logout: async () => {
        try {
            const token = getTokenFromLocalStorage(); // getTokenFromLocalStorage vẫn có thể ở util
            if (token) {
                // API call là optional, có thể backend tự xử lý khi token hết hạn
                await api.post(`${API_BASE_URL}/auth/logout`); // Sử dụng instance 'api' đã có interceptor
            }
            // Service không nên tự clear token, chỉ báo cho AuthContext
            return Promise.resolve(); // Trả về resolved promise
        } catch (error) {
            // console.error("Lỗi đăng xuất API (có thể bỏ qua):", error);
            // Ngay cả khi API lỗi, vẫn coi như logout thành công ở client
            return Promise.resolve();
        }
    },

    // Các hàm khác như resendOtp, verifyOtp, resetPassword, updateProfile giữ nguyên cách throw error
    // Ví dụ:
    resendOtp: async (email) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register/resend-otp`, { email });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    verifyOtp: async (email, otp) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register/verify`, { email, otp });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    resetPassword: async (email, newPassword, otp) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/register/forgot-password`, { email, newPassword, otp });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateProfile: async (userData) => {
        try {
            const response = await api.put(`${API_BASE_URL}/users/update`, userData);
            return response.data; // Trả về data để context/component xử lý
        } catch (error) {
            throw error;
        }
    },

    changeRoleToSeller: async () => {
        try {
            const response = await api.post(`${API_BASE_URL}/users/change-role`, { role: 'SELLER' });
            return response;
        } catch (error) {
            console.error("Lỗi khi đổi vai trò thành Seller:", error.response?.data || error.message);
            throw error;
        }
    },
};