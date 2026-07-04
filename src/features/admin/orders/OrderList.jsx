import React, { useState } from "react";
import OrderDetailModal from "./OrderDetailModal";
import { formatCurrency, formatDateTime } from "../../../utils/admin/format.js";

const OrderList = ({orders, isLoading, onStatusChange, onDeleteOrder, onViewOrder }) => {
    const [selectedOrder, setSelectedOrder] = useState(null);

    const getStatusBadge = (status, orderId) => {
        if (!status) return <span className="inline-block py-1.5 px-3 rounded-full text-xs font-medium bg-gray-50 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all relative">Không xác định</span>;

        const orderStatusMap = {
            "PENDING": {className: "bg-amber-50 text-amber-500", label: "Chờ xác nhận"},
            "CONFIRMED": {className: "bg-blue-50 text-blue-500", label: "Đã xác nhận"},
            "SHIPPED": {className: "bg-purple-50 text-purple-600", label: "Đang giao"},
            "DELIVERED": {className: "bg-green-50 text-green-600", label: "Đã giao"},
            "CANCELLED": {className: "bg-red-50 text-red-500", label: "Đã hủy"}
        };

        const statusInfo = orderStatusMap[status] || {className: "bg-gray-50", label: status};

        return (
            <span className={`inline-block py-1.5 px-3 rounded-full text-xs font-medium cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all relative ${statusInfo.className}`}>
                {statusInfo.label}
            </span>
        );
    };

    const getActionButtons = (order) => {
        return (
            <div className="flex gap-2 justify-center mx-auto w-full max-w-25">
                <button
                    className="w-8 h-8 border-none rounded bg-transparent cursor-pointer flex items-center justify-center transition-colors hover:bg-black/5"
                    title="Xem"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewOrder(order.id);
                    }}
                >
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                        alt="Xem"
                        width={20}
                        height={20}
                    />
                </button>
                <button
                    className="py-1.5 px-2.5 border-none rounded text-xs cursor-pointer bg-red-50 text-red-500 hover:bg-red-100 transition-colors w-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOrder(order.id);
                    }}
                >
                    Xóa
                </button>
            </div>
        );
    };

    // Hàm mở modal chi tiết
    const openOrderDetail = (order) => {
        setSelectedOrder(order);
    };

    // Hàm đóng modal chi tiết
    const closeOrderDetail = () => {
        setSelectedOrder(null);
    };


    const getPaymentStatusInfo = (paymentStatus) => {
        if (!paymentStatus) return { text: "Không xác định", className: "bg-gray-50 text-gray-500" };

        // Ánh xạ trạng thái thanh toán từ backend
        const statusMap = {
            "PENDING": { text: "Chờ thanh toán", className: "bg-amber-50 text-amber-500" },
            "COMPLETED": { text: "Đã thanh toán", className: "bg-green-50 text-green-600" },
            "FAILED": { text: "Thanh toán thất bại", className: "bg-red-50 text-red-500" },
            "CANCELLED": { text: "Đã hủy thanh toán", className: "bg-gray-50 text-gray-500" },
            "REFUNDED": { text: "Đã hoàn tiền", className: "bg-blue-50 text-blue-500" }
        };

        return statusMap[paymentStatus] || { text: paymentStatus, className: "bg-gray-50 text-gray-500" };
    };

    return (
    <div>
    <h2 className="text-lg font-semibold mb-5">Danh sách đơn hàng</h2>
    <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] p-4 mb-5">

            {/* Modal chi tiết đơn hàng */}
            {selectedOrder && (
                <OrderDetailModal order={selectedOrder} onClose={closeOrderDetail}/>
            )}

            {isLoading ? (
                <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>
            ) : orders.length === 0 ? (
                <div className="p-10 text-center text-gray-500">Không tìm thấy đơn hàng nào</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr>
                            <th className="p-3 text-[13px] text-center border-b border-gray-200 text-gray-500 font-medium bg-gray-50">Mã đơn</th>
                            <th className="p-3 text-[13px] text-center border-b border-gray-200 text-gray-500 font-medium bg-gray-50">Khách hàng</th>
                            <th className="p-3 text-[13px] text-center border-b border-gray-200 text-gray-500 font-medium bg-gray-50 hidden md:table-cell">Ngày đặt</th>
                            <th className="p-3 text-[13px] text-center border-b border-gray-200 text-gray-500 font-medium bg-gray-50">Tổng tiền</th>
                            <th className="p-3 text-[13px] text-center border-b border-gray-200 text-gray-500 font-medium bg-gray-50 hidden md:table-cell">Trạng thái đơn</th>
                            <th className="p-3 text-[13px] text-center border-b border-gray-200 text-gray-500 font-medium bg-gray-50">Thanh toán</th>
                            <th className="p-3 text-[13px] text-center border-b border-gray-200 text-gray-500 font-medium bg-gray-50">Thao tác</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} onClick={() => openOrderDetail(order)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                <td className="p-3 text-[13px] text-center border-b border-gray-200 font-medium">#{order.id}</td>
                                <td className="p-3 text-[13px] text-center border-b border-gray-200">
                                    <div className="flex flex-col justify-center items-center h-full">
                                        <span
                                            className="font-medium">{order.user?.firstName} {order.user?.lastName}</span>
                                        <span className="text-xs text-gray-500">{order.user?.email}</span>
                                    </div>
                                </td>
                                <td className="p-3 text-[13px] text-center border-b border-gray-200 hidden md:table-cell">{formatDateTime(order.orderDate)}</td>
                                <td className="p-3 text-[13px] text-center border-b border-gray-200 font-medium">{formatCurrency(order.totalDiscountedPrice)}</td>
                                <td className="p-3 text-[13px] text-center border-b border-gray-200 hidden md:table-cell">{getStatusBadge(order.orderStatus, order.id)}</td>
                                <td className="p-3 text-[13px] text-center border-b border-gray-200">
                                    <div className="flex flex-col gap-1 items-center justify-center">
                                        <div className="text-xs">{order.paymentMethod || "COD"}</div>
                                        {order.paymentStatus && (
                                            <div className={`text-[11px] py-0.5 px-1.5 rounded-full inline-block ${getPaymentStatusInfo(order.paymentStatus).className}`}>
                                                {getPaymentStatusInfo(order.paymentStatus).text}
                                            </div>
                                        )}
                                    </div>
                                </td >
                                <td className="p-3 text-[13px] text-center border-b border-gray-200" onClick={(e) => e.stopPropagation()}>{getActionButtons(order)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
    );
};

export default OrderList;