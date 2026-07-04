import axios from "axios";
import { authService } from "../services/auth.service";
import { getTokenFromLocalStorage, removeTokenFromLocalStorage } from "../services/util";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const API_BASE_URL = `${BACKEND_URL}/api/v1`;

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Biến để theo dõi các request đang chờ refresh token
let isRefreshing = false;
let failedQueue = [];

// Xử lý các request sau khi refresh token
const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Thêm interceptors để xử lý request
api.interceptors.request.use(
    (config) => {
        const token = getTokenFromLocalStorage();
        if (token) {
            // Log để debug
            console.log(`Đang gửi request đến ${config.url}`);
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error("Lỗi khi chuẩn bị request:", error);
        return Promise.reject(error);
    }
);

// Thêm interceptors để xử lý response và refresh token khi cần
api.interceptors.response.use(
    (response) => {
        console.log("Nhận phản hồi thành công:", response.status, response.config.url);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        console.error("Lỗi API:", error.response?.status, error.config?.url, error.message);

        // Kiểm tra xem có phải lỗi 401 (Unauthorized) không và chưa thử refresh token
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            console.log("Gặp lỗi 401, chuẩn bị refresh token...");

            if (isRefreshing) {
                console.log("Đang refresh token, thêm request vào hàng đợi");
                // Nếu đang trong quá trình refresh token, thêm request vào hàng đợi
                try {
                    const token = await new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    console.log("Lấy token mới từ hàng đợi, tiếp tục request");
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return axios(originalRequest);
                } catch (err) {
                    console.error("Lỗi khi xử lý request từ hàng đợi:", err);
                    return Promise.reject(err);
                }
            }

            originalRequest._retry = true;
            isRefreshing = true;
            console.log("Bắt đầu quá trình refresh token");

            try {
                // Thực hiện refresh token
                const newToken = await authService.refreshToken();
                console.log("Refresh token thành công");

                // Cập nhật token cho request hiện tại và các request trong hàng đợi
                processQueue(null, newToken);
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                return axios(originalRequest);
            } catch (refreshError) {
                console.error("Lỗi khi refresh token:", refreshError);
                // Xử lý lỗi refresh token
                processQueue(refreshError, null);

                console.log("Xóa token và chuyển hướng đến trang đăng nhập");
                // Cả access token và refresh token đều hết hạn
                // Chuyển hướng đến trang đăng nhập
                removeTokenFromLocalStorage();

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);