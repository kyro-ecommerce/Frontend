import { useState } from "react";
import { Search, CreditCard, DollarSign, Filter, ArrowUpDown, RotateCcw } from "lucide-react";

const OrderFilters = ({
    currentFilter,
    onFilterChange,
    onSearch,
    paymentMethodFilter = "all",
    onPaymentMethodChange,
    paymentStatusFilter = "all",
    onPaymentStatusChange,
    priceRangeFilter = "all",
    onPriceRangeChange,
    sortBy = "newest",
    onSortByChange,
    onResetAllFilters
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // Handle search submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm, startDate, endDate);
    };

    // Handle search input change
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
        if (onResetAllFilters) {
            onResetAllFilters();
        } else {
            onSearch("", "", "");
        }
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
        <div className="space-y-3.5">
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

            {/* Sub-Filters Row: Payment Method, Payment Status, Price Range, Sort By */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* PTTT Filter */}
                <div className="relative flex items-center">
                    <CreditCard className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                        value={paymentMethodFilter}
                        onChange={(e) => onPaymentMethodChange && onPaymentMethodChange(e.target.value)}
                        className="w-full py-2 pr-7 pl-9 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-[#1D7461] transition-all cursor-pointer appearance-none"
                    >
                        <option value="all">PTTT: Tất cả</option>
                        <option value="COD">COD (Thanh toán khi nhận)</option>
                        <option value="VNPAY">VNPAY (Ví / Thẻ)</option>
                    </select>
                    <span className="absolute right-2.5 text-slate-400 text-[10px] pointer-events-none">▼</span>
                </div>

                {/* Trạng thái Thanh toán Filter */}
                <div className="relative flex items-center">
                    <DollarSign className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                        value={paymentStatusFilter}
                        onChange={(e) => onPaymentStatusChange && onPaymentStatusChange(e.target.value)}
                        className="w-full py-2 pr-7 pl-9 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-[#1D7461] transition-all cursor-pointer appearance-none"
                    >
                        <option value="all">Thanh toán: Tất cả</option>
                        <option value="PENDING">Chờ thanh toán (PENDING)</option>
                        <option value="COMPLETED">Đã thanh toán (COMPLETED)</option>
                        <option value="FAILED">Thanh toán thất bại (FAILED)</option>
                        <option value="REFUNDED">Đã hoàn tiền (REFUNDED)</option>
                    </select>
                    <span className="absolute right-2.5 text-slate-400 text-[10px] pointer-events-none">▼</span>
                </div>

                {/* Khoảng giá Filter */}
                <div className="relative flex items-center">
                    <Filter className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                        value={priceRangeFilter}
                        onChange={(e) => onPriceRangeChange && onPriceRangeChange(e.target.value)}
                        className="w-full py-2 pr-7 pl-9 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-[#1D7461] transition-all cursor-pointer appearance-none"
                    >
                        <option value="all">Giá: Tất cả khoảng giá</option>
                        <option value="under_1m">Dưới 1 triệu</option>
                        <option value="1m_5m">1 triệu - 5 triệu</option>
                        <option value="5m_20m">5 triệu - 20 triệu</option>
                        <option value="above_20m">Trên 20 triệu</option>
                    </select>
                    <span className="absolute right-2.5 text-slate-400 text-[10px] pointer-events-none">▼</span>
                </div>

                {/* Sắp xếp Sort By */}
                <div className="relative flex items-center">
                    <ArrowUpDown className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                        value={sortBy}
                        onChange={(e) => onSortByChange && onSortByChange(e.target.value)}
                        className="w-full py-2 pr-7 pl-9 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 outline-none focus:bg-white focus:border-[#1D7461] transition-all cursor-pointer appearance-none"
                    >
                        <option value="newest">Sắp xếp: Mới nhất</option>
                        <option value="oldest">Sắp xếp: Cũ nhất</option>
                        <option value="price_desc">Giá: Cao ➔ Thấp</option>
                        <option value="price_asc">Giá: Thấp ➔ Cao</option>
                    </select>
                    <span className="absolute right-2.5 text-slate-400 text-[10px] pointer-events-none">▼</span>
                </div>
            </div>

            {/* Search and Date Filter Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-1">
                <form className="w-full sm:max-w-xs" onSubmit={handleSearchSubmit}>
                    <div className="relative w-full flex items-center">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã đơn, email..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full py-2 pr-4 pl-10 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all"
                        />
                    </div>
                </form>

                <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/80">
                        <input
                            type="date"
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#1D7461]/20"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className="text-slate-400 text-xs font-bold">đến</span>
                        <input
                            type="date"
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-[#1D7461]/20"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <button className="px-3.5 py-1.5 bg-[#1D7461] hover:bg-[#136050] text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm shadow-[#1D7461]/20 border-none flex items-center gap-1" onClick={handleDateFilter}>
                        Lọc
                    </button>
                    <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-200/80 flex items-center gap-1" onClick={handleClearFilters}>
                        <RotateCcw className="w-3.5 h-3.5" />
                        Xóa bộ lọc
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderFilters;