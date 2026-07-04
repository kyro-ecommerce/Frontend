// src/utils/validators.js

// Kiểm tra email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Kiểm tra số điện thoại VN
export const isValidPhoneNumber = (phone) => {
    const phoneRegex = /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone);
};

// Kiểm tra số dương
export const isPositiveNumber = (value) => {
    return !isNaN(value) && Number(value) > 0;
};

// Kiểm tra giá trị không rỗng
export const isNotEmpty = (value) => {
    return !!value && value.trim() !== '';
};

// Kiểm tra độ dài nhỏ nhất
export const minLength = (value, min) => {
    return value && value.length >= min;
};

// Kiểm tra độ dài tối đa
export const maxLength = (value, max) => {
    return value && value.length <= max;
};

// Kiểm tra URL
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};