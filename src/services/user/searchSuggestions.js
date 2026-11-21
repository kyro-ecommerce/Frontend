// Header search dropdown: AI hybrid search (keyword + multilingual vectors) first,
// the backend catalog keyword search when AI fails or finds nothing.

const positive = (value) => (typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null);

export function fromAiResults(response) {
  const rows = Array.isArray(response?.results) ? response.results : [];
  return rows
    .filter((row) => row && Number.isSafeInteger(row.product_id) && row.product_id > 0)
    .map((row) => {
      const original = positive(row.original_price);
      const sale = positive(row.discounted_price) ?? original;
      return {
        id: row.product_id,
        title: row.title || "Sản phẩm",
        image: row.image_url || "/Placeholder2.png",
        salePrice: sale,
        originalPrice: original && sale && original > sale ? original : null,
      };
    });
}

export function fromCatalogResults(response) {
  const rows = Array.isArray(response?.data?.content) ? response.data.content : [];
  return rows
    .filter((row) => row && row.id != null)
    .map((row) => ({
      id: row.id,
      title: row.title || "Sản phẩm",
      image: row.imageUrls?.[0]?.downloadUrl || "/Placeholder2.png",
      salePrice: positive(row.minSalePrice),
      originalPrice: row.discountPercent > 0 ? positive(row.price) : null,
    }));
}

/**
 * @returns {Promise<{items: object[], total: number, source: "ai" | "catalog"}>}
 */
export async function loadSuggestions(term, { aiSearch, catalogSearch, limit = 7 }) {
  try {
    const items = fromAiResults(await aiSearch(term, limit)).slice(0, limit);
    if (items.length) return { items, total: items.length, source: "ai" };
  } catch {
    // fall through to the catalog keyword search
  }
  const response = await catalogSearch({ keyword: term, size: limit });
  return {
    items: fromCatalogResults(response),
    total: Number(response?.data?.totalElements) || 0,
    source: "catalog",
  };
}
