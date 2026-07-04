import React from "react";
import { useLocation } from "react-router-dom";
import { getCurrentFormattedDate } from "../../utils/admin/format.js";

const Header = () => {
    const location = useLocation();

    // Xác định tiêu đề và nút hành động dựa trên pathname
    const getHeaderContent = () => {
        const path = location.pathname;

        // Cấu trúc mặc định
        let title = "Dashboard";
        let actionButton = (
            <div className="flex items-center bg-white/15 p-1 rounded-md">
                <span className="text-white font-medium text-sm px-3 py-2 bg-white/15 rounded-md">{getCurrentFormattedDate()}</span>
            </div>
        );

        // Xác định nội dung riêng cho từng trang
        if (path.includes("/admin/products")) {
            title = "Quản lý sản phẩm";
        } else if (path.includes("/admin/users")) {
            title = "Quản lý người dùng";
        } else if (path.includes("/admin/orders")) {
            title = "Quản lý đơn hàng";
        }
        
        return { title, actionButton };
    };

    const { title, actionButton } = getHeaderContent();

    return (
        <div className="flex justify-between items-center py-3 px-4 bg-linear-to-r from-[#4A6CF7] to-[#8B5CF6] text-white shadow-md m-0 rounded-none">
            <div>
                <h1 className="text-lg font-bold m-0">{title}</h1>
            </div>
            {actionButton}
        </div>
    );
};

export default Header;