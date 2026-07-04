import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// --- Customer Imports ---
import CustomerApp from './customer/App.jsx';
import { AuthProvider as CustomerAuthProvider } from './customer/contexts/AuthContext.jsx';
import { CartProvider as CustomerCartProvider } from './customer/contexts/CartContext.jsx';
import { OrderProvider as CustomerOrderProvider } from './customer/contexts/OrderContext.jsx';
import { ToastProvider as CustomerToastProvider } from './customer/contexts/ToastContext.jsx';
import './customer/assets/styles/index.css';

// --- Admin Imports ---
import AdminAppRouter from './admin/AppRouter.jsx';
import { AuthProvider as AdminAuthProvider } from './admin/hooks/useAuth.jsx';
import { ToastProvider as AdminToastProvider } from './admin/contexts/ToastContext.jsx';
import './admin/styles/global.css';

const root = createRoot(document.getElementById('root'));

// A very simple dynamic entry point to avoid context conflicts between Admin and Customer
const AppEntryPoint = () => {
  const path = window.location.pathname;
  
  // If the path starts with /admin, we load the Admin app
  if (path.startsWith('/admin')) {
    return (
      <AdminAuthProvider>
        <AdminToastProvider>
          <AdminAppRouter />
        </AdminToastProvider>
      </AdminAuthProvider>
    );
  }

  // Otherwise, load Customer app
  return (
    <CustomerAuthProvider>
      <CustomerCartProvider>
        <CustomerOrderProvider>
          <CustomerToastProvider>
            <CustomerApp />
          </CustomerToastProvider>
        </CustomerOrderProvider>
      </CustomerCartProvider>
    </CustomerAuthProvider>
  );
};

root.render(
  <StrictMode>
    <BrowserRouter>
      <AppEntryPoint />
    </BrowserRouter>
  </StrictMode>
);
