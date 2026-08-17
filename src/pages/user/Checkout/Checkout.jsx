import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useOrderContext } from '../../../store/user/OrderContext';
import { useCartContext } from '../../../store/user/CartContext';
import { orderService } from '../../../services/user/order.service';
import { useAuthContext } from '../../../store/user/AuthContext';
import { useToast } from '../../../store/user/ToastContext';
import { useCheckoutPage } from '../../../hooks/user/useCheckoutPage';
import AddressStep from './AddressStep';
import { CircularProgress, Typography, Button as MuiButton, Box, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VnpayExpirationNotice from '../../../components/user/checkout/VnpayExpirationNotice';

const API_LOCATION_BASE_URL = "https://provinces.open-api.vn/api";

const Checkout = () => {
    const {
        navigate,
        locationHook,
        queryParams,
        step,
        setStep,
        selectedAddress,
        setSelectedAddress,
        shippingInfo,
        setShippingInfo,
        provinces,
        districts,
        wards,
        selectedProvinceCode,
        setSelectedProvinceCode,
        selectedDistrictCode,
        setSelectedDistrictCode,
        selectedWardCode,
        setSelectedWardCode,
        isLoadingProvinces,
        isLoadingDistricts,
        isLoadingWards,
        paymentMethod,
        setPaymentMethod,
        isPlacingOrder,
        setIsPlacingOrder,
        vnpayStatus,
        setVnpayStatus,
        vnpayMessage,
        setVnpayMessage,
        processedOrderId,
        orderIdFromUrl,
        orderIdForPostProcessing,
        setOrderIdForPostProcessing,
        orderProcessedForEmailAndCartClear,
        setOrderProcessedForEmailAndCartClear,
        emailSentForOrderId,
        setEmailSentForOrderId,
        isProcessingPostOrder,
        setIsProcessingPostOrder,
        savedAddressesContext,
        orderFromContext,
        isOrderContextLoadingGlobal,
        orderContextError,
        fetchAddresses,
        addNewAddressContext,
        createNewOrderContext,
        fetchOrderByIdContext,
        clearOrderError,
        cartData,
        isCartContextLoading,
        fetchCart,
        authIsLoading,
        selectedItemIds,
        selectedCartItems,
        selectedTotalOriginalPrice,
        selectedTotalDiscountedPrice,
        formatCurrency,
        clearAddressIdQueryParam,
        handleShippingChange,
        handleProvinceChange,
        handleDistrictChange,
        handleWardChange,
        handleAddressSelect,
        handleAddAddressAndContinue,
        handleNextStep,
        handlePrevStep,
        handlePlaceOrder,
        showToast
    } = useCheckoutPage();



    const formatDate = (dateInput) => {
        if (!dateInput) return "Đang cập nhật...";
        if (Array.isArray(dateInput)) {
            const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
            const d = new Date(year, month - 1, day, hour, minute, second);
            return isNaN(d.getTime()) ? "Đang cập nhật..." : d.toLocaleString('vi-VN');
        }
        const d = new Date(dateInput);
        return isNaN(d.getTime()) ? "Đang cập nhật..." : d.toLocaleString('vi-VN');
    };

    const CheckoutProgress = () => ( /* ... (Giữ nguyên) ... */ <div className="flex items-center justify-between mb-10 w-full max-w-3xl mx-auto px-2 sm:px-0">
            {["Giỏ hàng", "Thông tin", "Thanh toán", "Hoàn tất"].map((label, index) => {
                const isActive = (index + 1) <= step;
                const isNextConnectorActive = (index + 1) < step;
                return (
                    <React.Fragment key={label}>
                        <div className="flex flex-col items-center text-center">
                            <div className={`w-8 h-8 font-semibold text-white ${isActive ? "bg-blue-600" : "bg-gray-300"} rounded-full flex items-center justify-center z-10 text-sm`}>
                                {index + 1}
                            </div>
                            <div className={`mt-1 text-xs sm:text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{label}</div>
                        </div>
                        {index < 3 && (
                            <div className={`flex-1 h-0.5 mx-1 sm:mx-2 ${isNextConnectorActive ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>);
    const PaymentStep = () => ( /* ... (Giữ nguyên) ... */ <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Chọn phương thức thanh toán</h2>
            <div className="space-y-4 mb-8">
                <div
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "COD" ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
                    onClick={() => setPaymentMethod("COD")}
                >
                    <input type="radio" id="cod" name="paymentMethod" value="COD" checked={paymentMethod === "COD"} onChange={() => setPaymentMethod("COD")} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3" />
                    <label htmlFor="cod" className="text-base font-medium text-gray-700">Thanh toán khi nhận hàng (COD)</label>
                </div>
                <div
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === "VNPAY" ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
                    onClick={() => setPaymentMethod("VNPAY")}
                >
                    <input type="radio" id="vnpay" name="paymentMethod" value="VNPAY" checked={paymentMethod === "VNPAY"} onChange={() => setPaymentMethod("VNPAY")} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mr-3" />
                    <label htmlFor="vnpay" className="text-base font-medium text-gray-700">Thanh toán qua VNPAY</label>
                    <img src="/VNPayIcon.jpg" alt="VNPAY" className="w-8 h-8 ml-auto rounded" />
                </div>
            </div>
            <div className="p-6 mb-6 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Thông tin đơn hàng</h3>
                {isCartContextLoading ? <CircularProgress /> : selectedCartItems.length === 0 ? (
                    <Typography>Giỏ hàng trống hoặc đang tải...</Typography>
                ) : (
                    <div className="space-y-3">
                        {selectedCartItems.map(item => (
                            <div key={item.id || item.productId} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-b-0">
                                <div>
                                    <p className='font-medium text-gray-800'>{item.productName}</p>
                                    <p className='text-sm text-gray-500'>SL: x{item.quantity} {item.size ? `(${item.size})` : ''}</p>
                                </div>
                                <p className="font-semibold text-red-600 whitespace-nowrap">{formatCurrency(item.salePrice * item.quantity)}</p>
                            </div>
                        ))}
                        <div className="border-t border-gray-300 pt-4 mt-4 space-y-2">
                            <div className="flex justify-between text-gray-600"><p>Tạm tính:</p> <p>{formatCurrency(selectedTotalOriginalPrice)}</p></div>
                            <div className="flex justify-between text-gray-600"><p>Giảm giá:</p> <p className="text-green-600">-{formatCurrency(selectedTotalOriginalPrice - selectedTotalDiscountedPrice)}</p></div>
                            <div className="flex justify-between text-lg font-bold text-gray-800"><p>Tổng cộng:</p> <p className="text-red-600">{formatCurrency(selectedTotalDiscountedPrice)}</p></div>
                        </div>
                    </div>
                )}
            </div>
            {orderContextError && <Alert severity="error" sx={{ mb: 2 }} onClose={clearOrderError}>{orderContextError}</Alert>}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={isPlacingOrder}
                    className="px-6 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                    ← QUAY LẠI
                </button>

                <button
                    type="button"
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || isCartContextLoading || selectedCartItems.length === 0 || authIsLoading}
                    className="bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white text-xs sm:text-sm font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-red-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isPlacingOrder || authIsLoading ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        <span>HOÀN TẤT ĐẶT HÀNG</span>
                    )}
                </button>
            </div>
        </div>);

    const handleRetryVNPay = async (orderId) => {
        if (!orderId) return;
        setIsPlacingOrder(true);
        try {
            const response = await orderService.createVNPayPayment(orderId);
            const paymentUrl = response?.data?.paymentUrl || response?.paymentUrl;
            if (typeof paymentUrl !== 'string' || !/^https?:\/\//.test(paymentUrl)) {
                throw new Error('Không nhận được link thanh toán VNPAY hợp lệ từ hệ thống.');
            }
            window.location.href = paymentUrl;
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.detail || error.message;
            showToast(message || 'Không thể tạo lại thanh toán VNPAY.', 'error');
            setIsPlacingOrder(false);
        }
    };

    const CompleteStep = () => { /* ... (Giữ nguyên) ... */ const orderDetails = orderFromContext;
        const orderId = processedOrderId || orderDetails?.id;
        const orderCode = orderDetails?.orderCode;

        if (vnpayStatus === 'processing' || (isOrderContextLoadingGlobal && !orderDetails && !orderContextError && step === 4)) {
            return (
                <Box sx={{ textAlign: 'center', py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={50} />
                    <Typography variant="h6" sx={{ mt: 2 }}>{vnpayMessage || "Đang tải thông tin đơn hàng..."}</Typography>
                </Box>
            );
        }
        if (vnpayStatus === 'failed') {
            const cancelledByCustomer = new URLSearchParams(locationHook.search).get('vnp_ResponseCode') === '24';
            return (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <svg className="mx-auto mb-4 h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 'bold', color: 'error.main' }}>
                        {cancelledByCustomer ? 'Đã hủy lần thanh toán' : 'Thanh toán chưa thành công'}
                    </Typography>
                    <Typography sx={{ mb: 3, color: 'text.secondary' }}>{vnpayMessage || "Đã có lỗi xảy ra với thanh toán VNPAY."}</Typography>
                    <Box sx={{ maxWidth: 600, mx: 'auto', mb: 3, textAlign: 'left' }}>
                        <VnpayExpirationNotice
                            order={orderDetails}
                            onRetry={() => handleRetryVNPay(orderId)}
                            isRetrying={isPlacingOrder}
                        />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <MuiButton variant="outlined" onClick={() => navigate(`/my-order/${orderId || ''}`)}>Xem chi tiết đơn hàng</MuiButton>
                    </Box>
                </Box>
            );
        }
        if (orderContextError && !orderDetails && step === 4) {
            return (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography variant="h5" color="error" gutterBottom>Không thể tải thông tin đơn hàng</Typography>
                    <Typography sx={{ mb: 2 }}>{orderContextError}</Typography>
                    {orderId && <MuiButton variant="outlined" onClick={() => fetchOrderByIdContext(orderId)}>Thử lại</MuiButton>}
                </Box>
            );
        }
        if (!orderDetails && !isOrderContextLoadingGlobal && !orderContextError && step === 4 && vnpayStatus !== 'success') {
            return (
                 <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography sx={{ mb: 2 }}>Không tìm thấy thông tin đơn hàng.</Typography>
                    <MuiButton variant="outlined" onClick={() => navigate('/my-order')}>Xem lịch sử đơn hàng</MuiButton>
                 </Box>
            );
        }
        if (vnpayStatus === 'success' && isOrderContextLoadingGlobal && !orderDetails) {
            return (
                <Box sx={{ textAlign: 'center', py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={50} />
                    <Typography variant="h6" sx={{ mt: 2 }}>Thanh toán VNPAY thành công! Đang tải chi tiết đơn hàng...</Typography>
                </Box>
            );
        }
        return (
            <div className="text-center py-10 bg-white p-6 md:p-10 rounded-lg shadow-xl max-w-2xl mx-auto">
                <div className="mb-6">
                    {(vnpayStatus === 'success' || (orderDetails?.paymentMethod === 'COD' && String(orderDetails?.id) === String(orderId)) ) && (
                        <svg className="mx-auto mb-4 h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
                        {vnpayStatus === 'success' ? "Thanh toán VNPAY thành công!" : "Đặt hàng thành công!"}
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">Cảm ơn bạn đã đặt hàng tại Kyro Store.</p>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6 text-left space-y-3 text-sm sm:text-base">
                        <h3 className="text-xl font-semibold mb-3 text-gray-700 flex justify-between items-center">
                            <span>Thông tin đơn hàng {orderCode}</span>
                            {orderDetails?.orderStatus === 'PENDING' && (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                                    <CircularProgress size={12} color="inherit" /> Đang xác nhận đơn hàng...
                                </span>
                            )}
                            {orderDetails?.orderStatus === 'CONFIRMED' && (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                                    <CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> Đã xác nhận
                                </span>
                            )}
                            {orderDetails?.orderStatus === 'CANCELLED' && (
                                <span className="bg-red-50 text-red-700 border border-red-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                                    <ErrorOutlineIcon sx={{ fontSize: 16 }} /> Đã hủy
                                </span>
                            )}
                        </h3>
                        <p>
                            <strong>Trạng thái:</strong>{' '}
                            <span className="font-semibold text-gray-800">
                                {orderDetails?.orderStatus === 'PENDING' && 'Chờ xử lý (PENDING)'}
                                {orderDetails?.orderStatus === 'CONFIRMED' && 'Đã xác nhận (CONFIRMED)'}
                                {orderDetails?.orderStatus === 'CANCELLED' && 'Đã hủy (CANCELLED)'}
                                {!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(orderDetails?.orderStatus) && (orderDetails?.orderStatus || 'PENDING')}
                            </span>
                        </p>
                        <p><strong>Ngày đặt:</strong> {formatDate(orderDetails?.orderDate)}</p>
                        <p><strong>Phương thức:</strong> {orderDetails?.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : (orderDetails?.paymentMethod || (vnpayStatus === 'success' ? "VNPAY" : "Đang cập nhật..."))}</p>
                        <p><strong>Địa chỉ giao:</strong> {`${orderDetails?.shippingAddress?.street || ''}, ${orderDetails?.shippingAddress?.ward || ''}, ${orderDetails?.shippingAddress?.district || ''}, ${orderDetails?.shippingAddress?.province || ''}`}</p>
                        <p className="font-bold"><strong>Tổng tiền:</strong> <span className="text-red-600">{orderDetails ? formatCurrency(orderDetails.totalDiscountedPrice) : "Đang cập nhật..."}</span></p>
                    </div>
                    <p className="mb-8 text-gray-600">Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-8 rounded-2xl shadow-md shadow-blue-100 transition-all cursor-pointer"
                        >
                            TIẾP TỤC MUA SẮM
                        </button>
                        <button
                            onClick={() => navigate(`/my-order/${orderId || ''}`)}
                            className="px-8 py-3 rounded-2xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                        >
                            XEM ĐƠN HÀNG
                        </button>
                    </div>
                </div>
            </div>
        ); };

    if (step < 2 && !locationHook.pathname.endsWith('/cart')) {
         useEffect(() => { navigate('/cart', { replace: true }); }, [navigate]);
        return <div className="text-center py-10">Đang chuyển hướng...</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-800">
                    {step === 2 ? "Thông tin đặt hàng" : step === 3 ? "Thanh Toán" : step === 4 ? "Hoàn tất đơn hàng" : "Thanh Toán"}
                </h1>
                <CheckoutProgress />
                {orderContextError && step < 4 && !isPlacingOrder && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={clearOrderError}>{orderContextError}</Alert>
                )}
                {step === 2 && (
                    <AddressStep
                        savedAddresses={savedAddressesContext || []} selectedAddress={selectedAddress} handleAddressSelect={handleAddressSelect}
                        shippingInfo={shippingInfo} handleShippingChange={handleShippingChange}
                        selectedProvinceId={selectedProvinceCode} selectedDistrictId={selectedDistrictCode} selectedWardId={selectedWardCode}
                        handleProvinceChange={handleProvinceChange} handleDistrictChange={handleDistrictChange} handleWardChange={handleWardChange}
                        provinces={provinces} districts={districts} wards={wards}
                        isLoadingProvinces={isLoadingProvinces} isLoadingDistricts={isLoadingDistricts} isLoadingWards={isLoadingWards}
                        handlePrevStep={handlePrevStep} onAddAddressAndContinue={handleAddAddressAndContinue} handleNextStep={handleNextStep}
                        isAddingAddress={isPlacingOrder}
                        onClearSelectedAddress={() => setSelectedAddress(null)}
                    />
                )}
                {step === 3 && <PaymentStep />}
                {step === 4 && <CompleteStep />}
            </div>
        </div>
    );
};

export default Checkout;
