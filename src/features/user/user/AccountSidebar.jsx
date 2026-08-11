// src/components/features/user/AccountSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
// Xóa: import { useDispatch } from "react-redux";
// Xóa: import { logout } from "../../../State/Auth/Action";
import { useAuthContext } from "../../../store/user/AuthContext"; // THAY ĐỔI

const AccountSidebar = () => {
  const location = useLocation();

  // Xóa: const dispatch = useDispatch();
  const { logout: contextLogout } = useAuthContext();

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      // Xóa: dispatch(logout());
      contextLogout(); // THAY ĐỔI: Gọi hàm logout từ AuthContext
    }
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="w-72 max-md:w-full shrink-0">
      <div className="flex flex-col gap-2 p-5 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
          Thông tin tài khoản
        </h2>
        <Link
          to="/account"
          className={`block px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 ${
            isActive('/account') && !location.pathname.includes('/my-order')
              ? 'bg-blue-50 text-blue-600 font-bold'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          Thông tin cá nhân & Địa chỉ
        </Link>
        <Link
          to="/my-order"
          className={`block px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150 ${
            isActive('/my-order')
              ? 'bg-blue-50 text-blue-600 font-bold'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          Quản lý đơn hàng
        </Link>
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all duration-150 cursor-pointer mt-2"
        >
          Đăng xuất
        </button>
      </div>
    </nav>
  );
};

export default AccountSidebar;
