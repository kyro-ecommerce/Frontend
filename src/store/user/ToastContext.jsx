import React, { createContext, useContext, useCallback } from 'react';
import { toast as hotToast } from 'react-hot-toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((message, type = 'info') => {
    if (type === 'success') {
      hotToast.success(message);
    } else if (type === 'error') {
      hotToast.error(message);
    } else if (type === 'warning') {
      hotToast(message, { icon: '⚠️' });
    } else {
      hotToast(message, { icon: 'ℹ️' });
    }
  }, []);

  const hideToast = useCallback(() => {
    hotToast.dismiss();
  }, []);

  const value = { showToast, hideToast, toastConfig: { show: false } };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return { showToast: context.showToast };
};

export const useToastInternal = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastInternal must be used within a ToastProvider');
  }
  return context;
};