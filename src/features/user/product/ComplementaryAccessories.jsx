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

const ComplementaryAccessories = ({ productId }) => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const fetchAccessories = async () => {
      setLoading(true);
      try {
        const res = await aiService.getComplementaryProducts(productId, 6);
        const list = res?.recommendations || res?.items || res?.data || (Array.isArray(res) ? res : []);
        let filteredList = list.filter((item) => {
          const itemId = item.id || item.product_id || item.productId;
          return String(itemId) !== String(productId);
        }).slice(0, 4);

        if (filteredList.length === 0) {
          const fallbackRes = await aiService.getTrendingProducts(6);
          const fallbackList = fallbackRes?.recommendations || fallbackRes?.items || fallbackRes?.data || (Array.isArray(fallbackRes) ? fallbackRes : []);
          filteredList = fallbackList.filter((item) => String(item.id || item.product_id || item.productId) !== String(productId)).slice(0, 4);
        }

        setAccessories(filteredList);
      } catch (err) {
        console.error("Error fetching complementary accessories:", err);
        try {
          const fallbackRes = await aiService.getTrendingProducts(6);
          const fallbackList = fallbackRes?.recommendations || fallbackRes?.items || fallbackRes?.data || (Array.isArray(fallbackRes) ? fallbackRes : []);
          const filteredList = fallbackList.filter((item) => String(item.id || item.product_id || item.productId) !== String(productId)).slice(0, 4);
          setAccessories(filteredList);
        } catch (fallbackErr) {
          setAccessories([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAccessories();
  }, [productId]);

  if (loading || !accessories || accessories.length === 0) return null;

  return (
    <section className="w-full bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-purple-50/70 p-6 md:p-8 border border-indigo-100/80 my-10 rounded-3xl shadow-[0_10px_35px_rgba(79,70,229,0.06)]">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Phụ Kiện Gợi Ý Mua Kèm
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {accessories.map((item, index) => {
            const id = item.id || item.product_id || item.productId;
            const img = extractImageUrl(item);
            const title = item.productTitle || item.title || item.name || "Phụ kiện";
            const origPrice = Number(item.original_price || item.originalPrice || item.price || 0);
            const discPrice = Number(item.minSalePrice || 0);
            const price = discPrice > 0 ? discPrice : (origPrice > 0 ? origPrice : Number(item.price || 0));
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
    </section>
  );
};


export default ComplementaryAccessories;
