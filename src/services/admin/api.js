import axios from "axios";
import { getErrorMessage, getErrorCode } from "../../utils/errorUtils";


const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"; // Thay đổi URL này nếu cần
const API_URL = `${BACKEND_URL}/api/v1`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Thêm dòng này để gửi và nhận cookie
});

// Thêm interceptor để xử lý token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor xử lý refresh token khi token hết hạn
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        error.normalizedMessage = getErrorMessage(error);
        error.message = error.normalizedMessage;
        error.errorCode = getErrorCode(error);

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Gọi API refresh token
                const res = await axios.post(
                    `${API_URL}/auth/refresh-token`,
                    {},
                    {
                        withCredentials: true, // Để gửi cookies (refresh token)
                    }
                );

                const newAccessToken = res.data?.accessToken || res.data?.data?.accessToken;
                if (newAccessToken) {
                    // Lưu token mới
                    localStorage.setItem("accessToken", newAccessToken);
                    // Gán token mới vào header
                    api.defaults.headers.common["Authorization"] =
                        "Bearer " + newAccessToken;

                    // Thực hiện lại request ban đầu
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Nếu refresh token cũng hết hạn, chuyển hướng về trang đăng nhập
                localStorage.removeItem("accessToken");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
