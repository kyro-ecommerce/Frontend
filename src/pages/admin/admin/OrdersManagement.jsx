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
        paymentMethod,
        paymentStatus,
        sortBy,
        sortDir,
        setFilter,
        setPaymentMethod,
        setPaymentStatus,
        handleSort,
        handleSearch,
        handleStatusChange,
        handleDeleteOrder,
        handleViewOrder,
        handlePageChange,
        resetAllFilters
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
            <div className="p-6 md:p-8 bg-[#F8FAFC] min-h-screen">
                <div className="max-w-7xl mx-auto space-y-4">
                    {/* Order Statistics */}
                    <OrderStats stats={stats} />

                    {/* Order Filters & List Container */}
                    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4">
                        <OrderFilters
                            currentFilter={filter}
                            onFilterChange={setFilter}
                            onSearch={handleSearch}
                            paymentMethod={paymentMethod}
                            onPaymentMethodChange={setPaymentMethod}
                            paymentStatus={paymentStatus}
                            onPaymentStatusChange={setPaymentStatus}
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSortChange={handleSort}
                            onResetAllFilters={resetAllFilters}
                        />

                        {/* Error Message */}
                        {error && <div className="text-red-600 bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs font-semibold">{error}</div>}

                        {/* Order List */}
                        <OrderList
                            orders={orders}
                            isLoading={isLoading}
                            onStatusChange={handleStatusChange}
                            onDeleteOrder={handleDeleteOrder}
                            onViewOrder={handleViewOrderWithModal}
                            sortBy={sortBy}
                            sortDir={sortDir}
                            onSort={handleSort}
                            currentFilter={filter}
                            onFilterChange={setFilter}
                            paymentStatus={paymentStatus}
                            onPaymentStatusChange={setPaymentStatus}
                            paymentMethod={paymentMethod}
                            onPaymentMethodChange={setPaymentMethod}
                            totalElements={pagination.totalElements}
                        />

                        {/* Pagination */}
                        {!isLoading && orders.length > 0 && (
                            <div className="flex justify-center items-center pt-3 border-t border-slate-200/60">
                                <div className="flex flex-wrap items-center justify-center gap-1.5 bg-slate-50/80 p-1 rounded-2xl border border-slate-200/80">
                                    <button
                                        className="px-3 py-1.5 text-xs font-extrabold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                                        onClick={() => goToPage(0)}
                                        disabled={pagination.currentPage === 0}
                                        title="Trang đầu"
                                    >
                                        « Đầu
                                    </button>

                                    <button
                                        className="px-3 py-1.5 text-xs font-extrabold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                                        disabled={!pagination.hasPrevious}
                                        onClick={previousPage}
                                    >
                                        ‹ Trước
                                    </button>

                                    <div className="flex items-center gap-1.5 px-2">
                                        <span className="text-xs font-bold text-slate-500">Trang</span>
                                        <input
                                            type="number"
                                            value={pageInput}
                                            onChange={handlePageInputChange}
                                            onKeyPress={handlePageInputKeyPress}
                                            placeholder={`${pagination.currentPage + 1}`}
                                            min="1"
                                            max={pagination.totalPages}
                                            className="w-12 py-1 px-1 text-xs font-black text-center text-[#1D7461] bg-white border border-slate-300 rounded-lg outline-none focus:border-[#1D7461] focus:ring-1 focus:ring-[#1D7461]"
                                        />
                                        <span className="text-xs font-bold text-slate-500">/ {pagination.totalPages || 1}</span>
                                    </div>

                                    <button
                                        className="px-3 py-1.5 text-xs font-extrabold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                                        disabled={!pagination.hasNext}
                                        onClick={nextPage}
                                    >
                                        Kế ›
                                    </button>

                                    <button
                                        className="px-3 py-1.5 text-xs font-extrabold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                                        onClick={() => goToPage(pagination.totalPages - 1)}
                                        disabled={pagination.currentPage === pagination.totalPages - 1 || pagination.totalPages === 0}
                                        title="Trang cuối"
                                    >
                                        Cuối »
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Detail Modal */}
                {isModalOpen && selectedOrder && (
                    <OrderDetailModal
                        order={selectedOrder}
                        onClose={closeOrderDetail}
                        onStatusChange={handleStatusChange}
                        onDeleteOrder={async (orderId) => {
                            const ok = await handleDeleteOrder(orderId);
                            if (ok) closeOrderDetail();
                        }}
                    />
                )}
            </div>
        </Layout>
    );
};

export default OrdersManagement;
