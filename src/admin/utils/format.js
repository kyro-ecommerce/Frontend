/**
 * Các hàm tiện ích để định dạng dữ liệu
 */

/**
 * Định dạng số tiền thành VND
 * @param {number|string|object} amount - Số tiền cần định dạng
 * @returns {string} Chuỗi đã định dạng theo tiền tệ Việt Nam
 */
const formatCurrency = (amount) => {
    // Xử lý trường hợp amount là object
    if (typeof amount === 'object' && amount !== null) {
        try {
            amount = parseFloat(amount.toString());
        } catch (error) {
            amount = 0;
        }
    }

    // Xử lý các trường hợp undefined, null hoặc NaN
    if (amount === undefined || amount === null || isNaN(amount)) {
        amount = 0;
    }

    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
};

/**
 * Định dạng ngày giờ đầy đủ (ngày/tháng/năm giờ:phút)
 * @param {string|Date} dateTimeStr - Chuỗi ngày giờ hoặc đối tượng Date
 * @returns {string} Chuỗi đã định dạng hoặc 'N/A' nếu không hợp lệ
 */
const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';

    try {
        const date = new Date(dateTimeStr);

        // Kiểm tra xem date có hợp lệ không
        if (isNaN(date.getTime())) return 'N/A';

        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    } catch (error) {
        console.error('Lỗi định dạng ngày giờ:', error);
        return 'N/A';
    }
};

/**
 * Định dạng chỉ ngày (ngày/tháng/năm)
 * @param {string|Date} dateStr - Chuỗi ngày hoặc đối tượng Date
 * @returns {string} Chuỗi đã định dạng hoặc 'N/A' nếu không hợp lệ
 */
const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';

    try {
        const date = new Date(dateStr);

        // Kiểm tra xem date có hợp lệ không
        if (isNaN(date.getTime())) return 'N/A';

        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date);
    } catch (error) {
        console.error('Lỗi định dạng ngày:', error);
        return 'N/A';
    }
};

/**
 * Lấy ngày hiện tại định dạng theo kiểu dd/mm/yyyy
 * @returns {string} Ngày hiện tại đã định dạng
 */
const getCurrentFormattedDate = () => {
    const currentDate = new Date();
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(currentDate);
};

// Xuất các hàm để sử dụng ở nơi khác
export {
    formatCurrency,
    formatDateTime,
    formatDate,
    getCurrentFormattedDate
};