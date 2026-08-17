import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../store/user/CartContext";
import { useToast } from "../../store/user/ToastContext";
import { getErrorMessage } from "../../utils/errorUtils";

export const useCartPage = () => {
    const navigate = useNavigate();
    const {
        cart,
        isLoading: isCartContextLoading,
        error: cartContextError,
        fetchCart,
        removeItemFromCart,
        clearCartError
    } = useCartContext();
    const { showToast } = useToast();

    const [isProcessingAction, setIsProcessingAction] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState([]);

    // Khi cart load xong, mặc định chọn tất cả sản phẩm
    useEffect(() => {
        if (cart?.cartItems?.length > 0) {
            setSelectedItemIds(cart.cartItems.map(item => item.id));
        }
    }, [cart?.cartItems]);

    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount || 0);
    }, []);

    const handleToggleSelect = useCallback((itemId) => {
        setSelectedItemIds(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    }, []);

    const handleToggleSelectAll = useCallback(() => {
        if (!cart?.cartItems) return;
        if (selectedItemIds.length === cart.cartItems.length) {
            setSelectedItemIds([]);
        } else {
            setSelectedItemIds(cart.cartItems.map(item => item.id));
        }
    }, [cart?.cartItems, selectedItemIds.length]);

    const handleRemoveSelected = useCallback(async () => {
        if (selectedItemIds.length === 0) return;
        setIsProcessingAction(true);
        try {
            const { cartService } = await import("../../services/user/cart.service");
            for (const id of selectedItemIds) {
                try {
                    await cartService.removeFromCart(id);
                } catch (e) {
                    console.warn("Item already removed or invalid id:", id, e);
                }
            }
            await fetchCart();
            setSelectedItemIds([]);
            showToast("Đã xóa các sản phẩm được chọn.", "success");
        } catch (err) {
            showToast(getErrorMessage(err, "Lỗi xóa sản phẩm"), "error");
        } finally {
            setIsProcessingAction(false);
        }
    }, [selectedItemIds, fetchCart, showToast]);

    const handleRemoveItem = useCallback(async (itemId) => {
        setIsProcessingAction(true);
        try {
            await removeItemFromCart(itemId);
            setSelectedItemIds(prev => prev.filter(id => id !== itemId));
            showToast("Đã xóa sản phẩm khỏi giỏ hàng.", "success");
        } catch (err) {
            console.error("Error removing item:", err);
            showToast(getErrorMessage(err, "Không thể xóa sản phẩm. Vui lòng thử lại."), "error");
        } finally {
            setIsProcessingAction(false);
        }
    }, [removeItemFromCart, showToast]);

    const handleCheckout = useCallback(() => {
        if (selectedItemIds.length === 0) {
            showToast("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán", "warning");
            return;
        }
        navigate(`/checkout?step=2&cartItemIds=${selectedItemIds.join(',')}`);
    }, [selectedItemIds, navigate, showToast]);

    const hasItems = Boolean(cart && cart.cartItems && cart.cartItems.length > 0);
    const isAllSelected = hasItems && selectedItemIds.length === cart.cartItems.length;

    // Tính toán số liệu dựa TRÊN CÁC SẢN PHẨM ĐƯỢC CHỌN
    const selectedItems = cart?.cartItems?.filter(i => selectedItemIds.includes(i.id)) || [];
    const selectedTotalQuantity = selectedItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const totalOriginalPrice = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalDiscountedPrice = selectedItems.reduce((acc, item) => acc + (item.salePrice * item.quantity), 0);
    const totalDiscount = totalOriginalPrice - totalDiscountedPrice;

    return {
        cart,
        isCartContextLoading,
        cartContextError,
        isProcessingAction,
        selectedItemIds,
        hasItems,
        isAllSelected,
        selectedItemsCount: selectedItemIds.length,
        selectedTotalQuantity,
        totalOriginalPrice,
        totalDiscountedPrice,
        totalDiscount,
        formatCurrency,
        handleToggleSelect,
        handleToggleSelectAll,
        handleRemoveSelected,
        handleRemoveItem,
        handleCheckout,
        clearCartError,
        navigate
    };
};
