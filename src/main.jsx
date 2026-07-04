import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// --- Customer Imports ---
import CustomerApp from './routes/user/AppUser.jsx';
import { AuthProvider as CustomerAuthProvider } from './store/user/AuthContext.jsx';
import { CartProvider as CustomerCartProvider } from './store/user/CartContext.jsx';
import { OrderProvider as CustomerOrderProvider } from './store/user/OrderContext.jsx';
import { ToastProvider as CustomerToastProvider } from './store/user/ToastContext.jsx';
import './index.css';

// --- Admin Imports ---
import AdminAppRouter from './routes/admin/AppRouter.jsx';
import { AuthProvider as AdminAuthProvider } from './hooks/admin/useAuth.jsx';
import { ToastProvider as AdminToastProvider } from './store/admin/ToastContext.jsx';


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
