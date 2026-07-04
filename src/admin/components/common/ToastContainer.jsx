// src/components/common/ToastContainer.jsx
import React from "react";
import ToastNotification from "./ToastNotification";
import "../../styles/common/toast.css";

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <ToastNotification
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default ToastContainer;