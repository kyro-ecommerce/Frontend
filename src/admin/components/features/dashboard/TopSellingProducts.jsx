import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/format.js';

const TopSellingProducts = ({ products = [] }) => {
    // Đảm bảo products là mảng
    const safeProducts = Array.isArray(products) ? products : [];

    return (
        <div className="top-selling-card">
            <h3 className="card-title">Sản phẩm bán chạy</h3>

            {safeProducts.length > 0 ? (
                <div className="top-products-list">
                    {safeProducts.map((product) => (
                        <div key={product.id} className="top-product-item">
                            <div className="top-product-img">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.title || product.name} />
                                ) : (
                                    <div className="placeholder-img">No image</div>
                                )}
                            </div>
                            <div className="top-product-info">
                                <div className="top-product-name">{product.title || product.name}</div>
                                <div className="top-product-price">
                                    {product.discounted_price !== undefined && product.discounted_price < product.price ? (
                                        <>
                                            <span className="discounted-price">{formatCurrency(product.discounted_price)}</span>
                                            <span className="original-price">{formatCurrency(product.price)}</span>
                                        </>
                                    ) : (
                                        formatCurrency(product.price)
                                    )}
                                </div>
                                <div className="top-product-rating">
                                    <span className="sold-count">| Đã bán: {product.quantitySold || 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-data" style={{ textAlign: 'center', padding: '20px', color: 'var(--secondary-color)' }}>
                    Không có dữ liệu sản phẩm bán chạy
                </div>
            )}

            <Link to="/admin/products" className="view-all">
                Xem tất cả sản phẩm
            </Link>
        </div>
    );
};

export default TopSellingProducts;