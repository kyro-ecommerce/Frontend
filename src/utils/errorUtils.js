/**
 * Trích xuất thông báo lỗi chuẩn hóa và thân thiện với người dùng từ API response/catch block.
 * Tự động chuyển đổi các chuỗi lỗi kỹ thuật (Axios error, status code, Java exception...) 
 * thành thông báo tiếng Việt dễ hiểu.
 *
 * @param {object|string} error - Error object từ Axios hoặc Catch block
 * @param {string} fallbackMessage - Thông báo mặc định nếu không trích xuất được
 * @returns {string} Thông báo lỗi hiển thị cho người dùng
 */
export const getErrorMessage = (error, fallbackMessage = "Đã xảy ra lỗi. Vui lòng thử lại sau.") => {
  if (!error) return fallbackMessage;

  // 1. Trường hợp error là string trực tiếp
  if (typeof error === "string") {
    return cleanTechnicalMessage(error, fallbackMessage);
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // 2. Lấy thông báo từ response data (nếu backend trả về JSON)
  let rawMsg = null;
  if (typeof data === "string") {
    // Nếu backend trả về HTML error page hoặc plain text
    rawMsg = null;
  } else if (data && typeof data === "object") {
    rawMsg = data.message || data.detail || data.properties?.message || data.title || data.error;
  }

  // Nếu rawMsg chứa chuỗi lỗi kỹ thuật thì xóa đi để dùng thông báo thân thiện
  if (rawMsg && isTechnicalString(rawMsg)) {
    rawMsg = null;
  }

  if (rawMsg) {
    return translateKnownErrorMessages(rawMsg);
  }

  // 3. Xử lý dựa trên HTTP Status Code
  if (status) {
    switch (status) {
      case 400:
        return "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
      case 401:
        return "Email hoặc mật khẩu không chính xác, hoặc phiên làm việc đã hết hạn.";
      case 403:
        return "Bạn không có quyền thực hiện thao tác này.";
      case 404:
        return "Không tìm thấy dữ liệu yêu cầu.";
      case 409:
        return "Dữ liệu đã tồn tại hoặc xảy ra xung đột.";
      case 422:
        return "Dữ liệu gửi lên không đúng định dạng.";
      case 429:
        return "Bạn đã thao tác quá nhanh. Vui lòng thử lại sau ít phút.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.";
      default:
        break;
    }
  }

  // 4. Kiểm tra client-side error message (vd: Network Error)
  if (error.message) {
    return cleanTechnicalMessage(error.message, fallbackMessage);
  }

  return fallbackMessage;
};

/**
 * Kiểm tra xem chuỗi có phải mã/chuỗi lỗi kỹ thuật không
 */
const isTechnicalString = (str) => {
  if (typeof str !== "string") return false;
  const techPatterns = [
    /Request failed with status code/i,
    /Network Error/i,
    /ERR_NETWORK/i,
    /ERR_BAD_REQUEST/i,
    /ERR_CANCELLED/i,
    /AxiosError/i,
    /java\./i,
    /NullPointerException/i,
    /ConstraintViolation/i,
    /SQLState/i,
    /Internal Server Error/i,
    /HttpMediaTypeNotSupported/i,
    /MethodNotAllowed/i,
    /status code \d{3}/i,
  ];
  return techPatterns.some((pattern) => pattern.test(str));
};

/**
 * Dịch các câu thông báo tiếng Anh phổ biến từ backend sang tiếng Việt thân thiện
 */
const translateKnownErrorMessages = (msg) => {
  if (typeof msg !== "string") return msg;
  if (/Bad credentials|Invalid username or password|Invalid credentials|Invalid email or password|Wrong password|mật khẩu không đúng|sai mật khẩu/i.test(msg)) {
    return "Email hoặc mật khẩu không chính xác.";
  }
  if (/User disabled|Account is locked|User is disabled/i.test(msg)) {
    return "Tài khoản của bạn đã bị khóa.";
  }
  if (/User not found|Account not found/i.test(msg)) {
    return "Không tìm thấy tài khoản người dùng.";
  }
  if (/Email already exists|Email đã tồn tại|Email is already registered/i.test(msg)) {
    return "Email này đã được đăng ký.";
  }
  if (/Invalid token|Token expired|JWT expired|Unauthorized/i.test(msg)) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }
  if (/INSUFFICIENT_STOCK|tồn kho|không đủ hàng|Out of stock/i.test(msg)) {
    return "Sản phẩm đã vượt quá số lượng tồn kho khả dụng.";
  }
  if (/^Not Found$/i.test(msg.trim()) || /Resource Not Found/i.test(msg)) {
    return "Không tìm thấy dữ liệu yêu cầu hoặc sản phẩm không còn tồn tại.";
  }
  if (/Cart item/i.test(msg) && /trùng/i.test(msg)) {
    return "Sản phẩm trong giỏ hàng bị trùng.";
  }
  if (/Giỏ hàng đã thay đổi/i.test(msg)) {
    return "Giỏ hàng đã thay đổi, vui lòng tải lại.";
  }
  if (/Category name already exists|Category already exists|Tên danh mục đã tồn tại/i.test(msg)) {
    return "Tên danh mục này đã tồn tại trong hệ thống. Vui lòng chọn tên khác.";
  }
  return msg;
};

/**
 * Lọc sạch thông báo kỹ thuật và trả về thông báo tiếng Việt
 */
const cleanTechnicalMessage = (msg, fallback) => {
  if (isTechnicalString(msg)) {
    if (/status code 401/i.test(msg)) return "Email hoặc mật khẩu không chính xác.";
    if (/status code 403/i.test(msg)) return "Bạn không có quyền thực hiện thao tác này.";
    if (/status code 404/i.test(msg) || /Not Found/i.test(msg)) return "Không tìm thấy dữ liệu yêu cầu hoặc sản phẩm đã hết hàng.";
    if (/status code 500/i.test(msg)) return "Hệ thống máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
    if (/Network Error|ERR_NETWORK/i.test(msg)) return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.";
    return fallback;
  }
  if (/^Not Found$/i.test(msg.trim())) {
    return "Không tìm thấy dữ liệu yêu cầu.";
  }
  return msg;
};

/**
 * Trích xuất Error Code chuẩn hóa từ API response
 */
export const getErrorCode = (error) => {
  const data = error?.response?.data;
  return data?.code || data?.properties?.code || "UNKNOWN_ERROR";
};

