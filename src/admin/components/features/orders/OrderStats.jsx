import React from "react";
import "../../../styles/admin/order/orders.css";
import { formatCurrency } from "../../../utils/format.js";

const OrderStats = ({ stats }) => {

    // Đảm bảo stats là object
    const safeStats = stats && typeof stats === 'object' ? stats : {};

    return (
        <div className="order-stats">
            <div className="stat-card">
                <div className="stat-title">Tổng đơn hàng</div>
                <div className="stat-value">{safeStats.totalOrders || 0}</div>
            </div>

            <div className="stat-card">
                <div className="stat-title">Đơn chờ xác nhận</div>
                <div className="stat-value">{safeStats.pendingOrders || 0}</div>
            </div>

            <div className="stat-card">
                <div className="stat-title">Đơn đã hoàn thành</div>
                <div className="stat-value">{safeStats.completedOrders || 0}</div>
            </div>

            <div className="stat-card">
                <div className="stat-title">Tổng doanh thu</div>
                <div className="stat-value">{formatCurrency(safeStats.totalRevenue)}</div>
            </div>
        </div>
    );
};

export default OrderStats;