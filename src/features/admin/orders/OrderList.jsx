import React from "react";
import { formatCurrency, formatDateTime } from "../../../utils/admin/format.js";

const OrderList = ({ orders = [], isLoading, onStatusChange, onDeleteOrder, onViewOrder }) => {

    const handleStatusSelectChange = async (e, orderId) => {
        e.stopPropagation();
        const newStatus = e.target.value;
        if (onStatusChange) {
            await onStatusChange(orderId, newStatus);
        }
    };

    const getActionButtons = (order) => {
        return (
            <div className="flex gap-2 justify-center items-center">
                <button
                    className="p-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 cursor-pointer flex items-center justify-center transition-all shadow-2xs"
                    title="Xem chi tiết"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewOrder(order.id);
                    }}
                >
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/159/159604.png"
                        alt="Xem"
                        width={16}
                        height={16}
                    />
                </button>
                <button
                    className="py-1.5 px-3 border-none rounded-lg text-xs font-semibold cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                    title="Xóa đơn hàng"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${order.id}?`)) {
                            onDeleteOrder(order.id);
                        }
                    }}
                >
                    Xóa
                </button>
            </div>
        );
    };


    const getPaymentStatusInfo = (paymentStatus) => {
        if (!paymentStatus) return { text: "Không xác định", className: "bg-gray-50 text-gray-500" };

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
                                    <th className="p-3 text-[13px] text-center border-b border-gray-200 text-gray-500 font-medium bg-gray-50">Trạng thái đơn</th>
                                    <th className="p-3 text-[13px] text-center border-b border-gray-200 text-gray-500 font-medium bg-gray-50">Thanh toán</th>
                                    <th className="p-3 text-[13px] text-center border-b border-gray-200 text-gray-500 font-medium bg-gray-50">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id} onClick={() => onViewOrder && onViewOrder(order.id)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                                        <td className="p-3 text-[13px] text-center border-b border-gray-200 font-medium">#{order.id}</td>
                                        <td className="p-3 text-[13px] text-center border-b border-gray-200">
                                            <div className="flex flex-col justify-center items-center h-full">
                                                <span className="font-medium">{order.user?.firstName} {order.user?.lastName}</span>
                                                <span className="text-xs text-gray-500">{order.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-[13px] text-center border-b border-gray-200 hidden md:table-cell">{formatDateTime(order.orderDate)}</td>
                                        <td className="p-3 text-[13px] text-center border-b border-gray-200 font-medium">{formatCurrency(order.totalDiscountedPrice)}</td>
                                        <td className="p-3 text-[13px] text-center border-b border-gray-200" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                value={order.orderStatus || "PENDING"}
                                                onChange={(e) => handleStatusSelectChange(e, order.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className={`py-1 px-2.5 rounded-full text-xs font-bold border cursor-pointer outline-none transition-all shadow-2xs ${
                                                    order.orderStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                    order.orderStatus === 'CONFIRMED' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                    order.orderStatus === 'SHIPPED' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                                    order.orderStatus === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-200' :
                                                    order.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                                                }`}
                                            >
                                                <option value="PENDING">Chờ xác nhận</option>
                                                <option value="CONFIRMED">Đã xác nhận</option>
                                                <option value="SHIPPED">Đang giao</option>
                                                <option value="DELIVERED">Đã giao</option>
                                                <option value="CANCELLED">Đã hủy</option>
                                            </select>
                                        </td>
                                        <td className="p-3 text-[13px] text-center border-b border-gray-200">
                                            <div className="flex flex-col gap-1 items-center justify-center">
                                                <div className="text-xs">{order.paymentMethod || "COD"}</div>
                                                {order.paymentStatus && (
                                                    <div className={`text-[11px] py-0.5 px-1.5 rounded-full inline-block ${getPaymentStatusInfo(order.paymentStatus).className}`}>
                                                        {getPaymentStatusInfo(order.paymentStatus).text}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
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