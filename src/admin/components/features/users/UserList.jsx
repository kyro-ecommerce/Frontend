import React from "react";
import "../../../styles/admin/user/users.css";
import {formatDate} from "../../../utils/format.js";

const UserList = ({
                      users,
                      isLoading,
                      currentPage,
                      totalPages,
                      onPageChange,
                      onToggleStatus,
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
        <div className="users-table-container">
            <h2>Danh sách người dùng</h2>

            {isLoading ? (
                <div className="loading-message">Đang tải dữ liệu...</div>
            ) : users.length === 0 ? (
                <div className="empty-message">Không tìm thấy người dùng nào</div>
            ) : (
                <>
                    <table className="users-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Họ tên</th>
                            <th>Vai trò</th>
                            <th>Ngày đăng ký</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr>
                                <td>{user.id}</td>
                                <td>{user.email}</td>
                                <td>
                                    {user.firstName || user.lastName
                                        ? `${user.firstName || ''} ${user.lastName || ''}`
                                        : 'Chưa cập nhật'}
                                </td>
                                <td>{user.role === "CUSTOMER" ? "Khách hàng" : "Người bán"}</td>
                                <td>{formatDate(user.createdAt)}</td> {/* Hiển thị ngày đăng ký */}
                                <td>
                                    <div className="status-toggle">
                                        <button
                                            className={`status-btn ${user.banned  ? 'inactive' : 'active'}`}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Ngăn sự kiện click lan tỏa
                                                onToggleStatus(user.id, !user.banned);
                                            }}
                                        >
                                            {user.banned  ? 'Bị khóa' : 'Hoạt động'}
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn view-btn"
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
                                            className="action-btn delete-btn"
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
                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            disabled={currentPage === 0}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            &laquo;
                        </button>

                        {getPageNumbers().map((page, index) => (
                            <button
                                key={index}
                                className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
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
                            className="pagination-btn"
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