import React, { useEffect, useState } from "react";
import { aiService } from "../../../services/user/ai.service";
import ProductCard from "./ProductCard";

const extractImageUrl = (product) => {
  if (!product) return "/Placeholder2.png";
  if (typeof product.image_url === "string" && product.image_url.trim()) return product.image_url.trim();
  if (typeof product.imageUrl === "string" && product.imageUrl.trim()) return product.imageUrl.trim();
  if (typeof product.image === "string" && product.image.trim()) return product.image.trim();
  
  if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
    const first = product.imageUrls[0];
    if (typeof first === "string") return first;
    if (first && first.downloadUrl) return first.downloadUrl;
    if (first && first.url) return first.url;
  }
  
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images[0];
    if (typeof first === "string") return first;
    if (first && first.downloadUrl) return first.downloadUrl;
    if (first && first.url) return first.url;
  }

  if (Array.isArray(product.image_urls) && product.image_urls.length > 0) {
    const first = product.image_urls[0];
    if (typeof first === "string") return first;
  }
  
  return "/Placeholder2.png";
};

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
        const res = await aiService.getComplementaryProducts(mainProductId, 6);
        const list = res?.recommendations || res?.items || res?.data || (Array.isArray(res) ? res : []);
        const cartProductIds = new Set(
          cartItems.map((ci) => String(ci?.productId || ci?.product?.id || ci?.id))
        );
        const filteredList = list.filter((item) => {
          const itemId = item.id || item.product_id || item.productId;
          return !cartProductIds.has(String(itemId));
        }).slice(0, 4);
        setAccessories(filteredList);
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
          const img = extractImageUrl(item);
          const title = item.productTitle || item.title || item.name || "Phụ kiện";
          const origPrice = Number(item.original_price || item.originalPrice || item.minPrice || item.price || 0);
          const discPrice = Number(item.discounted_price || item.discountedPrice || item.minSalePrice || item.salePrice || item.sale_price || item.discountPrice || 0);
          const price = discPrice > 0 && discPrice < origPrice ? discPrice : (origPrice > 0 ? origPrice : Number(item.price || 0));
          const originalPrice = discPrice > 0 && origPrice > discPrice ? origPrice : null;
          let discount = Number(item.discount_percent || item.discountPercent || 0);
          if (!discount && origPrice > 0 && discPrice > 0 && origPrice > discPrice) {
            discount = Math.round(((origPrice - discPrice) / origPrice) * 100);
          }
          const rating = Number(item.averageRating || item.average_rating || 5);

          return (
            <ProductCard
              key={id || index}
              productId={id}
              image={img}
              title={title}
              price={price}
              originalPrice={originalPrice}
              ratingImage={rating}
              discountPercent={discount}
            />
          );
        })}
      </div>
    </div>
  );
};


export default CartAccessories;
