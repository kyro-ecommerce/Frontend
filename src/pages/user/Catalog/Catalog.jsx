import React from "react";
import BreadcrumbNav from "../../../layouts/user/BreadcrumbNav";
import ProductControls from "../../../features/user/catalog/ProductControls";
import FilterSidebar from "../../../features/user/catalog/FilterSidebar";
import Filter from "../../../features/user/catalog/Filter";
import ProductCard from "../../../features/user/product/ProductCard";
import ProductSkeleton from "../../../features/user/product/ProductSkeleton";
import Pagination from "../../../components/user/common/Pagination";
import ZeroResultsRecommendations from "../../../features/user/catalog/ZeroResultsRecommendations";
import { useCatalogPage, extractImageUrl, formatPrice } from "../../../hooks/user/useCatalogPage";

const Catalog = ({ category: categoryProp }) => {
  const {
    currentPage,
    itemsPerPage,
    allFilteredProducts,
    currentProducts,
    totalPages,
    totalItems,
    loading,
    setLoading,
    statusMessage,
    messageType,
    categoryTree,
    pageTitle,
    handlePageChange
  } = useCatalogPage(categoryProp);

  const skeletonItems = Array(itemsPerPage).fill(0).map((_, index) => (
    <ProductSkeleton key={`skeleton-${index}`} />
  ));

  return (
    <div className="flex overflow-hidden flex-col pt-3 bg-gray-50 min-h-screen">
      <div className="flex flex-col self-center mt-4 w-full max-w-screen-xl px-4">
        <h1 className="self-start mt-4 mb-4 text-2xl md:text-3xl font-semibold text-gray-800">
          {pageTitle} ({loading ? "..." : totalItems})
        </h1>

        {/* Loading/Error/No Results Messages */}
        {!loading && messageType === 'error' && (
          <div className="text-center p-4 text-red-600 bg-red-100 rounded border border-red-300">{statusMessage}</div>
        )}

        <div className="flex flex-col md:flex-row gap-6 lg:gap-8 mt-4">
          {/* Sidebar */}
          <FilterSidebar topCategory={categoryProp} categoryTree={categoryTree} onFilterChange={() => setLoading(true)} />

          {/* Main Content Area */}
          <section className="w-full">
            <div className="flex flex-col w-full">
              {/* Product Controls (Sort, View) */}
              <ProductControls 
                shown={loading ? 0 : currentProducts.length} 
                total={loading ? 0 : totalItems} 
                onSortChange={() => setLoading(true)} 
              />
              
              {/* Product Grid */}
              {!loading && !allFilteredProducts.length && messageType !== 'error' && (
                <ZeroResultsRecommendations />
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mt-4">
                {loading ? (
                  skeletonItems
                ) : (
                  currentProducts.map((product, index) => {
                    const pid = product.id || product.product_id;
                    const price = Number(product.minSalePrice || 0);
                    const origPrice = Number(product.originalPrice || product.original_price || product.price || 0);
                    const imageUrl = extractImageUrl(product);
                    const rating = Number(product.averageRating || product.average_rating || 5);
                    const numRatings = Number(product.numRatings || product.num_ratings || 0);
                    const discount = Number(product.discountPercent || product.discount_percent || 0);

                    return (
                      <ProductCard
                        key={pid || index}
                        productId={pid}
                        image={imageUrl}
                        stockStatus={product.totalStock > 0 ? "in stock" : "out of stock"}
                        title={product.title}
                        price={formatPrice(price)}
                        originalPrice={origPrice > price ? formatPrice(origPrice) : null}
                        reviewCount={numRatings}
                        ratingImage={rating}
                        discountPercent={discount}
                      />
                    );
                  })
                )}
              </div>
              
              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(newPage) => handlePageChange(newPage, false)}
                  />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Catalog;
