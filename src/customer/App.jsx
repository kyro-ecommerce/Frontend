import { Routes, Route } from 'react-router-dom';
import CustomerRouters from './Routers/CustomerRouters';
import { ToastProvider } from './contexts/ToastContext.jsx';
import GlobalToast from './components/common/GlobalToast.jsx';
import "./assets/styles/App.css"

function App() {
  return (
    // 3. Bọc toàn bộ ứng dụng bằng ToastProvider
    <ToastProvider>
      <div className="App">
          <Routes>
            {/* CustomerRouters và tất cả các component con sẽ có quyền truy cập context */}
            <Route path="/*" element={<CustomerRouters/>} />
          </Routes>
          {/* 4. Render GlobalToast ở đây */}
          {/* Nó sẽ tự động hiển thị khi cần và nằm bên trong Provider */}
          <GlobalToast />
      </div>
    </ToastProvider>
  );
}

export default App;