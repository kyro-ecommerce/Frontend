// src/components/common/ToastContainer.jsx
import React from "react";
import ToastNotification from "./ToastNotification";


const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5">
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