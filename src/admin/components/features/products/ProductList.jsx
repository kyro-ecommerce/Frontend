import React, { useState } from "react";
import { formatCurrency, formatDate } from "../../../utils/format.js";


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
        if (quantity <= 0) return { label: "Hết hàng", className: "out-of-stock" };
        if (quantity < 20) return { label: "Ít hàng", className: "low-stock" };
        return { label: "Còn hàng", className: "in-stock" };
    };

    return (
        <div className="products-table-container">
            <div className="table-filters">
                <div className="filter-left">
                    <div className="selected-count">
                        Danh sách sản phẩm
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="loading-message">Đang tải dữ liệu sản phẩm...</div>
            ) : products.length === 0 ? (
                <div className="empty-message">Không tìm thấy sản phẩm nào</div>
            ) : (
                <table className="products-table">
                    <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>ID</th>
                        <th>Danh mục</th>
                        <th>Giá bán</th>
                        <th>Trạng thái</th>
                        <th>Ngày thêm</th>
                        <th>Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map((product) => {
                        const stockStatus = getStockStatus(product.quantity || 0);

                        return (
                            <tr key={product.id}>
                                <td>
                                    <div className="product-info">
                                        <div className="product-image">
                                            {product.imageUrls && product.imageUrls.length > 0 ? (
                                                <img src={product.imageUrls[0].downloadUrl} alt={product.title} />
                                            ) : (
                                                <div className="product-image-placeholder"></div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="product-name">{product.title}</div>
                                            <div className="product-variant">
                                                {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0
                                                    ? `${product.sizes.length} kích cỡ`
                                                    : "Không có kích cỡ"}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>#{product.id}</td>
                                <td>{product.topLevelCategory || "Chưa phân loại"}</td>
                                <td>
                                    <div className="price-info">
                                        <div className="current-price">{formatCurrency(product.discountedPrice || product.price)}</div>
                                        {product.discountedPrice && product.discountedPrice < product.price && (
                                            <div className="original-price">{formatCurrency(product.price)}</div>
                                        )}
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge-product ${stockStatus.className}`}>
                                        {stockStatus.label}
                                    </span>
                                </td>
                                <td>{formatDate(product.createdAt)}</td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    <div className="product-actions">
                                        <button
                                            className="action-btn view-btn"
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
                                            className="action-btn delete-btn"
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