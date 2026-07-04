"use client";
import React from "react";
import { Link } from "react-router-dom";

// Component con cho mỗi cột link, đã được tùy chỉnh class
const FooterLinkSection = ({ title, links, pathPrefix = "" }) => {
  return (
    // Bỏ các class min-w, mr, mb cũ, để grid ở cha quản lý
    <div>
      <h2 className="mb-4 text-2xl font-semibold text-gray-200 uppercase tracking-wider">
        {title}
      </h2>
      <ul className="space-y-2">
        {links.map((link, index) => {
          const linkPath = link.toLowerCase().replace(/\s+/g, "-");
          const fullPath = `${pathPrefix}/${linkPath}`;

          return (
            <li key={index}>
              <Link
                to={fullPath}
                className="text-xl text-gray-400 hover:text-white transition-colors duration-200"
              >
                {link}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// Component con cho phần địa chỉ, đã được tùy chỉnh class
const FooterAddressSection = () => {
  return (
    // Bỏ các class min-w, mr, mb cũ
    <div className="not-italic">
      <h2 className="mb-3 text-[20px] font-semibold text-gray-400 uppercase tracking-wider">
        Địa chỉ
      </h2>
      <div className="text-[15px] text-gray-400 space-y-1">
        <p>97 Man Thiện, Thủ Đức, TP. Hồ Chí Minh</p>
        <p>
          <span>Phone: </span>
          <a href="tel:0012345678" className="hover:text-sky-400 transition-colors">
            (00) 1234 5678
          </a>
        </p>
        <p>
          <span>E-mail: </span>
          <a href="mailto:shop@email.com" className="hover:text-sky-400 transition-colors">
            shop@email.com
          </a>
        </p>
      </div>
    </div>
  );
};

// Component con cho Copyright, đã được tùy chỉnh class
const FooterCopyright = () => {
  return (
    // Bỏ absolute positioning, để flexbox ở cha quản lý
    <div className="text-[17px] text-gray-500">
      Copyright © 2025 Shop Pty. Ltd.
    </div>
  );
};

const Footer = () => {
  const componentsLinks = ["CPU", "Ổ cứng", "Card đồ họa", "Vỏ case/ Nguồn", "RAM", "Tai nghe / Loa", "Bàn phím / Chuột"];
  const desktopLinks = ["Custom PC", "MSI All-In-One PC", "HP/Compaq PC", "AUS PC", "Tecs PC"];
  const phoneLinks = ["iPhone series", "Oppo", "Xiaomi", "Samsung", "Vivo", "Gaming phone"];
  const laptopLinks = ["Acer", "Asus", "Dell", "HP", "MSI", "Lenovo", "Macbook"];
  const accessoryLinks = ["Tai nghe không dây", "Cáp sạc", "Sạc dự phòng", "Ốp lưng", "Kính cường lực"];

  return (
    <footer className="bg-black text-gray-300">
      <div className="container mx-auto px-6 py-12 md:py-16">
        {/* Phần các cột link */}
        <div className="grid grid-cols- sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-20 gap-y-10 mb-10">
          <FooterLinkSection title="Linh kiện" links={componentsLinks} pathPrefix="/components" />
          <FooterLinkSection title="Máy tính bàn" links={desktopLinks} pathPrefix="/desktop" />
          <FooterLinkSection title="Điện thoại" links={phoneLinks} pathPrefix="/phone" />
          <FooterLinkSection title="Laptop" links={laptopLinks} pathPrefix="/laptop" />
          <FooterLinkSection title="Phụ kiện" links={accessoryLinks} pathPrefix="/accessories" />
        </div>

        {/* Đường kẻ ngang */}
        <hr className="my-8 border-gray-700" />

        {/* Phần địa chỉ, social và copyright */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center text-center md:text-left">
          <div className="mb-6 md:mb-0">
            <FooterAddressSection />
          </div>

          <div className="flex justify-center md:justify-start items-center space-x-5 mb-6 md:mb-0">
            <a href="https://www.facebook.com/EdenHoangKim/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <img src="/FacebookIcon.svg" className="w-5 h-5" alt="Facebook" />
            </a>
            <a href="https://www.instagram.com/edenhoangkim/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <img src="/InstagramIcon.svg" className="w-5 h-5" alt="Instagram" />
            </a>
            <a href="https://vnpay.vn" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              {/* Đảm bảo bạn có ảnh VNPayIcon.jpg trong thư mục public */}
              <img src="/VNPayIcon.jpg" className="w-5 h-5 object-contain rounded-sm" alt="VNPay" />
            </a>
          </div>

          <div>
            <FooterCopyright />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;