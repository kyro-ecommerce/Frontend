import React from "react";

const UserStats = ({ stats = {} }) => {
    const cards = [
        {
            title: "Tổng số người dùng",
            value: (stats.totalUsers || 0).toLocaleString('vi-VN'),
            badge: "Tất cả",
            badgeColor: "bg-blue-50 text-blue-700 border-blue-200"
        },
        {
            title: "Khách hàng (CUSTOMER)",
            value: (stats.totalCustomers || 0).toLocaleString('vi-VN'),
            badge: "Khách hàng",
            badgeColor: "bg-[#F2F9F7] text-[#1D7461] border-[#D5EFE8]"
        },
        {
            title: "Quản trị viên (ADMIN)",
            value: (stats.totalAdmins || 0).toLocaleString('vi-VN'),
            badge: "Quản trị",
            badgeColor: "bg-purple-50 text-purple-700 border-purple-200"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
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

export default UserStats;