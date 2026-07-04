import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorAlert = ({ message, onDismiss }) => {
    return (
        <div className="error-alert">
            <div className="error-icon">
                <AlertCircle />
            </div>
            <div className="error-content">
                <h4 className="error-title">Đã xảy ra lỗi</h4>
                <p className="error-message">{message}</p>
            </div>
            {onDismiss && (
                <button className="error-dismiss" onClick={onDismiss}>
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export default ErrorAlert;