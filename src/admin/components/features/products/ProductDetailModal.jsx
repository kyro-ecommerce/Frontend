// src/components/features/products/ProductDetailModal.jsx
import React from "react";
import "../../../styles/admin/product/product-detail.css";
import { formatCurrency, formatDateTime } from "../../../utils/formatters";

const ProductDetailModal = ({ product, onClose, onEdit }) => {
    if (!product) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Chi tiết sản phẩm</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="product-detail-grid">
                        <div className="product-image-gallery">
                            {product.imageUrls && product.imageUrls.length > 0 ? (
                                <div className="main-image">
                                    <img src={product.imageUrls[0].downloadUrl} alt={product.title} />
                                </div>
                            ) : (
                                <div className="no-image">Không có ảnh</div>
                            )}

                            {product.imageUrls && product.imageUrls.length > 1 && (
                                <div className="thumbnail-list">
                                    {product.imageUrls.slice(0, 5).map((image, index) => (
                                        <div key={index} className="thumbnail">
                                            <img src={image.downloadUrl} alt={`${product.title} - ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="product-info-section">
                            <h3 className="product-title">{product.title}</h3>
                            <div className="product-meta">
                                <div className="info-group">
                                    <div className="info-label">Mã sản phẩm:</div>
                                    <div className="info-value">#{product.id}</div>
                                </div>
                                <div className="info-group">
                                    <div className="info-label">Danh mục:</div>
                                    <div className="info-value">{product.topLevelCategory || "Chưa phân loại"}</div>
                                </div>
                                <div className="info-group">
                                    <div className="info-label">Ngày thêm:</div>
                                    <div className="info-value">{formatDateTime(product.createdAt)}</div>
                                </div>
                            </div>

                            <div className="product-pricing">
                                <div className="info-group">
                                    <div className="info-label">Giá gốc:</div>
                                    <div className="info-value price">{formatCurrency(product.price)}</div>
                                </div>
                                {product.discountedPrice && product.discountedPrice < product.price && (
                                    <div className="info-group">
                                        <div className="info-label">Giá khuyến mãi:</div>
                                        <div className="info-value discounted-price">{formatCurrency(product.discountedPrice)}</div>
                                    </div>
                                )}
                            </div>

                            <div className="inventory-section">
                                <div className="info-group">
                                    <div className="info-label">Tồn kho:</div>
                                    <div className="info-value">{product.quantity || 0} sản phẩm</div>
                                </div>
                                <div className="info-group">
                                    <div className="info-label">Đã bán:</div>
                                    <div className="info-value">{product.quantitySold || 0} sản phẩm</div>
                                </div>
                            </div>

                            {product.sizes && product.sizes.length > 0 && (
                                <div className="variant-section">
                                    <h4>Các kích cỡ:</h4>
                                    <div className="size-list">
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
                                                <span key={index} className="size-tag">
                                                    {displayText}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="product-description">
                        <h4>Mô tả sản phẩm</h4>
                        <div className="description-content">
                            {product.description || "Không có mô tả chi tiết cho sản phẩm này."}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;