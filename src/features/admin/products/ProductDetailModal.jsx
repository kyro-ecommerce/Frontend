// src/components/features/products/ProductDetailModal.jsx
import React from "react";
import { formatCurrency, formatDateTime } from "../../../utils/admin/formatters";

const ProductDetailModal = ({ product, onClose, onEdit }) => {
    if (!product) return null;

    return (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/50 flex items-center justify-center z-1000" onClick={onClose}>
            <div className="relative bg-white w-[90%] max-w-250 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.2)] max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center py-4 px-6 border-b border-gray-200">
                    <h2 className="m-0 text-blue-600 text-xl font-bold">Chi tiết sản phẩm</h2>
                    <button className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-blue-600 transition-colors" onClick={onClose}>×</button>
                </div>

                <div className="p-5 px-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6 mb-6">
                        <div className="flex flex-col gap-3">
                            {product.imageUrls && product.imageUrls.length > 0 ? (
                                <div className="w-full h-75 rounded-lg overflow-hidden">
                                    <img className="w-full h-full object-contain bg-gray-50" src={product.imageUrls[0].downloadUrl} alt={product.title} />
                                </div>
                            ) : (
                                <div className="w-full h-75 flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg italic">Không có ảnh</div>
                            )}

                            {product.imageUrls && product.imageUrls.length > 1 && (
                                <div className="flex gap-2.5 overflow-x-auto pb-1">
                                    {product.imageUrls.slice(0, 5).map((image, index) => (
                                        <div key={index} className="w-15 h-15 rounded border-2 border-transparent cursor-pointer overflow-hidden shrink-0">
                                            <img className="w-full h-full object-cover" src={image.downloadUrl} alt={`${product.title} - ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <h3 className="mt-0 mb-4 text-2xl text-gray-800 font-bold">{product.title}</h3>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-6 mb-5">
                                <div className="flex items-start">
                                    <div className="font-medium text-gray-500 min-w-30">Mã sản phẩm:</div>
                                    <div className="text-gray-800">#{product.id}</div>
                                </div>
                                <div className="flex items-start">
                                    <div className="font-medium text-gray-500 min-w-30">Danh mục:</div>
                                    <div className="text-gray-800">{product.topLevelCategory || "Chưa phân loại"}</div>
                                </div>
                                <div className="flex items-start">
                                    <div className="font-medium text-gray-500 min-w-30">Ngày thêm:</div>
                                    <div className="text-gray-800">{formatDateTime(product.createdAt)}</div>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-start">
                                    <div className="font-medium text-gray-500 min-w-30">Giá gốc:</div>
                                    <div className="text-sm font-medium text-gray-500 line-through">{formatCurrency(product.price)}</div>
                                </div>
                                {product.discountedPrice && product.discountedPrice < product.price && (
                                    <div className="flex items-start mt-2">
                                        <div className="font-medium text-gray-500 min-w-30">Giá khuyến mãi:</div>
                                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(product.discountedPrice)}</div>
                                    </div>
                                )}
                            </div>

                            <div className="my-4 py-4 border-y border-gray-200 flex gap-6">
                                <div className="flex items-start">
                                    <div className="font-medium text-gray-500 min-w-30">Tồn kho:</div>
                                    <div className="text-gray-800">{product.quantity || 0} sản phẩm</div>
                                </div>
                                <div className="flex items-start">
                                    <div className="font-medium text-gray-500 min-w-30">Đã bán:</div>
                                    <div className="text-gray-800">{product.quantitySold || 0} sản phẩm</div>
                                </div>
                            </div>

                            {product.sizes && product.sizes.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="mt-0 mb-3 text-base text-gray-800 font-bold">Các kích cỡ:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {product.sizes.map((size, index) => {
                                            // Handle ProductSizeDTO structure: {name, quantity}
                                            let displayText = '';
                                            if (typeof size === 'object' && size !== null) {
                                                displayText = size.name || 'Unknown Size';
                                                if (size.quantity !== undefined) {
                                                    displayText += ` (${size.quantity})`;
                                                }
                                            } else {
                                                displayText = String(size);
                                            }

                                            return (
                                                <span key={index} className="inline-block py-1 px-3 bg-gray-100 rounded text-sm text-gray-800">
                                                    {displayText}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6">
                        <h4 className="mt-0 mb-3 text-base text-gray-800 font-bold border-b border-gray-200 pb-2">Mô tả sản phẩm</h4>
                        <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {product.description || "Không có mô tả chi tiết cho sản phẩm này."}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end py-4 px-6 border-t border-gray-200 gap-3">
                    <button className="py-2.5 px-5 rounded bg-gray-100 text-gray-800 font-medium cursor-pointer border-none transition-colors hover:bg-gray-200" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;