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

    const handleSelectExistingAddress = useCallback((address) => {
        setSelectedAddress(address);
    }, []);

    const handleStepChange = useCallback((newStep) => {
        setStep(newStep);
        const params = new URLSearchParams(locationHook.search);
        params.set('step', newStep.toString());
        navigate(`${locationHook.pathname}?${params.toString()}`, { replace: true });
    }, [locationHook.search, locationHook.pathname, navigate]);

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
        handleSelectExistingAddress,
        handleStepChange,
        showToast
    };
};
