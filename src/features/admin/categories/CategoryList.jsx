import React, { useState } from "react";
import { translateCategoryName } from "../../../utils/admin/format.js";
import { Plus, Pencil, Trash2 } from "lucide-react";

const CategoryList = ({
    categories,
    isLoading,
    onEditCategory,
    onDeleteCategory,
    onAddSubCategory
}) => {
    // Keep track of collapsed/expanded parent category IDs
    const [expandedCategories, setExpandedCategories] = useState({});

    const toggleExpand = (catId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [catId]: !prev[catId]
        }));
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-[#1D7461] mb-3"></div>
                <p className="text-sm font-medium text-slate-500">Đang tải danh sách danh mục...</p>
            </div>
        );
    }

    if (!categories || categories.length === 0) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Không tìm thấy danh mục nào</h3>
                <p className="text-xs text-slate-500">Hãy thử thay đổi từ khóa tìm kiếm hoặc thêm danh mục mới.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                            <th className="py-3.5 px-4 w-12 text-center">#</th>
                            <th className="py-3.5 px-4">Tên danh mục</th>
                            <th className="py-3.5 px-4 text-center">Số sản phẩm</th>
                            <th className="py-3.5 px-4 text-right pr-6">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                        {categories.map((parent, index) => {
                            const isExpanded = expandedCategories[parent.categoryId] !== false; // expanded by default
                            const subCats = parent.subCategories || [];
                            const hasSub = subCats.length > 0;

                            return (
                                <React.Fragment key={parent.categoryId || index}>
                                    {/* Parent Category Row */}
                                    <tr className="hover:bg-slate-50/60 transition-colors group bg-white">
                                        <td className="py-3.5 px-4 text-center font-semibold text-slate-400">
                                            {index + 1}
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex items-center gap-2.5">
                                                {hasSub ? (
                                                    <button
                                                        onClick={() => toggleExpand(parent.categoryId)}
                                                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all cursor-pointer border-none p-0"
                                                        title={isExpanded ? "Thu gọn" : "Mở rộng"}
                                                    >
                                                        <svg
                                                            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <div className="w-6 h-6 flex items-center justify-center text-slate-300">
                                                        •
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-[#1D7461]/10 text-[#1D7461] flex items-center justify-center font-black text-xs shrink-0">
                                                        {parent.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">
                                                            {translateCategoryName(parent.name)}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-mono">
                                                            ID: {parent.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center">
                                            <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs">
                                                {parent.productCount || 0}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => onAddSubCategory(parent)}
                                                    className="h-8 px-2.5 rounded-xl bg-emerald-50 text-[#1D7461] hover:bg-emerald-100 font-bold text-xs transition-all cursor-pointer border-none flex items-center gap-1"
                                                    title="Thêm danh mục con"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span className="hidden sm:inline">Thêm con</span>
                                                </button>
                                                <button
                                                    onClick={() => onEditCategory(parent)}
                                                    className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer flex items-center justify-center transition-all border-none"
                                                    title="Chỉnh sửa danh mục"
                                                >
                                                    <Pencil className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => onDeleteCategory(parent)}
                                                    className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer flex items-center justify-center transition-all border-none"
                                                    title="Xóa danh mục"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* Subcategories Rows */}
                                    {isExpanded && subCats.map((sub) => (
                                        <tr key={sub.categoryId || sub.name} className="bg-slate-50/40 hover:bg-slate-100/50 transition-colors">
                                            <td className="py-2.5 px-4 text-center text-slate-300">
                                                └
                                            </td>
                                            <td className="py-2.5 px-4 pl-12">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                                    <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                                                        {translateCategoryName(sub.name)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        ({sub.name})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4 text-center">
                                                <span className="inline-block px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-medium">
                                                    {sub.productCount || 0}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-4 text-right pr-6">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => onEditCategory(sub)}
                                                        className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer flex items-center justify-center transition-all border-none"
                                                        title="Chỉnh sửa danh mục con"
                                                    >
                                                        <Pencil className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDeleteCategory(sub)}
                                                        className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer flex items-center justify-center transition-all border-none"
                                                        title="Xóa danh mục con"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryList;
