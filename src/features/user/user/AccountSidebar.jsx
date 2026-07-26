// src/components/features/user/AccountSidebar.jsx
import React, {useState} from "react";
import { Link, useLocation } from "react-router-dom";
// Xóa: import { useDispatch } from "react-redux";
// Xóa: import { logout } from "../../../State/Auth/Action";
import { useAuthContext } from "../../../store/user/AuthContext"; // THAY ĐỔI

const AccountSidebar = () => {
  const location = useLocation();

  // Xóa: const dispatch = useDispatch();
  const { logout: contextLogout, upgradeToSellerAndLogout, isLoading: isAuthLoading, user } = useAuthContext();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      // Xóa: dispatch(logout());
      contextLogout(); // THAY ĐỔI: Gọi hàm logout từ AuthContext
    }
  };

  const handleBecomeSeller = async () => {
    // Thay đổi thông báo trong hộp thoại confirm để rõ ràng hơn
    const isConfirmed = window.confirm(
        "Bạn có chắc chắn muốn đăng ký trở thành Người bán không?\n\nSau khi thành công, bạn sẽ được đăng xuất và cần đăng nhập lại."
    );

    if (isConfirmed) {
      setIsUpgrading(true);
      try {
        // Chỉ cần gọi hàm từ context
        await upgradeToSellerAndLogout();
        // Mọi việc còn lại (thông báo, logout, chuyển hướng) đã được context xử lý.
      } catch (error) {
        // Nếu context ném lỗi, chúng ta bắt và hiển thị nó
        alert(`Đăng ký thất bại: ${error.message}`);
        setIsUpgrading(false); // Reset trạng thái nút khi có lỗi
      }
    }
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const isSeller = user && user.role && user.role.name === 'SELLER';

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