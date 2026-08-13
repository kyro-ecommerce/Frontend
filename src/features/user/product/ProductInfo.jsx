import React, { useState } from "react"; // Bỏ useEffect nếu không dùng
import { Rating, CircularProgress } from '@mui/material'; // Thêm CircularProgress
import { Radio, RadioGroup } from '@headlessui/react';
import { useCartContext } from "../../../store/user/CartContext";
import { useToast } from "../../../store/user/ToastContext.jsx";

const ProductInfo = ({ item }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const { addItemToCart, isLoading: isCartLoadingGlobal } = useCartContext();
  const { showToast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showFullSpecs, setShowFullSpecs] = useState(false);


  const [quantity, setQuantity] = useState(1);

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount || 0);

  const handleClickToCart = async (isBuyNow = false) => {
    if (!item || !item.id) {
        showToast("Thông tin sản phẩm không hợp lệ.", "error");
        return;
    }
    if (item?.sizes?.length > 0 && !selectedSize) {
      showToast("Vui lòng chọn cấu hình sản phẩm.", "warning");
      return;
    }
    setIsAddingToCart(true);
    try {
      const cartData = {
        productId: item.id,
        size: selectedSize ? selectedSize.name : "Default",
        quantity: quantity
      };
      await addItemToCart(cartData);
      showToast(`${item.title || 'Sản phẩm'} đã được thêm vào giỏ hàng!`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Không thể thêm vào giỏ hàng.", "error");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const brandName = item?.brand?.name || item?.brand || "Kyro Store";

  const basicInfo = [
    { label: "Thương hiệu", value: item?.brand?.name || item?.brand || "Chưa rõ" },
    { label: "Màu sắc", value: item?.color || "Chưa rõ" },
  ];

  const extendedInfo = [
    { label: "Dung lượng pin", value: item?.batteryCapacity || "N/A" },
    { label: "Loại pin", value: item?.batteryType || "N/A" },
    { label: "Cổng kết nối", value: item?.connectionPort || "N/A font-medium" },
    { label: "Kích thước", value: item?.dimension || "N/A" },
    { label: "Dung lượng RAM", value: item?.ramCapacity || "N/A" },
    { label: "Bộ nhớ trong", value: item?.romCapacity || "N/A" },
    { label: "Kích thước màn hình", value: item?.screenSize || "N/A" },
    { label: "Trọng lượng", value: item?.weight || "N/A" },
  ];

  if (!item) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center p-10">
        <CircularProgress />
        <Typography sx={{mt: 2}}>Đang tải thông tin sản phẩm...</Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full lg:w-1/2 text-left">
      {/* 1. Brand Tag */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded bg-black text-white font-extrabold text-[11px] flex items-center justify-center uppercase shadow-xs">
          {brandName[0]}
        </div>
        <span className="text-xs font-extrabold text-gray-900 uppercase tracking-tight">
          {brandName}
        </span>
      </div>

      {/* 2. Title */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug mb-2">
        {item.title || "Tên sản phẩm"}
      </h1>

      {/* 3. Rating */}
      <div className="flex items-center gap-2 text-sm text-gray-900 font-semibold mb-3">
        <Rating value={item?.averageRating || 5} readOnly precision={0.5} size="small" sx={{ color: '#000' }} />
        <span className="text-xs font-semibold text-gray-600">({item?.numRatings || 146})</span>
      </div>

      {/* 4. Price */}
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          {formatCurrency(item?.discountedPrice || item?.price)}
        </span>
        {item?.price > item?.discountedPrice && (
          <>
            <span className="text-base line-through text-gray-400 font-medium">
              {formatCurrency(item?.price)}
            </span>
            <span className="text-xs bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full">
              -{item?.discountPercent || 0}%
            </span>
          </>
        )}
      </div>

      {/* 6. Configuration Selector (If sizes/configs available) */}
      {item?.sizes && item.sizes.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-gray-900">Cấu hình</span>
            {selectedSize && (
              <span className="text-xs text-green-600 font-medium">Còn {selectedSize.quantity} sản phẩm</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {item.sizes.map((size) => (
              <button
                key={size.name}
                disabled={size.quantity <= 0}
                onClick={() => setSelectedSize(size)}
                className={`px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                  selectedSize?.name === size.name
                    ? 'border-indigo-600 bg-indigo-50/40 text-indigo-900 ring-2 ring-indigo-600/20'
                    : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                } ${size.quantity <= 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
              >
                <span>{size.name}</span>
                <span className="text-xs opacity-60">↕</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. Quantity Selector */}
      <div className="flex items-center justify-between mb-6 pt-2">
        <span className="text-sm font-bold text-gray-900">Số lượng</span>
        <div className="flex items-center bg-gray-100 rounded-xl px-3 py-1.5 gap-4 font-bold text-gray-900 text-sm">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded-md cursor-pointer transition-colors disabled:opacity-40"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span>{quantity}</span>
          <button
            onClick={() => {
              const maxStock = selectedSize?.quantity ?? item?.quantityInStock ?? item?.stock ?? item?.quantityAvailable ?? null;
              if (maxStock !== null && quantity >= maxStock) {
                showToast(`Đã đạt số lượng tồn kho tối đa (${maxStock})`, "warning");
                return;
              }
              setQuantity(quantity + 1);
            }}
            disabled={(selectedSize?.quantity ?? item?.quantityInStock ?? item?.stock ?? item?.quantityAvailable ?? null) !== null && quantity >= (selectedSize?.quantity ?? item?.quantityInStock ?? item?.stock ?? item?.quantityAvailable)}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 rounded-md cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={(selectedSize?.quantity ?? item?.quantityInStock ?? item?.stock ?? item?.quantityAvailable ?? null) !== null && quantity >= (selectedSize?.quantity ?? item?.quantityInStock ?? item?.stock ?? item?.quantityAvailable) ? "Đã đạt số lượng tồn kho tối đa" : ""}
          >
            +
          </button>
        </div>
      </div>

      {/* 8. Primary Action Button */}
      <div className="mb-3">
        <button
          onClick={() => handleClickToCart(false)}
          disabled={isAddingToCart || isCartLoadingGlobal}
          className="w-full bg-[#5835FF] hover:bg-[#4624E0] text-white font-bold text-base py-3.5 px-6 rounded-2xl shadow-lg shadow-indigo-200 transition-all duration-200 cursor-pointer active:scale-[0.99] flex items-center justify-center"
        >
          {isAddingToCart || isCartLoadingGlobal ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            "Thêm vào giỏ hàng"
          )}
        </button>
      </div>



      {/* 9. Description Paragraph */}
      <div className="mb-6 pt-4 border-t border-gray-100">
        <h3 className="text-base font-bold text-gray-900 mb-2">Mô tả sản phẩm</h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-4">
          {item?.description || "Sản phẩm chính hãng với hiệu năng vượt trội, kiểu dáng hiện đại và chế độ bảo hành chu đáo. Lựa chọn hoàn hảo cho nhu cầu công việc và giải trí của bạn."}
        </p>
      </div>

      {/* 10. Specs Pill Button */}
      <div className="flex flex-col gap-2.5 mb-6">
        <button
          onClick={() => setShowFullSpecs(!showFullSpecs)}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold text-sm py-3 px-4 rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Xem thông tin cấu hình chi tiết</span>
        </button>
      </div>

      {/* 11. Detailed Specs Modal / Accordion */}
      {showFullSpecs && (
        <div className="bg-gray-50 rounded-2xl p-4 text-sm mb-6 border border-gray-100">
          <h4 className="font-bold text-gray-900 mb-3">Thông số kỹ thuật đầy đủ</h4>
          <table className="w-full text-left">
            <tbody>
              {basicInfo.map((info, idx) => (
                info.value && info.value !== "N/A" && (
                  <tr key={idx} className="border-b border-gray-200/60 last:border-0">
                    <td className="py-2 pr-3 font-semibold text-gray-500 w-1/3">{info.label}</td>
                    <td className="py-2 text-gray-900 font-medium">{info.value}</td>
                  </tr>
                )
              ))}
              {extendedInfo.map((info, idx) => (
                info.value && info.value !== "N/A" && (
                  <tr key={`ext-${idx}`} className="border-b border-gray-200/60 last:border-0">
                    <td className="py-2 pr-3 font-semibold text-gray-500 w-1/3">{info.label}</td>
                    <td className="py-2 text-gray-900 font-medium">{info.value}</td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default ProductInfo;