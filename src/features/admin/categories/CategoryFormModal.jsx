import React, { useState, useEffect } from "react";
import { translateCategoryName } from "../../../utils/admin/format.js";

const CategoryFormModal = ({
    isOpen,
    onClose,
    onSave,
    editingCategory,
    parentCategories = [],
    defaultParent = null
}) => {
    const [name, setName] = useState("");
    const [level, setLevel] = useState(1);
    const [parentId, setParentId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (editingCategory) {
            setName(editingCategory.name || "");
            setLevel(editingCategory.level || (editingCategory.parentId ? 2 : 1));
            setParentId(editingCategory.parentId || "");
        } else if (defaultParent) {
            setName("");
            setLevel(2);
            setParentId(defaultParent.categoryId || defaultParent.id || "");
        } else {
            setName("");
            setLevel(1);
            setParentId(parentCategories[0]?.categoryId || "");
        }
        setErrorMessage("");
    }, [editingCategory, defaultParent, isOpen, parentCategories]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setErrorMessage("Vui lòng nhập tên danh mục");
            return;
        }

        if (level === 2 && !parentId) {
            setErrorMessage("Vui lòng chọn danh mục chính trực thuộc");
            return;
        }

        setIsSubmitting(true);
        setErrorMessage("");

        try {
            const result = await onSave({
                name: name.trim(),
                level: parseInt(level, 10),
                parentId: level === 2 ? parentId : null
            });

            if (!result.success) {
                setErrorMessage(result.error || "Không thể lưu thông tin danh mục");
            }
        } catch (err) {
            setErrorMessage("Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-100">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                        <h2 className="text-base font-black text-slate-900 tracking-tight m-0">
                            {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                        </h2>
                        <p className="text-xs font-medium text-slate-500 m-0 mt-0.5">
                            {editingCategory ? "Cập nhật thông tin phân loại sản phẩm" : "Tạo phân loại mới cho sản phẩm"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all border-none cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Error Alert */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Form Inputs */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Category Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Tên danh mục <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ví dụ: Gaming Laptops, iPhone..."
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D7461]/20 focus:border-[#1D7461] transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Level Selector */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Loại danh mục
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setLevel(1)}
                                disabled={Boolean(editingCategory)}
                                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                    level === 1
                                        ? "bg-[#1D7461]/10 border-[#1D7461] text-[#1D7461] shadow-xs"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                } ${editingCategory ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>Danh mục chính</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setLevel(2);
                                    if (!parentId && parentCategories.length > 0) {
                                        setParentId(parentCategories[0].categoryId);
                                    }
                                }}
                                disabled={Boolean(editingCategory)}
                                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                    level === 2
                                        ? "bg-[#1D7461]/10 border-[#1D7461] text-[#1D7461] shadow-xs"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                } ${editingCategory ? "opacity-60 cursor-not-allowed" : ""}`}
                            >
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                <span>Danh mục con</span>
                            </button>
                        </div>
                    </div>

                    {/* Parent Category Select (Only shown if Level 2 / Subcategory) */}
                    {level === 2 && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Thuộc danh mục chính <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={parentId}
                                onChange={(e) => setParentId(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D7461]/20 focus:border-[#1D7461] cursor-pointer transition-all"
                            >
                                <option value="" disabled>-- Chọn danh mục chính --</option>
                                {parentCategories.map((pCat) => (
                                    <option key={pCat.categoryId || pCat.name} value={pCat.categoryId}>
                                        {translateCategoryName(pCat.name)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2.5 rounded-xl bg-[#1D7461] text-white hover:bg-[#155a4b] text-xs font-bold shadow-md shadow-[#1D7461]/20 transition-all cursor-pointer border-none flex items-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Đang lưu...</span>
                                </>
                            ) : (
                                <span>{editingCategory ? "Cập nhật" : "Tạo danh mục"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryFormModal;
