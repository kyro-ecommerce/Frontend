// src/AppRouter.jsx
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";

// Import các pages
import Dashboard from "./pages/admin/Dashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import Login from "./pages/auth/Login";
import NotFound from "./pages/auth/NotFound";
import UserManagement from "./pages/admin/UserManagement";
import OrdersManagement from "./pages/admin/OrdersManagement";

// Protected Route component đơn giản hóa
const ProtectedRoute = ({ element, requiredRole }) => {
    const { user, loading, hasRole, logout } = useAuth();

    if (loading) return <div>Đang tải...</div>;
    if (!user) {
        return <Navigate to="/admin/login" replace />;
    }
    if (requiredRole && !hasRole(requiredRole)) {
        logout();
        return null;
    }

    return element;
};

const AppRouter = () => {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/admin/login" element={<Login />} />

            {/* Protected admin routes với cấu trúc đơn giản hơn */}
            <Route path="/admin" element={<ProtectedRoute element={<Dashboard />} requiredRole="ADMIN" />} />
            <Route path="/admin/products" element={<ProtectedRoute element={<ProductManagement />} requiredRole="ADMIN" />} />
            <Route path="/admin/orders" element={<ProtectedRoute element={<OrdersManagement />} requiredRole="ADMIN" />} />
            <Route path="/admin/users" element={<ProtectedRoute element={<UserManagement />} requiredRole="ADMIN" />} />

            {/* Redirect và 404 */}
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

export default AppRouter;