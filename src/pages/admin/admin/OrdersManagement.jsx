// src/pages/admin/OrdersManagement.jsx
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../../../layouts/admin/Layout";
import { useAuth } from "../../../hooks/admin/useAuth.jsx";
import { useOrders } from "../../../hooks/admin/useOrders.jsx";
import OrderList from "../../../features/admin/orders/OrderList";
import OrderStats from "../../../features/admin/orders/OrderStats";
import OrderFilters from "../../../features/admin/orders/OrderFilters";
import OrderDetailModal from "../../../features/admin/orders/OrderDetailModal.jsx";


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
            <div className="p-5 md:p-8 bg-gray-50 min-h-screen">
                {/* Order Statistics */}
                <OrderStats stats={stats} />

                {/* Order Filters */}
                <OrderFilters
                    currentFilter={filter}
                    onFilterChange={setFilter}
                    onSearch={handleSearch}
                />

                {/* Error Message */}
                {error && <div className="text-red-500 bg-red-50 p-4 rounded-md mb-4">{error}</div>}

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
                    <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                                className={`px-3 py-1.5 text-sm font-medium border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${pagination.currentPage === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                onClick={() => goToPage(0)}
                                disabled={pagination.currentPage === 0}
                            >
                                Trang đầu
                            </button>

                            <button
                                className="px-3 py-1.5 text-sm font-medium border rounded bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!pagination.hasPrevious}
                                onClick={previousPage}
                            >
                                Trang Trước
                            </button>

                            <div className="flex items-center">
                                <input
                                    type="number"
                                    value={pageInput}
                                    onChange={handlePageInputChange}
                                    onKeyPress={handlePageInputKeyPress}
                                    placeholder={`${pagination.currentPage + 1}`}
                                    min="1"
                                    max={pagination.totalPages}
                                    className="px-3 py-1.5 text-sm font-medium border rounded bg-white text-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-16 text-center"
                                />
                            </div>

                            <button
                                className="px-3 py-1.5 text-sm font-medium border rounded bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!pagination.hasNext}
                                onClick={nextPage}
                            >
                                Trang kế
                            </button>

                            <button
                                className={`px-3 py-1.5 text-sm font-medium border rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${pagination.currentPage === pagination.totalPages - 1 || pagination.totalPages === 0 ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                onClick={() => goToPage(pagination.totalPages - 1)}
                                disabled={pagination.currentPage === pagination.totalPages - 1 || pagination.totalPages === 0}
                            >
                                Trang cuối
                            </button>
                        </div>

                        <div className="text-sm text-gray-600">
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