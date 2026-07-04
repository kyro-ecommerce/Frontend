// src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
        </div>
    );
};

export default LoadingSpinner;