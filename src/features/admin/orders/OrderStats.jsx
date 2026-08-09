import React from "react";
import { formatCurrency } from "../../../utils/admin/format.js";

const OrderStats = ({ stats }) => {
    const safeStats = stats && typeof stats === 'object' ? stats : {};

    const cards = [
        {
            title: "Tổng đơn hàng",
            value: (safeStats.totalOrders || 0).toLocaleString('vi-VN'),
            badge: "Hệ thống",
            badgeColor: "bg-blue-50 text-blue-700 border-blue-200"
        },
        {
            title: "Đơn chờ xác nhận",
            value: (safeStats.pendingOrders || 0).toLocaleString('vi-VN'),
            badge: "Chờ xử lý",
            badgeColor: "bg-amber-50 text-amber-700 border-amber-200"
        },
        {
            title: "Đơn đã hoàn thành",
            value: (safeStats.completedOrders || 0).toLocaleString('vi-VN'),
            badge: "Thành công",
            badgeColor: "bg-[#F2F9F7] text-[#1D7461] border-[#D5EFE8]"
        },
        {
            title: "Tổng doanh thu",
            value: formatCurrency(safeStats.totalRevenue || 0),
            badge: "Doanh số",
            badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500">{card.title}</span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                            {card.badge}
                        </span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                        {card.value}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default OrderStats;