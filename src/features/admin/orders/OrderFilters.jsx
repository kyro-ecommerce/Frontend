import { useState } from "react";
import {Search} from "lucide-react";

const OrderFilters = ({
    currentFilter,
    onFilterChange,
    onSearch,
    paymentMethod,
    onPaymentMethodChange,
    paymentStatus,
    onPaymentStatusChange
}) => {
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
        onFilterChange("all");
        onPaymentMethodChange("all");
        onPaymentStatusChange("all");
        onSearch("", "", "");
    };

    const filterTabs = [
        { key: "all", label: "Tất cả" },
        { key: "pending", label: "Chờ xử lý" },
        { key: "confirmed", label: "Đã xác nhận" },
        { key: "shipped", label: "Đang vận chuyển" },
        { key: "delivered", label: "Đã giao" },
        { key: "cancelled", label: "Đã hủy" }
    ];

    return (
        <div className="space-y-4">
            {/* Segmented Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-50 border border-slate-200/80 rounded-2xl scrollbar-hide">
                {filterTabs.map((tab) => {
                    const isActive = currentFilter === tab.key;
                    return (
                        <button
                            key={tab.key}
                            className={`py-2 px-3.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap border-none ${
                                isActive
                                    ? "bg-[#1D7461] text-white shadow-sm shadow-[#1D7461]/20"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
                            }`}
                            onClick={() => onFilterChange(tab.key)}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Search and Date Filter Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                <form className="w-full sm:max-w-xs" onSubmit={handleSearchSubmit}>
                    <div className="relative w-full flex items-center">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm đơn hàng..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full py-2.5 pr-4 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all"
                        />
                    </div>
                </form>

                <div className="flex flex-wrap gap-2 items-center">
                    <select
                        value={paymentMethod}
                        onChange={(e) => onPaymentMethodChange(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#1D7461]/20"
                    >
                        <option value="all">Mọi phương thức</option>
                        <option value="COD">COD</option>
                        <option value="VNPAY">VNPAY</option>
                    </select>
                    <select
                        value={paymentStatus}
                        onChange={(e) => onPaymentStatusChange(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#1D7461]/20"
                    >
                        <option value="all">Mọi thanh toán</option>
                        <option value="PENDING">Chờ thanh toán</option>
                        <option value="COMPLETED">Đã thanh toán</option>
                        <option value="FAILED">Thanh toán thất bại</option>
                        <option value="CANCELLED">Đã hủy thanh toán</option>
                        <option value="REFUNDED">Đã hoàn tiền</option>
                    </select>
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                        <input
                            type="date"
                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#1D7461]/20"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-slate-400 text-xs font-bold">đến</span>
                        <input
                            type="date"
                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#1D7461]/20"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button className="px-3.5 py-2 bg-[#1D7461] hover:bg-[#136050] text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm shadow-[#1D7461]/20 border-none" onClick={handleDateFilter}>Lọc</button>
                    <button className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-200/80" onClick={handleClearFilters}>Xóa bộ lọc</button>
                </div>
            </div>
        </div>
    );
};

export default OrderFilters;
