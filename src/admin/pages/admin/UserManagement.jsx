import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../hooks/useAuth.jsx";
import { userService } from "../../services/index.js";
import UserList from "../../components/features/users/UserList";
import UserFilters from "../../components/features/users/UserFilters";
import UserStats from "../../components/features/users/UserStats";
import UserDetailModal from "../../components/features/users/UserDetailModal"; // Đảm bảo import component mới
import "../../styles/admin/user/users.css";

const UserManagement = () => {
    const { user, loading, isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const pageNumber = parseInt(currentPage, 10) || 0;
            const pageSizeNumber = 10;

            // Gọi API lấy danh sách người dùng với phân trang và lọc
            const response = await userService.getAllUsers(
                pageNumber,
                pageSizeNumber,
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
                const statsData = statsResponse.data.data || {};
                // Giả định thống kê về khách hàng và người bán
                setStats({
                    totalCustomers: statsData.totalCustomers || 0,
                    totalSellers: statsData.totalSellers || 0
                });
            }
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu người dùng:", err);
            setError("Không thể tải danh sách người dùng. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && user) {
            fetchUsers();
        }
    }, [loading, user, currentPage, searchTerm, selectedRole]);

    // Xử lý khi người dùng thay đổi trang
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Xử lý khi người dùng tìm kiếm
    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0); // Reset về trang đầu tiên khi tìm kiếm
    };

    // Xử lý khi người dùng lọc theo vai trò
    const handleRoleFilter = (role) => {
        setSelectedRole(role);
        setCurrentPage(0); // Reset về trang đầu tiên khi lọc
    };

    const closeUserDetail = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
    };

    // Xử lý cập nhật thông tin người dùng
    const handleUpdateUser = async (updatedUser) => {
        try {
            setIsLoading(true);
            const currentUser = selectedUser;
            // Gọi API cập nhật thông tin người dùng
            if (updatedUser.firstName !== currentUser.firstName ||
                updatedUser.lastName !== currentUser.lastName ||
                updatedUser.mobile !== currentUser.mobile) {

                await userService.updateUser(updatedUser.id, {
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    mobile: updatedUser.mobile
                });
            }
            if (updatedUser.role !== currentUser.role) {
                await userService.changeUserRole(updatedUser.id, {
                    role: updatedUser.role
                });
            }
            fetchUsers();

            if (selectedUser && selectedUser.id === updatedUser.id) {
                // Fetch lại thông tin chi tiết để đảm bảo dữ liệu mới nhất
                const response = await userService.getUserDetails(updatedUser.id);
                if (response.status === 200) {
                    setSelectedUser(response.data.data);
                }
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật thông tin người dùng:", err);
            setError("Không thể cập nhật thông tin người dùng. Vui lòng thử lại sau.");
        }
    };

    // Xử lý thay đổi vai trò người dùng
    const handleChangeRole = async (userId, newRole) => {
        try {
            const response = await userService.changeUserRole(userId, newRole);
            if (response.status === 200) {
                // Cập nhật lại danh sách người dùng
                fetchUsers();

                // Nếu đang xem chi tiết người dùng này, cập nhật thông tin
                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser({
                        ...selectedUser,
                        role: newRole
                    });
                }
            }
        } catch (err) {
            console.error("Lỗi khi thay đổi vai trò người dùng:", err);
            setError("Không thể thay đổi vai trò người dùng. Vui lòng thử lại sau.");
        }
    };

    const handleViewUser = async (userId) => {
        try {
            // Fetch order details if needed, or use existing order from list
            const userToView = userId.find(user => user.id === userId);
            setSelectedUser(userToView);
            setIsModalOpen(true);
        } catch (err) {
            console.error("Error viewing user details:", err);
            setError("Cannot load user details. Please try again.");
        }
    };

    // Xử lý thay đổi trạng thái hoạt động của người dùng
    const handleToggleStatus = async (userId, shouldBeBanned) => {
        try {
            const response = await userService.banUser(userId, shouldBeBanned);
            if (response.status === 200) {
                // Cập nhật lại danh sách người dùng
                fetchUsers();

                // Nếu đang xem chi tiết người dùng này, cập nhật thông tin
                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser({
                        ...selectedUser,
                        banned: shouldBeBanned
                    });
                }
            }
        } catch (err) {
            console.error("Lỗi khi thay đổi trạng thái người dùng:", err);
            setError("Không thể thay đổi trạng thái người dùng. Vui lòng thử lại sau.");
        }
    };

    // Xử lý xóa người dùng
    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            return;
        }

        try {
            const response = await userService.deleteUser(userId);
            if (response.status === 200) {
                // Đóng modal nếu đang xem chi tiết người dùng bị xóa
                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser(null);
                }

                // Cập nhật lại danh sách người dùng
                fetchUsers();
            }
        } catch (err) {
            console.error("Lỗi khi xóa người dùng:", err);
            setError("Không thể xóa người dùng. Vui lòng thử lại sau.");
        }
    };

    // Hàm lấy chi tiết người dùng
    const handleViewDetail = async (userId) => {
        try {
            setIsLoading(true);
            const response = await userService.getUserDetails(userId);
            if (response.status === 200) {
                setSelectedUser(response.data.data);
            }
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết người dùng:", err);
            setError("Không thể lấy chi tiết người dùng. Vui lòng thử lại sau.");
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm đóng modal
    const handleCloseDetail = () => {
        setSelectedUser(null);
    };

    // Nếu đang tải thông tin người dùng
    if (loading) {
        return <div>Đang tải...</div>;
    }

    // Nếu người dùng không đăng nhập hoặc không phải admin
    if (!user || !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout>
            <div className="users-container">
                {/* Hiển thị thống kê */}
                <UserStats stats={stats} />

                {/* Bộ lọc và tìm kiếm */}
                <UserFilters
                    onSearch={handleSearch}
                    onRoleFilter={handleRoleFilter}
                    selectedRole={selectedRole}
                />

                {error && <div className="error-message">{error}</div>}

                {/* Danh sách người dùng */}
                <UserList
                    users={users}
                    isLoading={isLoading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    onToggleStatus={handleToggleStatus}
                    onDeleteUser={handleDeleteUser}
                    onViewDetail={handleViewDetail}
                />

                {isModalOpen && selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={closeUserDetail}
                    onUpdateUser={handleUpdateUser}
                    onChangeRole={handleChangeRole}
                    onToggleStatus={handleToggleStatus}
                />
                )}
                {/* Modal chi tiết người dùng */}
                {selectedUser && (
                    <UserDetailModal
                        user={selectedUser}
                        onClose={handleCloseDetail}
                        onUpdateUser={handleUpdateUser}
                        onChangeRole={handleChangeRole}
                        onToggleStatus={handleToggleStatus}
                    />
                )}
            </div>
        </Layout>
    );
};

export default UserManagement;