import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useOrderContext } from '../../store/user/OrderContext';
import { useCartContext } from '../../store/user/CartContext';
import { orderService } from '../../services/user/order.service';
import { useAuthContext } from '../../store/user/AuthContext';
import { useToast } from '../../store/user/ToastContext';

const API_LOCATION_BASE_URL = "https://provinces.open-api.vn/api";

export const useCheckoutPage = () => {
    const navigate = useNavigate();
    const locationHook = useLocation();
    const { showToast } = useToast();
    const queryParams = new URLSearchParams(locationHook.search);
    const initialStep = parseInt(queryParams.get('step') || '2', 10);
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

    const { cart: cartData, isLoading: isCartContextLoading, fetchCart } = useCartContext();
    const { isLoading: authIsLoading } = useAuthContext();
    const selectedItemIds = (queryParams.get('cartItemIds') || '')
        .split(',')
        .map(Number)
        .filter(id => Number.isInteger(id) && id > 0);
    const selectedCartItems = cartData?.cartItems?.filter(item => selectedItemIds.includes(item.id)) || [];
    const selectedTotalOriginalPrice = selectedCartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const selectedTotalDiscountedPrice = selectedCartItems.reduce(
        (total, item) => total + item.salePrice * item.quantity,
        0
    );

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
    const [emailSentForOrderId, setEmailSentForOrderId] = useState(null);
    const [isProcessingPostOrder, setIsProcessingPostOrder] = useState(false);

    useEffect(() => {
        if (step < 4 && !isCartContextLoading && selectedItemIds.length === 0) {
            navigate('/cart', { replace: true });
        }
    }, [step, isCartContextLoading, selectedItemIds.length, navigate]);

    useEffect(() => {
        fetchAddresses();
    }, [fetchAddresses]);

    useEffect(() => {
        const addressIdFromQuery = queryParams.get('addressId');
        if (addressIdFromQuery && savedAddressesContext.length > 0 && !shippingInfo.fullName) {
            const foundAddress = savedAddressesContext.find(addr => addr.id.toString() === addressIdFromQuery);
            if (foundAddress) {
                setSelectedAddress(foundAddress);
            }
        }
    }, [savedAddressesContext, locationHook.search, step, shippingInfo.fullName]);

    useEffect(() => {
        const currentOrderIdFromUrl = queryParams.get('orderId');
        if (step === 4 && currentOrderIdFromUrl) {
            if (currentOrderIdFromUrl !== processedOrderId || !orderFromContext || orderFromContext.id?.toString() !== currentOrderIdFromUrl) {
                setProcessedOrderId(currentOrderIdFromUrl);
                fetchOrderByIdContext(currentOrderIdFromUrl);
            }

            // Tự động poll ngầm mỗi 3s nếu đơn hàng đang ở trạng thái chờ xác nhận (PENDING)
            let intervalId = null;
            const isPending = !orderFromContext || orderFromContext.orderStatus === 'PENDING' || orderFromContext.orderStatus === 'WAITING_FOR_CONFIRMATION';
            if (isPending) {
                intervalId = setInterval(() => {
                    fetchOrderByIdContext(currentOrderIdFromUrl, true);
                }, 3000);
            }

            return () => {
                if (intervalId) clearInterval(intervalId);
            };
        }
    }, [step, locationHook.search, queryParams, fetchOrderByIdContext, processedOrderId, orderFromContext]);

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

    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount || 0);
    }, []);

    const clearAddressIdQueryParam = useCallback(() => {
        setSelectedAddress(null);
        const params = new URLSearchParams(locationHook.search);
        if (params.has('addressId')) {
            params.delete('addressId');
            navigate({ pathname: locationHook.pathname, search: params.toString() }, { replace: true });
        }
    }, [locationHook.search, locationHook.pathname, navigate]);

    const handleShippingChange = useCallback((e) => {
        clearAddressIdQueryParam();
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    }, [clearAddressIdQueryParam]);

    const handleProvinceChange = useCallback((e) => {
        clearAddressIdQueryParam();
        const code = e.target.value;
        const selectedOption = provinces.find(p => p.code.toString() === code);
        const name = selectedOption ? selectedOption.name : '';
        setSelectedProvinceCode(code);
        setShippingInfo(prev => ({ ...prev, city: name, district: '', ward: '' }));
        setSelectedDistrictCode('');
        setSelectedWardCode('');
        setDistricts([]);
        setWards([]);
    }, [clearAddressIdQueryParam, provinces]);

    const handleDistrictChange = useCallback((e) => {
        clearAddressIdQueryParam();
        const code = e.target.value;
        const selectedOption = districts.find(d => d.code.toString() === code);
        const name = selectedOption ? selectedOption.name : '';
        setSelectedDistrictCode(code);
        setShippingInfo(prev => ({ ...prev, district: name, ward: '' }));
        setSelectedWardCode('');
        setWards([]);
    }, [clearAddressIdQueryParam, districts]);

    const handleWardChange = useCallback((e) => {
        clearAddressIdQueryParam();
        const code = e.target.value;
        const selectedOption = wards.find(w => w.code.toString() === code);
        const name = selectedOption ? selectedOption.name : '';
        setSelectedWardCode(code);
        setShippingInfo(prev => ({ ...prev, ward: name }));
    }, [clearAddressIdQueryParam, wards]);

    const handleAddressSelect = useCallback((address) => {
        setSelectedAddress(address);
        setShippingInfo({ fullName: "", phone: "", email: "", address: "", city: "", district: "", ward: "", note: "" });
        setSelectedProvinceCode('');
        setSelectedDistrictCode('');
        setSelectedWardCode('');
        setDistricts([]);
        setWards([]);
        const params = new URLSearchParams(locationHook.search);
        params.set('addressId', address.id.toString());
        navigate({ pathname: locationHook.pathname, search: params.toString() }, { replace: true });
    }, [locationHook.search, locationHook.pathname, navigate]);

    const handleAddAddressAndContinue = useCallback(async () => {
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
    }, [shippingInfo, selectedProvinceCode, selectedDistrictCode, selectedWardCode, showToast, addNewAddressContext, locationHook.search, locationHook.pathname, navigate, fetchAddresses]);

    const handleNextStep = useCallback(() => {
        clearOrderError();
        if (step === 2) {
            if (selectedAddress) {
                const params = new URLSearchParams(locationHook.search);
                params.set('addressId', selectedAddress.id.toString());
                params.set('step', '3');
                navigate({ pathname: locationHook.pathname, search: params.toString() });
                setStep(3);
            } else if (shippingInfo.fullName && shippingInfo.phone && shippingInfo.address && selectedProvinceCode && selectedDistrictCode && selectedWardCode) {
                handleAddAddressAndContinue();
            } else {
                showToast("Vui lòng chọn địa chỉ giao hàng hoặc điền đầy đủ thông tin địa chỉ mới.", "warning");
                return;
            }
        }
        window.scrollTo(0, 0);
    }, [clearOrderError, step, selectedAddress, locationHook.search, locationHook.pathname, navigate, shippingInfo, selectedProvinceCode, selectedDistrictCode, selectedWardCode, handleAddAddressAndContinue, showToast]);

    const handlePrevStep = useCallback(() => {
        clearOrderError();
        const params = new URLSearchParams(locationHook.search);
        if (step === 2) { navigate('/cart'); }
        else if (step > 2) {
            const prevStep = step - 1;
            params.set('step', prevStep.toString());
            const paramsToRemove = ['vnp_Amount', 'vnp_BankCode', 'vnp_OrderInfo', 'vnp_PayDate', 'vnp_ResponseCode', 'vnp_SecureHash', 'vnp_TmnCode', 'vnp_TransactionNo', 'vnp_TransactionStatus', 'vnp_TxnRef'];
            paramsToRemove.forEach(p => params.delete(p));
            
            if (step === 4) {
                 setOrderProcessedForEmailAndCartClear(false);
            }
            navigate({ pathname: locationHook.pathname, search: params.toString() });
            setStep(prevStep);
            if (vnpayStatus) setVnpayStatus(null);
        }
        window.scrollTo(0, 0);
    }, [clearOrderError, step, navigate, locationHook.search, locationHook.pathname, vnpayStatus]);

    const handlePlaceOrder = useCallback(async () => {
        if (authIsLoading) { showToast("Hệ thống đang xử lý thông tin đăng nhập, vui lòng thử lại sau giây lát.", "warning"); return; }
        setIsPlacingOrder(true); clearOrderError();
        const addressIdFromUrl = queryParams.get('addressId');
        if (!addressIdFromUrl) { showToast("Vui lòng chọn hoặc lưu địa chỉ giao hàng hợp lệ ở bước trước.", "error"); setIsPlacingOrder(false); return; }
        const finalAddressId = Number(addressIdFromUrl);
        if (selectedCartItems.length !== selectedItemIds.length) {
            showToast("Giỏ hàng đã thay đổi, vui lòng chọn lại sản phẩm.", "warning");
            setIsPlacingOrder(false);
            return;
        }

        try {
            const createdOrder = await createNewOrderContext(
                finalAddressId,
                paymentMethod,
                selectedItemIds,
                cartData.version,
                selectedTotalDiscountedPrice
            );
            if (!createdOrder || !createdOrder.id) { throw new Error("Không nhận được ID đơn hàng sau khi tạo."); }

            setProcessedOrderId(createdOrder.id.toString());
            setOrderIdForPostProcessing(createdOrder.id.toString());
            setEmailSentForOrderId(null);
            setOrderProcessedForEmailAndCartClear(false);

            if (paymentMethod === "VNPAY") {
                const paymentResponse = await orderService.createVNPayPayment(createdOrder.id);
                console.log("[Checkout] VNPay Response:", paymentResponse);
                const paymentUrl = paymentResponse?.data?.paymentUrl || paymentResponse?.paymentUrl;
                if (paymentUrl && typeof paymentUrl === 'string' && (paymentUrl.startsWith('http://') || paymentUrl.startsWith('https://'))) {
                    console.log("[Checkout] Redirecting to VNPay URL:", paymentUrl);
                    window.location.href = paymentUrl;
                    return;
                } else {
                    console.error("[Checkout] Invalid VNPay URL payload:", paymentResponse);
                    throw new Error("Không nhận được link thanh toán VNPAY hợp lệ từ hệ thống.");
                }
            } else {
                const params = new URLSearchParams();
                params.set('step', '4');
                params.set('orderId', createdOrder.id.toString());
                navigate({ pathname: locationHook.pathname, search: params.toString() }, { replace: true });
                setStep(4);
            }
        } catch (err) {
            console.error("[Checkout] Lỗi trong quá trình đặt hàng:", err.message, err);
            const apiErrorMessage = err.response?.data?.message || err.response?.data?.detail || orderContextError || err.message || "Đặt hàng thất bại. Vui lòng thử lại.";
            if (err.message && err.message.includes("Authentication in progress")) {
                showToast("Hệ thống đang xử lý thông tin đăng nhập, vui lòng thử lại sau giây lát.", "warning");
            } else {
                showToast(apiErrorMessage, "error");
            }
            setIsPlacingOrder(false);
        } finally {
            if (paymentMethod !== 'VNPAY') {
                setIsPlacingOrder(false);
            }
        }
    }, [authIsLoading, showToast, clearOrderError, queryParams, selectedCartItems.length, selectedItemIds, createNewOrderContext, paymentMethod, cartData?.version, selectedTotalDiscountedPrice, orderContextError, locationHook.pathname, locationHook.search, navigate]);

    return {
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
    };
};
