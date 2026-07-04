import React, { useState, useEffect } from "react";

const Slider = () => {
  const images = [
    "/Banner1.jpg",
    "/Banner2.jpg", // Replace with your own image
    "/Banner3.jpg", // Replace with your own image
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change slides every 3 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-full max-w-[1300px] overflow-hidden border-5 border-transparent rounded-[70px]">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`Slide ${index + 1}`}
          className={`object-contain w-full transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0 absolute"
          }`}
        />
      ))}
    </div>
  );
};

export default Slider;
