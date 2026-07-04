import React from "react";
import { formatCurrency } from "../../../utils/admin/format.js";

const OrderStats = ({ stats }) => {

    // Đảm bảo stats là object
    const safeStats = stats && typeof stats === 'object' ? stats : {};

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col justify-center items-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Tổng đơn hàng</div>
                <div className="text-2xl font-semibold text-blue-600">{safeStats.totalOrders || 0}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col justify-center items-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Đơn chờ xác nhận</div>
                <div className="text-2xl font-semibold text-blue-600">{safeStats.pendingOrders || 0}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col justify-center items-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Đơn đã hoàn thành</div>
                <div className="text-2xl font-semibold text-blue-600">{safeStats.completedOrders || 0}</div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] flex flex-col justify-center items-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Tổng doanh thu</div>
                <div className="text-2xl font-semibold text-blue-600">{formatCurrency(safeStats.totalRevenue)}</div>
            </div>
        </div>
    );
};

export default OrderStats;