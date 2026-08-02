/**
 * Trích xuất thông báo lỗi chuẩn hóa từ API response (hỗ trợ RFC 7807 ProblemDetail, message, detail, code)
 *
 * @param {object} error - Error object từ Axios hoặc Catch block
 * @param {string} fallbackMessage - Thông báo mặc định nếu không trích xuất được
 * @returns {string} Thông báo lỗi hiển thị cho người dùng
 */
export const getErrorMessage = (error, fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại sau.") => {
  if (!error) return fallbackMessage;

  const data = error.response?.data;
  if (!data) {
    return error.message || fallbackMessage;
  }

  // Tái sử dụng theo thứ tự ưu tiên: detail (RFC 7807) > message > title
  return data.detail || data.message || data.title || error.message || fallbackMessage;
};

/**
 * Trích xuất Error Code chuẩn hóa từ API response (ví dụ: AUTH_001, PRODUCT_OUT_OF_STOCK)
 *
 * @param {object} error - Error object từ Axios
 * @returns {string} Error code string
 */
export const getErrorCode = (error) => {
  return error?.response?.data?.code || "UNKNOWN_ERROR";
};
