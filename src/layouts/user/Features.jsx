import React from "react";

const Features = () => {
  return (
    <div className="flex flex-col justify-center items-center px-16 py-14 w-full bg-white max-md:px-5 max-md:max-w-full">
      <div className="max-w-full w-263.5">
        <div className="flex gap-5 max-md:flex-col">
          <div className="w-1/3 max-md:ml-0 max-md:w-full">
            <div className="flex flex-col grow items-center text-center text-black max-md:mt-10">
              <img
                src="/Features1.svg"
                className="object-contain aspect-square w-16.25"
                alt="Product Support"
              />
              <div className="flex flex-col items-center mt-6 max-w-full w-66.25">
                <div className="text-lg font-bold leading-none">
                  Product Support
                </div>
                <div className="mt-3.5 text-sm leading-5">
                  Up to 3 years on-site warranty available for your peace of
                  mind.
                </div>
              </div>
            </div>
          </div>
          <div className="ml-5 w-1/3 max-md:ml-0 max-md:w-full">
            <div className="flex flex-col grow items-center text-center text-black max-md:mt-10">
              <img
                src="/Features2.svg"
                className="object-contain aspect-square w-16.25"
                alt="Personal Account"
              />
              <div className="flex flex-col items-center mt-6 max-w-full w-66.25">
                <div className="text-lg font-bold leading-none">
                  Personal Account
                </div>
                <div className="mt-3.5 text-sm leading-5">
                  With big discounts, free delivery and a dedicated support
                  specialist.
                </div>
              </div>
            </div>
          </div>
          <div className="ml-5 w-1/3 max-md:ml-0 max-md:w-full">
            <div className="flex flex-col grow items-center text-center text-black max-md:mt-10">
              <img
                src="/Features3.svg"
                className="object-contain aspect-square w-16.25"
                alt="Amazing Savings"
              />
              <div className="flex flex-col items-center mt-6 max-w-full w-66.25">
                <div className="text-lg font-bold leading-none">
                  Amazing Savings
                </div>
                <div className="mt-3.5 text-sm leading-5">
                  Up to 70% off new Products, you can be sure of the best price.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
