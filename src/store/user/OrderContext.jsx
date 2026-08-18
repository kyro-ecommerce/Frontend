// src/contexts/OrderContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { orderService } from '../../services/user/order.service';
import { aiService } from '../../services/user/ai.service';
import { useAuthContext } from './AuthContext'; // Giả sử bạn có AuthContext
import { getErrorMessage } from '../../utils/errorUtils';

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const latestOrderRequest = useRef(0);
  const [orders, setOrders] = useState([]);
  const [orderPagination, setOrderPagination] = useState({ page: 0, totalPages: 0, totalElements: 0, first: true, last: true });
  const [currentOrder, setCurrentOrder] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, jwt } = useAuthContext(); // Lấy trạng thái xác thực

  // fetchAddresses (giữ nguyên hoặc đảm bảo useCallback nếu cần)
  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.getAddresses();
      setAddresses(response.data?.data || response.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách địa chỉ (Context):", err);
      setError(getErrorMessage(err, "Không thể tải danh sách địa chỉ."));
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setOrders([]);
      setCurrentOrder(null);
    }
  }, [isAuthenticated, fetchAddresses]);

  const createNewOrder = useCallback(async (addressId, paymentMethod, cartItemIds, cartVersion, expectedTotalDiscountedPrice) => {
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để đặt hàng.");
      throw new Error("User not authenticated");
    }
    if (!addressId) {
        setError("Vui lòng chọn địa chỉ giao hàng hợp lệ.");
        throw new Error("Address ID is required");
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.createOrder(addressId, paymentMethod, cartItemIds, cartVersion, expectedTotalDiscountedPrice);
      const responseBody = response.data;
      let actualOrderObject = null;
      if (responseBody && Array.isArray(responseBody.orders) && responseBody.orders.length > 0) {
        actualOrderObject = responseBody.orders[0];
      } else {
        const errorMsg = `Cấu trúc phản hồi API tạo đơn hàng không đúng. Dữ liệu: ${JSON.stringify(responseBody, null, 2)}`;
        throw new Error(errorMsg);
      }
      if (!actualOrderObject || typeof actualOrderObject !== 'object') {
           const errorMsg = `Đối tượng đơn hàng không hợp lệ. Giá trị: ${JSON.stringify(actualOrderObject)}`;
           throw new Error(errorMsg);
      }
      const orderIdValue = actualOrderObject.id || actualOrderObject.orderId || actualOrderObject.order_id;
      if (!orderIdValue) {
           const errorMessage = `ID đơn hàng không tồn tại. Đối tượng: ${JSON.stringify(actualOrderObject, null, 2)}`;
           throw new Error(errorMessage);
      }
      actualOrderObject.id = orderIdValue;
      setCurrentOrder(actualOrderObject);

      // Record PURCHASE interaction (weight 5.0) to AI Service for personalization & Adminer DB logging
      try {
        const orderCat = actualOrderObject.categoryName || actualOrderObject.category || "";
        aiService.recordInteraction("PURCHASE", `Order #${orderIdValue} completed`, orderCat);
      } catch (e) {
        console.debug("Could not record purchase interaction:", e);
      }

      return actualOrderObject;
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Không thể tạo đơn hàng.");
      setError(errorMessage);
      setCurrentOrder(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrderById = useCallback(async (orderId, silent = false) => {
    if (!isAuthenticated || !orderId) {
        if (!silent) setCurrentOrder(null);
        return;
    }
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const response = await orderService.getOrderById(orderId);
      const responseBody = response.data;
      let orderData = null;
      if (responseBody && Array.isArray(responseBody.orders) && responseBody.orders.length > 0) {
          orderData = responseBody.orders[0];
      } else if (responseBody && typeof responseBody.data === 'object' && responseBody.data !== null && responseBody.data.id) {
          orderData = responseBody.data;
      } else if (responseBody && typeof responseBody === 'object' && responseBody !== null && responseBody.id) {
          orderData = responseBody;
      } else {
          throw new Error(`Cấu trúc dữ liệu chi tiết đơn hàng ${orderId} không hợp lệ.`);
      }
      if (!orderData || typeof orderData !== 'object') {
        throw new Error(`Dữ liệu chi tiết đơn hàng ${orderId} không phải là object.`);
      }
      const idValue = orderData.id || orderData.orderId || orderData.order_id;
      if (idValue) {
        orderData.id = idValue;
      }
      setCurrentOrder(orderData);
    } catch (err) {
      if (!silent) {
        console.error(`Lỗi khi lấy chi tiết đơn hàng ${orderId} (Context):`, err);
        setError(getErrorMessage(err, "Không thể tải chi tiết đơn hàng."));
        setCurrentOrder(null);
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addNewAddress = useCallback(async (addressData) => {
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để thêm địa chỉ.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.addAddress(addressData);
      await fetchAddresses();
      return response.data;
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Không thể thêm địa chỉ mới.");
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchAddresses]);

  const fetchUserOrders = useCallback(async (status = "all", page = 0) => {
    if (!isAuthenticated) {
        setOrders([]);
        return;
    }
    setIsLoading(true);
    const requestId = ++latestOrderRequest.current;
    setError(null);
    try {
        const response = await orderService.getAllOrders({ status, page, size: 20 });
        if (requestId !== latestOrderRequest.current) return;
        const pageData = response.data || {};
        const fetchedOrders = pageData.content || [];
        setOrderPagination({
          page: pageData.page || 0,
          totalPages: pageData.totalPages || 0,
          totalElements: pageData.totalElements || 0,
          first: pageData.first ?? true,
          last: pageData.last ?? true
        });
        
        const normalizedOrders = fetchedOrders.map(order => {
            if (order && typeof order === 'object' && !order.id && (order.orderId || order.order_id)) {
                return { ...order, id: order.orderId || order.order_id };
            }
            return order;
        }).filter(Boolean);
        setOrders(normalizedOrders);
    } catch (err) {
        if (requestId !== latestOrderRequest.current) return;
        console.error(`Lỗi khi lấy danh sách đơn hàng (${status}) (Context):`, err);
        setError(getErrorMessage(err, "Không thể tải danh sách đơn hàng."));
        setOrders([]);
    } finally {
        if (requestId === latestOrderRequest.current) setIsLoading(false);
    }
  }, [isAuthenticated]);

  const cancelUserOrder = useCallback(async (orderId) => {
    if (!isAuthenticated) {
        setError("Vui lòng đăng nhập để thực hiện thao tác này.");
        throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
        const response = await orderService.cancelOrder(orderId);
        
        if (currentOrder && (currentOrder.id === orderId || currentOrder.orderId === orderId || currentOrder.order_id === orderId)) {
             const actualId = currentOrder.id || currentOrder.orderId || currentOrder.order_id;
             if (actualId.toString() === orderId.toString()) {
                setCurrentOrder(prev => ({ ...prev, orderStatus: "CANCELLED", id: actualId }));
             }
        }
        return response.data;
    } catch (err) {
        const errorMessage = getErrorMessage(err, "Không thể hủy đơn hàng.");
        setError(errorMessage);
        throw err;
    } finally {
        setIsLoading(false);
    }
  }, [isAuthenticated, currentOrder]); // Thêm currentOrder

  // **QUAN TRỌNG: Bọc clearOrderError trong useCallback**
  const clearOrderError = useCallback(() => {
    setError(null);
  }, []); // Không có dependency, hàm này sẽ ổn định

  const value = {
    orders,
    orderPagination,
    currentOrder,
    addresses,
    isLoading,
    error,
    fetchAddresses,
    createNewOrder,
    fetchOrderById,
    addNewAddress,
    fetchUserOrders,
    cancelUserOrder,
    clearOrderError
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrderContext = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrderContext must be used within an OrderProvider');
  }
  return context;
};
