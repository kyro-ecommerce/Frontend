import { useState } from "react";
import React from "react";

export default function SeriesComponent() {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleClick = (index) => {
    setActiveIndex(index);
  };

  const productType = ["MSI GS Series", "MSI GT Series", "MSI GL Series", "MSI GE Series"]

  return (
    <div className="flex flex-wrap gap-6 ml-5 self-start mt-9 text-base font-semibold leading-snug text-center text-zinc-500">
      {productType.map(
        (series, index) => (
          <div
            key={index}
            className={`basis-auto cursor-pointer transition-all duration-300 ${
              activeIndex === index
                ? "text-blue-600"
                : "text-zinc-500"
            }`}
            onClick={() => handleClick(index)}
          >
            {series}
          </div>
        )
      )}
    </div>
  );
}
