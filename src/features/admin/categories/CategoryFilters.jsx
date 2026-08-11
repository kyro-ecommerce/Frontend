import React from "react";

const CategoryFilters = ({
    searchTerm,
    onSearchChange,
    selectedLevel,
    onLevelChange,
    onOpenAddModal
}) => {
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-60">
                    <svg
                        className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm kiếm danh mục theo tên..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D7461]/20 focus:border-[#1D7461] transition-all"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => onSearchChange("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 border-none bg-transparent cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Level Filter Dropdown */}
                <div className="min-w-40">
                    <select
                        value={selectedLevel}
                        onChange={(e) => onLevelChange(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D7461]/20 focus:border-[#1D7461] cursor-pointer transition-all"
                    >
                        <option value="all">Tất cả danh mục</option>
                        <option value="1">Danh mục chính</option>
                        <option value="2">Danh mục con</option>
                    </select>
                </div>
            </div>

            {/* Add Category Primary Button */}
            <button
                onClick={onOpenAddModal}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1D7461] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-[#1D7461]/20 hover:bg-[#155a4b] active:scale-[0.98] transition-all cursor-pointer border-none shrink-0"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                <span>Thêm danh mục</span>
            </button>
        </div>
    );
};

export default CategoryFilters;
