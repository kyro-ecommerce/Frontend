// src/contexts/CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { cartService } from '../../services/user/cart.service';
import { useAuthContext } from './AuthContext';

const CartContext = createContext(null);

const initialCartState = {
  cartItems: [],
  totalOriginalPrice: 0,
  totalDiscountedPrice: 0,
  discount: 0,
  totalItems: 0,
  id: null
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(initialCartState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, user, isLoading: authIsLoading } = useAuthContext();

  const normalizeCartData = (dataFromApi) => {
    if (dataFromApi && typeof dataFromApi === 'object') {
      const rawItems = dataFromApi.cartItems || dataFromApi.items || [];
      const normalizedItems = rawItems.map(item => ({
        ...item,
        id: item.id || item.productId,
        productId: item.productId || item.id,
        productName: item.productName || item.title || item.name || "Sản phẩm",
        imageUrl: item.productImageUrl || item.imageUrl || item.image || "/Placeholder2.png",
        productImageUrl: item.productImageUrl || item.imageUrl || item.image || "/Placeholder2.png",
        price: item.price || 0,
        discountedPrice: item.discountedPrice != null ? item.discountedPrice : (item.price || 0),
        quantity: item.quantity || 1,
        size: item.size || null,
      }));

      const totalOriginalPrice = dataFromApi.totalOriginalPrice ?? dataFromApi.totalPrice ?? 0;
      const totalDiscountedPrice = dataFromApi.totalDiscountedPrice ?? (dataFromApi.totalPrice || 0);
      const discount = dataFromApi.discount ?? (totalOriginalPrice - totalDiscountedPrice);
      const totalItems = dataFromApi.totalItems ?? normalizedItems.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

      return {
        cartItems: normalizedItems,
        totalOriginalPrice,
        totalDiscountedPrice,
        discount: discount > 0 ? discount : 0,
        totalItems,
        id: dataFromApi.id || cart?.id || null,
      };
    }
    console.warn("[CartContext] Dữ liệu giỏ hàng từ API không đúng định dạng hoặc rỗng:", dataFromApi);
    return initialCartState;
  };

  const internalFetchCart = useCallback(async () => {
    if (authIsLoading) {
      // console.log("[CartContext] AuthContext is loading, deferring internalFetchCart.");
      return;
    }

    if (!isAuthenticated || !user) {
      // console.log("[CartContext] Not authenticated or no user, setting cart to initial state.");
      setCart(initialCartState);
      setIsLoading(false);
      setError(null);
      return;
    }

    // console.log("[CartContext] Attempting to fetch cart via internalFetchCart.");
    setIsLoading(true);
    setError(null);
    try {
      const response = await cartService.getCart();
      // console.log("[CartContext] API response from cartService.getCart():", response);
      const cartDataFromApi = response.data.data || response.data;
      // console.log("[CartContext] Extracted cartDataFromApi:", cartDataFromApi);
      const normalizedData = normalizeCartData(cartDataFromApi);
      // console.log("[CartContext] Normalized cart data:", normalizedData);
      setCart(normalizedData);
    } catch (err) {
      console.error("[CartContext] Lỗi khi lấy giỏ hàng:", err);
      const errorMessage = err.response?.data?.message || err.message || "Không thể tải giỏ hàng.";
      setError(errorMessage);
      setCart(initialCartState);
    } finally {
      setIsLoading(false);
      // console.log("[CartContext] internalFetchCart finished.");
    }
  }, [isAuthenticated, user, authIsLoading]); // Dependencies này OK

  useEffect(() => {
    // console.log("[CartContext Main Effect] Triggered. AuthLoading:", authIsLoading, "IsAuth:", isAuthenticated, "User:", !!user);
    if (!authIsLoading) {
      if (isAuthenticated && user) {
        // console.log("[CartContext Main Effect] User authenticated, calling internalFetchCart.");
        internalFetchCart();
      } else {
        // console.log("[CartContext Main Effect] User not authenticated or no user, resetting cart state.");
        setCart(initialCartState);
        setIsLoading(false);
        setError(null);
      }
    }
  }, [isAuthenticated, user, authIsLoading, internalFetchCart]);

  const addItemToCart = async (cartData) => {
    if (authIsLoading) { throw new Error("Hệ thống đang xử lý, vui lòng thử lại sau."); }
    if (!isAuthenticated) { throw new Error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng."); }
    setIsLoading(true); // Bắt đầu loading cho action này
    setError(null);
    try {
      await cartService.addToCart(cartData);
      await internalFetchCart(); // Fetch lại toàn bộ giỏ hàng
      // Không cần return updatedCartData nữa nếu component sẽ lấy từ state cart được cập nhật
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể thêm vào giỏ hàng.";
      setError(errorMessage);
      // setIsLoading(false) sẽ được gọi trong finally của internalFetchCart hoặc ở đây nếu internalFetchCart không chạy
      if (!err.message?.includes("Authentication in progress")) { // Tránh set loading false nếu lỗi do auth
          setIsLoading(false);
      }
      throw err; // Ném lỗi để component gọi có thể xử lý (ví dụ: hiển thị toast)
    }
    // setIsLoading(false) sẽ được xử lý bởi internalFetchCart nếu nó chạy thành công
  };

  const removeItemFromCart = async (cartItemId) => {
    if (authIsLoading) throw new Error("Hệ thống đang xử lý, vui lòng thử lại sau.");
    if (!isAuthenticated) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
    setIsLoading(true);
    setError(null);
    try {
      await cartService.removeFromCart(cartItemId);
      await internalFetchCart();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể xóa sản phẩm.";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const updateCartItem = async (cartItemId, newQuantity) => {
    if (authIsLoading) throw new Error("Hệ thống đang xử lý, vui lòng thử lại sau.");
    if (!isAuthenticated) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
    setIsLoading(true);
    setError(null);
    try {
      await cartService.updateCartItem(cartItemId, newQuantity);
      await internalFetchCart();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể cập nhật số lượng.";
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  const clearCartContext = async () => {
    if (authIsLoading) { throw new Error("Hệ thống đang xử lý, không thể xóa giỏ hàng lúc này."); }
    if (!isAuthenticated) { throw new Error("Vui lòng đăng nhập để thực hiện thao tác này."); }
    setIsLoading(true);
    setError(null);
    try {
      await cartService.clearCart();
      setCart({ ...initialCartState, id: cart?.id });
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Không thể xóa giỏ hàng.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const exportedFetchCart = useCallback(() => {
    // console.log("[CartContext] exportedFetchCart called. authIsLoading:", authIsLoading);
    if (!authIsLoading) {
      internalFetchCart();
    } else {
      // console.log("[CartContext] Auth is loading, exportedFetchCart deferred.");
    }
  }, [authIsLoading, internalFetchCart]);


  const value = {
    cart,
    isLoading,
    error,
    fetchCart: exportedFetchCart,
    addItemToCart,
    removeItemFromCart,
    updateCartItem,
    clearCartContext,
    clearCartError: () => setError(null)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
};