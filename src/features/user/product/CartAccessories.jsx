import React, { useEffect, useState } from "react";
import { aiService } from "../../../services/user/ai.service";
import ProductCard from "./ProductCard";

const CartAccessories = ({ cartItems = [] }) => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setAccessories([]);
      return;
    }

    // Pick main product ID from cart items
    const mainItem = cartItems[0];
    const mainProductId = mainItem?.productId || mainItem?.product?.id || mainItem?.id;

    if (!mainProductId) return;

    const fetchCartAccessories = async () => {
      setLoading(true);
      try {
        const res = await aiService.getComplementaryProducts(mainProductId, 4);
        const list = res?.recommendations || res?.items || res?.data || (Array.isArray(res) ? res : []);
        setAccessories(list);
      } catch (err) {
        console.warn("Could not fetch cart accessories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartAccessories();
  }, [cartItems]);

  if (loading || !accessories || accessories.length === 0) return null;

  return (
    <div className="w-full mt-10 p-6 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-purple-50/90 rounded-2xl border border-indigo-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
          🛒
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Gợi Ý Phụ Kiện Mua Kèm Trước Khi Thanh Toán
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
              AI Smart Addon
            </span>
          </h3>
          <p className="text-xs text-gray-500">
            Bổ sung các phụ kiện đi kèm phù hợp nhất cho các sản phẩm trong giỏ hàng của bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {accessories.map((item, index) => {
          const id = item.id || item.product_id || item.productId;
          const img = item.imageUrl || item.image_url || item.image || "/Placeholder2.png";
          const title = item.productTitle || item.title || item.name || "Phụ kiện";
          const price = Number(item.discountedPrice || item.discounted_price || item.price || 0);
          const origPrice = Number(item.originalPrice || item.original_price || item.price || 0);
          const rating = Number(item.averageRating || item.average_rating || 5);
          const discount = Number(item.discountPercent || item.discount_percent || 0);

          return (
            <div key={id || index} className="relative group">
              {item.reason && (
                <div className="absolute top-2 left-2 z-10 max-w-[90%]">
                  <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-blue-900/90 text-white truncate max-w-full shadow-sm">
                    ✨ {item.reason}
                  </span>
                </div>
              )}
              <ProductCard
                productId={id}
                image={img}
                title={title}
                price={price}
                originalPrice={origPrice > price ? origPrice : null}
                ratingImage={rating}
                discountPercent={discount}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartAccessories;
