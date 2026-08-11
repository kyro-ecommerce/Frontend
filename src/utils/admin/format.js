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
const parseDateInput = (val) => {
    if (!val) return null;
    if (Array.isArray(val)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = val;
        return new Date(year, month - 1, day, hour, minute, second);
    }
    return new Date(val);
};

const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';

    try {
        const date = parseDateInput(dateTimeStr);
        if (!date || isNaN(date.getTime())) return 'N/A';

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
 * @param {string|Date|Array} dateStr - Chuỗi ngày hoặc đối tượng Date hoặc mảng mốc thời gian
 * @returns {string} Chuỗi đã định dạng hoặc 'N/A' nếu không hợp lệ
 */
const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';

    try {
        const date = parseDateInput(dateStr);
        if (!date || isNaN(date.getTime())) return 'N/A';

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

const categoryNameMap = {
    "Laptop": "Laptop",
    "Phone": "Điện thoại",
    "Mobile": "Điện thoại",
    "Tablet": "Máy tính bảng",
    "Desktop-Computers": "Máy tính để bàn",
    "Desktop": "Máy tính để bàn",
    "Accessories": "Phụ kiện",
    "Accessory": "Phụ kiện",
    "accessories": "Phụ kiện",
    "accessory": "Phụ kiện",
    "Smartwatch": "Đồng hồ thông minh",
    "Watch": "Đồng hồ thông minh",
    "Audio": "Thiết bị âm thanh",
    "Camera": "Máy ảnh",
    "Gaming Laptops": "Laptop Gaming",
    "Gaming": "Gaming",
    "2-in-1": "Laptop 2-trong-1",
    "MacBook": "MacBook",
    "Ultrabook": "Laptop Văn Phòng",
    "iPhone": "iPhone",
    "Samsung": "Samsung",
    "Xiaomi": "Xiaomi",
    "OPPO": "OPPO",
    "OnePlus": "OnePlus",
    "Acer": "Acer",
    "ASUS": "ASUS",
    "Dell": "Dell",
    "HP": "HP",
    "Apple": "Apple",
    "iPad": "iPad",
    "Android Tablets": "Máy tính bảng Android",
    "PC Gaming": "PC Gaming",
    "PC Office": "PC Văn Phòng",
    "Mouse": "Chuột",
    "Keyboard": "Bàn phím",
    "Headphone": "Tai nghe",
    "Headphones": "Tai nghe",
    "Charger": "Sạc & Cáp",
    "Cable": "Cáp sạc",
    "Uncategorized": "Chưa phân loại",
    "Other-Products": "Sản phẩm khác",
    "other-products": "Sản phẩm khác"
};

const translateCategoryName = (name) => {
    if (!name) return "Chưa phân loại";
    const str = String(name).trim();
    if (categoryNameMap[str]) return categoryNameMap[str];
    const normalized = str.toLowerCase().replace(/[-_]/g, ' ');
    for (const [key, val] of Object.entries(categoryNameMap)) {
        if (key.toLowerCase().replace(/[-_]/g, ' ') === normalized) return val;
    }
    return str;
};

// Xuất các hàm để sử dụng ở nơi khác
export {
    formatCurrency,
    formatDateTime,
    formatDate,
    getCurrentFormattedDate,
    translateCategoryName
};