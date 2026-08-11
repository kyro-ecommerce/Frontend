import React, { createContext, useContext } from 'react';
import { toast as hotToast } from 'react-hot-toast';

const ToastContext = createContext();

export const useToast = () => {
    return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
    const success = (message) => hotToast.success(message);
    const error = (message) => hotToast.error(message);
    const warning = (message) => hotToast(message, { icon: '⚠️' });
    const info = (message) => hotToast(message, { icon: 'ℹ️' });
    const addToast = (message, type = "success") => {
        if (type === "success") success(message);
        else if (type === "error") error(message);
        else if (type === "warning") warning(message);
        else info(message);
    };

    const contextValue = {
        addToast,
        removeToast: () => {},
        success,
        error,
        warning,
        info
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
        </ToastContext.Provider>
    );
};

export default ToastContext;