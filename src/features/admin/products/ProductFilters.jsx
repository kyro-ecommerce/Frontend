// src/components/features/products/ProductFilters.jsx - Updated
import React, {useCallback, useEffect, useState} from "react";
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
        <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
            <form className="flex-1 max-w-125" onSubmit={(e) => e.preventDefault()}>
                <div className="relative w-full max-w-100">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm theo tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 px-4 pr-10 border border-gray-300 rounded text-[15px] outline-none transition-colors focus:border-blue-500"
                    />
                    <button type="submit" className="absolute right-0 top-0 w-10 h-10 bg-transparent border-none text-gray-500 flex items-center justify-center cursor-pointer transition-colors hover:text-blue-500">
                        <span role="img" aria-label="search">🔍</span>
                    </button>
                </div>
            </form>

            <button className="h-10 px-6 bg-blue-600 text-white rounded font-medium cursor-pointer transition-colors border-none hover:bg-blue-700 whitespace-nowrap" onClick={onAddNewClick}>
                + Thêm sản phẩm mới
            </button>
        </div>
    );
};

export default ProductFilters;