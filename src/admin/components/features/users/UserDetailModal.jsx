import React, { useState } from "react";
import "../../../styles/admin/user/users.css";
import {formatCurrency, formatDate} from "../../../utils/format.js";

const UserDetailModal = ({ user, onClose, onUpdateUser, onChangeRole, onToggleStatus }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        ...user,
        role: user?.role || "CUSTOMER"
    });

    if (!user) return null;

    // Lấy thông tin từ user object hoặc sử dụng giá trị mặc định nếu không có
    const totalOrders = user.orderCount || 0;
    const totalSpent = user.totalSpent || 0;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedUser(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // Gọi hàm cập nhật người dùng
        const updatedUser = {
            id: user.id,
            firstName: editedUser.firstName,
            lastName: editedUser.lastName,
            mobile: editedUser.mobile,
        };
        onUpdateUser(updatedUser);

        setIsEditing(false);
    };

    const handleToggleStatus = () => {
        if (onToggleStatus) {
            onToggleStatus(user.id, !user.banned);
        }
    };


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="user-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Chi tiết người dùng</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="user-stats-section">
                        <div className="user-stat-card">
                            <div className="user-stat-value">{totalOrders}</div>
                            <div className="user-stat-label">Đơn hàng</div>
                        </div>
                        <div className="user-stat-card">
                            <div className="user-stat-value">{formatCurrency(totalSpent)}</div>
                            <div className="user-stat-label">Đã chi tiêu</div>
                        </div>
                        <div className="user-stat-card">
                            <div className="user-stat-value">{formatDate(user.createdAt)}</div>
                            <div className="user-stat-label">Ngày tham gia</div>
                        </div>
                    </div>

                    <div className="user-info-section">
                        <h3>
                            Thông tin cơ bản
                            {!isEditing ? (
                                <button
                                    className="edit-button"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <button
                                    className="edit-button"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Hủy
                                </button>
                            )}
                        </h3>

                        <div className="info-group">
                            <div className="info-label">ID:</div>
                            <div className="info-value">{user.id}</div>
                        </div>

                        <div className="info-group">
                            <div className="info-label">Họ:</div>
                            {isEditing ? (
                                <input
                                    className="info-input"
                                    type="text"
                                    name="firstName"
                                    value={editedUser.firstName || ""}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <div className="info-value">{user.firstName || "N/A"}</div>
                            )}
                        </div>

                        <div className="info-group">
                            <div className="info-label">Tên:</div>
                            {isEditing ? (
                                <input
                                    className="info-input"
                                    type="text"
                                    name="lastName"
                                    value={editedUser.lastName || ""}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <div className="info-value">{user.lastName || "N/A"}</div>
                            )}
                        </div>

                        <div className="info-group">
                            <div className="info-label">Email:</div>
                            <div className="info-value">{user.email}</div>
                        </div>

                        <div className="info-group">
                            <div className="info-label">Điện thoại:</div>
                            {isEditing ? (
                                <input
                                    className="info-input"
                                    type="text"
                                    name="mobile"
                                    value={editedUser.mobile || ""}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <div className="info-value">{user.mobile || "Chưa cung cấp"}</div>
                            )}
                        </div>

                        <div className="info-group">
                            <div className="info-label">Vai trò:</div>
                            <div className="info-value">
                                {user.role === "CUSTOMER" ? "Khách hàng" :
                                    user.role === "SELLER" ? "Người bán" : user.role}
                            </div>
                        </div>

                        <div className="info-group">
                            <div className="info-label">Trạng thái:</div>
                            <div className="info-value">
                                <span className={`status-badge ${user.banned ? 'inactive' : 'active'}`}>
                                    {user.banned  ? 'Bị khóa' : 'Hoạt động'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Đóng</button>
                    <button
                        className={`btn-${user.banned ? 'primary' : 'danger'}`}
                        onClick={handleToggleStatus}
                    >
                        {user.banned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                    </button>
                    {isEditing && (
                        <button className="btn-primary" onClick={handleSave}>
                            Lưu thay đổi
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;