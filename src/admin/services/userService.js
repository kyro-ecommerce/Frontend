// src/services/userService.js
import api from './api';

export const getAllUsers = (page = 0, size = 10, search = "", role = "") => {
    const validPage = Number.isInteger(Number(page)) ? page : 0;
    const validSize = Number.isInteger(Number(size)) ? size : 10;
    return api.get(`/admin/users/all?page=${validPage}&size=${validSize}&search=${search}&role=${role}`);
};

export const getUserDetails = (userId) => api.get(`/admin/users/${userId}`);

export const changeUserRole = (userId, role) =>
    api.put(`/admin/users/${userId}/change-role`, {role});

export const updateUserStatus = (userId, active) =>
    api.put(`/admin/users/${userId}/status`, {active});

export const deleteUser = (userId) => api.delete(`/admin/users/${userId}`);

export const getCustomerStats = () => api.get("/admin/users/customers/stats");

export const banUser = (userId, banned) =>
    api.put(`/admin/users/${userId}/ban?banned=${banned}`);

export const updateUser = (userId, userData) =>
    api.put(`/admin/users/${userId}`, userData);