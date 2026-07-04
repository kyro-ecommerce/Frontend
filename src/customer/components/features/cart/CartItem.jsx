import React, { useState } from "react";
import { useCart } from "../../../hooks/useCart";

const CartItem = ({ id, name, price, originalPrice, image, quantity: initialQuantity = 1 }) => {
  const { removeFromCart, updateCartItem, loading } = useCart();
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, quantity + value);
    setQuantity(newQuantity);
    try {
      updateCartItem(id, newQuantity);
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
      // Rollback the local state if API call fails
      setQuantity(quantity);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
      try {
        updateCartItem(id, value);
      } catch (error) {
        console.error("Error updating cart item quantity:", error);
        setQuantity(quantity);
      }
    }
  };

  const handleRemove = () => {
    try {
      removeFromCart(id);
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  return (
    <article className="flex justify-between items-center p-6 mb-4 border border-gray-300">
      <div className="flex gap-6 items-center">
        <img
          src={image || "/Placeholder2.png"}
          alt={name || "Product"}
          className="w-[120px] h-[120px] object-contain"
        />
        <div>
          <h3 className="mb-2 text-base font-medium">{name || "Product Name"}</h3>
          <button 
            className="text-sm text-stone-500"
            onClick={handleRemove}
            disabled={loading}
          >
            Xoá
          </button>
        </div>
      </div>
      <div className="flex gap-6 items-center">
        <div className="text-2xl font-semibold text-red-600">{price || "0đ"}</div>
        {originalPrice && (
          <div className="text-base line-through text-stone-500">
            {originalPrice}
          </div>
        )}
        <div className="flex items-center rounded border border-gray-300">
          <button
            className="px-3 py-2 text-base"
            onClick={() => handleQuantityChange(-1)}
            disabled={loading || quantity <= 1}
          >
            -
          </button>
          <input
            type="text"
            value={quantity}
            onChange={handleInputChange}
            className="w-10 text-center border-x border-gray-300"
          />
          <button
            className="px-3 py-2 text-base"
            onClick={() => handleQuantityChange(1)}
            disabled={loading}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
};

export default CartItem;