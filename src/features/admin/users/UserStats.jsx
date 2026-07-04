import React from "react";

const UserStats = ({stats}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div className="bg-white p-5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center justify-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Tổng số người dùng</div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalCustomers + stats.totalSellers || 0}</div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center justify-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Khách hàng</div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalCustomers || 0}</div>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-gray-100 flex flex-col items-center justify-center">
                <div className="text-sm text-gray-500 mb-2 font-medium">Người bán</div>
                <div className="text-2xl font-bold text-blue-600 mb-1">{stats.totalSellers || 0}</div>
            </div>
        </div>
    );
};

export default UserStats;