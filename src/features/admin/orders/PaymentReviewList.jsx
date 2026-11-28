import React from "react";
import { formatCurrency, formatDateTime } from "../../../utils/admin/format.js";
import { AlertTriangle, Eye, RefreshCw, RotateCcw, Search, ShieldAlert, CheckCircle2 } from "lucide-react";
import { getPaymentStatusBadge, getReviewReasonMeta } from "./paymentReviewUtils.js";

const PaymentReviewList = ({
    reviews = [],
    totalReviewCount = 0,
    isLoading,
    error,
    searchQuery,
    onSearchQueryChange,
    reasonFilter,
    onReasonFilterChange,
    onResetFilters,
    onRefresh,
    onViewDetail
}) => {
    const hasActiveFilter = Boolean(searchQuery?.trim()) || (reasonFilter && reasonFilter !== "all");

    return (
        <div className="space-y-4">
            {/* Read-only Explanation Banner */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-700 leading-relaxed">
                    <div className="font-extrabold text-amber-900 mb-0.5">
                        Hàng đợi đối soát thanh toán (Chỉ đọc — Read-Only)
                    </div>
                    <p className="m-0 text-slate-600">
                        Liệt kê các bản ghi thanh toán có <code className="px-1.5 py-0.5 rounded bg-white border border-amber-200/80 text-amber-800 font-mono text-[11px]">reviewRequired = true</code> (thanh toán đến muộn sau khi đơn đã hủy, khách thanh toán thành công trùng nhiều attempt, hoặc chưa xác minh được trạng thái đơn lúc nhận IPN). Quản trị viên tra cứu lịch sử attempt tại đây để đối soát trực tiếp trên cổng VNPay Merchant Portal.
                    </p>
                </div>
            </div>

            {/* Filter & Refresh Bar */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Tìm Order ID, Payment ID hoặc mã vnp_TxnRef..."
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            className="w-full py-2 pr-8 pl-10 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 outline-none focus:border-[#1D7461] focus:ring-2 focus:ring-[#1D7461]/20 transition-all placeholder-slate-400 shadow-2xs"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => onSearchQueryChange("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs border-none bg-transparent cursor-pointer p-1"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <select
                        value={reasonFilter || "all"}
                        onChange={(e) => onReasonFilterChange(e.target.value)}
                        className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#1D7461] cursor-pointer shadow-2xs"
                    >
                        <option value="all">Tất cả lý do đối soát</option>
                        <option value="SUCCESS_AFTER_ORDER_CANCELLED">Thanh toán sau khi đơn hủy (SUCCESS_AFTER_ORDER_CANCELLED)</option>
                        <option value="MULTIPLE_SUCCESSFUL_CHARGES">Thu tiền trùng nhiều lần (MULTIPLE_SUCCESSFUL_CHARGES)</option>
                        <option value="ORDER_STATE_UNVERIFIED">Chưa xác minh trạng thái đơn (ORDER_STATE_UNVERIFIED)</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 justify-end">
                    {hasActiveFilter && (
                        <button
                            type="button"
                            onClick={onResetFilters}
                            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold cursor-pointer transition-all border border-slate-200 shadow-2xs flex items-center gap-1.5"
                        >
                            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                            <span>Đặt lại</span>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={isLoading}
                        className="px-3.5 py-2 bg-[#1D7461] hover:bg-[#155a4b] disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer transition-all border-none shadow-xs flex items-center gap-1.5"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                        <span>Làm mới</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="text-red-600 bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs font-semibold">
                    {error}
                </div>
            )}

            {/* Header Summary */}
            <div className="flex items-center justify-between pb-1">
                <h3 className="text-base font-black text-slate-900 tracking-tight m-0">
                    Danh sách giao dịch cần đối soát
                </h3>
                <div className="text-xs font-bold text-slate-500">
                    Hiển thị <span className="text-slate-900 font-extrabold">{reviews.length}</span> trên{" "}
                    <span className="text-slate-900 font-extrabold">{totalReviewCount}</span> giao dịch cần đối soát
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-[#1D7461] mb-3"></div>
                    <p className="text-xs font-medium text-slate-500 m-0">Đang tải danh sách đối soát thanh toán...</p>
                </div>
            ) : (
                <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/90 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                                <th className="py-3.5 px-4 text-center">ĐƠN HÀNG / PAYMENT</th>
                                <th className="py-3.5 px-4">MÃ GIAO DỊCH (TXN REF)</th>
                                <th className="py-3.5 px-4 text-center">SỐ TIỀN</th>
                                <th className="py-3.5 px-4 text-center">TRẠNG THÁI TT</th>
                                <th className="py-3.5 px-4">LÝ DO CẦN ĐỐI SOÁT</th>
                                <th className="py-3.5 px-4 text-center hidden md:table-cell">CẬP NHẬT LÚC</th>
                                <th className="py-3.5 px-4 text-center">CHI TIẾT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                            {reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <div className="w-10 h-10 rounded-2xl bg-[#F2F9F7] text-[#1D7461] flex items-center justify-center mx-auto mb-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 mb-0.5">
                                            {hasActiveFilter
                                                ? "Không có bản ghi đối soát nào khớp bộ lọc"
                                                : "Hiện không có giao dịch nào cần đối soát"}
                                        </p>
                                        <p className="text-[11px] text-slate-400 m-0">
                                            {hasActiveFilter
                                                ? "Hãy thử xóa từ khóa tìm kiếm hoặc chọn Tất cả lý do đối soát."
                                                : "Các giao dịch thanh toán muộn sau khi hủy đơn hoặc thu trùng tiền sẽ tự động xuất hiện tại đây."}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((payment) => {
                                    const reasonMeta = getReviewReasonMeta(payment.reviewReason);
                                    const pStatusInfo = getPaymentStatusBadge(payment.paymentStatus);

                                    return (
                                        <tr
                                            key={payment.id}
                                            onClick={() => onViewDetail && onViewDetail(payment.id)}
                                            className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                        >
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl border border-slate-200/80 font-mono font-bold text-xs">
                                                        Đơn #{payment.orderId}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-semibold">
                                                        Payment #{payment.id}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-mono text-xs font-bold text-slate-800 break-all">
                                                        {payment.transactionId || "—"}
                                                    </span>
                                                    {payment.winningTransactionId != null && (
                                                        <span className="text-[10px] text-slate-400 font-medium">
                                                            Winning Attempt ID: #{payment.winningTransactionId}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-center font-black text-xs sm:text-sm text-[#1D7461]">
                                                {formatCurrency(payment.totalAmount)}
                                            </td>

                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex flex-col gap-1 items-center justify-center">
                                                    <span className="text-xs font-bold text-slate-700">
                                                        {payment.paymentMethod || "VNPAY"}
                                                    </span>
                                                    <span className={`text-[10px] font-extrabold py-0.5 px-2 rounded-full inline-block ${pStatusInfo.className}`}>
                                                        {pStatusInfo.text}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`inline-flex items-center gap-1 py-1 px-2.5 rounded-full text-[11px] font-bold ${reasonMeta.badgeClass}`}>
                                                        <AlertTriangle className="w-3 h-3 shrink-0" />
                                                        <span>{reasonMeta.label}</span>
                                                    </span>
                                                    {payment.reviewReason && (
                                                        <span className="font-mono text-[10px] text-slate-400 pl-1">
                                                            {payment.reviewReason}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-center text-xs font-medium text-slate-500 hidden md:table-cell">
                                                {formatDateTime(payment.paymentDate || payment.updatedAt || payment.createdAt)}
                                            </td>

                                            <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all border-none"
                                                    title="Xem lịch sử các lần thử thanh toán"
                                                    onClick={() => onViewDetail && onViewDetail(payment.id)}
                                                >
                                                    <Eye className="w-3.5 h-3.5 text-slate-700" />
                                                    <span>Attempts</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PaymentReviewList;
