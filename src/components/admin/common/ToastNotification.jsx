// src/components/common/ToastNotification.jsx
import React, { useState, useEffect } from "react";


const ToastNotification = ({ message, type = "success", duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => {
                if (onClose) onClose();
            }, 300); // Thời gian để animation kết thúc
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 300);
    };

    const getIcon = () => {
        switch (type) {
            case "success":
                return "✓";
            case "error":
                return "✕";
            case "warning":
                return "!";
            case "info":
                return "i";
            default:
                return "i";
        }
    };

    const typeStyles = {
        success: { border: "border-green-500", icon: "text-green-500 bg-green-100" },
        error: { border: "border-red-500", icon: "text-red-500 bg-red-100" },
        warning: { border: "border-yellow-500", icon: "text-yellow-500 bg-yellow-100" },
        info: { border: "border-blue-500", icon: "text-blue-500 bg-blue-100" },
    };
    const currentStyle = typeStyles[type] || typeStyles.info;

    return (
        <div className={`flex items-center w-80 p-4 mb-2 bg-white rounded-lg shadow-lg border-l-4 ${currentStyle.border} transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <div className={`inline-flex items-center justify-center shrink-0 w-8 h-8 rounded-lg ${currentStyle.icon}`}>
                {getIcon()}
            </div>
            <div className="ml-3 text-sm font-normal text-gray-700">{message}</div>
            <button type="button" className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8" onClick={handleClose}>
                <span className="sr-only">Close</span>
                <span className="text-xl leading-none">×</span>
            </button>
        </div>
    );
};

export default ToastNotification;