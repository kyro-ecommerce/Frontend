import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOrderContext } from "../../store/user/OrderContext";
import { useToast } from "../../store/user/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import { orderService } from "../../services/user/order.service";

export const useOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);

  const {
    currentOrder: order,
    isLoading,
    error,
    fetchOrderById,
    cancelUserOrder,
    clearOrderError
  } = useOrderContext();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (orderId) {
      clearOrderError();
      fetchOrderById(orderId);
    }
  }, [orderId, fetchOrderById, clearOrderError]);

  useEffect(() => {
    if (
      !orderId ||
      order?.paymentMethod !== "VNPAY" ||
      order?.orderStatus !== "PENDING" ||
      order?.paymentStatus === "COMPLETED"
    ) {
      return undefined;
    }
    const timer = setInterval(() => fetchOrderById(orderId), 30000);
    return () => clearInterval(timer);
  }, [orderId, order?.paymentMethod, order?.orderStatus, order?.paymentStatus, fetchOrderById]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount || 0);
  }, []);

  const getStatusText = useCallback((status) => {
    switch(status) {
      case "DELIVERED": return "Đã giao hàng";
      case "SHIPPED": return "Đang vận chuyển";
      case "PENDING": return "Chờ xử lý";
      case "CONFIRMED": return "Đã xác nhận";
      case "CANCELLED": return "Đã hủy";
      default: return status || "Không xác định";
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    switch(status) {
      case "DELIVERED": return "success";
      case "SHIPPED": return "info";
      case "PENDING": return "warning";
      case "CONFIRMED": return "secondary";
      case "CANCELLED": return "error";
      default: return "default";
    }
  }, []);

  const getPaymentStatusText = useCallback((status) => {
    switch (status) {
      case "COMPLETED": return "Đã thanh toán";
      case "CANCELLED": return "Đã hủy";
      case "FAILED": return "Thanh toán thất bại";
      case "REFUNDED": return "Đã hoàn tiền";
      default: return "Chờ thanh toán";
    }
  }, []);

  const handleCancelOrder = useCallback(async () => {
    const isConfirmed = await confirm({
      title: "Hủy đơn hàng",
      message: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      confirmText: "Hủy đơn hàng",
      cancelText: "Không",
      type: "warning"
    });

    if (isConfirmed) {
      try {
        await cancelUserOrder(orderId);
        showToast("Đơn hàng đã được hủy thành công", "success");
        fetchOrderById(orderId);
      } catch (err) {
        showToast(err.message || "Có lỗi xảy ra khi hủy đơn hàng.", "error");
      }
    }
  }, [confirm, cancelUserOrder, orderId, showToast, fetchOrderById]);

  const handleRetryPayment = useCallback(async () => {
    if (!orderId) return;
    setIsRetryingPayment(true);
    try {
      const response = await orderService.retryPayment(orderId);
      const data = response?.data?.data || response?.data || response;
      const paymentUrl = data?.paymentUrl || data?.vnpayUrl || data?.url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        showToast("Không nhận được liên kết thanh toán VNPAY. Vui lòng thử lại.", "error");
      }
    } catch (err) {
      console.error("Lỗi khi tạo lại liên kết thanh toán:", err);
      showToast(err.response?.data?.message || err.message || "Không thể khởi tạo thanh toán VNPAY.", "error");
    } finally {
      setIsRetryingPayment(false);
    }
  }, [orderId, showToast]);

  return {
    orderId,
    order,
    isLoading,
    error,
    isRetryingPayment,
    formatCurrency,
    getStatusText,
    getStatusColor,
    getPaymentStatusText,
    handleCancelOrder,
    handleRetryPayment,
    fetchOrderById,
    clearOrderError,
    navigate
  };
};
