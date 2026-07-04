import React, { useState } from "react";
import {formatCurrency, formatDate} from "../../../utils/admin/format.js";

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
        <div className="fixed inset-0 bg-black/50 z-1000 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg w-150 max-w-[90%] max-h-[90vh] overflow-y-auto shadow-[0_5px_20px_rgba(0,0,0,0.2)]" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold m-0">Chi tiết người dùng</h2>
                    <button className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-700" onClick={onClose}>×</button>
                </div>

                <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-lg font-semibold mb-2">{totalOrders}</div>
                            <div className="text-[13px] text-gray-500">Đơn hàng</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-lg font-semibold mb-2">{formatCurrency(totalSpent)}</div>
                            <div className="text-[13px] text-gray-500">Đã chi tiêu</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-lg font-semibold mb-2">{formatDate(user.createdAt)}</div>
                            <div className="text-[13px] text-gray-500">Ngày tham gia</div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-5 mb-5">
                        <h3 className="text-base font-semibold m-0 mb-4 flex justify-between items-center">
                            Thông tin cơ bản
                            {!isEditing ? (
                                <button
                                    className="py-1.5 px-3 bg-blue-600 text-white border-none rounded text-xs cursor-pointer hover:bg-blue-700 transition-colors"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Chỉnh sửa
                                </button>
                            ) : (
                                <button
                                    className="py-1.5 px-3 bg-gray-200 text-gray-800 border-none rounded text-xs cursor-pointer hover:bg-gray-300 transition-colors"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Hủy
                                </button>
                            )}
                        </h3>

                        <div className="flex flex-col md:flex-row mb-3">
                            <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">ID:</div>
                            <div className="text-sm font-medium">{user.id}</div>
                        </div>

                        <div className="flex flex-col md:flex-row mb-3">
                            <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Họ:</div>
                            {isEditing ? (
                                <input
                                    className="py-1.5 px-2.5 border border-gray-200 rounded text-sm w-full md:w-62.5 outline-none focus:border-blue-500"
                                    type="text"
                                    name="firstName"
                                    value={editedUser.firstName || ""}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <div className="text-sm font-medium">{user.firstName || "N/A"}</div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row mb-3">
                            <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Tên:</div>
                            {isEditing ? (
                                <input
                                    className="py-1.5 px-2.5 border border-gray-200 rounded text-sm w-full md:w-62.5 outline-none focus:border-blue-500"
                                    type="text"
                                    name="lastName"
                                    value={editedUser.lastName || ""}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <div className="text-sm font-medium">{user.lastName || "N/A"}</div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row mb-3">
                            <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Email:</div>
                            <div className="text-sm font-medium">{user.email}</div>
                        </div>

                        <div className="flex flex-col md:flex-row mb-3">
                            <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Điện thoại:</div>
                            {isEditing ? (
                                <input
                                    className="py-1.5 px-2.5 border border-gray-200 rounded text-sm w-full md:w-62.5 outline-none focus:border-blue-500"
                                    type="text"
                                    name="mobile"
                                    value={editedUser.mobile || ""}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <div className="text-sm font-medium">{user.mobile || "Chưa cung cấp"}</div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row mb-3">
                            <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Vai trò:</div>
                            <div className="text-sm font-medium">
                                {user.role === "CUSTOMER" ? "Khách hàng" :
                                    user.role === "SELLER" ? "Người bán" : user.role}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row mb-3">
                            <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Trạng thái:</div>
                            <div className="text-sm font-medium">
                                <span className={`inline-block py-1 px-2.5 rounded-full text-xs font-medium ${user.banned ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                    {user.banned  ? 'Bị khóa' : 'Hoạt động'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 px-5 border-t border-gray-200 flex justify-end gap-3 flex-wrap">
                    <button className="py-2.5 px-5 rounded text-sm font-medium cursor-pointer bg-gray-50 border border-gray-200 text-gray-800 hover:bg-gray-100 transition-colors" onClick={onClose}>Đóng</button>
                    <button
                        className={`py-2.5 px-5 rounded text-sm font-medium cursor-pointer transition-colors ${user.banned ? 'bg-blue-600 text-white border-none hover:bg-blue-700' : 'bg-red-50 text-red-500 border border-red-500 hover:bg-red-100'}`}
                        onClick={handleToggleStatus}
                    >
                        {user.banned ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                    </button>
                    {isEditing && (
                        <button className="py-2.5 px-5 rounded text-sm font-medium cursor-pointer bg-blue-600 text-white border-none hover:bg-blue-700 transition-colors" onClick={handleSave}>
                            Lưu thay đổi
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDetailModal;