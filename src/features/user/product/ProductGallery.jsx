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
    // Container chính của gallery
    <div className="w-105 max-md:w-full flex flex-col"> {/* Thêm flex flex-col */}

      {/* 1. Container cho ảnh chính với tỷ lệ khung hình cố định */}
      <div className="aspect-square w-full overflow-hidden border border-gray-200 rounded-md mb-5"> {/* Thêm class */}
        <img
          src={selectedImage}
          alt={item?.title || "Product Image"}
          // 2. Ảnh lấp đầy container và giữ tỷ lệ (object-contain)
          className="w-full h-full object-contain"
        />
      </div>

      {/* Container cho thumbnails */}
      <div className="flex gap-2.5 overflow-x-auto pb-2"> {/* Thêm pb-2 để tránh thanh cuộn che mất border */}
        {thumbnails.map((thumb, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(thumb.url)}
            // 3. Style cho thumbnail nhất quán hơn
            className={`
              w-20 h-20 shrink-0 overflow-hidden rounded border
              ${selectedImage === thumb.url
                ? 'border-blue-600 ring-1 ring-blue-600'
                : 'border-transparent'
              }
              hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            `}
          >
            <img
              src={thumb.url}
              alt={thumb.alt}
              // Ảnh thumbnail thường dùng object-cover để đẹp hơn
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;