// src/hooks/useUsers.jsx
import { useState, useEffect, useCallback } from "react";
import userService from "../services/api.js";

export const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("");

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const pageNumber = parseInt(currentPage, 10) || 0;
            const pageSize = 10;

            // Gọi API lấy danh sách người dùng với phân trang và lọc
            const response = await userService.getAllUsers(
                pageNumber,
                pageSize,
                searchTerm,
                selectedRole
            );

            if (response.status === 200) {
                const userData = response.data.data;
                const filteredUsers = (userData.content || []).filter(user => user.role !== "ADMIN");
                setUsers(filteredUsers);
                setTotalPages(userData.totalPages || 1);
            } else {
                throw new Error("Không thể lấy dữ liệu người dùng");
            }

            // Gọi API lấy thống kê về khách hàng
            const statsResponse = await userService.getCustomerStats();
            if (statsResponse.status === 200) {
                setStats(statsResponse.data.data || {});
            }
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu người dùng:", err);
            setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, pageSize, searchTerm, selectedRole]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Xử lý khi người dùng thay đổi trang
    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage);
    }, []);

    // Xử lý khi người dùng thay đổi kích thước trang
    const handlePageSizeChange = useCallback((newSize) => {
        setPageSize(newSize);
        setCurrentPage(0); // Reset về trang đầu tiên khi thay đổi kích thước trang
    }, []);

    // Xử lý khi người dùng tìm kiếm
    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
        setCurrentPage(0); // Reset về trang đầu tiên khi tìm kiếm
    }, []);

    // Xử lý khi người dùng lọc theo vai trò
    const handleRoleFilter = useCallback((role) => {
        setSelectedRole(role);
        setCurrentPage(0); // Reset về trang đầu tiên khi lọc
    }, []);

    // Xử lý thay đổi vai trò của người dùng
    const handleChangeRole = useCallback(async (userId, newRole) => {
        try {
            const response = await userService.changeUserRole(userId, newRole);
            if (response.status === 200 && response.data.status) {
                // Cập nhật lại danh sách người dùng
                await fetchUsers();
                return true;
            } else {
                throw new Error("Không thể thay đổi vai trò người dùng");
            }
        } catch (err) {
            console.error("Lỗi khi thay đổi vai trò người dùng:", err);
            setError("Không thể thay đổi vai trò người dùng. Vui lòng thử lại sau.");
            return false;
        }
    }, [fetchUsers]);

    // Xử lý thay đổi trạng thái hoạt động của người dùng
    const handleToggleStatus = useCallback(async (userId, isActive) => {
        try {
            const response = await userService.updateUserStatus(userId, !isActive);
            if (response.status === 200) {
                // Cập nhật lại danh sách người dùng
                await fetchUsers();
                return true;
            } else {
                throw new Error("Không thể thay đổi trạng thái người dùng");
            }
        } catch (err) {
            console.error("Lỗi khi thay đổi trạng thái người dùng:", err);
            setError("Không thể thay đổi trạng thái người dùng. Vui lòng thử lại sau.");
            return false;
        }
    }, [fetchUsers]);

    // Xử lý xóa người dùng
    const handleDeleteUser = useCallback(async (userId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            return false;
        }

        try {
            const response = await userService.deleteUser(userId);
            if (response.status === 200) {
                // Cập nhật lại danh sách người dùng
                await fetchUsers();
                return true;
            }
            return false;
        } catch (err) {
            console.error("Lỗi khi xóa người dùng:", err);
            setError("Không thể xóa người dùng. Vui lòng thử lại sau.");
            return false;
        }
    }, [fetchUsers]);

    // Tạo một mảng các số trang để hiển thị
    const getPageNumbers = useCallback(() => {
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
            if (totalPages > 1) {
                pageNumbers.push(totalPages - 1);
            }
        }

        return pageNumbers;
    }, [totalPages, currentPage]);

    return {
        users,
        stats,
        isLoading,
        error,
        currentPage,
        totalPages,
        pageNumbers: getPageNumbers(),
        handlePageChange,
        handlePageSizeChange,
        handleSearch,
        handleRoleFilter,
        handleChangeRole,
        handleToggleStatus,
        handleDeleteUser,
        selectedRole,
        refreshUsers: fetchUsers
    };
}