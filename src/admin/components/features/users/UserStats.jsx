import React from "react";
import "../../../styles/admin/user/users.css";


const UserStats = ({stats}) => {
    return (
        <div className="user-stats">
            <div className="stat-card">
                <div className="stat-title">Tổng số người dùng</div>
                <div className="stat-value">{stats.totalCustomers + stats.totalSellers || 0}</div>
            </div>

            <div className="stat-card">
                <div className="stat-title">Khách hàng</div>
                <div className="stat-value">{stats.totalCustomers || 0}</div>
            </div>

            <div className="stat-card">
                <div className="stat-title">Người bán</div>
                <div className="stat-value">{stats.totalSellers || 0}</div>
            </div>
        </div>
    );
};

export default UserStats;