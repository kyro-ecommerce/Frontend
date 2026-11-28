import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { paymentService } from "../../services/admin/index.js";

const toTimestamp = (val) => {
    if (!val) return 0;
    if (Array.isArray(val)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = val;
        return new Date(year, month - 1, day, hour, minute, second).getTime() || 0;
    }
    return new Date(val).getTime() || 0;
};

export const usePaymentReviews = () => {
    const latestListRequest = useRef(0);
    const latestDetailRequest = useRef(0);

    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [reasonFilter, setReasonFilter] = useState("all");

    const [selectedDetail, setSelectedDetail] = useState(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);

    const fetchReviews = useCallback(async () => {
        const requestId = ++latestListRequest.current;
        try {
            setIsLoading(true);
            setError(null);
            const response = await paymentService.getPaymentReviews();
            if (requestId !== latestListRequest.current) return;

            const raw = response.data?.data ?? response.data ?? [];
            const list = Array.isArray(raw) ? raw : [];
            const sorted = [...list].sort((a, b) => {
                const timeA = toTimestamp(a.updatedAt || a.paymentDate || a.createdAt);
                const timeB = toTimestamp(b.updatedAt || b.paymentDate || b.createdAt);
                return timeB - timeA || (b.id ?? 0) - (a.id ?? 0);
            });
            setReviews(sorted);
        } catch (err) {
            if (requestId !== latestListRequest.current) return;
            console.error("Error loading payment reviews:", err);
            setError(err?.normalizedMessage || "Không thể tải danh sách giao dịch cần đối soát. Vui lòng thử lại.");
            setReviews([]);
        } finally {
            if (requestId === latestListRequest.current) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const filteredReviews = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return reviews.filter((item) => {
            if (reasonFilter !== "all" && item.reviewReason !== reasonFilter) {
                return false;
            }
            if (!q) return true;
            const orderIdStr = item.orderId != null ? String(item.orderId) : "";
            const paymentIdStr = item.id != null ? String(item.id) : "";
            const txnStr = (item.transactionId || "").toLowerCase();
            return (
                orderIdStr.includes(q.replace(/^#/, "")) ||
                paymentIdStr.includes(q.replace(/^#/, "")) ||
                txnStr.includes(q)
            );
        });
    }, [reviews, reasonFilter, searchQuery]);

    const openReviewDetail = useCallback(async (paymentId) => {
        const requestId = ++latestDetailRequest.current;
        setIsDetailLoading(true);
        setDetailError(null);
        setSelectedDetail({ payment: { id: paymentId }, transactions: [] });
        try {
            const response = await paymentService.getPaymentReviewDetail(paymentId);
            if (requestId !== latestDetailRequest.current) return;
            const data = response.data?.data ?? response.data ?? {};
            setSelectedDetail({
                payment: data.payment || null,
                transactions: Array.isArray(data.transactions) ? data.transactions : [],
            });
        } catch (err) {
            if (requestId !== latestDetailRequest.current) return;
            console.error(`Error loading payment review detail ${paymentId}:`, err);
            setDetailError(err?.normalizedMessage || "Không thể tải chi tiết lịch sử giao dịch.");
        } finally {
            if (requestId === latestDetailRequest.current) {
                setIsDetailLoading(false);
            }
        }
    }, []);

    const closeReviewDetail = useCallback(() => {
        latestDetailRequest.current += 1;
        setSelectedDetail(null);
        setDetailError(null);
        setIsDetailLoading(false);
    }, []);

    const resetReviewFilters = useCallback(() => {
        setSearchQuery("");
        setReasonFilter("all");
    }, []);

    return {
        reviews,
        filteredReviews,
        reviewCount: reviews.length,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        reasonFilter,
        setReasonFilter,
        resetReviewFilters,
        refreshReviews: fetchReviews,
        selectedDetail,
        isDetailLoading,
        detailError,
        openReviewDetail,
        closeReviewDetail,
    };
};
