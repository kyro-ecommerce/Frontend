import React, { useState, useCallback, useEffect } from "react";
import { debounce } from 'lodash';
import { Search } from "lucide-react";

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
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row min-w-75 md:min-w-150 w-full gap-3 items-center">
                <form className="flex-1 w-full max-w-full md:max-w-md" onSubmit={handleSearchSubmit}>
                    <div className="relative w-full flex items-center">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo email hoặc tên..."
                            value={searchTerm}
                            onChange={handleSearchInput}
                            className="w-full py-2.5 pr-4 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all"
                        />
                    </div>
                </form>

                <div className="w-full md:w-auto">
                    <select
                        value={selectedRole}
                        onChange={handleRoleChange}
                        className="w-full md:w-auto py-2.5 px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white cursor-pointer outline-none focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all"
                    >
                        <option value="" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Tất cả vai trò</option>
                        <option value="CUSTOMER" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Khách hàng</option>
                        <option value="ADMIN" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Quản trị viên</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default UserFilters;