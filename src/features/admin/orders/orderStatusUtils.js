export const ORDER_STATUS_META = {
    PENDING: {
        label: "Chờ xử lý",
        badgeClass: "bg-amber-50 text-amber-600 border-amber-200"
    },
    CONFIRMED: {
        label: "Đã xác nhận",
        badgeClass: "bg-blue-50 text-blue-600 border-blue-200"
    },
    SHIPPED: {
        label: "Đang vận chuyển",
        badgeClass: "bg-purple-50 text-purple-600 border-purple-200"
    },
    DELIVERED: {
        label: "Đã giao",
        badgeClass: "bg-[#F2F9F7] text-[#1D7461] border-[#D5EFE8]"
    },
    CANCELLED: {
        label: "Đã hủy",
        badgeClass: "bg-red-50 text-red-600 border-red-200"
    }
};

export const getOrderStatusMeta = (status) =>
    ORDER_STATUS_META[status] || {
        label: status || "Không xác định",
        badgeClass: "bg-slate-50 text-slate-600 border-slate-200"
    };

export const isTerminalOrderStatus = (status) =>
    status === "DELIVERED" || status === "CANCELLED";

/**
 * Mirrors OrderService.java state machine transitions:
 * - PENDING -> CONFIRMED (requires VNPAY payment COMPLETED) | CANCELLED
 * - CONFIRMED -> SHIPPED | CANCELLED
 * - SHIPPED -> DELIVERED
 * - DELIVERED / CANCELLED -> terminal
 */
export const getOrderStatusOptions = (order) => {
    const current = order?.orderStatus || "PENDING";
    const currentMeta = getOrderStatusMeta(current);
    const options = [{ value: current, label: currentMeta.label, disabled: false }];

    if (current === "PENDING") {
        const unpaidVnpay =
            order?.paymentMethod === "VNPAY" && order?.paymentStatus !== "COMPLETED";
        options.push({
            value: "CONFIRMED",
            label: unpaidVnpay ? "Đã xác nhận (Chờ TT VNPAY)" : "Đã xác nhận",
            disabled: unpaidVnpay
        });
        options.push({ value: "CANCELLED", label: "Đã hủy", disabled: false });
    } else if (current === "CONFIRMED") {
        options.push({ value: "SHIPPED", label: "Đang vận chuyển", disabled: false });
        options.push({ value: "CANCELLED", label: "Đã hủy", disabled: false });
    } else if (current === "SHIPPED") {
        options.push({ value: "DELIVERED", label: "Đã giao", disabled: false });
    }

    return options;
};

export const canAdminDeleteOrder = (order) =>
    order?.orderStatus === "CANCELLED" && order?.paymentMethod !== "VNPAY";

export const getDeleteDisabledReason = (order) => {
    if (order?.paymentMethod === "VNPAY") {
        return "Đơn VNPAY không thể xóa để lưu vết đối soát thanh toán";
    }
    if (order?.orderStatus !== "CANCELLED") {
        return "Chỉ có thể xóa đơn COD đã ở trạng thái Đã hủy";
    }
    return "Xóa đơn hàng";
};
