import React from "react";
import { useAuth } from "../../hooks/admin/useAuth.jsx";

const Header = () => {
    const { user } = useAuth();

    return (
        <div className="bg-white border-b border-slate-200/80 py-3.5 px-6 flex justify-between items-center sticky top-0 z-30 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight m-0">
                    Welcome, {user?.firstName || 'Admin'}!
                </h1>
                <p className="text-xs text-slate-400 font-medium m-0 mt-0.5">
                    Hệ thống quản lý bán hàng & phân tích dữ liệu TechShop
                </p>
            </div>


            
        </div>
    );
};

export default Header;