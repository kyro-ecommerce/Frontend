import React from "react";
import {formatDate} from "../../../utils/admin/format.js";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Trash2, Filter } from "lucide-react";

const UserList = ({
                      users,
                      isLoading,
                      currentPage,
                      totalPages,
                      onPageChange,
                      onToggleStatus,
                      onChangeRole,
                      onDeleteUser,
                      onViewDetail,
                      selectedRole = "",
                      onRoleFilter,
                      selectedStatus = "all",
                      onStatusFilter,
                      sortBy = "id",
                      sortDir = "asc",
                      onSort
                  }) => {

    const renderSortButton = (field, label) => {
        const isActive = sortBy === field;
        return (
            <button
                type="button"
                onClick={() => onSort && onSort(field)}
                className={`group bg-transparent border-none font-extrabold text-xs tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isActive
                        ? "text-[#1D7461]"
                        : "text-slate-500 hover:text-slate-900"
                }`}
                title={`Sắp xếp theo ${label}`}
            >
                <span>{label}</span>
                {isActive ? (
                    <span className="w-5 h-5 rounded-md bg-[#1D7461]/15 text-[#1D7461] flex items-center justify-center">
                        {sortDir === "desc" ? (
                            <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                            <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                    </span>
                ) : (
                    <span className="w-5 h-5 rounded-md bg-slate-100 group-hover:bg-slate-200 text-slate-400 group-hover:text-slate-700 flex items-center justify-center transition-colors">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                    </span>
                )}
            </button>
        );
    };


    // Tạo một mảng các số trang để hiển thị
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Nếu tổng số trang <= maxPagesToShow, hiển thị tất cả các trang
            for (let i = 0; i < totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Luôn hiển thị trang đầu tiên
            pageNumbers.push(0);

            let startPage = Math.max(1, currentPage - 1);
            let endPage = Math.min(totalPages - 2, currentPage + 1);

            // Thêm "..." nếu trang hiện tại không gần trang đầu tiên
            if (currentPage > 2) {
                pageNumbers.push("...");
            }

            // Thêm các trang ở giữa
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            // Thêm "..." nếu trang hiện tại không gần trang cuối cùng
            if (currentPage < totalPages - 3) {
                pageNumbers.push("...");
            }

            // Luôn hiển thị trang cuối cùng
            pageNumbers.push(totalPages - 1);
        }

        return pageNumbers;
    };

    return (
        <div>
            <div className="flex justify-between pb-3 items-center">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight m-0">
                    Danh sách người dùng
                </h3>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-[#1D7461] mb-3"></div>
                    <p className="text-xs font-medium text-slate-500">Đang tải dữ liệu người dùng...</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                                    {/* ID */}
                                    <th className="py-3.5 px-4 text-center">
                                        {renderSortButton("id", "ID")}
                                    </th>

                                    {/* EMAIL */}
                                    <th className="py-3.5 px-4 text-left">
                                        {renderSortButton("email", "EMAIL")}
                                    </th>

                                    {/* HỌ TÊN */}
                                    <th className="py-3.5 px-4 text-left">
                                        {renderSortButton("name", "HỌ TÊN")}
                                    </th>

                                    {/* VAI TRÒ - INLINE FILTER */}
                                    <th className="py-3.5 px-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs">
                                            <span className="text-slate-600 font-extrabold whitespace-nowrap">VAI TRÒ</span>
                                            <select
                                                value={selectedRole || ""}
                                                onChange={(e) => onRoleFilter && onRoleFilter(e.target.value)}
                                                className="bg-slate-50 hover:bg-slate-100 text-[#1D7461] font-bold text-xs py-0.5 px-1.5 rounded-lg border border-slate-200 outline-none cursor-pointer transition-all"
                                            >
                                                <option value="" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Tất cả</option>
                                                <option value="CUSTOMER" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Khách hàng</option>
                                                <option value="ADMIN" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Quản trị viên</option>
                                            </select>
                                        </div>
                                    </th>

                                    {/* NGÀY ĐĂNG KÝ */}
                                    <th className="py-3.5 px-4 text-center">
                                        {renderSortButton("createdAt", "NGÀY ĐĂNG KÝ")}
                                    </th>

                                    {/* TRẠNG THÁI - INLINE FILTER */}
                                    <th className="py-3.5 px-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs">
                                            <span className="text-slate-600 font-extrabold whitespace-nowrap">TRẠNG THÁI</span>
                                            <select
                                                value={selectedStatus || "all"}
                                                onChange={(e) => onStatusFilter && onStatusFilter(e.target.value)}
                                                className="bg-slate-50 hover:bg-slate-100 text-[#1D7461] font-bold text-xs py-0.5 px-1.5 rounded-lg border border-slate-200 outline-none cursor-pointer transition-all"
                                            >
                                                <option value="all" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Tất cả</option>
                                                <option value="active" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Hoạt động</option>
                                                <option value="banned" className="bg-white text-slate-900" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>Bị khóa</option>
                                            </select>
                                        </div>
                                    </th>

                                    {/* THAO TÁC */}
                                    <th className="py-3.5 px-4 text-center font-extrabold text-slate-700 text-xs uppercase tracking-wider">
                                        THAO TÁC
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-12 text-center">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                                                <Filter className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 mb-0.5">Không tìm thấy người dùng phù hợp</p>
                                            <p className="text-[11px] text-slate-400 m-0">Hãy thử đổi các bộ lọc ở tiêu đề cột hoặc ô tìm kiếm ở trên.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => onViewDetail(user.id)}>
                                            <td className="p-3.5 px-4 text-center">
                                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/60 font-bold text-xs">#{user.id}</span>
                                            </td>
                                            <td className="p-3.5 px-4 text-left font-bold text-xs text-slate-800">{user.email}</td>
                                            <td className="p-3.5 px-4 text-left font-semibold text-xs text-slate-600">
                                                {user.firstName || user.lastName
                                                    ? `${user.firstName || ''} ${user.lastName || ''}`
                                                    : 'Chưa cập nhật'}
                                            </td>
                                            <td className="p-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    value={user.role || "CUSTOMER"}
                                                    onChange={(e) => {
                                                        e.stopPropagation();
                                                        if (onChangeRole) onChangeRole(user.id, e.target.value);
                                                    }}
                                                    className={`py-1 px-3 rounded-full text-xs font-extrabold border cursor-pointer outline-none transition-all ${
                                                        user.role === "ADMIN" ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}
                                                >
                                                    <option value="CUSTOMER">Khách hàng</option>
                                                    <option value="ADMIN">Quản trị viên</option>
                                                </select>
                                            </td>
                                            <td className="p-3.5 px-4 text-center text-xs font-medium text-slate-500">{formatDate(user.createdAt)}</td>
                                            <td className="p-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className={`py-1 px-3 rounded-full text-xs font-extrabold border cursor-pointer transition-all ${
                                                        user.banned ? 'bg-red-50 text-red-600 border-red-200' : 'bg-[#F2F9F7] text-[#1D7461] border-[#D5EFE8]'
                                                    }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onToggleStatus(user.id, !user.banned);
                                                    }}
                                                >
                                                    {user.banned ? 'Bị khóa' : 'Hoạt động'}
                                                </button>
                                            </td>
                                            <td className="p-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex gap-1.5 justify-center">
                                                    <button
                                                        className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer flex items-center justify-center transition-all border-none"
                                                        title="Xem chi tiết"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onViewDetail(user.id);
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4 text-slate-700" />
                                                    </button>
                                                    <button
                                                        className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer flex items-center justify-center transition-all border-none"
                                                        title="Xóa người dùng"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteUser(user.id);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang */}
                    <div className="flex justify-center mt-5">
                        <button
                            className="w-9 h-9 border border-slate-200 bg-white rounded-xl mx-1 cursor-pointer flex items-center justify-center text-xs font-bold disabled:text-slate-300 disabled:cursor-not-allowed transition-all"
                            disabled={currentPage === 0}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            &laquo;
                        </button>

                        {getPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                className={`w-9 h-9 border rounded-xl mx-1 flex items-center justify-center text-xs font-bold transition-all ${
                                    page === currentPage
                                        ? 'bg-[#1D7461] text-white border-[#1D7461] shadow-sm shadow-[#1D7461]/20 cursor-pointer'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer disabled:text-slate-300 disabled:cursor-not-allowed'
                                }`}
                                onClick={() => {
                                    if (typeof page === 'number') {
                                        onPageChange(page);
                                    }
                                }}
                                disabled={typeof page !== 'number'}
                            >
                                {page === '...' ? '...' : page + 1}
                            </button>
                        ))}

                        <button
                            className="w-9 h-9 border border-slate-200 bg-white rounded-xl mx-1 cursor-pointer flex items-center justify-center text-xs font-bold disabled:text-slate-300 disabled:cursor-not-allowed transition-all"
                            disabled={currentPage === totalPages - 1}
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            &raquo;
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserList;