import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { cartService } from '../../services/user/cart.service';
import { useAuthContext } from './AuthContext';
import { getErrorMessage } from '../../utils/errorUtils';

const CartContext = createContext(null);

const initialCartState = {
  cartItems: [],
  totalOriginalPrice: 0,
  totalDiscountedPrice: 0,
  discount: 0,
  totalItems: 0,
  id: null,
  version: 0
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
        id: item.id != null ? item.id : (item.cartItemId != null ? item.cartItemId : item.productId),
        cartItemId: item.id != null ? item.id : item.cartItemId,
        productId: item.productId || item.id,
        productName: item.productName || item.title || item.name || "Sản phẩm",
        imageUrl: item.productImageUrl || item.imageUrl || item.image || "/Placeholder2.png",
        productImageUrl: item.productImageUrl || item.imageUrl || item.image || "/Placeholder2.png",
        price: item.price || 0,
        discountedPrice: item.discountedPrice != null ? item.discountedPrice : (item.price || 0),
        quantity: item.quantity || 1,
        size: item.size || null,
        stock: item.stock ?? item.quantityInStock ?? item.quantityAvailable ?? item.availableQuantity ?? item.maxQuantity ?? null,
      }));

      const totalOriginalPrice = dataFromApi.totalOriginalPrice ?? dataFromApi.totalPrice ?? 0;
      const totalDiscountedPrice = dataFromApi.totalDiscountedPrice ?? (dataFromApi.totalPrice || 0);
      const discount = dataFromApi.discount ?? (totalOriginalPrice - totalDiscountedPrice);
      const totalItems = normalizedItems.length;

      return {
        cartItems: normalizedItems,
        totalOriginalPrice,
        totalDiscountedPrice,
        discount: discount > 0 ? discount : 0,
        totalItems,
        id: dataFromApi.id || cart?.id || null,
        version: dataFromApi.version ?? 0,
      };
    }
    console.warn("[CartContext] Dữ liệu giỏ hàng từ API không đúng định dạng hoặc rỗng:", dataFromApi);
    return initialCartState;
  };

  const internalFetchCart = useCallback(async () => {
    if (authIsLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      setCart(initialCartState);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await cartService.getCart();
      const cartDataFromApi = response.data.data || response.data;
      const normalizedData = normalizeCartData(cartDataFromApi);
      setCart(normalizedData);
    } catch (err) {
      console.error("[CartContext] Lỗi khi lấy giỏ hàng:", err);
      const errorMessage = getErrorMessage(err, "Không thể tải giỏ hàng.");
      setError(errorMessage);
      setCart(initialCartState);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, authIsLoading]);

  useEffect(() => {
    if (!authIsLoading) {
      if (isAuthenticated && user) {
        internalFetchCart();
      } else {
        setCart(initialCartState);
        setIsLoading(false);
        setError(null);
      }
    }
  }, [isAuthenticated, user, authIsLoading, internalFetchCart]);

  const addItemToCart = async (cartData) => {
    if (authIsLoading) { throw new Error("Hệ thống đang xử lý, vui lòng thử lại sau."); }
    if (!isAuthenticated) { throw new Error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng."); }
    setIsLoading(true);
    try {
      const response = await cartService.addToCart(cartData);
      const cartDataFromApi = response.data?.data || response.data;
      if (cartDataFromApi && typeof cartDataFromApi === 'object') {
        setCart(normalizeCartData(cartDataFromApi));
      } else {
        await internalFetchCart();
      }
    } catch (err) {
      if (!err.message?.includes("Authentication in progress")) {
          setIsLoading(false);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItemFromCart = async (cartItemId) => {
    if (authIsLoading) throw new Error("Hệ thống đang xử lý, vui lòng thử lại sau.");
    if (!isAuthenticated) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
    setIsLoading(true);
    try {
      const response = await cartService.removeFromCart(cartItemId);
      const cartDataFromApi = response.data?.data || response.data;
      if (cartDataFromApi && typeof cartDataFromApi === 'object') {
        setCart(normalizeCartData(cartDataFromApi));
      } else {
        await internalFetchCart();
      }
    } catch (err) {
      console.error("[CartContext] Error in removeItemFromCart:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (cartItemId, newQuantity) => {
    if (authIsLoading) throw new Error("Hệ thống đang xử lý, vui lòng thử lại sau.");
    if (!isAuthenticated) throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
    setIsLoading(true);
    try {
      const response = await cartService.updateCartItem(cartItemId, newQuantity);
      const cartDataFromApi = response.data?.data || response.data;
      if (cartDataFromApi && typeof cartDataFromApi === 'object') {
        setCart(normalizeCartData(cartDataFromApi));
      } else {
        await internalFetchCart();
      }
    } catch (err) {
      console.error("[CartContext] Error in updateCartItem:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCartContext = async () => {
    if (authIsLoading) { throw new Error("Hệ thống đang xử lý, không thể xóa giỏ hàng lúc này."); }
    if (!isAuthenticated) { throw new Error("Vui lòng đăng nhập để thực hiện thao tác này."); }
    setIsLoading(true);
    try {
      await cartService.clearCart();
      setCart({ ...initialCartState, id: cart?.id, version: cart?.version ?? 0 });
    } catch (err) {
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
