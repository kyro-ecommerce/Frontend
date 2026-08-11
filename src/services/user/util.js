/**
 * Các hàm tiện ích để xử lý token và cookie
 */

/**
 * Lưu access token vào localStorage
 * @param {string} token - Access token cần lưu
 */
export const saveTokenToLocalStorage = (token) => {
    try {
        localStorage.setItem("jwt", token);
        localStorage.setItem("accessToken", token);
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
        return localStorage.getItem("jwt") || localStorage.getItem("accessToken");
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
        localStorage.removeItem("accessToken");
        console.log("Đã xóa access token từ localStorage");
    } catch (error) {
        console.error("Lỗi khi xóa access token từ localStorage:", error);
    }
};

/**
 * Xóa access token phía client. Refresh token HttpOnly được backend xóa khi logout.
 */
export const clearAllTokens = () => {
    removeTokenFromLocalStorage();
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
