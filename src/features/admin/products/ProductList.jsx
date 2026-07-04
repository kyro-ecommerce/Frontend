import React, { useState } from "react";
import { formatCurrency, formatDate } from "../../../utils/admin/format.js";

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
        if (quantity <= 0) return { label: "Hết hàng", className: "bg-red-50 text-red-500 border border-red-200" };
        if (quantity < 20) return { label: "Ít hàng", className: "bg-orange-50 text-orange-500 border border-orange-200" };
        return { label: "Còn hàng", className: "bg-blue-50 text-blue-500 border border-blue-200" };
    };

    return (
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="flex justify-between p-4 px-5 border-b border-gray-200 items-center">
                <div className="flex items-center gap-4">
                    <div className="text-xl font-bold text-gray-800">
                        Danh sách sản phẩm
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="p-8 text-center text-gray-500 italic">Đang tải dữ liệu sản phẩm...</div>
            ) : products.length === 0 ? (
                <div className="p-8 text-center text-gray-500 italic">Không tìm thấy sản phẩm nào</div>
            ) : (
                <table className="w-full border-collapse">
                    <thead>
                    <tr>
                        <th className="p-4 px-5 text-center border-b border-gray-200 bg-gray-50 font-medium text-gray-800 text-[15px]">Sản phẩm</th>
                        <th className="p-4 px-5 text-center border-b border-gray-200 bg-gray-50 font-medium text-gray-800 text-[15px]">ID</th>
                        <th className="p-4 px-5 text-center border-b border-gray-200 bg-gray-50 font-medium text-gray-800 text-[15px]">Danh mục</th>
                        <th className="p-4 px-5 text-center border-b border-gray-200 bg-gray-50 font-medium text-gray-800 text-[15px]">Giá bán</th>
                        <th className="p-4 px-5 text-center border-b border-gray-200 bg-gray-50 font-medium text-gray-800 text-[15px]">Trạng thái</th>
                        <th className="p-4 px-5 text-center border-b border-gray-200 bg-gray-50 font-medium text-gray-800 text-[15px]">Ngày thêm</th>
                        <th className="p-4 px-5 text-center border-b border-gray-200 bg-gray-50 font-medium text-gray-800 text-[15px]">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((product) => {
                        const stockStatus = getStockStatus(product.quantity || 0);

                        return (
                            <tr key={product.id} className="hover:bg-gray-50 cursor-pointer">
                                <td className="p-4 px-5 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-15 h-15 rounded overflow-hidden bg-gray-100 shrink-0">
                                            {product.imageUrls && product.imageUrls.length > 0 ? (
                                                <img className="w-full h-full object-cover" src={product.imageUrls[0].downloadUrl} alt={product.title} />
                                            ) : (
                                                <div className="w-full h-full bg-gray-200"></div>
                                            )}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-medium mb-1 text-gray-800">{product.title}</div>
                                            <div className="text-xs text-gray-500">
                                                {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0
                                                    ? `${product.sizes.length} kích cỡ`
                                                    : "Không có kích cỡ"}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 px-5 text-center border-b border-gray-100">#{product.id}</td>
                                <td className="p-4 px-5 text-center border-b border-gray-100">{product.topLevelCategory || "Chưa phân loại"}</td>
                                <td className="p-4 px-5 text-center border-b border-gray-100">
                                    <div className="flex flex-col">
                                        <div className="font-medium text-blue-600">{formatCurrency(product.discountedPrice || product.price)}</div>
                                        {product.discountedPrice && product.discountedPrice < product.price && (
                                            <div className="line-through text-gray-500 text-xs m-0">{formatCurrency(product.price)}</div>
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 px-5 text-center border-b border-gray-100">
                                    <span className={`inline-block py-1 px-2 rounded text-xs font-medium min-w-19.5 ${stockStatus.className}`}>
                                        {stockStatus.label}
                                    </span>
                                </td>
                                <td className="p-4 px-5 text-center border-b border-gray-100">{formatDate(product.createdAt)}</td>
                                <td className="p-4 px-5 text-center border-b border-gray-100" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            className="w-8 h-8 border-none rounded bg-transparent cursor-pointer flex items-center justify-center transition-colors hover:bg-black/5"
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
                                            className="w-8 h-8 border-none rounded bg-transparent cursor-pointer flex items-center justify-center transition-colors hover:bg-black/5"
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
            )}
        </div>
    );
};

export default ProductList;