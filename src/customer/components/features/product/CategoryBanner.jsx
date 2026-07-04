import React from "react";

const CategoryBanner = ({
  backgroundImage,
  title,
  className = "",
  paddingTop = "pt-36",
}) => {
  return (
    <div className="flex-1 text-center text-white">
      <div
        className={`flex relative flex-col items-center px-12 ${paddingTop} pb-9 w-full aspect-[0.671] max-md:px-5 max-md:pt-24 ${className}`}
      >
        <img
          src={backgroundImage}
          className="object-cover absolute inset-0 size-full"
          alt={title}
        />
        <div className="relative text-2xl font-bold leading-7 whitespace-pre-line">
          {title}
        </div>
        <div className="relative mt-24 text-sm leading-none underline max-md:mt-10">
          Xem toàn bộ sản phẩm
        </div>
      </div>
    </div>
  );
};

export default CategoryBanner;
