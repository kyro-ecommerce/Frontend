// src/AppRouter.jsx
import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../../hooks/admin/useAuth.jsx";

// Import các pages
import Dashboard from "../../pages/admin/admin/Dashboard";
import ProductManagement from "../../pages/admin/admin/ProductManagement";
import Login from "../../pages/admin/auth/Login";
import NotFound from "../../pages/admin/auth/NotFound";
import UserManagement from "../../pages/admin/admin/UserManagement";
import OrdersManagement from "../../pages/admin/admin/OrdersManagement";

// Protected Route component đơn giản hóa
const ProtectedRoute = ({ element, requiredRole }) => {
    const { user, loading, hasRole, logout } = useAuth();

    if (loading) return <div>Đang tải...</div>;
    if (!user) {
        return <Navigate to="/login" replace />;
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
            <Route path="/login" element={<Login />} />

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