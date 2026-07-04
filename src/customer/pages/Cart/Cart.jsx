// src/pages/Cart/Cart.jsx
import React, { useState, useEffect } from "react"; // Bỏ useEffect nếu không dùng nữa
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../../contexts/CartContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { CircularProgress, Typography, Button as MuiButton, Box, Alert } from "@mui/material";

// --- Component CartItem ---
const CartItem = ({ item, onRemove, formatCurrency, isLoading: isActionLoading }) => { // Đổi tên isLoading để rõ ràng hơn
    const { updateCartItem: contextUpdateCartItem, isLoading: isCartContextUpdating } = useCartContext();
    const [quantity, setQuantity] = useState(item.quantity);
    const { showToast } = useToast();

    // Cập nhật quantity state nếu item.quantity từ context thay đổi (ví dụ sau khi fetch lại cart)
    useEffect(() => {
        setQuantity(item.quantity);
    }, [item.quantity]);


    const handleLocalQuantityChange = async (changeValue) => {
        const newQuantity = Math.max(1, quantity + changeValue);
        if (newQuantity === quantity && changeValue !== 0) return;

        const oldQuantity = quantity;
        setQuantity(newQuantity); // Cập nhật UI ngay

        try {
            await contextUpdateCartItem(item.id, newQuantity);
            // Không cần showToast ở đây nếu context đã xử lý
        } catch (error) {
            console.error("Error updating cart item quantity (CartItem):", error);
            showToast(error.message || "Lỗi cập nhật số lượng", "error");
            setQuantity(oldQuantity); // Rollback nếu lỗi
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value === "") {
            setQuantity(""); // Cho phép input rỗng tạm thời
        } else {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue > 0) {
                setQuantity(numValue);
            } else if (isNaN(numValue) && value !== "") {
                // Nếu nhập chữ hoặc ký tự không phải số, giữ nguyên giá trị cũ
                setQuantity(prev => prev);
            }
        }
    };

    const handleInputBlur = async () => {
        let finalQuantity = parseInt(quantity, 10);

        if (isNaN(finalQuantity) || finalQuantity <= 0) {
            // Nếu giá trị không hợp lệ (rỗng, chữ, số âm, 0), rollback về giá trị từ context (item.quantity)
            finalQuantity = item.quantity;
            setQuantity(finalQuantity); // Cập nhật UI
            if (item.quantity.toString() !== quantity.toString() && quantity !== "") {
                 // Chỉ thông báo nếu người dùng đã nhập gì đó không hợp lệ và nó khác với giá trị gốc
                 showToast("Số lượng không hợp lệ. Đã khôi phục số lượng trước đó.", "warning");
            }
            return; // Không gọi API nếu không có thay đổi hợp lệ
        }

        if (finalQuantity === item.quantity) return; // Không gọi API nếu không có thay đổi

        try {
            await contextUpdateCartItem(item.id, finalQuantity);
        } catch (error) {
            console.error("Error updating cart item quantity on blur (CartItem):", error);
            showToast(error.message || "Lỗi cập nhật số lượng", "error");
            setQuantity(item.quantity); // Rollback về giá trị gốc từ context nếu API lỗi
        }
    };
    const currentLoadingState = isActionLoading || isCartContextUpdating;

    return (
        <article className="flex flex-col sm:flex-row justify-between items-center p-4 md:p-6 mb-4 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white">
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto mb-4 sm:mb-0">
                <img
                    src={item?.imageUrl || "/Placeholder2.png"}
                    alt={item?.productName || "Sản phẩm"}
                    className="w-24 h-24 sm:w-[120px] sm:h-[120px] object-contain rounded-md border"
                />
                <div className="text-center sm:text-left">
                    <h3 className="mb-1 text-base sm:text-lg font-medium text-gray-800 line-clamp-2" title={item?.productName || "Sản phẩm"}>{item?.productName || "Sản phẩm"}</h3>
                    {item?.size && <p className="text-xs sm:text-sm text-gray-500 mb-1">Cấu hình: {item.size}</p>}
                    <button
                        className="text-xs sm:text-sm text-red-600 hover:text-red-700 transition-colors font-medium disabled:opacity-50"
                        onClick={() => onRemove(item.id)}
                        disabled={currentLoadingState}
                    >
                        Xoá
                    </button>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
                <div className="text-lg sm:text-xl font-semibold text-red-600 order-first sm:order-none">
                    {formatCurrency(item.discountedPrice * item.quantity)}
                </div>
                {item?.price > item.discountedPrice && (
                    <div className="text-xs sm:text-sm line-through text-gray-500">
                        {formatCurrency(item.price * item.quantity)}
                    </div>
                )}
                <div className="flex items-center rounded border border-gray-300">
                    <button
                        className="px-3 py-1 sm:py-2 text-base hover:bg-gray-100 disabled:opacity-50"
                        onClick={() => handleLocalQuantityChange(-1)}
                        disabled={currentLoadingState || quantity <= 1}
                    >
                        -
                    </button>
                    <input
                        type="text" // Giữ type text để cho phép input rỗng tạm thời
                        value={quantity} // Hiển thị quantity từ state
                        onChange={handleInputChange}
                        onBlur={handleInputBlur} // Xử lý logic khi focus ra ngoài
                        className="w-10 text-center border-x border-gray-300 py-1 sm:py-2 focus:outline-none bg-white"
                        disabled={currentLoadingState}
                    />
                    <button
                        className="px-3 py-1 sm:py-2 text-base hover:bg-gray-100 disabled:opacity-50"
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
const CartSummary = ({ cartData, formatCurrency, onCheckout, isLoading }) => {
    if (!cartData) return null;
    return (
        <div className="w-full md:w-1/3 lg:w-1/4 mt-6 md:mt-0 md:sticky md:top-10">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-5 text-gray-800">Tóm tắt đơn hàng</h2>
                <div className="space-y-3 mb-5">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">Tạm tính:</p>
                        <p className="font-medium text-gray-800">{formatCurrency(cartData?.totalOriginalPrice || 0)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">Giảm giá:</p>
                        <p className="font-medium text-green-600">-{formatCurrency(cartData?.discount || 0)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">Phí vận chuyển:</p>
                        <p className="font-medium text-green-600">Miễn phí</p>
                    </div>
                </div>
                <hr className="my-4 border-gray-300" />
                <div className="flex justify-between items-center text-lg font-bold mb-6">
                    <p className="text-gray-800">Tổng cộng:</p>
                    <p className="text-red-600 text-xl">{formatCurrency(cartData?.totalDiscountedPrice || 0)}</p>
                </div>
                <MuiButton
                    variant="contained"
                    fullWidth
                    onClick={onCheckout}
                    disabled={isLoading || !cartData?.cartItems?.length}
                    sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        bgcolor: 'rgb(220 38 38)', // Tailwind red-600
                        '&:hover': { bgcolor: 'rgb(185 28 28)' }, // Tailwind red-700
                        '&.Mui-disabled': { bgcolor: 'rgb(209 213 219)', color: 'rgb(107 114 128)' } // Tailwind gray-300 and gray-500
                    }}
                >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : "ĐẶT HÀNG"}
                </MuiButton>
            </div>
        </div>
    );
};

// --- Component Cart ---
const Cart = () => {
    const navigate = useNavigate();
    const {
        cart,
        isLoading: isCartContextLoading, // Đây là loading của context (ví dụ: khi fetch toàn bộ cart)
        error: cartContextError,
        // fetchCart, // Không cần gọi fetchCart từ đây nữa
        removeItemFromCart,
        clearCartError
    } = useCartContext();
    const { showToast } = useToast();
    // const { isAuthenticated } = useAuthContext(); // Không cần isAuthenticated nếu fetchCart đã bị loại bỏ

    const [isProcessingAction, setIsProcessingAction] = useState(false); // Loading cho từng action (remove, update)

    // Loại bỏ useEffect gọi fetchCart từ đây. CartContext sẽ tự xử lý việc fetch.
    // useEffect(() => {
    //     if (isAuthenticated && !isCartContextLoading && (!cart || cart.cartItems.length === 0) && !cartContextError) {
    //         fetchCart();
    //     }
    // }, [isAuthenticated, isCartContextLoading, cart, cartContextError, fetchCart]);

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount || 0);

    const handleRemoveItem = async (itemId) => {
        setIsProcessingAction(true);
        try {
            await removeItemFromCart(itemId);
            showToast("Đã xóa sản phẩm khỏi giỏ hàng.", "success");
        } catch (err) {
            showToast(err.message || "Lỗi xóa sản phẩm", "error");
        }
        setIsProcessingAction(false);
    };

    const handleCheckout = () => navigate('/checkout?step=2');

    const CheckoutProgress = () => {
        const currentStepInCart = 1;
        return (
            <div className="flex items-center justify-between mb-10 w-full max-w-3xl mx-auto px-2 sm:px-0">
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

    // Hiển thị loading toàn cục nếu context đang fetch lần đầu VÀ chưa có lỗi
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
                            onClick={() => {
                                clearCartError();
                                // Không gọi fetchCart() trực tiếp ở đây nữa,
                                // CartContext sẽ tự fetch nếu cần sau khi lỗi được clear
                                // Hoặc, bạn có thể có một hàm refreshCart trong context
                            }}
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

    return (
        <main className="flex flex-col pt-3 bg-gray-50 min-h-screen">
            <section className="flex flex-col items-center px-4 md:px-10 lg:px-16 xl:px-24 py-10">
                <h1 className="mb-8 text-3xl sm:text-4xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
                <CheckoutProgress />
                
                {!hasItems && !isCartContextLoading ? (
                    <div className="w-full py-16 text-center min-h-[40vh] flex flex-col justify-center items-center bg-white rounded-lg shadow-md">
                        <img src="/empty-cart.svg" alt="Empty Cart" className="w-48 h-48 mb-6 text-gray-400" />
                        <Typography variant="h5" className="mb-4 text-gray-700">Giỏ hàng của bạn trống</Typography>
                        <Typography variant="body1" className="mb-6 text-gray-500">Thêm sản phẩm vào giỏ để tiếp tục mua sắm.</Typography>
                        <MuiButton
                            variant="contained" color="primary" onClick={() => navigate('/product/all')}
                            sx={{ py: 1.5, px: 6, fontSize: '1rem', bgcolor: 'rgb(37 99 235)', '&:hover': { bgcolor: 'rgb(29 78 216)' } }}
                        >
                            Khám phá sản phẩm
                        </MuiButton>
                    </div>
                ) : cart && cart.cartItems ? (
                    <div className="w-full flex flex-col md:flex-row gap-6">
                        <div className="w-full md:flex-grow">
                            {/* Hiển thị loading nhỏ nếu context đang update (sau action) nhưng vẫn có items */}
                            {isCartContextLoading && hasItems && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
                            {cart.cartItems.map((cartItem) => (
                                <CartItem
                                    key={cartItem.id} item={cartItem} onRemove={handleRemoveItem}
                                    formatCurrency={formatCurrency} isLoading={isProcessingAction || isCartContextLoading} // item loading + context loading
                                />
                            ))}
                        </div>
                        <CartSummary
                            cartData={cart} formatCurrency={formatCurrency} onCheckout={handleCheckout}
                            isLoading={isProcessingAction || isCartContextLoading}
                        />
                    </div>
                ) : null}
            </section>
        </main>
    );
};

export default Cart;