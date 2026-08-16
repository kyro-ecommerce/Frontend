import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/admin/format.js';

const RecentOrders = ({ orders = [] }) => {
    // Đảm bảo orders là mảng
    const safeOrders = Array.isArray(orders) ? orders : [];

    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2 m-0">
                        Đơn hàng gần đây
                    </h3>
                    <p className="text-xs text-slate-400 font-medium m-0 mt-0.5">Các đơn hàng mới phát sinh gần nhất</p>
                </div>
                <Link to="/admin/orders" className="text-xs font-bold text-[#1D7461] hover:text-[#136050] bg-[#F2F9F7] hover:bg-[#E2F4EE] px-3 py-1.5 rounded-xl transition-all no-underline">
                    Xem tất cả ➔
                </Link>
            </div>

            {safeOrders.length > 0 ? (
                <table className="w-full border-collapse">
                    <thead>
                    <tr>
                        <th className="p-3 text-left border-b border-gray-200 text-gray-500 font-medium text-sm">Tracking No</th>
                        <th className="p-3 text-left border-b border-gray-200 text-gray-500 font-medium text-sm">Sản phẩm</th>
                        <th className="p-3 text-left border-b border-gray-200 text-gray-500 font-medium text-sm">Đơn giá</th>
                        <th className="p-3 text-left border-b border-gray-200 text-gray-500 font-medium text-sm">Số lượng</th>
                        <th className="p-3 text-left border-b border-gray-200 text-gray-500 font-medium text-sm">Tổng tiền</th>
                    </tr>
                    </thead>
                    <tbody>
                    {safeOrders.map((order) => {
                        const firstItem = order.orderItems?.[0];
                        const trackingNo = order.orderCode || 'N/A';
                        const productImg = firstItem?.imageUrl || firstItem?.productImageUrl || firstItem?.image || firstItem?.images?.[0]?.downloadUrl || order.productImg || order.imageUrl;
                        const mainTitle = firstItem?.productTitle || firstItem?.productName || order.productName || 'Đơn hàng';
                        const extraCount = (order.orderItems?.length || 1) - 1;
                        const productName = extraCount > 0 ? `${mainTitle} (+${extraCount})` : mainTitle;
                        const price = firstItem?.discountedPrice || firstItem?.price || order.price || 0;
                        const quantity = order.totalItems || firstItem?.quantity || order.quantity || 1;
                        const totalAmount = order.totalDiscountedPrice ?? order.originalPrice ?? order.totalAmount ?? (price * quantity);

                        return (
                            <tr key={order.id}>
                                <td className="p-3 text-left border-b border-gray-200">{trackingNo}</td>
                                <td className="p-3 text-left border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                            {productImg ? (
                                                <img
                                                    className="w-full h-full object-cover"
                                                    src={productImg}
                                                    alt={productName}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling ? e.target.nextSibling.style.display = 'flex' : null;
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">No image</div>
                                            )}
                                        </div>
                                        <div className="font-medium text-sm text-gray-800 line-clamp-1">{productName}</div>
                                    </div>
                                </td>
                                <td className="p-3 text-left border-b border-gray-200">{formatCurrency(price)}</td>
                                <td className="p-3 text-left border-b border-gray-200">{quantity}</td>
                                <td className="p-3 text-left border-b border-gray-200 font-semibold">{formatCurrency(totalAmount)}</td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>
            ) : (
                <div className="text-center p-5 text-gray-500">
                    Không có đơn hàng nào gần đây
                </div>
            )}

            {/* <Link to="/admin/orders" className="block text-center mt-4 text-blue-600 font-medium no-underline p-2 rounded-lg hover:bg-gray-100 transition-colors">
                Xem tất cả đơn hàng
            </Link> */}
        </div>
    );
};

export default RecentOrders;
