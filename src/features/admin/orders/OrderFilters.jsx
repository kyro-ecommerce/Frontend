import React, { useState } from "react";
import { Search, Calendar, RotateCcw, Filter } from "lucide-react";

const OrderFilters = ({
    onSearch,
    onResetAllFilters
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [activePreset, setActivePreset] = useState("all");

    // Handle search submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm, startDate, endDate);
    };

    // Apply quick date preset
    const handlePresetSelect = (presetKey) => {
        setActivePreset(presetKey);
        const today = new Date();
        let start = "";
        let end = today.toISOString().split("T")[0];

        if (presetKey === "7days") {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            start = d.toISOString().split("T")[0];
        } else if (presetKey === "30days") {
            const d = new Date();
            d.setDate(d.getDate() - 30);
            start = d.toISOString().split("T")[0];
        } else if (presetKey === "thisMonth") {
            const d = new Date(today.getFullYear(), today.getMonth(), 1);
            start = d.toISOString().split("T")[0];
        } else if (presetKey === "all") {
            start = "";
            end = "";
        }

        setStartDate(start);
        setEndDate(end);
        onSearch(searchTerm, start, end);
    };

    // Manual date filter click
    const handleManualDateFilter = () => {
        setActivePreset("custom");
        onSearch(searchTerm, startDate, endDate);
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSearchTerm("");
        setStartDate("");
        setEndDate("");
        setActivePreset("all");
        onResetAllFilters();
    };

    const datePresets = [
        { key: "all", label: "Tất cả thời gian" },
        { key: "7days", label: "7 ngày qua" },
        { key: "30days", label: "30 ngày qua" },
        { key: "thisMonth", label: "Tháng này" },
    ];

    return (
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
            {/* Top Row: Search input + Segmented Date Presets */}
            <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
                {/* Search Bar */}
                <form className="flex-1 max-w-xl" onSubmit={handleSearchSubmit}>
                    <div className="relative flex items-center">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm mã đơn (#101), tên khách hàng, số điện thoại..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                            }}
                            className="w-full py-2.5 pr-9 pl-10 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all placeholder-slate-400 shadow-2xs"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchTerm("");
                                    onSearch("", startDate, endDate);
                                }}
                                className="absolute right-3 text-slate-400 hover:text-slate-600 text-xs border-none bg-transparent cursor-pointer p-1"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </form>

                {/* Quick Date Presets Segmented Pills */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
                    {datePresets.map((preset) => (
                        <button
                            key={preset.key}
                            type="button"
                            onClick={() => handlePresetSelect(preset.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer whitespace-nowrap ${
                                activePreset === preset.key
                                    ? "bg-[#1D7461] text-white shadow-sm shadow-[#1D7461]/20"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Row: Custom Date Range Picker & Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-200/60">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500 font-extrabold uppercase text-[11px] tracking-wider">
                        <Calendar className="w-3.5 h-3.5 text-[#1D7461]" />
                        <span>Khoảng ngày:</span>
                    </span>
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="text-xs font-semibold text-slate-700 border-none outline-none bg-transparent cursor-pointer"
                        />
                        <span className="text-slate-400 font-bold">→</span>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="text-xs font-semibold text-slate-700 border-none outline-none bg-transparent cursor-pointer"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleManualDateFilter}
                        className="px-3.5 py-1.5 bg-[#1D7461] hover:bg-[#155a4b] text-white rounded-xl text-xs font-bold border-none cursor-pointer transition-all shadow-xs flex items-center gap-1"
                    >
                        <Filter className="w-3 h-3" />
                        <span>Lọc ngày</span>
                    </button>
                </div>

                {/* Reset Filters */}
                <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-200 shadow-2xs flex items-center gap-1.5 ml-auto"
                >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Đặt lại bộ lọc</span>
                </button>
            </div>
        </div>
    );
};

export default OrderFilters;
