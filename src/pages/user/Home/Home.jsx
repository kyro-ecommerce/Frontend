// src/pages/Home/Home.jsx
import { useState, useEffect } from "react";
import TopSale from "../../../features/user/product/TopSale";
import Slider from "../../../features/user/product/Slider";
import FlashSale from "../../../features/user/product/FlashSale";
import LatestTop from "../../../features/user/product/LatestTop";
import RecommendedForYou from "../../../features/user/product/RecommendedForYou";

const Home = () => {
  return (
    <div className="flex overflow-hidden flex-col bg-white w-full">
      {/* Full Viewport 3D Hero Slider */}
      <Slider />

      {/* Main Content Sections */}
      <div className="flex flex-col items-center mx-auto mt-8 w-full max-w-screen-xl px-4">
        <RecommendedForYou />
        <FlashSale />
        <TopSale />
        <LatestTop />
      </div>
    </div>
  );
};


export default Home;