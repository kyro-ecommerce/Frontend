// src/contexts/ToastContext.js
import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

// 1. Tạo Context
const ToastContext = createContext();

// 2. Tạo Provider Component
export const ToastProvider = ({ children }) => {
  const [toastConfig, setToastConfig] = useState({
    show: false,
    message: '',
    type: 'info', // Các type có thể là: 'success', 'error', 'warning', 'info'
  });
  const timeoutRef = useRef(null); // Để lưu trữ ID của setTimeout

  // Hàm để ẩn toast
  const hideToast = useCallback(() => {
    // Xóa timeout cũ nếu có (quan trọng khi hiển thị toast mới trước khi cái cũ ẩn)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setToastConfig((prev) => ({ ...prev, show: false }));
  }, []);

  // Hàm để hiển thị toast
  const showToast = useCallback(
    (message, type = 'info', duration = 4000) => { // Mặc định là info, 4 giây
      // Xóa timeout cũ nếu có
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToastConfig({ show: true, message, type });

      // Đặt timeout mới để tự động ẩn
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast] // hideToast là dependency ổn định nhờ useCallback([])
  );

  // Giá trị cung cấp bởi Context
  const value = { showToast, hideToast, toastConfig };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

// 3. Tạo Custom Hook để dễ sử dụng Context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  // Chỉ trả về hàm showToast để component khác sử dụng
  return { showToast: context.showToast };
};

// Export thêm config và hideToast để component GlobalToast sử dụng
export const useToastInternal = () => {
    const context = useContext(ToastContext);
    if (context === undefined) {
      throw new Error('useToastInternal must be used within a ToastProvider');
    }
    return context;
}