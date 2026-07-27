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
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-5 mb-5">
            <h2 className="text-lg font-semibold mb-5">Danh sách người dùng</h2>

            {isLoading ? (
                <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
            ) : users.length === 0 ? (
                <div className="p-10 text-center text-gray-500">Không tìm thấy người dùng nào</div>
            ) : (
                <>
                    <table className="w-full border-collapse">
                        <thead>
                        <tr>
                            <th className="p-3 px-4 text-center border-b border-gray-200 font-medium text-gray-500 text-xs">ID</th>
                            <th className="p-3 px-4 text-center border-b border-gray-200 font-medium text-gray-500 text-xs">Email</th>
                            <th className="p-3 px-4 text-center border-b border-gray-200 font-medium text-gray-500 text-xs">Họ tên</th>
                            <th className="p-3 px-4 text-center border-b border-gray-200 font-medium text-gray-500 text-xs">Vai trò</th>
                            <th className="p-3 px-4 text-center border-b border-gray-200 font-medium text-gray-500 text-xs">Ngày đăng ký</th>
                            <th className="p-3 px-4 text-center border-b border-gray-200 font-medium text-gray-500 text-xs">Trạng thái</th>
                            <th className="p-3 px-4 text-center border-b border-gray-200 font-medium text-gray-500 text-xs">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 px-4 text-center border-b border-gray-200">{user.id}</td>
                                <td className="p-3 px-4 text-center border-b border-gray-200">{user.email}</td>
                                <td className="p-3 px-4 text-center border-b border-gray-200">
                                    {user.firstName || user.lastName
                                        ? `${user.firstName || ''} ${user.lastName || ''}`
                                        : 'Chưa cập nhật'}
                                </td>
                                <td className="p-3 px-4 text-center border-b border-gray-200">
                                    <select
                                        value={user.role || "CUSTOMER"}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            if (onChangeRole) onChangeRole(user.id, e.target.value);
                                        }}
                                        className={`py-1 px-2.5 rounded-full text-xs font-semibold border border-gray-200 cursor-pointer outline-none ${
                                            user.role === "ADMIN" ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                        }`}
                                    >
                                        <option value="CUSTOMER">Khách hàng</option>
                                        <option value="ADMIN">Quản trị viên</option>
                                    </select>
                                </td>
                                <td className="p-3 px-4 text-center border-b border-gray-200">{formatDate(user.createdAt)}</td>
                                <td className="p-3 px-4 text-center border-b border-gray-200">
                                    <div className="cursor-pointer">
                                        <button
                                            className={`border-none py-1.5 px-3 rounded-full text-xs font-medium cursor-pointer transition-all ${user.banned  ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Ngăn sự kiện click lan tỏa
                                                onToggleStatus(user.id, !user.banned);
                                            }}
                                        >
                                            {user.banned  ? 'Bị khóa' : 'Hoạt động'}
                                        </button>
                                    </div>
                                </td>
                                <td className="p-3 px-4 text-center border-b border-gray-200">
                                    <div className="flex gap-2 justify-center">
                                        <button
                                            className="w-8 h-8 border-none rounded bg-transparent cursor-pointer flex items-center justify-center transition-colors hover:bg-black/5"
                                            title="Xem"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewDetail(user.id)
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
                                            className="py-1.5 px-2.5 border-none rounded text-xs cursor-pointer min-w-12.5 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Ngăn sự kiện click lan tỏa
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

                    {/* Phân trang */}
                    <div className="flex justify-center mt-5">
                        <button
                            className="w-9 h-9 border border-gray-200 bg-white rounded mx-1 cursor-pointer flex items-center justify-center text-sm disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={currentPage === 0}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            &laquo;
                        </button>

                        {getPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                className={`w-9 h-9 border border-gray-200 rounded mx-1 flex items-center justify-center text-sm ${page === currentPage ? 'bg-blue-600 text-white border-blue-600 cursor-pointer' : 'bg-white cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50'}`}
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
                            className="w-9 h-9 border border-gray-200 bg-white rounded mx-1 cursor-pointer flex items-center justify-center text-sm disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
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