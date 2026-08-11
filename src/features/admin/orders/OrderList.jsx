import React from "react";
import { formatCurrency, formatDateTime } from "../../../utils/admin/format.js";
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, Trash2, Filter } from "lucide-react";
import { useConfirm } from "../../../context/ConfirmContext.jsx";

const OrderList = ({
    orders = [],
    isLoading,
    onStatusChange,
    onDeleteOrder,
    onViewOrder,
    sortBy,
    sortDir,
    onSort,
    currentFilter = "all",
    onFilterChange,
    paymentStatus = "all",
    onPaymentStatusChange
}) => {
    const confirm = useConfirm();

    const handleStatusSelectChange = async (e, orderId) => {
        e.stopPropagation();
        const newStatus = e.target.value;
        if (onStatusChange) {
            await onStatusChange(orderId, newStatus);
        }
    };

    const renderSortButton = (field, label) => {
        const isActive = sortBy === field;
        return (
            <button
                type="button"
                onClick={() => onSort(field)}
                className={`group bg-transparent border-none font-extrabold text-xs tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                    isActive
                        ? "text-[#1D7461]"
                        : "text-slate-700 hover:text-slate-900"
                }`}
                title={`Sắp xếp theo ${label}`}
            >
                <span>{label}</span>
                {isActive ? (
                    <span className="w-5 h-5 rounded-md bg-[#1D7461]/15 text-[#1D7461] flex items-center justify-center">
                        {sortDir === "desc" ? (
                            <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                            <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                    </span>
                ) : (
                    <span className="w-5 h-5 rounded-md bg-slate-100/80 group-hover:bg-slate-200/80 text-slate-400 group-hover:text-slate-700 flex items-center justify-center transition-colors">
                        <ArrowUpDown className="w-3.5 h-3.5" />
                    </span>
                )}
            </button>
        );
    };

    const getActionButtons = (order) => {
        return (
            <div className="flex gap-1.5 justify-center items-center">
                <button
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer flex items-center justify-center transition-all border-none"
                    title="Xem chi tiết"
                    onClick={(e) => {
                        e.stopPropagation();
                        onViewOrder(order.id);
                    }}
                >
                    <Eye className="w-4 h-4 text-slate-700" />
                </button>
                <button
                    className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer flex items-center justify-center transition-all border-none"
                    title="Xóa đơn hàng"
                    onClick={async (e) => {
                        e.stopPropagation();
                        const isConfirmed = await confirm({
                            title: "Xóa đơn hàng",
                            message: `Bạn có chắc chắn muốn xóa đơn hàng #${order.id} không? Thao tác này không thể hoàn tác.`,
                            confirmText: "Xóa đơn hàng",
                            cancelText: "Hủy",
                            type: "danger"
                        });
                        if (isConfirmed) {
                            onDeleteOrder(order.id);
                        }
                    }}
                >
                    <Trash2 className="w-4 h-4 text-red-500" />
                </button>
            </div>
        );
    };

    const getPaymentStatusInfo = (pStatus) => {
        if (!pStatus) return { text: "Không xác định", className: "bg-slate-50 text-slate-400 border border-slate-200" };

        const statusMap = {
            "PENDING": { text: "Chờ thanh toán", className: "bg-amber-50 text-amber-600 border border-amber-200" },
            "COMPLETED": { text: "Đã thanh toán", className: "bg-[#F2F9F7] text-[#1D7461] border border-[#D5EFE8]" },
            "FAILED": { text: "Thanh toán thất bại", className: "bg-red-50 text-red-600 border border-red-200" },
            "CANCELLED": { text: "Đã hủy thanh toán", className: "bg-slate-50 text-slate-500 border border-slate-200" },
            "REFUNDED": { text: "Đã hoàn tiền", className: "bg-blue-50 text-blue-600 border border-blue-200" }
        };

        return statusMap[pStatus] || { text: pStatus, className: "bg-slate-50 text-slate-500 border border-slate-200" };
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
                <h3 className="text-base font-black text-slate-900 tracking-tight m-0">
                    Danh sách đơn hàng
                </h3>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-[#1D7461] mb-3"></div>
                    <p className="text-xs font-medium text-slate-500">Đang tải dữ liệu đơn hàng...</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                                {/* MÃ ĐƠN */}
                                <th className="py-3.5 px-4 text-center">
                                    {renderSortButton("id", "MÃ ĐƠN")}
                                </th>

                                {/* KHÁCH HÀNG */}
                                <th className="py-3.5 px-4 font-extrabold text-slate-700 text-xs uppercase tracking-wider">
                                    KHÁCH HÀNG
                                </th>

                                {/* NGÀY ĐẶT */}
                                <th className="py-3.5 px-4 text-center hidden md:table-cell">
                                    {renderSortButton("orderDate", "NGÀY ĐẶT")}
                                </th>

                                {/* TỔNG TIỀN */}
                                <th className="py-3.5 px-4 text-center">
                                    {renderSortButton("totalDiscountedPrice", "TỔNG TIỀN")}
                                </th>

                                {/* TRẠNG THÁI ĐƠN - FILTER GẮN TRỰC TIẾP TRÊN HEADER */}
                                <th className="py-3.5 px-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs">
                                        <span className="text-slate-600 font-extrabold whitespace-nowrap">TRẠNG THÁI</span>
                                        <select
                                            value={currentFilter || "all"}
                                            onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
                                            className="bg-slate-50 hover:bg-slate-100 text-[#1D7461] font-bold text-xs py-0.5 px-1.5 rounded-lg border border-slate-200 outline-none cursor-pointer transition-all"
                                        >
                                            <option value="all">Tất cả</option>
                                            <option value="PENDING">Chờ xử lý</option>
                                            <option value="CONFIRMED">Đã xác nhận</option>
                                            <option value="SHIPPED">Đang vận chuyển</option>
                                            <option value="DELIVERED">Đã giao</option>
                                            <option value="CANCELLED">Đã hủy</option>
                                        </select>
                                    </div>
                                </th>

                                {/* THANH TOÁN - FILTER GẮN TRỰC TIẾP TRÊN HEADER */}
                                <th className="py-3.5 px-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs">
                                        <span className="text-slate-600 font-extrabold whitespace-nowrap">THANH TOÁN</span>
                                        <select
                                            value={paymentStatus || "all"}
                                            onChange={(e) => onPaymentStatusChange && onPaymentStatusChange(e.target.value)}
                                            className="bg-slate-50 hover:bg-slate-100 text-[#1D7461] font-bold text-xs py-0.5 px-1.5 rounded-lg border border-slate-200 outline-none cursor-pointer transition-all"
                                        >
                                            <option value="all">Tất cả</option>
                                            <option value="PENDING">Chờ TT</option>
                                            <option value="COMPLETED">Đã TT</option>
                                            <option value="FAILED">Thất bại</option>
                                            <option value="CANCELLED">Đã hủy TT</option>
                                            <option value="REFUNDED">Hoàn tiền</option>
                                        </select>
                                    </div>
                                </th>

                                {/* THAO TÁC */}
                                <th className="py-3.5 px-4 text-center font-extrabold text-slate-700 text-xs uppercase tracking-wider">
                                    THAO TÁC
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                                            <Filter className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 mb-0.5">Không tìm thấy đơn hàng phù hợp</p>
                                        <p className="text-[11px] text-slate-400 m-0">Hãy thử đổi các bộ lọc ở tiêu đề cột hoặc ô tìm kiếm ở trên.</p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} onClick={() => onViewOrder && onViewOrder(order.id)} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                                        <td className="py-3.5 px-4 text-center">
                                            <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl border border-slate-200/80 font-mono font-bold text-xs">
                                                #{order.id}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                                    {order.shippingAddress?.fullName || `Khách hàng #${order.userId}`}
                                                </span>
                                                <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                                                    {order.shippingAddress?.phoneNumber || order.userEmail || ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center text-xs font-medium text-slate-500 hidden md:table-cell">
                                            {formatDateTime(order.orderDate)}
                                        </td>
                                        <td className="py-3.5 px-4 text-center font-black text-xs sm:text-sm text-[#1D7461]">
                                            {formatCurrency(order.totalDiscountedPrice)}
                                        </td>
                                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
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
                                        <td className="py-3.5 px-4 text-center">
                                            <div className="flex flex-col gap-1 items-center justify-center">
                                                <span className="text-xs font-bold text-slate-700">{order.paymentMethod || "COD"}</span>
                                                {order.paymentStatus && (
                                                    <span className={`text-[10px] font-extrabold py-0.5 px-2 rounded-full inline-block ${getPaymentStatusInfo(order.paymentStatus).className}`}>
                                                        {getPaymentStatusInfo(order.paymentStatus).text}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            {getActionButtons(order)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderList;
