import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/admin/format.js';

const TopSellingProducts = ({ products = [] }) => {
    const safeProducts = Array.isArray(products) ? products : [];

    const getRankBadge = (index) => {
        if (index === 0) return <span className="w-5 h-5 rounded-full bg-[#1D7461] text-white font-black text-[10px] flex items-center justify-center shadow-xs">1</span>;
        if (index === 1) return <span className="w-5 h-5 rounded-full bg-teal-500 text-white font-black text-[10px] flex items-center justify-center shadow-xs">2</span>;
        if (index === 2) return <span className="w-5 h-5 rounded-full bg-teal-200 text-teal-900 font-black text-[10px] flex items-center justify-center shadow-xs">3</span>;
        return <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 font-bold text-[10px] flex items-center justify-center">{index + 1}</span>;
    };

    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] h-full flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 m-0">
                           Sản phẩm bán chạy
                        </h3>
                        <p className="text-xs text-slate-400 font-medium m-0 mt-0.5">Top sản phẩm có doanh số tốt nhất</p>
                    </div>
                    <Link to="/admin/products" className="text-xs font-bold text-[#1D7461] hover:text-[#136050] bg-[#F2F9F7] hover:bg-[#E2F4EE] px-3 py-1.5 rounded-xl transition-all no-underline">
                        Tất cả ➔
                    </Link>
                </div>

                {safeProducts.length > 0 ? (
                    <div className="space-y-3">
                        {safeProducts.map((product, index) => {
                            const img = product.imageUrl || product.imageUrls?.[0]?.imageUrl || product.imageUrls?.[0]?.downloadUrl || product.images?.[0]?.downloadUrl || product.images?.[0]?.url;
                            const title = product.title || product.name;
                            const discountedPrice = product.discountedPrice ?? product.discounted_price;
                            const price = product.price || 0;
                            const sold = product.quantitySold ?? product.quantity_sold ?? 0;
                            const hasDiscount = discountedPrice !== undefined && discountedPrice !== null && discountedPrice < price;

                            return (
                                <div key={product.id || index} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {getRankBadge(index)}
                                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 p-0.5">
                                            {img ? (
                                                <img className="w-full h-full object-cover rounded-md" src={img} alt={title} />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-[10px] text-slate-400">N/A</div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-xs text-slate-800 truncate max-w-36">{title}</div>
                                            <div className="text-xs font-extrabold text-[#1D7461] mt-0.5">
                                                {hasDiscount ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <span>{formatCurrency(discountedPrice)}</span>
                                                        <span className="text-slate-400 line-through text-[10px] font-normal">{formatCurrency(price)}</span>
                                                    </span>
                                                ) : (
                                                    formatCurrency(price)
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="bg-[#F2F9F7] text-[#1D7461] text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0 border border-[#D5EFE8] ml-2">
                                        {sold} đb
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-400 text-xs font-medium">
                        Không có dữ liệu sản phẩm bán chạy
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopSellingProducts;