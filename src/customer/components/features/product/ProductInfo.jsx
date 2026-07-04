import React, { useState } from "react"; // Bỏ useEffect nếu không dùng
import { Rating, CircularProgress } from '@mui/material'; // Thêm CircularProgress
import { Radio, RadioGroup } from '@headlessui/react';
import { useCartContext } from "../../../contexts/CartContext";
import { useToast } from "../../../contexts/ToastContext.jsx";

const ProductInfo = ({ item }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const { addItemToCart, isLoading: isCartLoadingGlobal } = useCartContext();
  const { showToast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showFullSpecs, setShowFullSpecs] = useState(false);


  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount || 0);

  const handleClickToCart = async () => {
    if (!item || !item.id) {
        showToast("Thông tin sản phẩm không hợp lệ.", "error");
        return;
    }
    if (!selectedSize) {
      showToast("Vui lòng chọn cấu hình.", "warning");
      return;
    }
    setIsAddingToCart(true);
    try {
      const cartData = {
        productId: item.id,
        size: selectedSize.name,
        quantity: 1
      };
      await addItemToCart(cartData);
      showToast(`${item.title || 'Sản phẩm'} đã được thêm vào giỏ hàng!`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Không thể thêm vào giỏ hàng.", "error");
    } finally {
      setIsAddingToCart(false);
    }
  };

  function classNames(...classes) { return classes.filter(Boolean).join(' ') }

  const basicInfo = [
    { label: "Thương hiệu", value: item?.brand?.name || item?.brand || "Chưa rõ" },
    { label: "Màu sắc", value: item?.color || "Chưa rõ" },
    // Thêm các trường khác từ item nếu có
  ];

  const extendedInfo = [
    { label: "Mô tả sản phẩm", value: item?.description || "Không có mô tả." },
    { label: "Dung lượng pin", value: item?.batteryCapacity || "N/A" },
    { label: "Loại pin", value: item?.batteryType || "N/A" }, // Sửa batteryTtype
    { label: "Cổng kết nối", value: item?.connectionPort || "N/A" },
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
    <div className="flex flex-col flex-1">
      <h1 className="mb-3 text-2xl lg:text-3xl font-semibold text-gray-800">{item.title || "Tên sản phẩm"}</h1>
      <div className="flex gap-2 items-center text-sm text-gray-600 mb-3">
        <Rating value={item?.averageRating || 0} name='product-rating' readOnly precision={0.5} size="small"/>
        <span>({item?.numRatings || 0} đánh giá)</span>
        <span className="mx-1">|</span>
        <span>Đã bán ({item?.quantitySold || 0})</span>
      </div>
      <div className="mb-4">
        <span className="text-3xl lg:text-4xl font-bold text-red-600">{formatCurrency(item?.discountedPrice)}</span>
        {item?.price > item?.discountedPrice && (
          <>
            <span className="ml-3 text-lg lg:text-xl line-through text-gray-500">{formatCurrency(item?.price)}</span>
            <span className="ml-2 text-sm bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded">
              -{item?.discountPercent || 0}%
            </span>
          </>
        )}
      </div>

      {item?.sizes && item.sizes.length > 0 && (
        <fieldset aria-label="Choose a configuration" className="mt-4 mb-5">
          <legend className="text-md font-medium text-gray-900 mb-2">Chọn cấu hình:</legend>
          <RadioGroup
            value={selectedSize}
            onChange={setSelectedSize}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {item.sizes.map((size) => (
              <Radio
                key={size.name}
                value={size}
                disabled={size.quantity <= 0}
                className={({ checked, disabled }) =>
                  classNames(
                    disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                             : 'bg-white text-gray-900 hover:bg-gray-50 cursor-pointer',
                    checked ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-300',
                    'group relative flex items-center justify-center rounded-md border px-3 py-2.5 text-sm font-medium focus:outline-none transition-all'
                  )
                }
              >
                <span>{size.name}</span>
                {size.quantity <= 0 && (
                    <span className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200">
                        <svg stroke="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full stroke-2 text-gray-200">
                        <line x1={0} x2={100} y1={100} y2={0} vectorEffect="non-scaling-stroke" />
                        </svg>
                    </span>
                )}
              </Radio>
            ))}
          </RadioGroup>
        </fieldset>
      )}

      {selectedSize && (
        <div className="mt-1 mb-3 text-sm text-green-600">
          Đã chọn: <strong>{selectedSize.name}</strong> (Còn lại: {selectedSize.quantity})
        </div>
      )}
      {!selectedSize && item?.sizes && item.sizes.length > 0 && (
         <div className="mt-1 mb-3 text-sm text-red-500">Vui lòng chọn một cấu hình.</div>
      )}


      <button
        onClick={handleClickToCart}
        disabled={(!selectedSize && item?.sizes?.length > 0) || isAddingToCart || isCartLoadingGlobal}
        className={`w-full px-8 py-3 text-base font-semibold text-white rounded-md transition-colors duration-150 ease-in-out
                    ${(!selectedSize && item?.sizes?.length > 0) || isAddingToCart || isCartLoadingGlobal
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
                    }`}
      >
        {isAddingToCart || isCartLoadingGlobal ? <CircularProgress size={24} color="inherit" /> : "Thêm vào giỏ hàng"}
      </button>

      <section className="my-6 py-4 border-t border-b border-gray-200">
        <ul className="space-y-1 text-sm text-gray-600">
            <li><span className="font-medium text-green-600">✓</span> Bảo hành {item?.warrantyPeriod || "12"} tháng</li>
            <li><span className="font-medium text-green-600">✓</span> Đổi trả dễ dàng trong 7 ngày</li>
            <li><span className="font-medium text-green-600">✓</span> Miễn phí giao hàng toàn quốc</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">Thông tin chi tiết</h2>
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <table className="w-full">
            <tbody>
              {basicInfo.map((info, index) => (
                info.value && info.value !== "N/A" && (
                  <tr key={`basic-${index}`} className="border-b border-gray-200 last:border-b-0">
                    <td className="py-2.5 pr-3 font-medium text-gray-600 w-1/3">{info.label}</td>
                    <td className="py-2.5 text-gray-800">{info.value}</td>
                  </tr>
                )
              ))}
              {!showFullSpecs && (
                <tr>
                  <td colSpan="2" className="pt-3 text-center">
                    <button onClick={() => setShowFullSpecs(true)} className="text-blue-600 hover:underline font-medium">
                      Xem thêm cấu hình chi tiết ▼
                    </button>
                  </td>
                </tr>
              )}
              {showFullSpecs && extendedInfo.map((info, index) => (
                 info.value && info.value !== "N/A" && (
                  <tr key={`extended-${index}`} className="border-b border-gray-200 last:border-b-0">
                    <td className="py-2.5 pr-3 font-medium text-gray-600 w-1/3">{info.label}</td>
                    <td className="py-2.5 text-gray-800">{info.value}</td>
                  </tr>
                )
              ))}
               {showFullSpecs && item?.detailedReview && (
                <tr>
                    <td colSpan="2" className="pt-4">
                        <h3 className="text-lg font-semibold mb-1 text-gray-800">Đánh giá chi tiết</h3>
                        <p className="text-gray-700 whitespace-pre-line">{item.detailedReview}</p>
                    </td>
                </tr>
              )}
              {showFullSpecs && item?.powerfulPerformance && (
                <tr>
                    <td colSpan="2" className="pt-4">
                        <h3 className="text-lg font-semibold mb-1 text-gray-800">Hiệu năng</h3>
                        <p className="text-gray-700 whitespace-pre-line">{item.powerfulPerformance}</p>
                    </td>
                </tr>
              )}
              {showFullSpecs && (
                <tr>
                  <td colSpan="2" className="pt-4 text-center">
                    <button onClick={() => setShowFullSpecs(false)} className="text-blue-600 hover:underline font-medium">
                      Thu gọn ▲
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
export default ProductInfo;