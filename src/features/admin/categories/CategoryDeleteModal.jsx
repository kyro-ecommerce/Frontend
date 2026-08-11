import React, { useState } from "react";
import { translateCategoryName } from "../../../utils/admin/format.js";

const CategoryDeleteModal = ({
    isOpen,
    onClose,
    onConfirmDelete,
    category
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState(null);

    if (!isOpen || !category) return null;

    const hasSubCategories = category.subCategories && category.subCategories.length > 0;

    const handleDelete = async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
            const result = await onConfirmDelete(category.categoryId);
            if (!result.success) setDeleteError(result);
        } catch (err) {
            console.error("Lỗi xóa danh mục:", err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 overflow-hidden text-center">
                {/* Warning Icon */}
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </div>

                {/* Title and Confirmation Text */}
                <h3 className="text-base font-black text-slate-900 mb-1">
                    Xác nhận xóa danh mục?
                </h3>
                <p className="text-xs text-slate-600 mb-4">
                    Bạn có chắc chắn muốn xóa danh mục{" "}
                    <span className="font-bold text-slate-900">
                        "{translateCategoryName(category.name)}"
                    </span>{" "}
                    không?
                </p>

                {/* Warning for subcategories */}
                {hasSubCategories && (
                    <div className="p-3 mb-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs font-semibold text-amber-800 flex items-start gap-2">
                        <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>
                            Danh mục này có chứa <strong>{category.subCategories.length} danh mục con</strong>. Khi xóa danh mục cha, các danh mục con liên quan cũng sẽ bị ảnh hưởng.
                        </span>
                    </div>
                )}

                {deleteError && (
                    <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-left text-xs text-red-700">
                        <strong>{deleteError.error}</strong>
                        {deleteError.blockedCategories?.length > 0 && (
                            <ul className="mt-2 mb-0 pl-4">
                                {deleteError.blockedCategories.map(blocked => (
                                    <li key={blocked.categoryId}>{blocked.name}: {blocked.productCount} sản phẩm</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-3 mt-5">
                    <button
                        onClick={onClose}
                        className="w-1/2 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-1/2 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold shadow-md shadow-red-600/20 transition-all cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Đang xóa...</span>
                            </>
                        ) : (
                            <span>Xóa danh mục</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CategoryDeleteModal;
