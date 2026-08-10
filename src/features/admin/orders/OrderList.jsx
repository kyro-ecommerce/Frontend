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
            <div className="flex gap-1.5 justify-center items-center">
                <button
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-600 cursor-pointer flex items-center justify-center transition-all border-none"
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
        if (!paymentStatus) return { text: "Không xác định", className: "bg-slate-50 text-slate-400 border border-slate-200" };

        const statusMap = {
            "PENDING": { text: "Chờ thanh toán", className: "bg-amber-50 text-amber-600 border border-amber-200" },
            "COMPLETED": { text: "Đã thanh toán", className: "bg-[#F2F9F7] text-[#1D7461] border border-[#D5EFE8]" },
            "FAILED": { text: "Thanh toán thất bại", className: "bg-red-50 text-red-600 border border-red-200" },
            "CANCELLED": { text: "Đã hủy thanh toán", className: "bg-slate-50 text-slate-500 border border-slate-200" },
            "REFUNDED": { text: "Đã hoàn tiền", className: "bg-blue-50 text-blue-600 border border-blue-200" }
        };

        return statusMap[paymentStatus] || { text: paymentStatus, className: "bg-slate-50 text-slate-500 border border-slate-200" };
    };

    return (
        <div>
            <div className="flex justify-between pb-3 items-center">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight m-0">
                    Danh sách đơn hàng
                </h3>
            </div>
            {isLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs font-medium">Đang tải dữ liệu đơn hàng...</div>
            ) : orders.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-medium">Không tìm thấy đơn hàng nào</div>
            ) : (
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80">
                                <th className="p-3.5 px-4 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Mã đơn</th>
                                <th className="p-3.5 px-4 text-left font-extrabold text-slate-400 text-xs uppercase tracking-wider">Khách hàng</th>
                                <th className="p-3.5 px-4 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider hidden md:table-cell">Ngày đặt</th>
                                <th className="p-3.5 px-4 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Tổng tiền</th>
                                <th className="p-3.5 px-4 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Trạng thái đơn</th>
                                <th className="p-3.5 px-4 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Thanh toán</th>
                                <th className="p-3.5 px-4 text-center font-extrabold text-slate-400 text-xs uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order) => (
                                <tr key={order.id} onClick={() => onViewOrder && onViewOrder(order.id)} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                                    <td className="p-3.5 px-4 text-center">
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/60 font-bold text-xs">#{order.id}</span>
                                    </td>
                                    <td className="p-3.5 px-4 text-left">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-xs text-slate-800">
                                                {order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : (order.shippingAddress?.fullName || order.userEmail || "Khách hàng")}
                                            </span>
                                            <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                                                {order.user?.email || order.userEmail || (order.shippingAddress?.phoneNumber ? `SĐT: ${order.shippingAddress.phoneNumber}` : "N/A")}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-3.5 px-4 text-center text-xs font-medium text-slate-500 hidden md:table-cell">{formatDateTime(order.orderDate)}</td>
                                    <td className="p-3.5 px-4 text-center font-extrabold text-xs text-[#1D7461]">{formatCurrency(order.totalDiscountedPrice)}</td>
                                    <td className="p-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            value={order.orderStatus || "PENDING"}
                                            onChange={(e) => handleStatusSelectChange(e, order.id)}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`py-1 px-3 rounded-full text-xs font-extrabold border cursor-pointer outline-none transition-all ${
                                                order.orderStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                order.orderStatus === 'CONFIRMED' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                order.orderStatus === 'SHIPPED' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                                order.orderStatus === 'DELIVERED' ? 'bg-[#F2F9F7] text-[#1D7461] border-[#D5EFE8]' :
                                                order.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                        >
                                            <option value="PENDING">Chờ xử lý</option>
                                            <option value="CONFIRMED">Đã xác nhận</option>
                                            <option value="SHIPPED">Đang vận chuyển</option>
                                            <option value="DELIVERED">Đã giao</option>
                                            <option value="CANCELLED">Đã hủy</option>
                                        </select>
                                    </td>
                                    <td className="p-3.5 px-4 text-center">
                                        <div className="flex flex-col gap-1 items-center justify-center">
                                            <span className="text-xs font-bold text-slate-700">{order.paymentMethod || "COD"}</span>
                                            {order.paymentStatus && (
                                                <span className={`text-[10px] font-bold py-0.5 px-2 rounded-full inline-block ${getPaymentStatusInfo(order.paymentStatus).className}`}>
                                                    {getPaymentStatusInfo(order.paymentStatus).text}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>{getActionButtons(order)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderList;