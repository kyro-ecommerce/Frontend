// src/components/common/GlobalToast.js
import React from 'react';
import { useToastInternal } from '../../contexts/ToastContext'; // Sử dụng hook nội bộ
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid'; // Ví dụ dùng Heroicons

const GlobalToast = () => {
  // Lấy state và hàm hide từ context
  const { toastConfig, hideToast } = useToastInternal();
  const { show, message, type } = toastConfig;

  if (!show) return null;

  // Xác định màu sắc và icon dựa trên type
  let bgColor = 'bg-blue-500';
  let textColor = 'text-white';
  let IconComponent = InformationCircleIcon;

  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      IconComponent = CheckCircleIcon;
      break;
    case 'error':
      bgColor = 'bg-red-600';
      IconComponent = XCircleIcon;
      break;
    case 'warning':
      bgColor = 'bg-yellow-500';
      textColor = 'text-gray-800'; // Màu chữ tối hơn cho nền vàng
      IconComponent = ExclamationTriangleIcon;
      break;
    case 'info':
    default:
      bgColor = 'bg-blue-500';
      IconComponent = InformationCircleIcon;
      break;
  }

  return (
    // Định vị ở góc trên bên phải (hoặc vị trí bạn muốn)
    <div
      className={`fixed top-5 right-5 w-auto max-w-sm z-[100] p-4 rounded-md shadow-lg ${bgColor} ${textColor} animate-slide-down`}
      role="alert"
      aria-live="assertive" // Quan trọng cho accessibility
    >
      <div className="flex items-center">
        {/* Icon */}
        <div className="flex-shrink-0">
          <IconComponent className={`h-6 w-6 ${textColor}`} aria-hidden="true" />
        </div>

        {/* Message */}
        <div className="ml-3 flex-1 text-sm font-medium">
          {message}
        </div>

        {/* Close Button (Optional) */}
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={hideToast}
            className={`inline-flex rounded-md p-1.5 ${textColor} hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 ${type === 'warning' ? 'focus:ring-offset-yellow-500' : type === 'error' ? 'focus:ring-offset-red-600' : type === 'success' ? 'focus:ring-offset-green-500' : 'focus:ring-offset-blue-500'
              }`}
          >
            <span className="sr-only">Đóng</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalToast;