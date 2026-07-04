import React, { useState, useCallback, useEffect } from "react";
import "../../../styles/admin/user/users.css";
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
        <div className="user-filters">
            <div className="filter-duo">
                <form className="search-form" onSubmit={handleSearchSubmit}>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo email hoặc tên..."
                            value={searchTerm}
                            onChange={handleSearchInput}
                        />
                        <button type="submit" className="search-btn">
                            <span role="img" aria-label="search">🔍</span>
                        </button>
                    </div>
                </form>

                <div className="filter-dropdown">
                    <select
                        value={selectedRole}
                        onChange={handleRoleChange}
                        className="role-filter"
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