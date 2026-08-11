// src/pages/Cart/Cart.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../../store/user/CartContext";
import { useToast } from "../../../store/user/ToastContext";
import { CircularProgress, Typography, Button as MuiButton, Box, Alert } from "@mui/material";
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import CartAccessories from "../../../features/user/product/CartAccessories";


// --- Component CartItem ---
const CartItem = ({ item, isSelected, onToggleSelect, onRemove, formatCurrency, isLoading: isActionLoading }) => {
    const { updateCartItem: contextUpdateCartItem, isLoading: isCartContextUpdating } = useCartContext();
    const [quantity, setQuantity] = useState(item.quantity);
    const { showToast } = useToast();

    useEffect(() => {
        setQuantity(item.quantity);
    }, [item.quantity]);

    const handleLocalQuantityChange = async (changeValue) => {
        const newQuantity = Math.max(1, quantity + changeValue);
        if (newQuantity === quantity && changeValue !== 0) return;

        const oldQuantity = quantity;
        setQuantity(newQuantity);

        try {
            await contextUpdateCartItem(item.id, newQuantity);
        } catch (error) {
            console.error("Error updating cart item quantity (CartItem):", error);
            showToast(error.message || "Lỗi cập nhật số lượng", "error");
            setQuantity(oldQuantity);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value === "") {
            setQuantity("");
        } else {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue > 0) {
                setQuantity(numValue);
            }
        }
    };

    const handleInputBlur = async () => {
        let finalQuantity = parseInt(quantity, 10);
        if (isNaN(finalQuantity) || finalQuantity <= 0) {
            finalQuantity = item.quantity;
            setQuantity(finalQuantity);
            return;
        }
        if (finalQuantity === item.quantity) return;

        try {
            await contextUpdateCartItem(item.id, finalQuantity);
        } catch (error) {
            console.error("Error updating cart item quantity on blur:", error);
            showToast(error.message || "Lỗi cập nhật số lượng", "error");
            setQuantity(item.quantity);
        }
    };

    const currentLoadingState = isActionLoading || isCartContextUpdating;

    return (
        <article className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 md:p-5 mb-4 border border-gray-200 rounded-xl bg-white shadow-2xs hover:border-gray-300 transition-colors gap-4">
            {/* Left section: Checkbox + Image + Title + Config + Xoá */}
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                {/* Checkbox chọn sản phẩm */}
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item.id)}
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 mt-1 sm:mt-0"
                />

                {/* Product Image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white border border-gray-300 rounded-xl p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                        src={item?.imageUrl || "/Placeholder2.png"}
                        alt={item?.productName || "Sản phẩm"}
                        className="w-full h-full object-contain"
                    />
                </div>

                <div className="flex flex-col">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2 leading-snug mb-1" title={item?.productName || "Sản phẩm"}>
                        {item?.productName || "Sản phẩm"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mb-1.5">
                        Cấu hình: <span className="text-gray-700 font-normal">{item?.size || "Một cỡ"}</span>
                    </p>
                    <button
                        className="text-xs sm:text-sm text-red-600 hover:text-red-700 transition-colors font-semibold cursor-pointer underline text-left disabled:opacity-50"
                        onClick={() => onRemove(item.id)}
                        disabled={currentLoadingState}
                    >
                        Xoá
                    </button>
                </div>
            </div>

            {/* Right section: Prices + Quantity Stepper */}
            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                <div className="flex items-baseline gap-2">
                    <span className="text-base sm:text-lg font-bold text-red-600 underline underline-offset-2 decoration-red-600">
                        {formatCurrency(item.discountedPrice * item.quantity)}
                    </span>
                    {item?.price > item.discountedPrice && (
                        <span className="text-xs sm:text-sm line-through text-gray-400">
                            {formatCurrency(item.price * item.quantity)}
                        </span>
                    )}
                </div>

                <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white shrink-0">
                    <button
                        className="px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer transition-colors"
                        onClick={() => handleLocalQuantityChange(-1)}
                        disabled={currentLoadingState || quantity <= 1}
                    >
                        -
                    </button>
                    <input
                        type="text"
                        value={quantity}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="w-10 text-center text-sm font-semibold border-x border-gray-300 py-1 bg-white focus:outline-none"
                        disabled={currentLoadingState}
                    />
                    <button
                        className="px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 cursor-pointer transition-colors"
                        onClick={() => handleLocalQuantityChange(1)}
                        disabled={currentLoadingState}
                    >
                        +
                    </button>
                </div>
            </div>
        </article>
    );
};

// --- Component CartSummary ---
const CartSummary = ({ selectedItemsCount, totalOriginalPrice, totalDiscountedPrice, discount, formatCurrency, onCheckout, isLoading }) => {
    return (
        <div className="w-full md:w-1/3 lg:w-1/4 mt-6 md:mt-0 md:sticky md:top-10">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <h2 className="text-xl font-semibold mb-5 text-center text-gray-800">Đơn hàng</h2>
                <div className="space-y-3 mb-5 text-sm">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">Sản phẩm chọn:</p>
                        <p className="font-bold text-gray-800">{selectedItemsCount} món</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">Tạm tính:</p>
                        <p className="font-medium text-gray-800">{formatCurrency(totalOriginalPrice)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">Giảm giá:</p>
                        <p className="font-medium text-green-600">-{formatCurrency(discount)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">Phí vận chuyển:</p>
                        <p className="font-medium text-green-600">Miễn phí</p>
                    </div>
                </div>
                <hr className="my-4 border-gray-200" />
                <div className="flex justify-between items-center text-lg font-bold mb-6">
                    <p className="text-gray-800">Tổng cộng:</p>
                    <p className="text-red-600 text-xl">{formatCurrency(totalDiscountedPrice)}</p>
                </div>

                <button
                    type="button"
                    className="w-full h-12 sm:h-14 rounded-lg bg-red-600 text-white font-semibold text-lg hover:bg-red-700 transition-colors"
                    onClick={onCheckout}
                    disabled={isLoading || selectedItemsCount === 0}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : `Đặt Hàng`}
                </button>
            </div>
        </div>
    );
};

// --- Component Cart ---
const Cart = () => {
    const navigate = useNavigate();
    const {
        cart,
        isLoading: isCartContextLoading,
        error: cartContextError,
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

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount || 0);

    const handleToggleSelect = (itemId) => {
        setSelectedItemIds(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleToggleSelectAll = () => {
        if (!cart?.cartItems) return;
        if (selectedItemIds.length === cart.cartItems.length) {
            setSelectedItemIds([]);
        } else {
            setSelectedItemIds(cart.cartItems.map(item => item.id));
        }
    };

    const handleRemoveSelected = async () => {
        if (selectedItemIds.length === 0) return;
        setIsProcessingAction(true);
        try {
            for (const id of selectedItemIds) {
                await removeItemFromCart(id);
            }
            setSelectedItemIds([]);
            showToast("Đã xóa các sản phẩm được chọn.", "success");
        } catch (err) {
            showToast(err.message || "Lỗi xóa sản phẩm", "error");
        } finally {
            setIsProcessingAction(false);
        }
    };

    const handleRemoveItem = async (itemId) => {
        setIsProcessingAction(true);
        try {
            await removeItemFromCart(itemId);
            setSelectedItemIds(prev => prev.filter(id => id !== itemId));
            showToast("Đã xóa sản phẩm khỏi giỏ hàng.", "success");
        } catch (err) {
            showToast(err.message || "Lỗi xóa sản phẩm", "error");
        }
        setIsProcessingAction(false);
    };

    const handleCheckout = () => {
        if (selectedItemIds.length === 0) {
            showToast("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán", "warning");
            return;
        }
        navigate(`/checkout?step=2&cartItemIds=${selectedItemIds.join(',')}`);
    };

    const CheckoutProgress = () => {
        const currentStepInCart = 1;
        return (
            <div className="flex items-center justify-between mb-8 w-full max-w-3xl mx-auto px-2 sm:px-0">
                {["Giỏ hàng", "Thông tin", "Thanh toán", "Hoàn tất"].map((label, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber <= currentStepInCart;
                    const isNextConnectorActive = stepNumber < currentStepInCart;

                    return (
                        <React.Fragment key={label}>
                            <div className="flex flex-col items-center text-center">
                                <div className={`w-8 h-8 font-semibold text-white ${isActive ? "bg-blue-600" : "bg-gray-300"} rounded-full flex items-center justify-center z-10 text-sm`}>
                                    {stepNumber}
                                </div>
                                <div className={`mt-1 text-xs sm:text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{label}</div>
                            </div>
                            {index < 3 && (
                                <div className={`flex-1 h-0.5 mx-1 sm:mx-2 ${isNextConnectorActive ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    if (isCartContextLoading && (!cart || cart.cartItems.length === 0) && !cartContextError) {
        return (
            <Box className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-10">
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" sx={{ mt: 4 }}>Đang tải giỏ hàng...</Typography>
            </Box>
        );
    }

    if (cartContextError && !isCartContextLoading) {
        return (
            <Box className="text-center py-10 min-h-[calc(100vh-200px)] flex flex-col justify-center items-center px-4">
                <Alert
                    severity="error" sx={{ width: '100%', maxWidth: 'md', mb: 2 }}
                    action={
                        <MuiButton
                            color="inherit"
                            size="small"
                            onClick={() => clearCartError()}
                        >
                            Thử lại
                        </MuiButton>
                    }
                >
                    <Typography variant="h6" component="div">Đã xảy ra lỗi</Typography>
                    <Typography>{cartContextError}</Typography>
                </Alert>
            </Box>
        );
    }
    
    const hasItems = cart && cart.cartItems && cart.cartItems.length > 0;
    const isAllSelected = hasItems && selectedItemIds.length === cart.cartItems.length;

    // Tính toán số liệu dựa TRÊN CÁC SẢN PHẨM ĐƯỢC CHỌN
    const selectedItems = cart?.cartItems?.filter(i => selectedItemIds.includes(i.id)) || [];
    const totalOriginalPrice = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalDiscountedPrice = selectedItems.reduce((acc, item) => acc + (item.discountedPrice * item.quantity), 0);
    const totalDiscount = totalOriginalPrice - totalDiscountedPrice;

    return (
        <main className="flex flex-col pt-3 bg-gray-50 min-h-screen">
            <section className="flex flex-col items-center px-4 md:px-10 lg:px-16 xl:px-24 py-10">
                <h1 className="mb-6 text-3xl sm:text-4xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
                <CheckoutProgress />
                
                {!hasItems && !isCartContextLoading ? (
                    <div className="w-full py-16 text-center min-h-[40vh] flex flex-col justify-center items-center bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] px-6">
                        <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                            <ShoppingBagOutlinedIcon sx={{ fontSize: 48 }} />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
                            Giỏ hàng của bạn đang trống
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-6 leading-relaxed">
                            Hãy khám phá hàng ngàn sản phẩm công nghệ chất lượng cao và chọn món hàng yêu thích của bạn nhé!
                        </p>
                        <button
                            onClick={() => navigate('/product/all')}
                            className="bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-bold text-xs sm:text-sm py-3.5 px-8 rounded-2xl shadow-lg shadow-red-100 transition-all cursor-pointer flex items-center gap-2"
                        >
                            <span>KHÁM PHÁ SẢN PHẨM</span>
                            <span className="text-base">→</span>
                        </button>
                    </div>
                ) : cart && cart.cartItems ? (
                    <div className="flex flex-col w-full">
                        <div className="w-full flex flex-col md:flex-row gap-6">
                            <div className="w-full md:grow">
                                {/* Header Chọn tất cả */}
                                <div className="flex items-center justify-between p-3.5 mb-4 bg-white border border-gray-200 rounded-xl shadow-2xs">
                                    <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-800 select-none">
                                        <input
                                            type="checkbox"
                                            checked={isAllSelected}
                                            onChange={handleToggleSelectAll}
                                            className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span>Tất cả ({cart.cartItems.length} sản phẩm)</span>
                                    </label>

                                    {selectedItemIds.length > 0 && (
                                        <button
                                            onClick={handleRemoveSelected}
                                            disabled={isProcessingAction}
                                            className="text-xs text-red-600 hover:text-red-700 font-semibold underline cursor-pointer disabled:opacity-50"
                                        >
                                            Xóa mục đã chọn ({selectedItemIds.length})
                                        </button>
                                    )}
                                </div>

                                {/* Danh sách các item trong giỏ */}
                                {cart.cartItems.map((cartItem) => (
                                    <CartItem
                                        key={cartItem.id}
                                        item={cartItem}
                                        isSelected={selectedItemIds.includes(cartItem.id)}
                                        onToggleSelect={handleToggleSelect}
                                        onRemove={handleRemoveItem}
                                        formatCurrency={formatCurrency}
                                        isLoading={isProcessingAction || isCartContextLoading}
                                    />
                                ))}
                            </div>

                            {/* Tóm tắt đơn hàng (tính theo các món được tick chọn) */}
                            <CartSummary
                                selectedItemsCount={selectedItemIds.length}
                                totalOriginalPrice={totalOriginalPrice}
                                totalDiscountedPrice={totalDiscountedPrice}
                                discount={totalDiscount}
                                formatCurrency={formatCurrency}
                                onCheckout={handleCheckout}
                                isLoading={isProcessingAction || isCartContextLoading}
                            />
                        </div>

                        {/* AI Gợi ý phụ kiện mua kèm trước khi thanh toán */}
                        <CartAccessories cartItems={cart?.cartItems} />
                    </div>
                ) : null}

            </section>
        </main>
    );
};


export default Cart;
