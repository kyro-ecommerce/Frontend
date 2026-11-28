import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../../../layouts/admin/Layout";
import { useAuth } from "../../../hooks/admin/useAuth.jsx";
import { orderService, userService } from "../../../services/admin/index.js";
import UserList from "../../../features/admin/users/UserList";
import UserFilters from "../../../features/admin/users/UserFilters";
import UserStats from "../../../features/admin/users/UserStats";
import UserDetailModal from "../../../features/admin/users/UserDetailModal";
import { useConfirm } from "../../../context/ConfirmContext.jsx";
import { useToast } from "../../../store/admin/ToastContext.jsx";
import { getErrorMessage } from "../../../utils/errorUtils.js";


const UserManagement = () => {
    const confirm = useConfirm();
    const toast = useToast();
    const { user, loading, isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [sortBy, setSortBy] = useState("id");
    const [sortDir, setSortDir] = useState("asc");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailStatsLoading, setIsDetailStatsLoading] = useState(false);

    // Xử lý khi lọc theo trạng thái trên header
    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        setCurrentPage(0);
    };

    // Xử lý khi bấm sắp xếp cột trên header
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortDir('asc');
        }
        setCurrentPage(0);
    };

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const pageNumber = parseInt(currentPage, 10) || 0;
            const pageSizeNumber = 10;

            const response = await userService.getAllUsers(
                pageNumber,
                pageSizeNumber,
                searchTerm,
                selectedRole,
                selectedStatus,
                sortBy,
                sortDir
            );

            if (response.status === 200) {
                const userData = response.data?.data || response.data || {};
                const rawList = userData.content || (Array.isArray(userData) ? userData : []);
                setUsers(rawList);
                setTotalPages(userData.totalPages || 1);
                setTotalElements(userData.totalElements ?? rawList.length);
            } else {
                throw new Error("Không thể lấy dữ liệu người dùng");
            }

            const statsResponse = await userService.getCustomerStats();
            if (statsResponse.status === 200) {
                const statsData = statsResponse.data?.data || statsResponse.data || {};
                setStats({
                    totalUsers: statsData.totalUsers || 0,
                    totalCustomers: statsData.totalCustomers || 0,
                    totalAdmins: statsData.totalAdmins || 0
                });
            }
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu người dùng:", err);
            setError(getErrorMessage(err, "Không thể tải danh sách người dùng. Vui lòng thử lại sau."));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && user) {
            fetchUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading, user, currentPage, searchTerm, selectedRole, selectedStatus, sortBy, sortDir]);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(0);
    };

    const handleRoleFilter = (role) => {
        setSelectedRole(role);
        setCurrentPage(0);
    };

    // Xử lý cập nhật thông tin người dùng
    const handleUpdateUser = async (updatedUser) => {
        try {
            setError(null);
            const currentUser = selectedUser;
            if (
                !currentUser ||
                updatedUser.firstName !== currentUser.firstName ||
                updatedUser.lastName !== currentUser.lastName ||
                updatedUser.mobile !== currentUser.mobile
            ) {
                await userService.updateUser(updatedUser.id, {
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    phoneNumber: updatedUser.mobile
                });
                toast?.success("Cập nhật thông tin người dùng thành công!");
            }
            fetchUsers();

            if (selectedUser && selectedUser.id === updatedUser.id) {
                const response = await userService.getUserDetails(updatedUser.id);
                if (response.status === 200) {
                    const freshUser = response.data?.data || response.data;
                    setSelectedUser((prev) => ({
                        ...prev,
                        ...freshUser
                    }));
                }
            }
        } catch (err) {
            console.error("Lỗi khi cập nhật thông tin người dùng:", err);
            const message = getErrorMessage(err, "Không thể cập nhật thông tin người dùng.");
            setError(message);
            toast?.error(message);
        }
    };

    // Xử lý thay đổi vai trò người dùng
    const handleChangeRole = async (userId, newRole) => {
        if (Number(userId) === Number(user?.id)) {
            toast?.warning("Không thể tự thay đổi vai trò của tài khoản quản trị đang đăng nhập.");
            return;
        }
        try {
            setError(null);
            const response = await userService.changeUserRole(userId, newRole);
            if (response.status === 200) {
                toast?.success("Cập nhật vai trò người dùng thành công!");
                fetchUsers();

                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser((prev) => ({
                        ...prev,
                        role: newRole
                    }));
                }
            }
        } catch (err) {
            console.error("Lỗi khi thay đổi vai trò người dùng:", err);
            const message = getErrorMessage(err, "Không thể thay đổi vai trò người dùng.");
            setError(message);
            toast?.error(message);
        }
    };

    // Xử lý thay đổi trạng thái khóa của người dùng
    const handleToggleStatus = async (userId, shouldBeBanned) => {
        if (Number(userId) === Number(user?.id)) {
            toast?.warning("Không thể tự khóa tài khoản quản trị đang đăng nhập.");
            return;
        }
        try {
            setError(null);
            const response = await userService.banUser(userId, shouldBeBanned);
            if (response.status === 200) {
                toast?.success(shouldBeBanned ? "Đã khóa tài khoản người dùng!" : "Đã mở khóa tài khoản người dùng!");
                fetchUsers();

                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser((prev) => ({
                        ...prev,
                        banned: shouldBeBanned
                    }));
                }
            }
        } catch (err) {
            console.error("Lỗi khi thay đổi trạng thái người dùng:", err);
            const message = getErrorMessage(err, "Không thể thay đổi trạng thái người dùng.");
            setError(message);
            toast?.error(message);
        }
    };

    // Xử lý xóa người dùng
    const handleDeleteUser = async (userId) => {
        if (Number(userId) === Number(user?.id)) {
            toast?.warning("Không thể tự xóa tài khoản quản trị đang đăng nhập.");
            return;
        }

        const isConfirmed = await confirm({
            title: "Xóa người dùng",
            message: "Bạn có chắc chắn muốn xóa tài khoản người dùng này không?",
            confirmText: "Xóa người dùng",
            cancelText: "Hủy",
            type: "danger"
        });

        if (!isConfirmed) return;

        try {
            setError(null);
            const response = await userService.deleteUser(userId);
            if (response.status === 200 || response.status === 204) {
                if (selectedUser && selectedUser.id === userId) {
                    setSelectedUser(null);
                }
                toast?.success(response.data?.message || "Đã xóa tài khoản người dùng thành công!");
                fetchUsers();
            }
        } catch (err) {
            console.error("Lỗi khi xóa người dùng:", err);
            const message = getErrorMessage(err, "Không thể xóa người dùng.");
            setError(message);
            toast?.error(message);
        }
    };

    // Hàm lấy chi tiết người dùng kèm thống kê đơn hàng thực tế từ order-service
    const handleViewDetail = async (userId) => {
        try {
            setError(null);
            setIsDetailStatsLoading(true);
            const existing = users.find((u) => u.id === userId);
            if (existing) {
                setSelectedUser({ ...existing, orderCount: 0, totalSpent: 0 });
            }

            const [userRes, ordersRes] = await Promise.allSettled([
                userService.getUserDetails(userId),
                orderService.getAllOrders(0, 100, "", "", "", "", "", "", "orderDate", "desc", userId)
            ]);

            if (userRes.status !== "fulfilled" || userRes.value.status !== 200) {
                throw userRes.status === "rejected" ? userRes.reason : new Error("Không thể lấy chi tiết người dùng");
            }

            const detailUser = userRes.value.data?.data || userRes.value.data || {};
            let orderCount = 0;
            let totalSpent = 0;

            if (ordersRes.status === "fulfilled" && ordersRes.value.status === 200) {
                const pageData = ordersRes.value.data?.data || ordersRes.value.data || {};
                const orderList = pageData.content || (Array.isArray(pageData) ? pageData : []);
                orderCount = pageData.totalElements ?? orderList.length;
                totalSpent = orderList
                    .filter((o) => o.orderStatus !== "CANCELLED")
                    .reduce((sum, o) => sum + Number(o.totalDiscountedPrice || 0), 0);
            }

            setSelectedUser({
                ...detailUser,
                orderCount,
                totalSpent
            });
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết người dùng:", err);
            const message = getErrorMessage(err, "Không thể lấy chi tiết người dùng.");
            setError(message);
            toast?.error(message);
        } finally {
            setIsDetailStatsLoading(false);
        }
    };

    const handleCloseDetail = () => {
        setSelectedUser(null);
    };

    if (loading) {
        return <div>Đang tải...</div>;
    }

    if (!user || !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout>
            <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
                <div className="max-w-7xl mx-auto space-y-4">
                    {/* Hiển thị thống kê */}
                    <UserStats stats={stats} />

                    {/* Container cho bộ lọc và danh sách */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                        {/* Bộ lọc và tìm kiếm */}
                        <UserFilters
                            onSearch={handleSearch}
                            onRoleFilter={handleRoleFilter}
                            selectedRole={selectedRole}
                        />

                        {error && <div className="text-red-600 bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs font-semibold">{error}</div>}

                        {/* Danh sách người dùng với header filter và sắp xếp */}
                        <UserList
                            users={users}
                            currentAdminId={user?.id}
                            isLoading={isLoading}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            onToggleStatus={handleToggleStatus}
                            onChangeRole={handleChangeRole}
                            onDeleteUser={handleDeleteUser}
                            onViewDetail={handleViewDetail}
                            selectedRole={selectedRole}
                            onRoleFilter={handleRoleFilter}
                            selectedStatus={selectedStatus}
                            onStatusFilter={handleStatusFilter}
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={handleSort}
                            totalElements={totalElements || stats.totalUsers || users.length}
                        />
                    </div>
                </div>

                {/* Modal chi tiết người dùng */}
                {selectedUser && (
                    <UserDetailModal
                        user={selectedUser}
                        currentAdminId={user?.id}
                        isStatsLoading={isDetailStatsLoading}
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
