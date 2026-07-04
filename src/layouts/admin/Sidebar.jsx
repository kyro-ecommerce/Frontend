// src/components/layout/Sidebar.jsx
import React, {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {useAuth} from "../../hooks/admin/useAuth.jsx";

const Sidebar = () => {
    const [showLogout, setShowLogout] = useState(false);
    const {user, logout} = useAuth();
    const location = useLocation();

    const handleLogout = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await logout();
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        }
    };

    const toggleLogout = () => {
        setShowLogout(!showLogout);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    // Thêm các icon sử dụng UTF-8 characters
    const icons = {
        dashboard: "📊",
        products: "📦",
        users: "👥",
        orders: "🛒",
        revenue: "💰",
    };

    return (
        <div className="w-50 bg-[#1A2266] h-screen sticky top-0 flex flex-col text-white shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
            <div className="p-3 flex items-center border-b border-white/10">
                <img src="https://res.cloudinary.com/dgygvrrjs/image/upload/v1745387610/ChatGPT_Image_Apr_5_2025_12_08_58_AM_ociguu.png?fbclid=IwY2xjawJ4KxJleHRuA2FlbQIxMABicmlkETFnbUszR1o2RlZrQXJ2VFRXAR7SKjjUPYQHQovx3wZg3p14ksqpKnPTakahujkwPCwl21n8F7-sQJX0fXLfRg_aem_ghKIYi2m6VITMUEzqoiUOg" alt="Logo" className="w-8 h-8 mr-2 rounded-[10%] object-cover" />
                <h1 className="text-base font-semibold m-0">TechShop</h1>
            </div>

            <div className="flex-1">
                <ul className="list-none pt-2.5 flex flex-col p-0 m-0">
                    <li className={`relative flex items-center p-2 px-3 hover:bg-white/10 transition-colors cursor-pointer ${isActive("/admin") ? "bg-linear-to-r from-[#4A6CF7]/20 to-[#4A6CF7]/5 text-white before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0.75 before:bg-linear-to-b before:from-[#4A6CF7] before:to-[#8B5CF6]" : ""}`}>
                        <Link to="/admin" className="flex flex-row items-center w-full h-full text-inherit no-underline">
                            <span className="mr-2 text-sm">{icons.dashboard}</span>
                            Dashboard
                        </Link>
                    </li>
                    <li className={`relative flex items-center p-2 px-3 hover:bg-white/10 transition-colors cursor-pointer ${isActive("/admin/products") ? "bg-linear-to-r from-[#4A6CF7]/20 to-[#4A6CF7]/5 text-white before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0.75 before:bg-linear-to-b before:from-[#4A6CF7] before:to-[#8B5CF6]" : ""}`}>
                        <Link to="/admin/products" className="flex flex-row items-center w-full h-full text-inherit no-underline">
                            <span className="mr-2 text-sm">{icons.products}</span>
                            Sản phẩm
                        </Link>
                    </li>
                    <li className={`relative flex items-center p-2 px-3 hover:bg-white/10 transition-colors cursor-pointer ${isActive("/admin/orders") ? "bg-linear-to-r from-[#4A6CF7]/20 to-[#4A6CF7]/5 text-white before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0.75 before:bg-linear-to-b before:from-[#4A6CF7] before:to-[#8B5CF6]" : ""}`}>
                        <Link to="/admin/orders" className="flex flex-row items-center w-full h-full text-inherit no-underline">
                            <span className="mr-2 text-sm">{icons.orders}</span>
                            Đơn hàng
                        </Link>
                    </li>
                    <li className={`relative flex items-center p-2 px-3 hover:bg-white/10 transition-colors cursor-pointer ${isActive("/admin/users") ? "bg-linear-to-r from-[#4A6CF7]/20 to-[#4A6CF7]/5 text-white before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-0.75 before:bg-linear-to-b before:from-[#4A6CF7] before:to-[#8B5CF6]" : ""}`}>
                        <Link to="/admin/users" className="flex flex-row items-center w-full h-full text-inherit no-underline">
                            <span className="mr-2 text-sm">{icons.users}</span>
                            Người dùng
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="mt-auto bg-white/5 border-t border-white/10 py-4 px-5 flex items-center relative cursor-pointer hover:bg-white/10 transition-colors" onClick={toggleLogout}>
                <div className="w-9.5 h-9.5 rounded-[10%] bg-linear-to-br from-[#4A6CF7] to-[#8B5CF6] text-white mr-3 flex items-center justify-center font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.3)] overflow-hidden shrink-0">
                    <img
                        src="https://res.cloudinary.com/dgygvrrjs/image/upload/v1745387610/ChatGPT_Image_Apr_5_2025_12_08_58_AM_ociguu.png?fbclid=IwY2xjawJ4KxJleHRuA2FlbQIxMABicmlkETFnbUszR1o2RlZrQXJ2VFRXAR7SKjjUPYQHQovx3wZg3p14ksqpKnPTakahujkwPCwl21n8F7-sQJX0fXLfRg_aem_ghKIYi2m6VITMUEzqoiUOg"
                        alt="Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-1">
                    <div className="font-bold text-white text-base uppercase">
                        {user?.firstName || 'Admin'}
                    </div>
                </div>
                {showLogout && (
                    <div className="absolute bottom-15 right-2.5 w-30 bg-[#1F2937] shadow-[0_4px_12px_rgba(0,0,0,0.3)] rounded-md overflow-hidden z-50">
                        <button className="w-full py-3 px-4 text-left bg-transparent border-none text-white/80 cursor-pointer text-sm transition-colors flex items-center hover:bg-white/10 hover:text-white" onClick={handleLogout}>
                            ⬅️ Đăng xuất
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;