import React from "react";

const CategoryStats = ({ stats }) => {
    const { totalCategories = 0, level1Count = 0, level2Count = 0, totalProducts = 0 } = stats || {};

    const statCards = [
        {
            title: "Tổng số danh mục",
            value: totalCategories,
            subText: "Tất cả danh mục",
            icon: (
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            bg: "bg-emerald-50 border-emerald-100",
            iconBg: "bg-emerald-100/80"
        },
        {
            title: "Danh mục chính",
            value: level1Count,
            subText: "Phân loại tổng quan",
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
            ),
            bg: "bg-blue-50 border-blue-100",
            iconBg: "bg-blue-100/80"
        },
        {
            title: "Danh mục con",
            value: level2Count,
            subText: "Phân loại chi tiết",
            icon: (
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 11h.01M7 15h.01M11 7h8M11 11h8M11 15h8" />
                </svg>
            ),
            bg: "bg-purple-50 border-purple-100",
            iconBg: "bg-purple-100/80"
        },
        {
            title: "Tổng sản phẩm",
            value: totalProducts,
            subText: "Đang phân loại",
            icon: (
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            bg: "bg-amber-50 border-amber-100",
            iconBg: "bg-amber-100/80"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${card.bg} transition-all duration-200 hover:shadow-md`}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{card.title}</span>
                        <div className={`p-2 rounded-xl ${card.iconBg}`}>
                            {card.icon}
                        </div>
                    </div>
                    <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900">{card.value}</span>
                        <span className="text-xs font-medium text-slate-500">{card.subText}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CategoryStats;
