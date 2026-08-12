// src/services/userService.js
import api from './api';

export const getAllUsers = (page = 0, size = 10, search = "", role = "") => {
    const validPage = Number.isInteger(Number(page)) ? page : 0;
    const validSize = Number.isInteger(Number(size)) ? size : 10;
    return api.get(`/admin/users?page=${validPage}&size=${validSize}&search=${search}&role=${role}`);
};

export const getUserDetails = (userId) => api.get(`/admin/users/${userId}`);

export const changeUserRole = (userId, role) =>
    api.patch(`/admin/users/${userId}/role`, {role});

export const updateUserStatus = (userId, active) =>
    api.patch(`/admin/users/${userId}/status`, {active});

export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

export const getCustomerStats = () => api.get("/admin/analytics/users/summary");

export const banUser = (userId, banned) =>
    api.patch(`/admin/users/${userId}/status`, {banned});

export const updateUser = (userId, userData) =>
    api.patch(`/admin/users/${userId}`, userData);
