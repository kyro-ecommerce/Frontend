// src/components/layout/Sidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/admin/useAuth.jsx";

const Sidebar = () => {
    const [showLogout, setShowLogout] = useState(false);
    const { user, logout } = useAuth();
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

    const isActive = (path) => {
        if (path === "/admin") return location.pathname === "/admin";
        return location.pathname.startsWith(path);
    };

    const menuItems = [
        { path: "/admin", label: "Dashboard" },
        { path: "/admin/products", label: "Sản phẩm" },
        { path: "/admin/orders", label: "Đơn hàng" },
        { path: "/admin/users", label: "Người dùng" },
    ];

    return (
        <aside className="w-60 bg-white h-screen sticky top-0 flex flex-col border-r border-slate-200/80 z-40 select-none">
            {/* Brand Logo */}
            <div className="p-5 flex items-center gap-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-[#1D7461] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#1D7461]/20 shrink-0">
                    T
                </div>
                <div>
                    <h1 className="text-base font-extrabold text-slate-900 tracking-tight m-0">TechShop</h1>
                    <span className="text-[10px] font-bold text-[#1D7461] uppercase tracking-wider block">Admin Portal</span>
                </div>
            </div>

            {/* Menu Links */}
            <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
                <div>
                    <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        MENU QUẢN TRỊ
                    </div>
                    <ul className="space-y-1.5 list-none p-0 m-0">
                        {menuItems.map((item) => {
                            const active = isActive(item.path);
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all no-underline ${
                                            active
                                                ? "bg-[#1D7461] text-white shadow-md shadow-[#1D7461]/20 scale-[1.01]"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                        }`}
                                    >
                                        <span className="text-base leading-none">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>

            {/* User Account / Logout */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                <div
                    className="p-2.5 rounded-2xl bg-white border border-slate-200/60 shadow-2xs flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all relative"
                    onClick={() => setShowLogout(!showLogout)}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#1D7461] to-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                            {user?.firstName?.charAt(0) || 'A'}
                        </div>
                        <div className="truncate">
                            <div className="font-extrabold text-slate-800 text-xs truncate">
                                {user?.firstName || 'Admin'} {user?.lastName || ''}
                            </div>
                            <div className="text-[10px] font-medium text-slate-400 truncate">
                                {user?.email || 'admin@techshop.com'}
                            </div>
                        </div>
                    </div>

                    {showLogout && (
                        <div className="absolute bottom-14 left-0 right-0 bg-white border border-slate-200 shadow-xl rounded-2xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2">
                            <button
                                className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer flex items-center gap-2"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;