// src/components/features/products/ProductFilters.jsx - Updated
import React, {useCallback, useEffect, useState} from "react";
import "../../../styles/admin/product/products.css";
import { debounce } from 'lodash';

const ProductFilters = ({ onSearch, onCategoryFilter, onSort, sortBy, sortOrder, categories = [], onAddNewClick }) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Sử dụng useCallback để tạo hàm debounced chỉ một lần
    const debouncedSearch = useCallback(
        debounce((term) => {
            onSearch(term);
        }, 500), // 500ms delay
        [onSearch]
    );

    // Gọi tìm kiếm khi searchTerm thay đổi
    useEffect(() => {
        debouncedSearch(searchTerm);
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchTerm, debouncedSearch]);

    return (
        <div className="product-filters">
            <form className="search-form">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm theo tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="search-btn">
                        <span role="img" aria-label="search">🔍</span>
                    </button>
                </div>
            </form>

            <button className="add-product-btn" onClick={onAddNewClick}>
                + Thêm sản phẩm mới
            </button>
        </div>
    );
};

export default ProductFilters;