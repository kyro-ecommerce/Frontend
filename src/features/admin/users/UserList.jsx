import React from "react";
import {formatDate} from "../../../utils/admin/format.js";

const UserList = ({
                      users,
                      isLoading,
                      currentPage,
                      totalPages,
                      onPageChange,
                      onToggleStatus,
                      onChangeRole,
                      onDeleteUser,
                      onViewDetail
                  }) => {


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
                <div className="p-12 text-center text-slate-400 text-xs font-medium">Đang tải dữ liệu người dùng...</div>
            ) : users.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-medium">Không tìm thấy người dùng nào</div>
            ) : (
                <>
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80">
                                    <th className="p-3.5 px-4 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">ID</th>
                                    <th className="p-3.5 px-4 text-left font-extrabold text-slate-400 text-xs uppercase tracking-wider">Email</th>
                                    <th className="p-3.5 px-4 text-left font-extrabold text-slate-400 text-xs uppercase tracking-wider">Họ tên</th>
                                    <th className="p-3.5 px-4 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Vai trò</th>
                                    <th className="p-3.5 px-4 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Ngày đăng ký</th>
                                    <th className="p-3.5 px-4 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Trạng thái</th>
                                    <th className="p-3.5 px-4 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((user) => (
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
                                                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 cursor-pointer flex items-center justify-center transition-all border-none"
                                                    title="Xem"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onViewDetail(user.id);
                                                    }}
                                                >
                                                    <img
                                                        src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                                                        alt="Xem"
                                                        width={16}
                                                        height={16}
                                                    />
                                                </button>
                                                <button
                                                    className="py-1.5 px-3 border-none rounded-xl text-xs font-bold cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteUser(user.id);
                                                    }}
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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