import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { ConfirmProvider } from './context/ConfirmContext.jsx';

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
      <ConfirmProvider>
        <AppEntryPoint />
        {/* Global Toast Notification Container */}
        <Toaster
          position="top-right"
          containerStyle={{
            top: 85,
            right: 24,
          }}
          toastOptions={{
            duration: 2000,
            style: {
              background: '#1e293b',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '16px',
              padding: '12px 18px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              cursor: 'pointer',
            },
            success: {
              iconTheme: {
                primary: '#1D7461',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid rgba(29, 116, 97, 0.3)',
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
              style: {
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }
            }
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <div
                  onClick={() => toast.dismiss(t.id)}
                  className="flex items-center gap-2 cursor-pointer"
                  title="Bấm để tắt thông báo"
                >
                  {icon}
                  {message}
                </div>
              )}
            </ToastBar>
          )}
        </Toaster>
      </ConfirmProvider>
    </BrowserRouter>
  </StrictMode>
);
