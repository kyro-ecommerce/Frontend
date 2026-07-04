// src/hooks/useAuth.jsx
import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {authService} from '../services/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Kiểm tra người dùng đã đăng nhập hay chưa
        const checkLoggedIn = async () => {
            try {
                // Kiểm tra token trong localStorage
                const token = localStorage.getItem("accessToken");
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Lấy thông tin người dùng hiện tại
                const response = await authService.getCurrentUser();
                setUser(response.data);
            } catch (err) {
                console.error("Failed to fetch user:", err);
                localStorage.removeItem("accessToken");
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    // Xử lý đăng nhập
    const login = useCallback(async (credentials) => {
        try {
            setError(null);
            const response = await authService.login(credentials);
            const { accessToken, user } = response.data.data;

            // Cookie refreshToken sẽ được tự động lưu bởi browser
            // Ta chỉ cần lưu accessToken
            localStorage.setItem("accessToken", accessToken);
            setUser(user);
            return user;
        } catch (err) {
            console.error("Login error details:", err);
            setError(err.response?.data?.message || "Đăng nhập thất bại");
            throw err;
        }
    }, []);

    // Xử lý đăng xuất
    const logout = useCallback(async () => {
        try {
            await authService.logout(); // Gọi API để hủy refresh token trên server
            localStorage.removeItem("accessToken"); // Xóa access token
            setUser(null);
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("accessToken");
            setUser(null);
            navigate("/login");
        }
    }, [navigate]);

    // Kiểm tra vai trò người dùng
    const hasRole = useCallback((role) => {
        if (!user) return false;
        return user.role === role;
    }, [user]);

    const isAdmin = useCallback(() => hasRole("ADMIN"), [hasRole]);

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        hasRole,
        isAdmin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default useAuth;