// src/contexts/ToastContext.jsx
import React, { createContext, useContext, useState } from 'react';
import ToastContainer from '../components/common/ToastContainer';

// Tạo context cho toast
const ToastContext = createContext();

// Custom hook để sử dụng toast
export const useToast = () => {
    return useContext(ToastContext);
};

// Provider component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Thêm một toast mới
    const addToast = (message, type = "success", duration = 3000) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type, duration }]);
        return id;
    };

    // Xóa một toast
    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Các helper function
    const success = (message, duration) => addToast(message, "success", duration);
    const error = (message, duration) => addToast(message, "error", duration);
    const warning = (message, duration) => addToast(message, "warning", duration);
    const info = (message, duration) => addToast(message, "info", duration);

    // Giá trị context
    const contextValue = {
        addToast,
        removeToast,
        success,
        error,
        warning,
        info
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export default ToastContext;