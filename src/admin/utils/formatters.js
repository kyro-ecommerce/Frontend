export const formatCurrency = (amount) => {
    if (typeof amount === 'object' && amount !== null) {
        try {
            amount = parseFloat(amount.toString());
        } catch (error) {
            amount = 0;
            console.log("error: ", error);
        }
    }
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + 'đ';
};

export const formatDate = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";

    try {
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) return "N/A"; // Kiểm tra ngày hợp lệ

        return new Intl.DateTimeFormat("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(date);
    } catch (e) {
        console.error("Lỗi định dạng ngày:", e);
        return "N/A";
    }
};

export const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";

    try {
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) return "N/A"; // Kiểm tra ngày hợp lệ

        return new Intl.DateTimeFormat("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    } catch (e) {
        console.error("Lỗi định dạng ngày giờ:", e);
        return "N/A";
    }
};

export const formatDateToISO = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const getRelativeTime = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";

    try {
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) return "N/A";

        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) {
            return "Vừa xong";
        } else if (diffMin < 60) {
            return `${diffMin} phút trước`;
        } else if (diffHour < 24) {
            return `${diffHour} giờ trước`;
        } else if (diffDay < 30) {
            return `${diffDay} ngày trước`;
        } else {
            return formatDate(date);
        }
    } catch (e) {
        console.error("Lỗi tính thời gian tương đối:", e);
        return "N/A";
    }
};