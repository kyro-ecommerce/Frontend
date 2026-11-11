// Presentation only: never rerank candidates or infer missing catalog facts.
export function normalizeCatalogRating(value) {
  if ((typeof value !== "number" && typeof value !== "string") || value === "") return null;
  const rating = Number(value);
  return Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

const positiveMoney = (value) => typeof value === "number" && Number.isSafeInteger(value) && value > 0;

export function mapSimilarProductCard(item) {
  const variant = item.selected_variant ?? null;
  if (variant) {
    // Do not conceal a broken API contract by mixing or repairing price bases.
    if (!Number.isSafeInteger(variant.variant_id) || variant.variant_id <= 0
      || typeof variant.sku !== "string" || !variant.sku.trim()
      || !positiveMoney(variant.price_vnd) || !positiveMoney(variant.sale_price_vnd)
      || variant.sale_price_vnd > variant.price_vnd
      || item.original_price !== variant.price_vnd
      || item.discounted_price !== variant.sale_price_vnd) return null;
  } else if (item.comparison_basis === "sku_snapshot") {
    return null;
  }
  const original = Number(variant?.price_vnd ?? item.original_price ?? item.originalPrice ?? item.minPrice ?? item.price ?? 0);
  const sale = Number(variant?.sale_price_vnd ?? item.discounted_price ?? item.discountedPrice ?? item.minSalePrice ?? item.salePrice ?? item.sale_price ?? item.discountPrice ?? 0);
  const hasDiscount = sale > 0 && original > sale;
  return {
    productId: item.product_id ?? item.id ?? item.productId,
    image: item.imageUrl || item.image_url || item.image || (Array.isArray(item.images) ? item.images[0] : null),
    title: item.productTitle || item.title || item.name || "Sản phẩm",
    price: sale > 0 ? sale : original,
    originalPrice: hasDiscount ? original : null,
    discountPercent: variant
      ? Math.floor(((original - sale) * 100) / original)
      : Number(item.discount_percent ?? item.discountPercent ?? (hasDiscount ? Math.round(((original - sale) * 100) / original) : 0)),
    ratingImage: normalizeCatalogRating(item.averageRating ?? item.average_rating),
    selectedVariant: variant,
    recommendationReason: typeof item.reason === "string" ? item.reason : null,
  };
}

export function variantCapacityLabel(variant) {
  const capacity = (value) => Number.isSafeInteger(value) && value > 0 ? `${value} GB` : "chưa rõ";
  return `RAM: ${capacity(variant.ram_gb)} · Lưu trữ: ${capacity(variant.storage_gb)}`;
}
