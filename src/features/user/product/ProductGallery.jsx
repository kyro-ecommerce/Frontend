import { useState, useEffect } from "react";
import React from "react";

const ProductGallery = ({ item }) => {
  // State mặc định an toàn hơn khi item chưa load
  const defaultImage = "/Placeholder1.png"; // Hoặc một ảnh placeholder thực tế
  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const [thumbnails, setThumbnails] = useState([{ url: defaultImage, alt: "Placeholder" }]);

  useEffect(() => {
    // Chỉ cập nhật nếu item hợp lệ và có imageUrls
    if (item && Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
      const firstImageUrl = item.imageUrls[0]?.downloadUrl;
      // Đảm bảo ảnh đầu tiên hợp lệ trước khi set
      if (firstImageUrl) {
        setSelectedImage(firstImageUrl);
      } else {
        setSelectedImage(defaultImage); // Fallback nếu ảnh đầu không hợp lệ
      }

      const newThumbnails = item.imageUrls
        .filter(image => image && image.downloadUrl) // Lọc ra những ảnh hợp lệ
        .map((image, index) => ({
          url: image.downloadUrl,
          alt: `${item.title || 'Product'} - Ảnh ${index + 1}`
        }));

      // Nếu không có thumbnail hợp lệ nào, giữ lại placeholder
      setThumbnails(newThumbnails.length > 0 ? newThumbnails : [{ url: defaultImage, alt: "Placeholder" }]);

    } else {
      // Reset về mặc định nếu item không hợp lệ
      setSelectedImage(defaultImage);
      setThumbnails([{ url: defaultImage, alt: "Placeholder" }]);
    }
  }, [item]);

  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center">
      {/* 1. Main Image Container */}
      <div className="w-full aspect-square bg-[#F6F6F6] rounded-3xl p-6 sm:p-10 flex items-center justify-center overflow-hidden mb-4 relative shadow-2xs">
        <img
          src={selectedImage}
          alt={item?.title || "Product Image"}
          className="max-h-full max-w-full object-contain transition-all duration-500 hover:scale-105"
        />
      </div>

      {/* 2. Thumbnails List */}
      {thumbnails.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-2 w-full justify-center">
          {thumbnails.map((thumb, index) => {
            const isSelected = selectedImage === thumb.url;
            return (
              <button
                key={index}
                onClick={() => setSelectedImage(thumb.url)}
                className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-[#F6F6F6] p-1 border-2 transition-all duration-200 cursor-pointer shrink-0 overflow-hidden ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-600/20 scale-105'
                    : 'border-transparent hover:border-gray-300 opacity-80 hover:opacity-100'
                }`}
              >
                <img
                  src={thumb.url}
                  alt={thumb.alt}
                  className="w-full h-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;