import React from "react";
import { formatCurrency, formatDateTime } from "../../../utils/admin/format.js";
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert, XCircle } from "lucide-react";
import { getPaymentStatusBadge, getReviewReasonMeta } from "./paymentReviewUtils.js";

const getAttemptStatusBadge = (status) => {
    const normalized = String(status || "").toUpperCase();
    if (normalized === "SUCCESS") {
        return {
            text: "SUCCESS",
            className: "bg-[#F2F9F7] text-[#1D7461] border border-[#D5EFE8]",
            icon: <CheckCircle2 className="w-3 h-3" />
        };
    }
    if (normalized === "FAILED") {
        return {
            text: "FAILED",
            className: "bg-red-50 text-red-600 border border-red-200",
            icon: <XCircle className="w-3 h-3" />
        };
    }
    return {
        text: normalized || "PENDING",
        className: "bg-amber-50 text-amber-600 border border-amber-200",
        icon: <Clock className="w-3 h-3" />
    };
};

const PaymentReviewDetailModal = ({ detail, isLoading, error, onClose }) => {
    if (!detail && !isLoading && !error) return null;

    const payment = detail?.payment || null;
    const transactions = Array.isArray(detail?.transactions) ? detail.transactions : [];
    const reasonMeta = getReviewReasonMeta(payment?.reviewReason);
    const paymentBadge = getPaymentStatusBadge(payment?.paymentStatus);

    const successCount = transactions.filter(
        (tx) => String(tx.transaction_status ?? tx.transactionStatus ?? "").toUpperCase() === "SUCCESS"
    ).length;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex justify-center items-center overflow-y-auto py-10 z-1000"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-[92%] max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_10px_30px_rgba(0,0,0,0.22)] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-slate-900 m-0">
                                Chi tiết đối soát thanh toán {payment?.id ? `#${payment.id}` : ""}
                            </h2>
                            <span className="text-xs text-slate-500 font-medium">
                                Chế độ xem chỉ đọc (Read-Only) — dữ liệu từ payment-service
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="bg-transparent border-none text-2xl cursor-pointer text-slate-400 hover:text-slate-800 leading-none px-2"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 overflow-y-auto space-y-5">
                    {isLoading ? (
                        <div className="py-16 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-slate-200 border-t-[#1D7461] mb-3"></div>
                            <p className="text-xs font-medium text-slate-500 m-0">
                                Đang tải thông tin thanh toán và lịch sử các lần thử (attempts)...
                            </p>
                        </div>
                    ) : error ? (
                        <div className="text-red-600 bg-red-50 border border-red-200 p-4 rounded-xl text-xs font-semibold">
                            {error}
                        </div>
                    ) : payment ? (
                        <>
                            {/* Reconciliation Reason Box */}
                            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-extrabold ${reasonMeta.badgeClass}`}>
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        <span>{reasonMeta.label}</span>
                                    </span>
                                    {payment.reviewReason && (
                                        <code className="px-2 py-0.5 rounded-lg bg-white border border-amber-200 text-amber-800 font-mono text-[11px] font-bold">
                                            {payment.reviewReason}
                                        </code>
                                    )}
                                </div>
                                <p className="text-xs text-slate-700 leading-relaxed m-0 pt-1">
                                    {reasonMeta.description}
                                </p>
                            </div>

                            {/* Payment Summary Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2.5 text-xs">
                                    <h3 className="text-sm font-extrabold text-slate-800 m-0 mb-2">
                                        Thông tin bản ghi Payment
                                    </h3>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-slate-500">Payment ID:</span>
                                        <span className="font-mono font-bold text-slate-900">#{payment.id}</span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-slate-500">Order ID liên kết:</span>
                                        <span className="font-mono font-bold text-slate-900">Đơn #{payment.orderId}</span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-slate-500">Tổng số tiền đơn:</span>
                                        <span className="font-black text-[#1D7461] text-sm">
                                            {formatCurrency(payment.totalAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center gap-2">
                                        <span className="text-slate-500">Phương thức & Trạng thái:</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-bold text-slate-800">{payment.paymentMethod || "VNPAY"}</span>
                                            <span className={`text-[10px] font-extrabold py-0.5 px-2 rounded-full ${paymentBadge.className}`}>
                                                {paymentBadge.text}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-2.5 text-xs">
                                    <h3 className="text-sm font-extrabold text-slate-800 m-0 mb-2">
                                        Thông tin đối soát giao dịch
                                    </h3>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-slate-500">Mã tham chiếu chính:</span>
                                        <span className="font-mono font-bold text-slate-900 text-right break-all">
                                            {payment.transactionId || "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-slate-500">Winning Attempt ID:</span>
                                        <span className="font-mono font-bold text-slate-900">
                                            {payment.winningTransactionId != null ? `#${payment.winningTransactionId}` : "Chưa có"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-slate-500">Thời điểm thanh toán:</span>
                                        <span className="font-semibold text-slate-800">
                                            {formatDateTime(payment.paymentDate)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-2">
                                        <span className="text-slate-500">Cập nhật lần cuối:</span>
                                        <span className="font-semibold text-slate-800">
                                            {formatDateTime(payment.updatedAt || payment.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Attempts Table */}
                            <div className="space-y-2.5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h3 className="text-sm font-extrabold text-slate-900 m-0">
                                        Lịch sử các lần thử thanh toán (`payment_transactions`)
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs font-bold">
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                                            Tổng số lần thử: {transactions.length}
                                        </span>
                                        <span className={`px-2.5 py-1 rounded-lg ${
                                            successCount > 1
                                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                                : "bg-[#F2F9F7] text-[#1D7461]"
                                        }`}>
                                            Thành công (SUCCESS): {successCount}
                                        </span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                                                <th className="py-3 px-3.5 text-center">ATTEMPT</th>
                                                <th className="py-3 px-3.5">MÃ THAM CHIẾU (VNP_TXNREF)</th>
                                                <th className="py-3 px-3.5 text-center">CỔNG</th>
                                                <th className="py-3 px-3.5 text-center">SỐ TIỀN</th>
                                                <th className="py-3 px-3.5 text-center">MÃ PHẢN HỒI</th>
                                                <th className="py-3 px-3.5 text-center">KẾT QUẢ</th>
                                                <th className="py-3 px-3.5 text-center">THỜI GIAN CẬP NHẬT</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                                            {transactions.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="p-8 text-center text-slate-400">
                                                        Chưa ghi nhận lần thử giao dịch nào cho bản ghi này.
                                                    </td>
                                                </tr>
                                            ) : (
                                                transactions.map((tx) => {
                                                    const txId = tx.id;
                                                    const reference = tx.transaction_reference ?? tx.transactionReference ?? "—";
                                                    const provider = tx.gateway_provider ?? tx.gatewayProvider ?? "VNPAY";
                                                    const amount = tx.amount ?? 0;
                                                    const responseCode = tx.response_code ?? tx.responseCode ?? "—";
                                                    const txStatus = tx.transaction_status ?? tx.transactionStatus ?? "PENDING";
                                                    const updatedAt = tx.updated_at ?? tx.updatedAt ?? tx.created_at ?? tx.createdAt;
                                                    const isWinner =
                                                        payment.winningTransactionId != null &&
                                                        Number(txId) === Number(payment.winningTransactionId);
                                                    const statusBadge = getAttemptStatusBadge(txStatus);

                                                    return (
                                                        <tr
                                                            key={txId || reference}
                                                            className={isWinner ? "bg-[#F2F9F7]/50" : "hover:bg-slate-50/70"}
                                                        >
                                                            <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-800">
                                                                #{txId}
                                                            </td>
                                                            <td className="py-3 px-3.5">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="font-mono font-bold text-slate-800 break-all">
                                                                        {reference}
                                                                    </span>
                                                                    {isWinner && (
                                                                        <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-md bg-[#1D7461] text-white text-[10px] font-extrabold">
                                                                            Giao dịch ghi nhận chính (Winner)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-3.5 text-center font-bold text-slate-600">
                                                                {provider}
                                                            </td>
                                                            <td className="py-3 px-3.5 text-center font-extrabold text-slate-900">
                                                                {formatCurrency(amount)}
                                                            </td>
                                                            <td className="py-3 px-3.5 text-center">
                                                                <code className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                                                                    {responseCode}
                                                                </code>
                                                            </td>
                                                            <td className="py-3 px-3.5 text-center">
                                                                <span className={`inline-flex items-center gap-1 py-0.5 px-2.5 rounded-full text-[10px] font-extrabold ${statusBadge.className}`}>
                                                                    {statusBadge.icon}
                                                                    <span>{statusBadge.text}</span>
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-3.5 text-center text-slate-500">
                                                                {formatDateTime(updatedAt)}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer - Strictly Read-Only */}
                <div className="p-4 px-5 border-t border-slate-200 flex justify-between items-center gap-3 sticky bottom-0 bg-white z-10">
                    <span className="text-[11px] text-slate-400 font-medium">
                        * Việc hoàn tiền (nếu có) được thực hiện và đối soát trực tiếp trên cổng VNPay Merchant Portal.
                    </span>
                    <button
                        type="button"
                        className="py-2 px-5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors"
                        onClick={onClose}
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentReviewDetailModal;
