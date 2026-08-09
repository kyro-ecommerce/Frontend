import React from 'react';
import { formatCurrency } from '../../../utils/admin/format.js';

const DashboardStats = ({ productStats = {}, orderStats = {} }) => {
    const totalRevenue = orderStats.totalRevenue ?? 0;
    const totalOrders = orderStats.totalOrders ?? 0;
    const completedOrders = orderStats.completedOrders ?? 0;
    const totalProducts = productStats.totalProducts ?? productStats.stockStatus?.total ?? 0;
    const inStock = productStats.inStock ?? productStats.stockStatus?.inStock ?? 0;

    const cards = [
        {
            title: "Tổng sản phẩm",
            value: totalProducts.toLocaleString('vi-VN'),
            badge: "Live",
            badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200"
        },
        {
            title: "Doanh thu tổng",
            value: formatCurrency(totalRevenue),
            badge: "Doanh số",
            badgeColor: "bg-[#F2F9F7] text-[#1D7461] border-[#D5EFE8]"
        },
        {
                       
            title: "Đơn hàng hệ thống",
            value: totalOrders.toLocaleString('vi-VN'),
            badge: `${completedOrders} đã giao`,
            badgeColor: "bg-blue-50 text-blue-700 border-blue-200"
        },
        {
            
            title: "Sản phẩm tồn kho",
            value: inStock.toLocaleString('vi-VN'),
            badge: "Khả dụng",
            badgeColor: "bg-teal-50 text-teal-700 border-teal-200"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <span className="text-sm">{card.icon}</span>
                            <span>{card.title}</span>
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between gap-2 mt-1">
                        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {card.value}
                        </div>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${card.badgeColor} shrink-0`}>
                            {card.badge}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;