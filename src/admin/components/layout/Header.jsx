import React from "react";
import { useLocation } from "react-router-dom";
import "../../styles/layout/header.css";
import {getCurrentFormattedDate} from "../../utils/format.js";

const Header = () => {
    const location = useLocation();


    // Xác định tiêu đề và nút hành động dựa trên pathname
    const getHeaderContent = () => {
        const path = location.pathname;

        // Cấu trúc mặc định
        let title = "Dashboard";
        let actionButton = (
            <div className="date-filter">
                <span className="current-date-display">{getCurrentFormattedDate()}</span>
            </div>
        );

        // Xác định nội dung riêng cho từng trang
        if (path.includes("/admin/products")) {
            title = "Quản lý sản phẩm";
            actionButton = (
                <div className="date-filter">
                    <span className="current-date-display">{getCurrentFormattedDate()}</span>
                </div>
            );
        } else if (path.includes("/admin/users")) {
            title = "Quản lý người dùng";
            actionButton = (
                <div className="date-filter">
                    <span className="current-date-display">{getCurrentFormattedDate()}</span>
                </div>
            );
        } else if (path.includes("/admin/orders")) {
            title = "Quản lý đơn hàng";
            actionButton = (
                <div className="date-filter">
                    <span className="current-date-display">{getCurrentFormattedDate()}</span>
                </div>
            );
        }
        return { title, actionButton };
    };

    const { title, actionButton } = getHeaderContent();

    return (
        <div className="header">
            <div>
                <h1 className="header-title">{title}</h1>
            </div>
            {actionButton}
        </div>
    );
};

export default Header;