import React, { useState } from "react";
import { formatCurrency, formatDate, translateCategoryName } from "../../../utils/admin/format.js";

const ProductList = ({
                         products,
                         isLoading,
                         categories = [],
                         onCategoryFilter,
                         selectedCategory,
                         onSort,
                         sortBy,
                         sortOrder,
                         onView,
                         onDelete,
                         onMultipleDelete
                     }) => {

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
                                const stockStatus = getStockStatus(product.quantity || 0);

                                return (
                                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                                        <td className="p-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 p-0.5">
                                                    {product.imageUrls && product.imageUrls.length > 0 ? (
                                                        <img className="w-full h-full object-cover rounded-lg" src={product.imageUrls[0].downloadUrl} alt={product.title} />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">N/A</div>
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-bold text-xs text-slate-800 line-clamp-1">{product.title}</div>
                                                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                                                        {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0
                                                            ? `${product.sizes.length} kích cỡ`
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
                                                <div className="font-extrabold text-xs text-[#1D7461]">{formatCurrency(product.discountedPrice || product.price)}</div>
                                                {product.discountedPrice && product.discountedPrice < product.price && (
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
                                                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 cursor-pointer flex items-center justify-center transition-all border-none"
                                                    title="Xem"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onView(product);
                                                    }}
                                                >
                                            <img
                                                src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                                                alt="Xem"
                                                width={20}
                                                height={20}
                                            />
                                                </button>
                                                <button
                                                    className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer flex items-center justify-center transition-all border-none"
                                                    title="Xóa"
                                                    onClick={() => {
                                                        if (window.confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.title}"?`)) {
                                                            onDelete(product.id);
                                                        }
                                                    }}
                                                >
                                            <img
                                                src="https://cdn-icons-png.flaticon.com/512/1214/1214428.png"
                                                alt="Xóa"
                                                width={20}
                                                height={20}
                                            />
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