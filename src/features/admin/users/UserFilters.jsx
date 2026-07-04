import React, { useState, useCallback, useEffect } from "react";
import { debounce } from 'lodash';

const UserFilters = ({ onSearch, onRoleFilter, selectedRole }) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Tạo hàm debounce cho việc tìm kiếm
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce((term) => {
            onSearch(term);
        }, 500),
        [onSearch]
    );

    // Xử lý khi người dùng nhập vào ô tìm kiếm
    const handleSearchInput = (e) => {
        const term = e.target.value;
        setSearchTerm(term);
        debouncedSearch(term);
    };

    // Xử lý khi người dùng submit form tìm kiếm
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    // Xử lý khi thay đổi lọc theo vai trò
    const handleRoleChange = (e) => {
        onRoleFilter(e.target.value);
    };

    // Xử lý xóa bộ lọc
    const handleClearFilters = () => {
        setSearchTerm("");
        onRoleFilter("");
        onSearch("");
    };

    // Hủy debounce khi component unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex flex-col md:flex-row min-w-75 md:min-w-150 w-full gap-4 md:gap-0 items-center">
                <form className="flex-1 w-full max-w-full md:max-w-137.5" onSubmit={handleSearchSubmit}>
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo email hoặc tên..."
                            value={searchTerm}
                            onChange={handleSearchInput}
                            className="w-full py-2.5 pr-4 pl-9 border border-gray-300 rounded text-sm font-sans outline-none focus:border-blue-500 transition-colors"
                        />
                        <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-gray-500 cursor-pointer">
                            <span role="img" aria-label="search">🔍</span>
                        </button>
                    </div>
                </form>

                <div className="md:ml-4 w-full md:w-auto">
                    <select
                        value={selectedRole}
                        onChange={handleRoleChange}
                        className="w-full md:w-auto py-2.5 px-4 border border-gray-300 rounded text-sm bg-white cursor-pointer font-sans outline-none focus:border-blue-500 transition-colors"
                    >
                        <option value="">Tất cả user</option>
                        <option value="CUSTOMER">Khách hàng</option>
                        <option value="SELLER">Người bán</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default UserFilters;