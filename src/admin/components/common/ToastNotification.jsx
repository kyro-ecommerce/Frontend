// src/components/common/ToastNotification.jsx
import React, { useState, useEffect } from "react";
import "../../styles/common/toast.css";

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

    return (
        <div className={`toast-notification ${type} ${isVisible ? 'show' : 'hide'}`}>
            <div className="toast-icon">{getIcon()}</div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={handleClose}>×</button>
        </div>
    );
};

export default ToastNotification;