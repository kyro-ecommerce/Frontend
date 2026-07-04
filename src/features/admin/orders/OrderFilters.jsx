import { useEffect, useState, useCallback } from "react";
import { debounce } from 'lodash';

const OrderFilters = ({ currentFilter, onFilterChange, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Handle search submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm, startDate, endDate);
    };

    // Handle search input change (trigger search on Enter or button click)
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Handle date filter
    const handleDateFilter = () => {
        onSearch(searchTerm, startDate, endDate);
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setStartDate("");
        setEndDate("");
        onSearch("", "", "");
    };

    return (
        <div className="mb-6">
            <div className="flex overflow-x-auto border-b border-gray-200 mb-5 pb-1 gap-1 md:gap-0 scrollbar-hide">
                <button
                    className={`py-2.5 px-4 bg-transparent border-none text-[15px] font-medium cursor-pointer border-b-2 transition-colors whitespace-nowrap ${currentFilter === "all" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-800"}`}
                    onClick={() => onFilterChange("all")}
                >
                    Tất cả
                </button>
                <button
                    className={`py-2.5 px-4 bg-transparent border-none text-[15px] font-medium cursor-pointer border-b-2 transition-colors whitespace-nowrap ${currentFilter === "pending" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-800"}`}
                    onClick={() => onFilterChange("pending")}
                >
                    Chờ xác nhận
                </button>
                <button
                    className={`py-2.5 px-4 bg-transparent border-none text-[15px] font-medium cursor-pointer border-b-2 transition-colors whitespace-nowrap ${currentFilter === "confirmed" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-800"}`}
                    onClick={() => onFilterChange("confirmed")}
                >
                    Đã xác nhận
                </button>
                <button
                    className={`py-2.5 px-4 bg-transparent border-none text-[15px] font-medium cursor-pointer border-b-2 transition-colors whitespace-nowrap ${currentFilter === "shipped" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-800"}`}
                    onClick={() => onFilterChange("shipped")}
                >
                    Đang giao
                </button>
                <button
                    className={`py-2.5 px-4 bg-transparent border-none text-[15px] font-medium cursor-pointer border-b-2 transition-colors whitespace-nowrap ${currentFilter === "delivered" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-800"}`}
                    onClick={() => onFilterChange("delivered")}
                >
                    Đã giao
                </button>
                <button
                    className={`py-2.5 px-4 bg-transparent border-none text-[15px] font-medium cursor-pointer border-b-2 transition-colors whitespace-nowrap ${currentFilter === "cancelled" ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-800"}`}
                    onClick={() => onFilterChange("cancelled")}
                >
                    Đã hủy
                </button>
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                <form className="w-full max-w-full lg:max-w-100" onSubmit={handleSearchSubmit}>
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Tìm kiếm đơn hàng..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full py-2.5 px-4 pl-9 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 transition-colors"
                        />
                        <button type="submit" className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-gray-500 cursor-pointer">
                            🔍
                        </button>
                    </div>
                </form>

                <div className="flex flex-wrap gap-2 items-center">
                    <input
                        type="date"
                        placeholder="Từ ngày"
                        className="py-2.5 px-3 border border-gray-300 rounded text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                        type="date"
                        placeholder="Đến ngày"
                        className="py-2.5 px-3 border border-gray-300 rounded text-sm text-gray-800 outline-none focus:border-blue-500 transition-colors"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <button className="py-2.5 px-4 bg-white border border-gray-300 rounded text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors text-gray-700" onClick={handleDateFilter}>Lọc</button>
                    <button className="py-2.5 px-4 bg-white border border-gray-300 rounded text-sm font-medium flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors text-gray-700" onClick={handleClearFilters}>Xóa bộ lọc</button>
                </div>
            </div>
        </div>
    );
};

export default OrderFilters;