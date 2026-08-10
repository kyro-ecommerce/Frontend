import React from "react";
import { formatCurrency, formatDateTime } from "../../../utils/admin/format.js";

const OrderDetailModal = ({ order, onClose, onStatusChange, onDeleteOrder }) => {
    if (!order) return null;

    const handleStatusSelect = async (e) => {
        const newStatus = e.target.value;
        if (onStatusChange) {
            await onStatusChange(order.id, newStatus);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa đơn hàng #${order.id}?`)) {
            if (onDeleteOrder) {
                await onDeleteOrder(order.id);
                onClose();
            }
        }
    };


    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center overflow-y-auto py-10 z-1000" onClick={onClose}>
            <div className="bg-white rounded-lg w-[90%] max-w-250 max-h-[90vh] overflow-y-auto shadow-[0_5px_20px_rgba(0,0,0,0.2)] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold m-0">Chi tiết đơn hàng #{order.id}</h2>
                    <button className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-800" onClick={onClose}>×</button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div className="bg-gray-50 rounded-lg p-4 mb-5">
                            <h3 className="text-base font-semibold m-0 mb-4 text-gray-800">Thông tin đơn hàng</h3>
                            <div className="flex flex-col md:flex-row mb-3">
                                <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Mã đơn hàng:</div>
                                <div className="text-sm font-medium text-gray-800">#{order.id}</div>
                            </div>
                            <div className="flex flex-col md:flex-row mb-3">
                                <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Ngày đặt hàng:</div>
                                <div className="text-sm font-medium text-gray-800">{formatDateTime(order.orderDate)}</div>
                            </div>
                            <div className="flex flex-col md:flex-row mb-3">
                                <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Trạng thái:</div>
                                <div className="text-sm font-medium text-gray-800">
                  <span className={`inline-block py-1.5 px-3 rounded-full text-xs font-medium cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all relative ${
                      order.orderStatus === 'PENDING' ? 'bg-amber-50 text-amber-500' :
                      order.orderStatus === 'CONFIRMED' ? 'bg-blue-50 text-blue-500' :
                      order.orderStatus === 'SHIPPED' ? 'bg-purple-50 text-purple-600' :
                      order.orderStatus === 'DELIVERED' ? 'bg-green-50 text-green-600' :
                      order.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-500' : 'bg-gray-50'
                  }`}>
                    {order.orderStatus}
                  </span>
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row mb-3">
                                <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Phương thức thanh toán:</div>
                                <div className="text-sm font-medium text-gray-800">{order.paymentMethod || ""}</div>
                            </div>
                            <div className="flex flex-col md:flex-row mb-3">
                                <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Trạng thái thanh toán:</div>
                                <div className="text-sm font-medium text-gray-800">{order.paymentStatus || "Chưa thanh toán"}</div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-5">
                            <h3 className="text-base font-semibold m-0 mb-4 text-gray-800">Thông tin khách hàng</h3>
                            <div className="flex flex-col md:flex-row mb-3">
                                <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Tên khách hàng:</div>
                                <div className="text-sm font-medium text-gray-800">
                                    {order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : (order.shippingAddress?.fullName || order.userEmail || "Khách hàng")}
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row mb-3">
                                <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Email:</div>
                                <div className="text-sm font-medium text-gray-800">{order.user?.email || order.userEmail || 'N/A'}</div>
                            </div>
                            <div className="flex flex-col md:flex-row mb-3">
                                <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Số điện thoại:</div>
                                <div className="text-sm font-medium text-gray-800">{order.user?.mobile || order.shippingAddress?.phoneNumber || 'Không có'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-5">
                        <h3 className="text-base font-semibold m-0 mb-4 text-gray-800">Địa chỉ giao hàng</h3>
                        {order.shippingAddress ? (
                            <>
                                <div className="flex flex-col md:flex-row mb-3">
                                    <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Người nhận:</div>
                                    <div className="text-sm font-medium text-gray-800">{order.shippingAddress.fullName}</div>
                                </div>
                                <div className="flex flex-col md:flex-row mb-3">
                                    <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Số điện thoại:</div>
                                    <div className="text-sm font-medium text-gray-800">{order.shippingAddress.phoneNumber}</div>
                                </div>
                                <div className="flex flex-col md:flex-row mb-3">
                                    <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Địa chỉ:</div>
                                    <div className="text-sm font-medium text-gray-800">
                                        {order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                                    </div>
                                </div>
                                {order.shippingAddress.note && (
                                    <div className="flex flex-col md:flex-row mb-3">
                                        <div className="w-full md:w-37.5 text-sm text-gray-500 mb-1 md:mb-0">Ghi chú:</div>
                                        <div className="text-sm font-medium text-gray-800">{order.shippingAddress.note}</div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-sm font-medium text-gray-800">Không có thông tin địa chỉ</div>
                        )}
                    </div>

                    <div className="mb-5">
                        <h3 className="text-base font-semibold m-0 mb-4 text-gray-800">Sản phẩm đã đặt</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse mt-3">
                                <thead>
                                <tr>
                                    <th className="p-3 text-left border-b border-gray-200 text-gray-500 font-medium text-[13px]">Sản phẩm</th>
                                    <th className="p-3 text-left border-b border-gray-200 text-gray-500 font-medium text-[13px]">Size</th>
                                    <th className="p-3 text-left border-b border-gray-200 text-gray-500 font-medium text-[13px]">Đơn giá</th>
                                    <th className="p-3 text-left border-b border-gray-200 text-gray-500 font-medium text-[13px]">Số lượng</th>
                                    <th className="p-3 text-left border-b border-gray-200 text-gray-500 font-medium text-[13px]">Thành tiền</th>
                                </tr>
                                </thead>
                                <tbody>
                                {order.orderItems && order.orderItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="p-3 text-left border-b border-gray-200">
                                            <div className="flex flex-col md:flex-row items-start md:items-center">
                                                <div className="w-12 h-12 rounded overflow-hidden bg-gray-50 mb-2 md:mb-0 md:mr-3 flex items-center justify-center shrink-0">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.productTitle} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-[10px] text-center text-gray-500">Không có ảnh</div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="font-medium mb-1 text-sm">{item.productTitle || "Sản phẩm không tồn tại"}</div>
                                                    <div className="text-xs text-gray-500">#{item.productId || "N/A"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 text-left border-b border-gray-200">{item.size || "N/A"}</td>
                                        <td className="p-3 text-left border-b border-gray-200">
                                            {item.discountedPrice ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{formatCurrency(item.discountedPrice)}</span>
                                                    <span className="text-xs text-gray-500 line-through">{formatCurrency(item.price)}</span>
                                                </div>
                                            ) : (
                                                formatCurrency(item.price)
                                            )}
                                        </td>
                                        <td className="p-3 text-left border-b border-gray-200">{item.quantity}</td>
                                        <td className="p-3 text-left border-b border-gray-200 font-medium text-blue-600">
                                            {formatCurrency((item.discountedPrice || item.price) * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mt-5">
                        <div className="flex justify-between py-2 text-sm">
                            <div>Tổng tiền hàng:</div>
                            <div>{formatCurrency(order.originalPrice)}</div>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between py-2 text-sm">
                                <div>Giảm giá:</div>
                                <div>-{formatCurrency(order.discount)}</div>
                            </div>
                        )}
                        <div className="flex justify-between py-2 text-sm">
                            <div>Phí vận chuyển:</div>
                            <div>{formatCurrency(0)}</div>
                        </div>
                        <div className="flex justify-between py-2 text-sm border-t border-gray-200 mt-2 pt-4 font-semibold">
                            <div>Tổng thanh toán:</div>
                            <div className="text-blue-600">{formatCurrency(order.totalDiscountedPrice)}</div>
                        </div>
                    </div>
                </div>

                <div className="p-4 px-5 border-t border-gray-200 flex flex-wrap justify-between items-center gap-3 sticky bottom-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-500">Cập nhật trạng thái:</span>
                        <select
                            value={order.orderStatus || "PENDING"}
                            onChange={handleStatusSelect}
                            className={`py-1.5 px-3 rounded-full text-xs font-bold border cursor-pointer outline-none transition-all shadow-2xs ${
                                order.orderStatus === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                order.orderStatus === 'CONFIRMED' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                order.orderStatus === 'SHIPPED' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                                order.orderStatus === 'DELIVERED' ? 'bg-green-50 text-green-600 border-green-200' :
                                order.orderStatus === 'CANCELLED' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                            }`}
                        >
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="SHIPPED">Đang vận chuyển</option>
                            <option value="DELIVERED">Đã giao</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            className="py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            onClick={handleDelete}
                        >
                            Xóa đơn hàng
                        </button>
                        <button
                            type="button"
                            className="py-2 px-5 bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
                            onClick={onClose}
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;