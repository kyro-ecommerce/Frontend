// src/pages/Checkout/Checkout.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useOrderContext } from '../../contexts/OrderContext';
import { useCartContext } from '../../contexts/CartContext';
import { orderService } from '../../services/order.service';
import { useAuthContext } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import AddressStep from './AddressStep';
import { CircularProgress, Typography, Button as MuiButton, Box, Alert } from '@mui/material';

const API_LOCATION_BASE_URL = "https://provinces.open-api.vn/api";

const Checkout = () => {
    const navigate = useNavigate();
    const locationHook = useLocation();
    const { showToast } = useToast();
    const queryParams = new URLSearchParams(locationHook.search);
    const initialStep = parseInt(queryParams.get('step') || '2'); // Bắt đầu từ bước 2 (Địa chỉ)
    const orderIdFromUrl = queryParams.get('orderId');

    const {
        addresses: savedAddressesContext,
        currentOrder: orderFromContext,
        isLoading: isOrderContextLoadingGlobal,
        error: orderContextError,
        fetchAddresses,
        addNewAddress: addNewAddressContext,
        createNewOrder: createNewOrderContext,
        fetchOrderById: fetchOrderByIdContext,
        clearOrderError
    } = useOrderContext();

    const { cart: cartData, isLoading: isCartContextLoading, clearCartContext } = useCartContext();
    const { isLoading: authIsLoading } = useAuthContext();

    const [step, setStep] = useState(initialStep < 2 ? 2 : initialStep);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [shippingInfo, setShippingInfo] = useState({
        fullName: "", phone: "", email: "", address: "",
        city: "", district: "", ward: "", note: ""
    });

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
    const [selectedDistrictCode, setSelectedDistrictCode] = useState('');
    const [selectedWardCode, setSelectedWardCode] = useState('');

    const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [isLoadingWards, setIsLoadingWards] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const [vnpayStatus, setVnpayStatus] = useState(null);
    const [vnpayMessage, setVnpayMessage] = useState('');
    const [processedOrderId, setProcessedOrderId] = useState(orderIdFromUrl);
    const [orderIdForPostProcessing, setOrderIdForPostProcessing] = useState(null);
    const [orderProcessedForEmailAndCartClear, setOrderProcessedForEmailAndCartClear] = useState(false);
    const [emailSentForOrderId, setEmailSentForOrderId] = useState(null); // Cờ theo dõi email đã gửi
    const [isProcessingPostOrder, setIsProcessingPostOrder] = useState(false);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    useEffect(() => {
        const addressIdFromQuery = queryParams.get('addressId');
        if (addressIdFromQuery && savedAddressesContext.length > 0) {
            const foundAddress = savedAddressesContext.find(addr => addr.id.toString() === addressIdFromQuery);
            if (foundAddress) {
                setSelectedAddress(foundAddress);
            }
        }
    }, [savedAddressesContext, locationHook.search, queryParams, step]); // Thêm queryParams

    useEffect(() => {
        const currentOrderIdFromUrl = queryParams.get('orderId');
        if (step === 4 && currentOrderIdFromUrl) {
            if (currentOrderIdFromUrl !== processedOrderId || !orderFromContext || orderFromContext.id?.toString() !== currentOrderIdFromUrl) {
                setProcessedOrderId(currentOrderIdFromUrl);
                fetchOrderByIdContext(currentOrderIdFromUrl);
            }
        }
    }, [step, locationHook.search, queryParams, fetchOrderByIdContext, processedOrderId, orderFromContext]); // Thêm queryParams

    useEffect(() => {
        const fetchProvincesAPI = async () => {
            setIsLoadingProvinces(true);
            try {
                const response = await axios.get(`${API_LOCATION_BASE_URL}/p/`);
                setProvinces(response.data || []);
            } catch (error) { console.error("Error fetching provinces:", error); setProvinces([]); }
            finally { setIsLoadingProvinces(false); }
        };
        fetchProvincesAPI();
    }, []);

    useEffect(() => {
        if (!selectedProvinceCode) {
            setDistricts([]); setSelectedDistrictCode('');
            setWards([]); setSelectedWardCode('');
            return;
        }
        const fetchDistrictsAPI = async () => {
            setIsLoadingDistricts(true);
            setWards([]); setSelectedWardCode('');
            try {
                const response = await axios.get(`${API_LOCATION_BASE_URL}/p/${selectedProvinceCode}?depth=2`);
                setDistricts(response.data?.districts || []);
            } catch (error) { console.error("Error fetching districts:", error); setDistricts([]); }
            finally { setIsLoadingDistricts(false); }
        };
        fetchDistrictsAPI();
    }, [selectedProvinceCode]);

    useEffect(() => {
        if (!selectedDistrictCode) {
            setWards([]); setSelectedWardCode('');
            return;
        }
        const fetchWardsAPI = async () => {
            setIsLoadingWards(true);
            try {
                const response = await axios.get(`${API_LOCATION_BASE_URL}/d/${selectedDistrictCode}?depth=2`);
                setWards(response.data?.wards || []);
            } catch (error) { console.error("Error fetching wards:", error); setWards([]); }
            finally { setIsLoadingWards(false); }
        };
        fetchWardsAPI();
    }, [selectedDistrictCode]);

    useEffect(() => {
        const searchParams = new URLSearchParams(locationHook.search);
        const isVNPayReturn = searchParams.has('vnp_ResponseCode');
        const currentStepFromUrl = parseInt(searchParams.get('step') || '0', 10);

        if (isVNPayReturn && currentStepFromUrl === 4 && vnpayStatus === null) {
            setVnpayStatus('processing');
            setVnpayMessage('Đang xác nhận kết quả thanh toán VNPAY...');
            const paramsObject = Object.fromEntries(searchParams);
            const vnp_ResponseCode = paramsObject['vnp_ResponseCode'];
            const vnp_TxnRef = paramsObject['vnp_TxnRef'];
            const extractedOrderId = vnp_TxnRef ? vnp_TxnRef.split('_')[0] : null;

            if (extractedOrderId) {
                setProcessedOrderId(extractedOrderId);
                setOrderIdForPostProcessing(extractedOrderId); // Quan trọng: Set để effect sau xử lý
                setEmailSentForOrderId(null); // Reset cờ email cho order mới này (nếu là flow mới)
                setOrderProcessedForEmailAndCartClear(false); // Reset cờ xử lý

                const processCallback = async () => {
                    try {
                        await orderService.handleVNPayCallback(paramsObject);
                        await fetchOrderByIdContext(extractedOrderId);
                        if (vnp_ResponseCode === '00') {
                            setVnpayStatus('success');
                            setVnpayMessage('Thanh toán VNPAY thành công!');
                            showToast('Thanh toán VNPAY thành công!', 'success');
                        } else {
                            setVnpayStatus('failed');
                            setVnpayMessage(`Thanh toán qua VNPAY thất bại. Mã lỗi: ${vnp_ResponseCode}.`);
                            showToast('Thanh toán VNPAY thất bại.', 'error');
                        }
                    } catch (error) {
                        console.error("Lỗi khi xử lý VNPAY callback:", error);
                        setVnpayStatus('failed');
                        setVnpayMessage('Lỗi khi xác nhận kết quả thanh toán VNPAY.');
                        showToast('Lỗi xác nhận thanh toán VNPAY.', 'error');
                        fetchOrderByIdContext(extractedOrderId);
                    }
                };
                processCallback();
            } else {
                setVnpayStatus('failed');
                setVnpayMessage('Lỗi: Không tìm thấy mã đơn hàng từ VNPAY.');
                showToast('Lỗi xử lý thanh toán VNPAY.', 'error');
            }
        } else if (currentStepFromUrl === 4 && !isVNPayReturn && orderIdFromUrl) {
            setProcessedOrderId(orderIdFromUrl);
            if ((!orderFromContext || orderFromContext.id?.toString() !== orderIdFromUrl) && !isOrderContextLoadingGlobal) {
                fetchOrderByIdContext(orderIdFromUrl);
            }
            // Nếu là COD và chưa xử lý, set orderIdForPostProcessing
            if (orderFromContext?.paymentMethod === 'COD' && orderFromContext?.id.toString() === orderIdFromUrl) {
                setOrderIdForPostProcessing(orderIdFromUrl);
                 // Không reset emailSentForOrderId ở đây vì có thể là refresh trang
            }
        }
    }, [locationHook.search, vnpayStatus, showToast, fetchOrderByIdContext, orderIdFromUrl, orderFromContext, isOrderContextLoadingGlobal, queryParams]);


    useEffect(() => {
        const performPostProcessing = async () => {
            // Nếu một quá trình đã bắt đầu, không chạy lại
            if (isProcessingPostOrder) {
                console.log(`[POST_PROCESSING_EFFECT] Skipped: A process is already running.`);
                return;
            }

            if (step === 4 && orderIdForPostProcessing && !authIsLoading && !orderProcessedForEmailAndCartClear) {
                if (orderFromContext && orderFromContext.id?.toString() === orderIdForPostProcessing) {
                    const isVNPaySuccessAndCompleted = orderFromContext.paymentMethod === 'VNPAY' && orderFromContext.paymentStatus === 'COMPLETED';
                    const isCOD = orderFromContext.paymentMethod === 'COD';

                    if (isVNPaySuccessAndCompleted || isCOD) {
                        if (emailSentForOrderId !== orderIdForPostProcessing) {
                            
                            // ---- BẮT ĐẦU KHÓA ----
                            setIsProcessingPostOrder(true);
                            
                            try {
                                console.log(`[POST_PROCESSING_EFFECT] ATTEMPTING TO SEND EMAIL AND CLEAR CART for order ${orderIdForPostProcessing}`);
                                
                                await orderService.sendOrderToEmail(orderIdForPostProcessing);
                                showToast("Thông tin đơn hàng đã được gửi qua email.", "success");
                                setEmailSentForOrderId(orderIdForPostProcessing);

                                await clearCartContext();
                                showToast("Giỏ hàng đã được xóa.", "info");
                                
                                setOrderProcessedForEmailAndCartClear(true);
                            } catch (error) {
                                console.error(`[POST_PROCESSING_EFFECT] Error during post-processing for order ${orderIdForPostProcessing}:`, error);
                                const errorMessage = error.message || "Lỗi khi hoàn tất các bước cuối của đơn hàng.";
                                showToast(errorMessage, "error");
                            } finally {
                                // ---- MỞ KHÓA ----
                                setIsProcessingPostOrder(false);
                            }
                        }
                    }
                } else if (!orderFromContext && !isOrderContextLoadingGlobal) {
                    fetchOrderByIdContext(orderIdForPostProcessing);
                }
            }
        };

        performPostProcessing();
    }, [
        step,
        vnpayStatus,
        orderIdForPostProcessing,
        authIsLoading,
        orderProcessedForEmailAndCartClear,
        emailSentForOrderId,
        orderFromContext,
        isOrderContextLoadingGlobal,
        fetchOrderByIdContext,
        clearCartContext,
        showToast,
        isProcessingPostOrder 
    ]);

    const handleShippingChange = (e) => { const { name, value } = e.target; setShippingInfo(prev => ({ ...prev, [name]: value })); };
    const handleProvinceChange = (e) => { /* ... */ const code = e.target.value; const selectedOption = provinces.find(p => p.code.toString() === code); const name = selectedOption ? selectedOption.name : ''; setSelectedProvinceCode(code); setShippingInfo(prev => ({ ...prev, city: name, district: '', ward: '' })); setSelectedDistrictCode(''); setSelectedWardCode(''); setDistricts([]); setWards([]); };
    const handleDistrictChange = (e) => { /* ... */ const code = e.target.value; const selectedOption = districts.find(d => d.code.toString() === code); const name = selectedOption ? selectedOption.name : ''; setSelectedDistrictCode(code); setShippingInfo(prev => ({ ...prev, district: name, ward: '' })); setSelectedWardCode(''); setWards([]); };
    const handleWardChange = (e) => { /* ... */ const code = e.target.value; const selectedOption = wards.find(w => w.code.toString() === code); const name = selectedOption ? selectedOption.name : ''; setSelectedWardCode(code); setShippingInfo(prev => ({ ...prev, ward: name })); };
    const handleAddressSelect = (address) => { /* ... */ setSelectedAddress(address); setShippingInfo({ fullName: "", phone: "", email: "", address: "", city: "", district: "", ward: "", note: "" }); setSelectedProvinceCode(''); setSelectedDistrictCode(''); setSelectedWardCode(''); setDistricts([]); setWards([]); const params = new URLSearchParams(locationHook.search); params.set('addressId', address.id.toString()); navigate({ pathname: locationHook.pathname, search: params.toString() }, { replace: true }); };

    const handleNextStep = () => {
        clearOrderError();
        if (step === 2) {
            const addressIdFromQuery = queryParams.get('addressId');
            if (selectedAddress && selectedAddress.id.toString() === addressIdFromQuery) {
                const params = new URLSearchParams(locationHook.search);
                params.set('step', '3');
                navigate({ pathname: locationHook.pathname, search: params.toString() });
                setStep(3);
            } else if (!selectedAddress && (shippingInfo.fullName && shippingInfo.phone && shippingInfo.address && selectedProvinceCode && selectedDistrictCode && selectedWardCode)) {
                showToast("Vui lòng 'Lưu & Sử dụng địa chỉ này' hoặc chọn một địa chỉ đã lưu.", "warning"); return;
            } else if (!addressIdFromQuery) {
                 showToast("Vui lòng chọn địa chỉ giao hàng hoặc thêm và lưu địa chỉ mới.", "warning"); return;
            } else {
                 showToast("Vui lòng chọn hoặc xác nhận địa chỉ giao hàng.", "warning"); return;
            }
        }
        window.scrollTo(0, 0);
    };

    const handlePrevStep = () => {
        clearOrderError();
        const params = new URLSearchParams(locationHook.search);
        if (step === 2) { navigate('/cart'); }
        else if (step > 2) {
            const prevStep = step - 1;
            params.set('step', prevStep.toString());
            const paramsToRemove = ['vnp_Amount', 'vnp_BankCode', 'vnp_OrderInfo', 'vnp_PayDate', 'vnp_ResponseCode', 'vnp_SecureHash', 'vnp_TmnCode', 'vnp_TransactionNo', 'vnp_TransactionStatus', 'vnp_TxnRef'];
            paramsToRemove.forEach(p => params.delete(p));
            
            // Không xóa orderId khi quay lại từ bước 4 nếu đó là COD, nhưng reset các cờ xử lý
            if (step === 4) {
                 if (paymentMethod === "VNPAY") {
                    // Nếu là VNPAY và quay lại, có thể orderId này sẽ không được dùng nữa nếu họ chọn thanh toán lại
                    // params.delete('orderId'); // Cân nhắc việc này
                 }
                 setOrderProcessedForEmailAndCartClear(false); // Cho phép xử lý lại NẾU là đơn hàng mới
                 // Không reset emailSentForOrderId ở đây, nó được reset khi tạo đơn hàng mới.
            }
            navigate({ pathname: locationHook.pathname, search: params.toString() });
            setStep(prevStep);
            if (vnpayStatus) setVnpayStatus(null);
        }
        window.scrollTo(0, 0);
    };

    const handleAddAddressAndContinue = async () => {
        if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !selectedProvinceCode || !selectedDistrictCode || !selectedWardCode) {
            showToast("Vui lòng điền đầy đủ thông tin địa chỉ.", "error"); return;
        }
        setIsPlacingOrder(true);
        const addressData = { fullName: shippingInfo.fullName, phoneNumber: shippingInfo.phone, email: shippingInfo.email, street: shippingInfo.address, province: shippingInfo.city, district: shippingInfo.district, ward: shippingInfo.ward, note: shippingInfo.note };
        try {
            const newAddedAddressResponse = await addNewAddressContext(addressData);
            const newAddedAddress = newAddedAddressResponse.data || newAddedAddressResponse;
            if (newAddedAddress && newAddedAddress.id) {
                setSelectedAddress(newAddedAddress);
                showToast("Địa chỉ đã được thêm và chọn thành công!", "success");
                const params = new URLSearchParams(locationHook.search);
                params.set('step', '3');
                params.set('addressId', newAddedAddress.id.toString());
                navigate({ pathname: locationHook.pathname, search: params.toString() });
                setStep(3); window.scrollTo(0, 0);
            } else {
                showToast("Thêm địa chỉ thành công. Vui lòng chọn lại từ danh sách.", "info");
                fetchAddresses();
                setShippingInfo({ fullName: "", phone: "", email: "", address: "", city: "", district: "", ward: "", note: "" });
                setSelectedProvinceCode(''); setSelectedDistrictCode(''); setSelectedWardCode('');
            }
        } catch (error) { showToast(error.message || "Có lỗi xảy ra khi thêm địa chỉ.", "error");
        } finally { setIsPlacingOrder(false); }
    };

    const handlePlaceOrder = async () => {
        if (authIsLoading) { showToast("Hệ thống đang xử lý thông tin đăng nhập, vui lòng thử lại sau giây lát.", "warning"); return; }
        setIsPlacingOrder(true); clearOrderError();
        const addressIdFromUrl = queryParams.get('addressId');
        if (!addressIdFromUrl) { showToast("Vui lòng chọn hoặc lưu địa chỉ giao hàng hợp lệ ở bước trước.", "error"); setIsPlacingOrder(false); return; }
        const finalAddressId = Number(addressIdFromUrl);

        try {
            const createdOrder = await createNewOrderContext(finalAddressId);
            if (!createdOrder || !createdOrder.id) { throw new Error("Không nhận được ID đơn hàng sau khi tạo."); }

            setProcessedOrderId(createdOrder.id.toString());
            setOrderIdForPostProcessing(createdOrder.id.toString());
            setEmailSentForOrderId(null); // **QUAN TRỌNG: Reset cờ đã gửi mail khi tạo đơn hàng MỚI**
            setOrderProcessedForEmailAndCartClear(false); // Reset cờ đã xử lý post-processing

            if (paymentMethod === "VNPAY") {
                const paymentResponse = await orderService.createVNPayPayment(createdOrder.id);
                if (paymentResponse.data?.paymentUrl) { window.location.href = paymentResponse.data.paymentUrl; return; }
                else { throw new Error("Không nhận được link thanh toán VNPAY."); }
            } else { // COD
                const params = new URLSearchParams();
                params.set('step', '4');
                params.set('orderId', createdOrder.id.toString());
                navigate({ pathname: locationHook.pathname, search: params.toString() }, { replace: true });
                setStep(4);
            }
        } catch (err) {
            console.error("[Checkout] Lỗi trong quá trình đặt hàng:", err.message, err);
            const apiErrorMessage = orderContextError || err.message || "Đặt hàng thất bại. Vui lòng thử lại.";
            if (err.message && err.message.includes("Authentication in progress")) { showToast("Hệ thống đang xử lý thông tin đăng nhập, vui lòng thử lại sau giây lát.", "warning");
            } else { showToast(apiErrorMessage, "error"); }
        } finally {
             if (paymentMethod !== 'VNPAY' || (err && !err.message?.toLowerCase().includes("vnpay"))) { setIsPlacingOrder(false); }
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount || 0);

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
                {isCartContextLoading ? <CircularProgress /> : !cartData || !cartData.cartItems || cartData.cartItems.length === 0 ? (
                    <Typography>Giỏ hàng trống hoặc đang tải...</Typography>
                ) : (
                    <div className="space-y-3">
                        {cartData.cartItems.map(item => (
                            <div key={item.id || item.productId} className="flex justify-between items-start py-2 border-b border-gray-200 last:border-b-0">
                                <div>
                                    <p className='font-medium text-gray-800'>{item.productName}</p>
                                    <p className='text-sm text-gray-500'>SL: x{item.quantity} {item.size ? `(${item.size})` : ''}</p>
                                </div>
                                <p className="font-semibold text-red-600 whitespace-nowrap">{formatCurrency(item.discountedPrice * item.quantity)}</p>
                            </div>
                        ))}
                        <div className="border-t border-gray-300 pt-4 mt-4 space-y-2">
                            <div className="flex justify-between text-gray-600"><p>Tạm tính:</p> <p>{formatCurrency(cartData.totalOriginalPrice)}</p></div>
                            <div className="flex justify-between text-gray-600"><p>Giảm giá:</p> <p className="text-green-600">-{formatCurrency(cartData.discount)}</p></div>
                            <div className="flex justify-between text-lg font-bold text-gray-800"><p>Tổng cộng:</p> <p className="text-red-600">{formatCurrency(cartData.totalDiscountedPrice)}</p></div>
                        </div>
                    </div>
                )}
            </div>
            {orderContextError && <Alert severity="error" sx={{ mb: 2 }} onClose={clearOrderError}>{orderContextError}</Alert>}
            <div className="flex justify-between mt-8">
                <MuiButton variant="outlined" onClick={handlePrevStep} disabled={isPlacingOrder} sx={{ py: 1.5, px: 4 }}>Quay Lại</MuiButton>
                <MuiButton variant="contained" onClick={handlePlaceOrder} disabled={isPlacingOrder || isCartContextLoading || !cartData?.cartItems?.length || authIsLoading} sx={{ py: 1.5, px: 6, bgcolor: 'rgb(220 38 38)', '&:hover': { bgcolor: 'rgb(185 28 28)' } }}>
                    {isPlacingOrder || authIsLoading ? <CircularProgress size={24} color="inherit" /> : 'Hoàn tất đặt hàng'}
                </MuiButton>
            </div>
        </div>);
    const CompleteStep = () => { /* ... (Giữ nguyên) ... */ const orderDetails = orderFromContext;
        const orderIdToDisplay = processedOrderId || orderDetails?.id;

        if (vnpayStatus === 'processing' || (isOrderContextLoadingGlobal && !orderDetails && !orderContextError && step === 4)) {
            return (
                <Box sx={{ textAlign: 'center', py: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={50} />
                    <Typography variant="h6" sx={{ mt: 2 }}>{vnpayMessage || "Đang tải thông tin đơn hàng..."}</Typography>
                </Box>
            );
        }
        if (vnpayStatus === 'failed') {
            return (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <svg className="mx-auto mb-4 h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 'bold', color: 'error.main' }}>Thanh toán thất bại</Typography>
                    <Typography sx={{ mb: 3, color: 'text.secondary' }}>{vnpayMessage || "Đã có lỗi xảy ra với thanh toán VNPAY."}</Typography>
                    <MuiButton variant="outlined" onClick={() => navigate(`/my-order/${orderIdToDisplay || ''}`)}>Xem chi tiết đơn hàng</MuiButton>
                </Box>
            );
        }
        if (orderContextError && !orderDetails && step === 4) {
            return (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography variant="h5" color="error" gutterBottom>Không thể tải thông tin đơn hàng</Typography>
                    <Typography sx={{ mb: 2 }}>{orderContextError}</Typography>
                    {orderIdToDisplay && <MuiButton variant="outlined" onClick={() => fetchOrderByIdContext(orderIdToDisplay)}>Thử lại</MuiButton>}
                </Box>
            );
        }
        if (!orderDetails && !isOrderContextLoadingGlobal && !orderContextError && step === 4 && vnpayStatus !== 'success') {
            return (
                 <Box sx={{ textAlign: 'center', py: 10 }}>
                    <Typography sx={{ mb: 2 }}>Không tìm thấy thông tin cho đơn hàng #{orderIdToDisplay}.</Typography>
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
                    {(vnpayStatus === 'success' || (orderDetails?.paymentMethod === 'COD' && orderDetails?.id?.toString() === orderIdToDisplay) ) && (
                        <svg className="mx-auto mb-4 h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
                        {vnpayStatus === 'success' ? "Thanh toán VNPAY thành công!" : "Đặt hàng thành công!"}
                    </h2>
                    <p className="text-lg text-gray-600 mb-6">Cảm ơn bạn đã đặt hàng tại Tech Shop.</p>
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6 text-left space-y-3 text-sm sm:text-base">
                        <h3 className="text-xl font-semibold mb-3 text-gray-700">Thông tin đơn hàng #{orderIdToDisplay}</h3>
                        <p><strong>Ngày đặt:</strong> {orderDetails?.orderDate ? new Date(orderDetails.orderDate).toLocaleString('vi-VN') : "Đang cập nhật..."}</p>
                        <p><strong>Phương thức:</strong> {orderDetails?.paymentMethod === "COD" ? "Thanh toán khi nhận hàng (COD)" : (orderDetails?.paymentMethod || (vnpayStatus === 'success' ? "VNPAY" : "Đang cập nhật..."))}</p>
                        <p><strong>Địa chỉ giao:</strong> {`${orderDetails?.shippingAddress?.street || ''}, ${orderDetails?.shippingAddress?.ward || ''}, ${orderDetails?.shippingAddress?.district || ''}, ${orderDetails?.shippingAddress?.province || ''}`}</p>
                        <p className="font-bold"><strong>Tổng tiền:</strong> <span className="text-red-600">{orderDetails ? formatCurrency(orderDetails.totalDiscountedPrice) : "Đang cập nhật..."}</span></p>
                    </div>
                    <p className="mb-8 text-gray-600">Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.</p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <MuiButton variant="contained" color="primary" onClick={() => navigate('/')} sx={{ py: 1.5, px: 5 }}>TIẾP TỤC MUA SẮM</MuiButton>
                        <MuiButton variant="outlined" color="primary" onClick={() => navigate(`/my-order/${orderIdToDisplay || ''}`)} sx={{ py: 1.5, px: 5 }}>XEM ĐƠN HÀNG</MuiButton>
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
                    />
                )}
                {step === 3 && <PaymentStep />}
                {step === 4 && <CompleteStep />}
            </div>
        </div>
    );
};

export default Checkout;