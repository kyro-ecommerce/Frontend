import React, { useState } from "react";
import { formatCurrency, formatDate, translateCategoryName } from "../../../utils/admin/format.js";
import { useConfirm } from "../../../context/ConfirmContext.jsx";
import { Eye, Pencil, Trash2 } from "lucide-react";

const ProductList = ({
                         products = [],
                         isLoading,
                         categories = [],
                         onCategoryFilter,
                         selectedCategory,
                         onSort,
                         sortBy,
                         sortOrder,
                         onView,
                         onEdit,
                         onDelete,
                         onAddProduct,
                         onMultipleDelete,
                         totalElements
                     }) => {
    const confirm = useConfirm();

    // Xác định trạng thái tồn kho
    const getStockStatus = (quantity) => {
        if (quantity <= 0) return { label: "Hết hàng", className: "bg-red-50 text-red-600 border border-red-200" };
        if (quantity < 20) return { label: "Ít hàng", className: "bg-amber-50 text-amber-600 border border-amber-200" };
        return { label: "Còn hàng", className: "bg-[#F2F9F7] text-[#1D7461] border border-[#D5EFE8]" };
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
            <div className="flex justify-between p-4 px-5 border-b border-slate-100 items-center">
                <div className="flex items-center gap-3">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight m-0">
                        Danh sách sản phẩm
                    </h3>
                </div>
                {totalElements != null && (
                    <div className="text-xs font-bold text-slate-500">
                        Hiển thị <span className="text-slate-900 font-extrabold">{products.length}</span> trên <span className="text-slate-900 font-extrabold">{totalElements}</span> sản phẩm
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs font-medium">Đang tải dữ liệu sản phẩm...</div>
            ) : products.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-medium">Không tìm thấy sản phẩm nào</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80">
                                <th className="p-3.5 px-5 text-left font-extrabold text-slate-400 text-xs uppercase tracking-wider">Sản phẩm</th>
                                <th className="p-3.5 px-5 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">ID</th>
                                <th className="p-3.5 px-5 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Danh mục</th>
                                <th className="p-3.5 px-5 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Giá bán</th>
                                <th className="p-3.5 px-5 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Trạng thái</th>
                                <th className="p-3.5 px-5 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Ngày thêm</th>
                                <th className="p-3.5 px-5 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.map((product) => {
                                const stockStatus = getStockStatus(product.totalStock || 0);

                                return (
                                    <tr
                                        key={product.id}
                                        onClick={() => onView && onView(product)}
                                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    >
                                        <td className="p-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 p-0.5">
                                                    {(() => {
                                                        const img = product.imageUrls?.[0]?.downloadUrl || product.imageUrls?.[0]?.url || (typeof product.imageUrls?.[0] === 'string' ? product.imageUrls[0] : null) || product.images?.[0]?.downloadUrl || product.imageUrl || '/Placeholder2.png';
                                                        return <img className="w-full h-full object-cover rounded-lg" src={img} alt={product.title} />;
                                                    })()}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-xs text-slate-800 line-clamp-1">{product.title}</div>
                                                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                                                        {product.variants && Array.isArray(product.variants) && product.variants.length > 0
                                                            ? `${product.variants.length} variants`
                                                            : "Không có kích cỡ"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3.5 px-5 text-center text-xs font-bold text-slate-500">
                                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/60">#{product.id}</span>
                                        </td>
                                        <td className="p-3.5 px-5 text-center text-xs font-semibold text-slate-600">{translateCategoryName(product.topLevelCategory)}</td>
                                        <td className="p-3.5 px-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className="font-extrabold text-xs text-[#1D7461]">{formatCurrency(product.minSalePrice)}</div>
                                                {product.minSalePrice < product.minPrice && (
                                                    <div className="line-through text-slate-400 text-[10px] font-normal m-0">{formatCurrency(product.price)}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3.5 px-5 text-center">
                                            <span className={`inline-block py-1 px-2.5 rounded-lg text-xs font-bold ${stockStatus.className}`}>
                                                {stockStatus.label}
                                            </span>
                                        </td>
                                        <td className="p-3.5 px-5 text-center text-xs font-medium text-slate-500">{formatDate(product.createdAt)}</td>
                                        <td className="p-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex gap-1.5 justify-center">
                                                <button
                                                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center justify-center transition-all border-none"
                                                    title="Xem chi tiết"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onView(product);
                                                    }}
                                                >
                                                    <Eye className="w-4 h-4 text-slate-700" />
                                                </button>
                                                {onEdit && (
                                                    <button
                                                        className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 cursor-pointer flex items-center justify-center transition-all border-none"
                                                        title="Sửa sản phẩm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onEdit(product);
                                                        }}
                                                    >
                                                        <Pencil className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                )}
                                                <button
                                                    className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer flex items-center justify-center transition-all border-none"
                                                    title="Xóa sản phẩm"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        const isConfirmed = await confirm({
                                                            title: "Xóa sản phẩm",
                                                            message: `Bạn có chắc chắn muốn xóa sản phẩm "${product.title}" không?`,
                                                            confirmText: "Xóa sản phẩm",
                                                            cancelText: "Hủy",
                                                            type: "danger"
                                                        });
                                                        if (isConfirmed) {
                                                            onDelete(product.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProductList;
