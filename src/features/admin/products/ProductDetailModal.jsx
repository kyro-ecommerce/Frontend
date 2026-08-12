// src/components/features/products/ProductDetailModal.jsx
import React from "react";
import { formatCurrency, formatDateTime } from "../../../utils/admin/formatters";

const ProductDetailModal = ({ product, onClose, onEdit }) => {
    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100" onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex justify-between items-center py-4 px-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="m-0 text-base font-extrabold text-slate-900 tracking-tight">Chi tiết sản phẩm</h2>
                    <button
                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center border-none cursor-pointer transition-all font-bold text-sm"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-6">
                        <div className="flex flex-col gap-3">
                            {(() => {
                                const imagesList = (product.imageUrls && product.imageUrls.length > 0)
                                    ? product.imageUrls
                                    : (product.images || []);
                                const mainImg = imagesList[0]?.downloadUrl || imagesList[0]?.url || (typeof imagesList[0] === 'string' ? imagesList[0] : null) || '/Placeholder2.png';
                                
                                return (
                                    <>
                                        <div className="w-full h-64 rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-50 p-2 flex items-center justify-center">
                                            <img className="w-full h-full object-contain rounded-xl" src={mainImg} alt={product.title} />
                                        </div>
                                        {imagesList.length > 1 && (
                                            <div className="flex gap-2 overflow-x-auto pb-1">
                                                {imagesList.slice(0, 5).map((image, index) => {
                                                    const imgUrl = image.downloadUrl || image.url || (typeof image === 'string' ? image : '');
                                                    return (
                                                        <div key={index} className="w-14 h-14 rounded-xl border border-slate-200 cursor-pointer overflow-hidden shrink-0">
                                                            <img className="w-full h-full object-cover" src={imgUrl} alt={`${product.title} - ${index + 1}`} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        <div className="flex flex-col space-y-4">
                            <div>
                                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight m-0">{product.title}</h3>
                                <span className="inline-block mt-2 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200/60">
                                    ID: #{product.id}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                                <div>
                                    <span className="text-slate-400 font-bold block mb-0.5">Danh mục</span>
                                    <span className="font-bold text-slate-800">{product.topLevelCategory || "Chưa phân loại"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold block mb-0.5">Ngày thêm</span>
                                    <span className="font-bold text-slate-800">{formatDateTime(product.createdAt)}</span>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-3">
                                {product.discountedPrice && product.discountedPrice < product.price ? (
                                    <>
                                        <span className="text-2xl font-extrabold text-[#1D7461]">{formatCurrency(product.discountedPrice)}</span>
                                        <span className="text-xs font-bold text-slate-400 line-through">{formatCurrency(product.price)}</span>
                                    </>
                                ) : (
                                    <span className="text-2xl font-extrabold text-[#1D7461]">{formatCurrency(product.price)}</span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 text-xs">
                                <div>
                                    <span className="text-slate-400 font-bold block mb-0.5">Tồn kho</span>
                                    <span className="font-extrabold text-slate-800 text-sm">{product.quantity || 0} sản phẩm</span>
                                </div>
                                <div>
                                    <span className="text-slate-400 font-bold block mb-0.5">Đã bán</span>
                                    <span className="font-extrabold text-[#1D7461] text-sm">{product.quantitySold || 0} sản phẩm</span>
                                </div>
                            </div>

                            {product.sizes && product.sizes.length > 0 && (
                                <div>
                                    <span className="text-xs font-extrabold text-slate-700 block mb-2">Kích cỡ có sẵn</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {product.sizes.map((size, index) => {
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
                                                <span key={index} className="py-1 px-3 bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-extrabold text-slate-700">
                                                    {displayText}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2 pb-1 border-b border-slate-100">Mô tả sản phẩm</h4>
                        <div className="text-xs font-medium text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                            {product.description || "Không có mô tả chi tiết cho sản phẩm này."}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end items-center gap-3 p-4 px-6 border-t border-slate-100 bg-slate-50/50">
                    <button className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200/80" onClick={onClose}>
                        Đóng
                    </button>
                    {onEdit && (
                        <button
                            className="px-5 py-2.5 rounded-xl bg-[#1D7461] hover:bg-[#136050] text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-[#1D7461]/20 border-none"
                            onClick={() => {
                                onClose();
                                onEdit(product);
                            }}
                        >
                            Chỉnh sửa sản phẩm
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
