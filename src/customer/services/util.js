/**
 * Các hàm tiện ích để xử lý token và cookie
 */

/**
 * Lưu refresh token vào cookie
 * @param {string} refreshToken - Token cần lưu
 * @param {number} days - Số ngày hết hạn (mặc định: 7 ngày)
 */
export const saveRefreshTokenToCookie = (refreshToken, days = 7) => {
    try {
        console.log("Lưu refresh token vào cookie");
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);
        document.cookie = `refreshToken=${refreshToken}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict; HttpOnly`;
    } catch (error) {
        console.error("Lỗi khi lưu refresh token vào cookie:", error);
    }
};

/**
 * Lấy refresh token từ cookie
 * @returns {string|null} Refresh token hoặc null nếu không tìm thấy
 */
export const getRefreshTokenFromCookie = () => {
    try {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('refreshToken='));
        
        if (cookieValue) {
            return cookieValue.split('=')[1];
        }
        return null;
    } catch (error) {
        console.error("Lỗi khi lấy refresh token từ cookie:", error);
        return null;
    }
};

/**
 * Xóa refresh token khỏi cookie
 */
export const removeRefreshTokenFromCookie = () => {
    try {
        document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        console.log("Đã xóa refresh token khỏi cookie");
    } catch (error) {
        console.error("Lỗi khi xóa refresh token khỏi cookie:", error);
    }
};

/**
 * Lưu access token vào localStorage
 * @param {string} token - Access token cần lưu
 */
export const saveTokenToLocalStorage = (token) => {
    try {
        localStorage.setItem("jwt", token);
    } catch (error) {
        console.error("Lỗi khi lưu access token vào localStorage:", error);
    }
};

/**
 * Lấy access token từ localStorage
 * @returns {string|null} Access token hoặc null nếu không tìm thấy
 */
export const getTokenFromLocalStorage = () => {
    try {
        return localStorage.getItem("jwt");
    } catch (error) {
        console.error("Lỗi khi lấy access token từ localStorage:", error);
        return null;
    }
};

/**
 * Xóa access token từ localStorage
 */
export const removeTokenFromLocalStorage = () => {
    try {
        localStorage.removeItem("jwt");
        console.log("Đã xóa access token từ localStorage");
    } catch (error) {
        console.error("Lỗi khi xóa access token từ localStorage:", error);
    }
};

/**
 * Xóa tất cả token (cả access và refresh token)
 */
export const clearAllTokens = () => {
    removeTokenFromLocalStorage();
    removeRefreshTokenFromCookie();
};

/**
 * Lấy giá trị token từ phản hồi API
 * @param {Object} response - Phản hồi từ API
 * @returns {Object} Chứa accessToken và refreshToken (có thể là null nếu không tìm thấy)
 */
export const extractTokensFromResponse = (response) => {
    if (!response || !response.data) {
        return { accessToken: null, refreshToken: null };
    }

    const data = response.data;
    
    // Trường hợp 1: Token nằm trực tiếp trong response.data
    if (data.jwt || data.token || data.accessToken) {
        return {
            accessToken: data.jwt || data.token || data.accessToken,
            refreshToken: data.refreshToken || null
        };
    }
    
    // Trường hợp 2: Token nằm trong data.data
    if (data.data && (data.data.jwt || data.data.token || data.data.accessToken)) {
        return {
            accessToken: data.data.jwt || data.data.token || data.data.accessToken,
            refreshToken: data.data.refreshToken || null
        };
    }
    
    // Không tìm thấy token
    return { accessToken: null, refreshToken: null };
};

/**
 * Kiểm tra xem người dùng đã đăng nhập chưa
 * @returns {boolean} true nếu đã đăng nhập, false nếu chưa
 */
export const isAuthenticated = () => {
    return !!getTokenFromLocalStorage();
};

/**
 * Lấy mã code từ URL (sử dụng cho OAuth2)
 * @returns {string|null} Mã code hoặc null nếu không tìm thấy
 */
export const getCodeFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
};

/**
 * Kiểm tra URL hiện tại có phải là URL callback từ OAuth không
 * @returns {boolean} true nếu là URL callback, false nếu không
 */
export const isOAuthCallback = () => {
    return !!getCodeFromUrl();
}; 