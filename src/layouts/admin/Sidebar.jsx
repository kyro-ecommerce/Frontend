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
        { 
            path: "/admin", 
            label: "Dashboard",
            icon: (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        { 
            path: "/admin/products", 
            label: "Sản phẩm",
            icon: (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
        },
        { 
            path: "/admin/categories", 
            label: "Danh mục",
            icon: (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        { 
            path: "/admin/orders", 
            label: "Đơn hàng",
            icon: (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            )
        },
        { 
            path: "/admin/users", 
            label: "Người dùng",
            icon: (
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
    ];

    return (
        <aside className="w-60 bg-white h-screen sticky top-0 flex flex-col border-r border-slate-200/80 z-40 select-none">
            {/* Brand Logo */}
            <div className="p-5 flex items-center gap-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-[#1D7461] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#1D7461]/20 shrink-0">
                    K
                </div>
                <div>
                    <h1 className="text-base font-extrabold text-slate-900 tracking-tight m-0">Kyro Store</h1>
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
                                {user?.email || 'admin@kyrostore.com'}
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