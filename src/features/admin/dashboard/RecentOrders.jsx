import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/admin/format.js';

const RecentOrders = ({ orders = [] }) => {
    // Đảm bảo orders là mảng
    const safeOrders = Array.isArray(orders) ? orders : [];

    return (
        <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="text-base font-semibold mb-4">Đơn hàng gần đây</h3>

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
                    {safeOrders.map((order) => (
                        <tr key={order.id}>
                            <td className="p-3 text-left border-b border-gray-200">{order.trackingNo || `TN-${order.id}`}</td>
                            <td className="p-3 text-left border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                                        {order.productImg ? (
                                            <img className="w-full h-full object-cover" src={order.productImg} alt={order.productName} />
                                        ) : (
                                            <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">No image</div>
                                        )}
                                    </div>
                                    <div className="font-medium">{order.productName}</div>
                                </div>
                            </td>
                            <td className="p-3 text-left border-b border-gray-200">{formatCurrency(order.price)}</td>
                            <td className="p-3 text-left border-b border-gray-200">{order.quantity}</td>
                            <td className="p-3 text-left border-b border-gray-200">{formatCurrency(order.totalAmount)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center p-5 text-gray-500">
                    Không có đơn hàng nào gần đây
                </div>
            )}

            <Link to="/admin/orders" className="block text-center mt-4 text-blue-600 font-medium no-underline p-2 rounded-lg hover:bg-gray-100 transition-colors">
                Xem tất cả đơn hàng
            </Link>
        </div>
    );
};

export default RecentOrders;