import React from "react";
import "../../../styles/admin/order/order-detail.css";
import { formatCurrency, formatDateTime } from "../../../utils/format.js";

const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;


    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="order-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Chi tiết đơn hàng #{order.id}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="order-info-grid">
                        <div className="order-info-section">
                            <h3>Thông tin đơn hàng</h3>
                            <div className="info-group">
                                <div className="info-label">Mã đơn hàng:</div>
                                <div className="info-value">#{order.id}</div>
                            </div>
                            <div className="info-group">
                                <div className="info-label">Ngày đặt hàng:</div>
                                <div className="info-value">{formatDateTime(order.orderDate)}</div>
                            </div>
                            <div className="info-group">
                                <div className="info-label">Trạng thái:</div>
                                <div className="info-value">
                  <span className={`status-badge status-${order.orderStatus?.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                                </div>
                            </div>
                            <div className="info-group">
                                <div className="info-label">Phương thức thanh toán:</div>
                                <div className="info-value">{order.paymentMethod || ""}</div>
                            </div>
                            <div className="info-group">
                                <div className="info-label">Trạng thái thanh toán:</div>
                                <div className="info-value">{order.paymentStatus || "Chưa thanh toán"}</div>
                            </div>
                        </div>

                        <div className="order-info-section">
                            <h3>Thông tin khách hàng</h3>
                            <div className="info-group">
                                <div className="info-label">Tên khách hàng:</div>
                                <div className="info-value">
                                    {(order.user?.firstName || '') + ' ' + (order.user?.lastName || '')}
                                </div>
                            </div>
                            <div className="info-group">
                                <div className="info-label">Email:</div>
                                <div className="info-value">{order.user?.email || 'N/A'}</div>
                            </div>
                            <div className="info-group">
                                <div className="info-label">Số điện thoại:</div>
                                <div className="info-value">{order.user?.mobile || 'Không có'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="order-info-section">
                        <h3>Địa chỉ giao hàng</h3>
                        {order.shippingAddress ? (
                            <>
                                <div className="info-group">
                                    <div className="info-label">Người nhận:</div>
                                    <div className="info-value">{order.shippingAddress.fullName}</div>
                                </div>
                                <div className="info-group">
                                    <div className="info-label">Số điện thoại:</div>
                                    <div className="info-value">{order.shippingAddress.phoneNumber}</div>
                                </div>
                                <div className="info-group">
                                    <div className="info-label">Địa chỉ:</div>
                                    <div className="info-value">
                                        {order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.province}
                                    </div>
                                </div>
                                {order.shippingAddress.note && (
                                    <div className="info-group">
                                        <div className="info-label">Ghi chú:</div>
                                        <div className="info-value">{order.shippingAddress.note}</div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="info-value">Không có thông tin địa chỉ</div>
                        )}
                    </div>

                    <div className="order-items-section">
                        <h3>Sản phẩm đã đặt</h3>
                        <table className="order-items-table">
                            <thead>
                            <tr>
                                <th>Sản phẩm</th>
                                <th>Size</th>
                                <th>Đơn giá</th>
                                <th>Số lượng</th>
                                <th>Thành tiền</th>
                            </tr>
                            </thead>
                            <tbody>
                            {order.orderItems && order.orderItems.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="product-cell">
                                            <div className="product-image">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.productTitle} />
                                                ) : (
                                                    <div className="no-image">Không có ảnh</div>
                                                )}
                                            </div>
                                            <div className="product-details">
                                                <div className="product-name">{item.productTitle || "Sản phẩm không tồn tại"}</div>
                                                <div className="product-id">#{item.productId || "N/A"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{item.size || "N/A"}</td>
                                    <td>
                                        {item.discountedPrice ? (
                                            <div className="price-with-discount">
                                                <span className="discounted-price">{formatCurrency(item.discountedPrice)}</span>
                                                <span className="original-price">{formatCurrency(item.price)}</span>
                                            </div>
                                        ) : (
                                            formatCurrency(item.price)
                                        )}
                                    </td>
                                    <td>{item.quantity}</td>
                                    <td className="item-total">
                                        {formatCurrency((item.discountedPrice || item.price) * item.quantity)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="order-summary">
                        <div className="summary-row">
                            <div>Tổng tiền hàng:</div>
                            <div>{formatCurrency(order.originalPrice)}</div>
                        </div>
                        {order.discount > 0 && (
                            <div className="summary-row">
                                <div>Giảm giá:</div>
                                <div>-{formatCurrency(order.discount)}</div>
                            </div>
                        )}
                        <div className="summary-row">
                            <div>Phí vận chuyển:</div>
                            <div>{formatCurrency(0)}</div>
                        </div>
                        <div className="summary-row total">
                            <div>Tổng thanh toán:</div>
                            <div>{formatCurrency(order.totalDiscountedPrice)}</div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;