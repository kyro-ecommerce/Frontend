import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/admin/format.js';

const TopSellingProducts = ({ products = [] }) => {
    // Đảm bảo products là mảng
    const safeProducts = Array.isArray(products) ? products : [];

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-base font-semibold mb-4">Sản phẩm bán chạy</h3>

            {safeProducts.length > 0 ? (
                <div>
                    {safeProducts.map((product) => (
                        <div key={product.id} className="flex items-center py-3 border-b border-gray-200">
                            <div className="w-12.5 h-12.5 rounded-lg bg-gray-100 mr-4 overflow-hidden shrink-0">
                                {product.imageUrl ? (
                                    <img className="w-full h-full object-cover" src={product.imageUrl} alt={product.title || product.name} />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">No image</div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium mb-1 text-sm">{product.title || product.name}</div>
                                <div className="text-blue-600 font-medium text-sm">
                                    {product.discounted_price !== undefined && product.discounted_price < product.price ? (
                                        <>
                                            <span className="text-blue-600 mr-2">{formatCurrency(product.discounted_price)}</span>
                                            <span className="text-gray-400 line-through text-xs">{formatCurrency(product.price)}</span>
                                        </>
                                    ) : (
                                        formatCurrency(product.price)
                                    )}
                                </div>
                                <div className="flex items-center text-yellow-500 text-xs mt-1">
                                    <span className="text-gray-500">| Đã bán: {product.quantitySold || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-5 text-gray-500">
                    Không có dữ liệu sản phẩm bán chạy
                </div>
            )}

            <Link to="/admin/products" className="block text-center mt-4 text-blue-600 font-medium no-underline p-2 rounded-lg hover:bg-gray-100 transition-colors">
                Xem tất cả sản phẩm
            </Link>
        </div>
    );
};

export default TopSellingProducts;