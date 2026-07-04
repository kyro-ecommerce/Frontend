import React from "react";
const CartProgress = () => {
  return (
    <div className="flex justify-between mb-10 w-full">
      <div className="flex items-center">
        <div className="w-8 h-8 font-semibold text-white bg-blue-600 rounded-full flex items-center justify-center">
          1
        </div>
        <div className="ml-2 text-sm font-medium">Giỏ hàng</div>
      </div>
      <div className="flex items-center">
        <div className="w-8 h-8 font-semibold text-white bg-gray-300 rounded-full flex items-center justify-center">
          2
        </div>
        <div className="ml-2 text-sm font-medium">Thông tin đặt hàng</div>
      </div>
      <div className="flex items-center">
        <div className="w-8 h-8 font-semibold text-white bg-gray-300 rounded-full flex items-center justify-center">
          3
        </div>
        <div className="ml-2 text-sm font-medium">Thanh toán</div>
      </div>
      <div className="flex items-center">
        <div className="w-8 h-8 font-semibold text-white bg-gray-300 rounded-full flex items-center justify-center">
          4
        </div>
        <div className="ml-2 text-sm font-medium">Hoàn tất</div>
      </div>
    </div>
  );
};

export default CartProgress;
