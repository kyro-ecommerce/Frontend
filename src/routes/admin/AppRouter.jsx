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

// Protected Route component
const ProtectedRoute = ({ element, requiredRole }) => {
    const { user, loading, hasRole } = useAuth();

    if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500 font-medium">Đang tải...</div>;
    if (!user || (requiredRole && !hasRole(requiredRole))) {
        window.location.href = "/login";
        return null;
    }

    return element;
};

const AppRouter = () => {
    return (
        <Routes>
            {/* Protected admin routes */}
            <Route path="/admin" element={<ProtectedRoute element={<Dashboard />} requiredRole="ADMIN" />} />
            <Route path="/admin/products" element={<ProtectedRoute element={<ProductManagement />} requiredRole="ADMIN" />} />
            <Route path="/admin/orders" element={<ProtectedRoute element={<OrdersManagement />} requiredRole="ADMIN" />} />
            <Route path="/admin/users" element={<ProtectedRoute element={<UserManagement />} requiredRole="ADMIN" />} />

            {/* Redirect và 404 */}
            <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
    );
};

export default AppRouter;