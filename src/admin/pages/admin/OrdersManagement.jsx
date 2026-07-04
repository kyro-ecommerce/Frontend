// src/pages/admin/OrdersManagement.jsx
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../hooks/useAuth.jsx";
import { useOrders } from "../../hooks/useOrders.jsx";
import OrderList from "../../components/features/orders/OrderList";
import OrderStats from "../../components/features/orders/OrderStats";
import OrderFilters from "../../components/features/orders/OrderFilters";
import OrderDetailModal from "../../components/features/orders/OrderDetailModal.jsx";
import "../../styles/admin/order/orders.css";

const OrdersManagement = () => {
    const { user, loading, isAdmin } = useAuth();

    // Use the orders hook for all business logic
    const {
        orders,
        pagination,
        stats,
        isLoading,
        error,
        filter,
        setFilter,
        handleSearch,
        handleStatusChange,
        handleDeleteOrder,
        handleViewOrder,
        handlePageChange
    } = useOrders();

    // Local UI state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pageInput, setPageInput] = useState("");

    // Pagination handlers
    const goToPage = (page) => {
        if (page >= 0 && page < pagination.totalPages) {
            handlePageChange(page);
        }
    };

    const nextPage = () => {
        if (pagination.hasNext) {
            goToPage(pagination.currentPage + 1);
        }
    };

    const previousPage = () => {
        if (pagination.hasPrevious) {
            goToPage(pagination.currentPage - 1);
        }
    };

    const handlePageInputChange = (e) => {
        setPageInput(e.target.value);
    };

    const handlePageInputKeyPress = (e) => {
        if (e.key === 'Enter') {
            const pageNumber = parseInt(pageInput);
            if (pageNumber >= 1 && pageNumber <= pagination.totalPages) {
                goToPage(pageNumber - 1); // Convert to 0-based index
            }
            setPageInput("");
        }
    };

    // Handle view order with modal
    const handleViewOrderWithModal = async (orderId) => {
        const orderToView = await handleViewOrder(orderId);
        if (orderToView) {
            setSelectedOrder(orderToView);
            setIsModalOpen(true);
        }
    };

    const closeOrderDetail = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    // Loading state
    if (loading) {
        return <div>Đang tải...</div>;
    }

    // Authentication check
    if (!user || !isAdmin()) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout>
            <div className="orders-container">
                {/* Order Statistics */}
                <OrderStats stats={stats} />

                {/* Order Filters */}
                <OrderFilters
                    currentFilter={filter}
                    onFilterChange={setFilter}
                    onSearch={handleSearch}
                />

                {/* Error Message */}
                {error && <div className="error-message">{error}</div>}

                {/* Order List */}
                <OrderList
                    orders={orders}
                    isLoading={isLoading}
                    onStatusChange={handleStatusChange}
                    onDeleteOrder={handleDeleteOrder}
                    onViewOrder={handleViewOrderWithModal}
                />

                {/* Pagination */}
                {!isLoading && orders.length > 0 && (
                    <div className="pagination-container">
                        <div className="pagination">
                            <button
                                className={`button-product outline small ${pagination.currentPage === 0 ? 'active' : ''}`}
                                onClick={() => goToPage(0)}
                                disabled={pagination.currentPage === 0}
                            >
                                Trang đầu
                            </button>

                            <button
                                className="button-product outline small"
                                disabled={!pagination.hasPrevious}
                                onClick={previousPage}
                            >
                                Trang Trước
                            </button>

                            <div className="page-input-container">
                                <input
                                    type="number"
                                    value={pageInput}
                                    onChange={handlePageInputChange}
                                    onKeyPress={handlePageInputKeyPress}
                                    placeholder={`${pagination.currentPage + 1}`}
                                    min="1"
                                    max={pagination.totalPages}
                                    className="button-product outline small"
                                />
                            </div>

                            <button
                                className="button-product outline small"
                                disabled={!pagination.hasNext}
                                onClick={nextPage}
                            >
                                Trang kế
                            </button>

                            <button
                                className={`button-product outline small ${pagination.currentPage === pagination.totalPages - 1 || pagination.totalPages === 0 ? 'active' : ''}`}
                                onClick={() => goToPage(pagination.totalPages - 1)}
                                disabled={pagination.currentPage === pagination.totalPages - 1 || pagination.totalPages === 0}
                            >
                                Trang cuối
                            </button>
                        </div>

                        <div className="pagination-info">
                            Hiển thị {orders.length} trên {pagination.totalElements || 0} đơn hàng
                        </div>
                    </div>
                )}

                {/* Order Detail Modal */}
                {isModalOpen && selectedOrder && (
                    <OrderDetailModal
                        order={selectedOrder}
                        onClose={closeOrderDetail}
                        onStatusChange={handleStatusChange}
                    />
                )}
            </div>
        </Layout>
    );
};

export default OrdersManagement;