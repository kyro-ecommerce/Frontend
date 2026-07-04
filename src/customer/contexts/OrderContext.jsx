// src/contexts/OrderContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { orderService } from '../services/order.service';
import { useAuthContext } from './AuthContext'; // Giả sử bạn có AuthContext

const OrderContext = createContext(null);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
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
      setError(err.response?.data?.message || err.message || "Không thể tải danh sách địa chỉ.");
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // Phụ thuộc vào isAuthenticated

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setOrders([]); // Reset orders khi không xác thực
      setCurrentOrder(null);
    }
  }, [isAuthenticated, fetchAddresses]); // Thêm fetchAddresses

  // createNewOrder (giữ nguyên hoặc đảm bảo useCallback nếu cần)
  const createNewOrder = useCallback(async (addressId) => {
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
      const response = await orderService.createOrder(addressId);
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
      return actualOrderObject;
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || err.response?.data?.error || "Không thể tạo đơn hàng.";
      setError(errorMessage);
      setCurrentOrder(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // Phụ thuộc vào isAuthenticated

  // fetchOrderById (giữ nguyên hoặc đảm bảo useCallback nếu cần)
  const fetchOrderById = useCallback(async (orderId) => {
    if (!isAuthenticated || !orderId) {
        setCurrentOrder(null);
        return;
    }
    setIsLoading(true);
    setError(null);
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
      console.error(`Lỗi khi lấy chi tiết đơn hàng ${orderId} (Context):`, err);
      setError(err.response?.data?.message || err.message || "Không thể tải chi tiết đơn hàng.");
      setCurrentOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]); // Phụ thuộc vào isAuthenticated

  // addNewAddress (giữ nguyên hoặc đảm bảo useCallback nếu cần)
  const addNewAddress = useCallback(async (addressData) => {
    if (!isAuthenticated) {
      setError("Vui lòng đăng nhập để thêm địa chỉ.");
      throw new Error("User not authenticated");
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await orderService.addAddress(addressData);
      await fetchAddresses(); // Fetch lại danh sách địa chỉ sau khi thêm
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể thêm địa chỉ mới.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchAddresses]); // Thêm fetchAddresses

  // **QUAN TRỌNG: Bọc fetchUserOrders trong useCallback**
  const fetchUserOrders = useCallback(async (status = "all") => {
    if (!isAuthenticated) {
        setOrders([]);
        return;
    }
    setIsLoading(true);
    setError(null);
    console.log(`[OrderContext] Fetching orders with status: ${status}`); // Thêm log
    try {
        let response;
        switch (status) {
          case "PENDING": response = await orderService.getPendingOrders(); break;
          case "SHIPPED": response = await orderService.getShippingOrders(); break;
          case "DELIVERED": response = await orderService.getDeliveredOrders(); break;
          case "CANCELLED": response = await orderService.getCancelledOrders(); break;
          case "CONFIRMED": response = await orderService.getConfirmedOrders(); break;
          case "all": default: response = await orderService.getAllOrders(); break;
        }
        const fetchedOrders = response.data?.data || response.data || [];
        console.log(`[OrderContext] Fetched orders for status ${status}:`, fetchedOrders); // Thêm log
        
        const normalizedOrders = fetchedOrders.map(order => {
            if (order && typeof order === 'object' && !order.id && (order.orderId || order.order_id)) {
                return { ...order, id: order.orderId || order.order_id };
            }
            return order;
        }).filter(Boolean); // Loại bỏ các giá trị null hoặc undefined nếu có
        setOrders(normalizedOrders);
    } catch (err) {
        console.error(`Lỗi khi lấy danh sách đơn hàng (${status}) (Context):`, err);
        setError(err.response?.data?.message || err.message || "Không thể tải danh sách đơn hàng.");
        setOrders([]);
    } finally {
        setIsLoading(false);
    }
  }, [isAuthenticated]); // Chỉ phụ thuộc vào isAuthenticated

  // cancelUserOrder (giữ nguyên hoặc đảm bảo useCallback nếu cần)
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
        // Gọi fetchUserOrders với status hiện tại để cập nhật danh sách
        // Tuy nhiên, nếu đang ở trang chi tiết, có thể không cần gọi lại toàn bộ danh sách
        // Thay vào đó, OrderManagement sẽ tự fetch lại khi quay về.
        // Hoặc, bạn có thể truyền status hiện tại của OrderManagement vào đây.
        // Để đơn giản, chúng ta sẽ để OrderManagement tự xử lý việc fetch lại.
        // await fetchUserOrders(); // Tạm thời comment dòng này để tránh gọi thừa
        return response.data;
    } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Không thể hủy đơn hàng.";
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