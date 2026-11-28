export const getReviewReasonMeta = (reason) => {
    const map = {
        SUCCESS_AFTER_ORDER_CANCELLED: {
            label: "Thanh toán thành công sau khi đơn đã hủy",
            badgeClass: "bg-red-50 text-red-700 border border-red-200",
            description:
                "Khách hàng đã hoàn tất thanh toán VNPay nhưng đơn hàng ở trạng thái ĐÃ HỦY (do hết tồn kho, quá hạn 15 phút hoặc hủy trước khi IPN đến). Cần đối soát trên cổng VNPay Merchant Portal để xử lý hoàn tiền thủ công."
        },
        MULTIPLE_SUCCESSFUL_CHARGES: {
            label: "Thu tiền thành công nhiều lần (trùng giao dịch)",
            badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
            description:
                "Phát hiện nhiều hơn 1 lần thử thanh toán (attempt) cùng trả kết quả SUCCESS cho cùng một đơn hàng. Hệ thống chỉ ghi nhận giao dịch thắng đầu tiên cho đơn; các giao dịch thu trùng cần đối soát hoàn trả."
        },
        ORDER_STATE_UNVERIFIED: {
            label: "Chưa xác minh được trạng thái đơn lúc callback",
            badgeClass: "bg-purple-50 text-purple-700 border border-purple-200",
            description:
                "Tại thời điểm nhận callback từ VNPay, payment-service không thể truy vấn trạng thái đơn từ order-service. Cần kiểm tra chéo trạng thái đơn hàng hiện tại và lịch sử giao dịch VNPay."
        }
    };

    if (reason && map[reason]) {
        return map[reason];
    }

    return {
        label: reason ? "Cần đối soát bất thường" : "Cần kiểm tra đối soát thủ công",
        badgeClass: "bg-amber-50 text-amber-700 border border-amber-200",
        description:
            "Giao dịch được đánh dấu reviewRequired = true để vận hành viên kiểm tra chéo giữa dữ liệu đơn hàng và cổng thanh toán VNPay."
    };
};

export const getPaymentStatusBadge = (pStatus) => {
    const statusMap = {
        PENDING: { text: "Chờ thanh toán", className: "bg-amber-50 text-amber-600 border border-amber-200" },
        COMPLETED: { text: "Đã thanh toán", className: "bg-[#F2F9F7] text-[#1D7461] border border-[#D5EFE8]" },
        FAILED: { text: "Thanh toán thất bại", className: "bg-red-50 text-red-600 border border-red-200" },
        CANCELLED: { text: "Đã hủy thanh toán", className: "bg-slate-50 text-slate-500 border border-slate-200" },
        REFUNDED: { text: "Đã hoàn tiền", className: "bg-blue-50 text-blue-600 border border-blue-200" }
    };
    return statusMap[pStatus] || { text: pStatus || "Không xác định", className: "bg-slate-50 text-slate-500 border border-slate-200" };
};
