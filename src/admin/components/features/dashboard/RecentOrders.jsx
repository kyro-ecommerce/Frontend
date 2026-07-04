import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../../utils/format.js';

const RecentOrders = ({ orders = [] }) => {
    // Đảm bảo orders là mảng
    const safeOrders = Array.isArray(orders) ? orders : [];

    return (
        <div className="recent-orders-card">
            <h3 className="card-title">Đơn hàng gần đây</h3>

            {safeOrders.length > 0 ? (
                <table className="recent-orders-table">
                    <thead>
                    <tr>
                        <th>Tracking No</th>
                        <th>Sản phẩm</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Tổng tiền</th>
                    </tr>
                    </thead>
                    <tbody>
                    {safeOrders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.trackingNo || `TN-${order.id}`}</td>
                            <td>
                                <div className="product-info">
                                    <div className="product-img">
                                        {order.productImg ? (
                                            <img src={order.productImg} alt={order.productName} />
                                        ) : (
                                            <div className="no-image">No image</div>
                                        )}
                                    </div>
                                    <div className="product-name">{order.productName}</div>
                                </div>
                            </td>
                            <td>{formatCurrency(order.price)}</td>
                            <td>{order.quantity}</td>
                            <td>{formatCurrency(order.totalAmount)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <div className="no-data" style={{ textAlign: 'center', padding: '20px', color: 'var(--secondary-color)' }}>
                    Không có đơn hàng nào gần đây
                </div>
            )}

            <Link to="/admin/orders" className="view-all">
                Xem tất cả đơn hàng
            </Link>
        </div>
    );
};

export default RecentOrders;