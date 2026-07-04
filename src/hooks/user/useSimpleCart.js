import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Hook quản lý giỏ hàng đơn giản với localStorage
export const useSimpleCart = () => {
  const [cart, setCart] = useState({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    totalDiscountedPrice: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Load giỏ hàng từ localStorage khi component được mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);
  
  // Lưu giỏ hàng vào localStorage khi thay đổi
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);
  
  // Thêm sản phẩm vào giỏ hàng
  const addToCart = (product, quantity = 1, size = null) => {
    setIsLoading(true);
    
    try {
      setCart(prevCart => {
        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const existingItemIndex = prevCart.items.findIndex(
          item => item.product.id === product.id && item.size === size
        );
        
        let newItems = [...prevCart.items];
        
        if (existingItemIndex >= 0) {
          // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity
          };
        } else {
          // Nếu sản phẩm chưa có trong giỏ hàng, thêm mới
          newItems.push({
            id: Date.now(), // ID tạm thời
            product,
            quantity,
            size,
            price: product.price
          });
        }
        
        // Tính toán lại tổng
        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalDiscountedPrice = newItems.reduce((sum, item) => {
          const discountPercent = item.product.discountPercent || 0;
          const discountedPrice = item.price * (1 - discountPercent / 100);
          return sum + (discountedPrice * item.quantity);
        }, 0);
        
        return {
          items: newItems,
          totalItems,
          totalPrice,
          totalDiscountedPrice
        };
      });
      
      // Hiển thị thông báo thành công
      alert("Đã thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Có lỗi xảy ra khi thêm vào giỏ hàng");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (itemId) => {
    setIsLoading(true);
    
    try {
      setCart(prevCart => {
        const newItems = prevCart.items.filter(item => item.id !== itemId);
        
        // Tính toán lại tổng
        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalDiscountedPrice = newItems.reduce((sum, item) => {
          const discountPercent = item.product.discountPercent || 0;
          const discountedPrice = item.price * (1 - discountPercent / 100);
          return sum + (discountedPrice * item.quantity);
        }, 0);
        
        return {
          items: newItems,
          totalItems,
          totalPrice,
          totalDiscountedPrice
        };
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
      alert("Có lỗi xảy ra khi xóa sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const updateQuantity = (itemId, quantity) => {
    if (quantity < 1) return;
    
    setIsLoading(true);
    
    try {
      setCart(prevCart => {
        const itemIndex = prevCart.items.findIndex(item => item.id === itemId);
        
        if (itemIndex === -1) return prevCart;
        
        const newItems = [...prevCart.items];
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          quantity
        };
        
        // Tính toán lại tổng
        const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const totalDiscountedPrice = newItems.reduce((sum, item) => {
          const discountPercent = item.product.discountPercent || 0;
          const discountedPrice = item.price * (1 - discountPercent / 100);
          return sum + (discountedPrice * item.quantity);
        }, 0);
        
        return {
          items: newItems,
          totalItems,
          totalPrice,
          totalDiscountedPrice
        };
      });
    } catch (error) {
      console.error("Error updating cart item:", error);
      alert("Có lỗi xảy ra khi cập nhật giỏ hàng");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Xóa tất cả sản phẩm khỏi giỏ hàng
  const clearCart = () => {
    setIsLoading(true);
    
    try {
      setCart({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        totalDiscountedPrice: 0
      });
      
      localStorage.removeItem('cart');
    } catch (error) {
      console.error("Error clearing cart:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Chuyển đến trang thanh toán
  const checkout = () => {
    if (cart.items.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }
    
    navigate('/checkout');
  };
  
  // Format tiền Việt Nam
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };
  
  return {
    cart,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    checkout,
    formatCurrency
  };
};