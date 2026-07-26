import React from "react";
import { Link } from "react-router-dom";
import { FiMapPin, FiPhone, FiMail, FiFacebook, FiInstagram, FiCreditCard } from "react-icons/fi";

const FooterLinkSection = ({ title, links, pathPrefix = "" }) => {
  return (
    <div>
      <h3 className="mb-4 text-xs sm:text-sm font-bold text-white uppercase tracking-wider border-l-2 border-blue-500 pl-2.5">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link, index) => {
          const linkPath = link.toLowerCase().replace(/\s+/g, "-");
          const fullPath = `${pathPrefix}/${linkPath}`;

          return (
            <li key={index}>
              <Link
                to={fullPath}
                className="text-xs sm:text-sm text-gray-400 hover:text-blue-400 hover:translate-x-1 transition-all duration-200 inline-block"
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

const Footer = () => {
  const componentsLinks = ["CPU", "Ổ cứng", "Card đồ họa", "Vỏ case/ Nguồn", "RAM", "Tai nghe / Loa", "Bàn phím / Chuột"];
  const desktopLinks = ["Custom PC", "MSI All-In-One PC", "HP/Compaq PC", "ASUS PC", "Tecs PC"];
  const phoneLinks = ["iPhone series", "Oppo", "Xiaomi", "Samsung", "Vivo", "Gaming phone"];
  const laptopLinks = ["Acer", "Asus", "Dell", "HP", "MSI", "Lenovo", "Macbook"];
  const accessoryLinks = ["Tai nghe không dây", "Cáp sạc", "Sạc dự phòng", "Ốp lưng", "Kính cường lực"];

  return (
    <footer className="bg-[#0B0F17] text-gray-300 border-t border-gray-800/60 font-sans">
      <div className="max-w-screen-xl mx-auto px-6 py-12 md:py-16">
        {/* Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-12">
          <FooterLinkSection title="Linh kiện" links={componentsLinks} pathPrefix="/computer-parts" />
          <FooterLinkSection title="Máy tính bàn" links={desktopLinks} pathPrefix="/desktop-computers" />
          <FooterLinkSection title="Điện thoại" links={phoneLinks} pathPrefix="/phone" />
          <FooterLinkSection title="Laptop" links={laptopLinks} pathPrefix="/laptop" />
          <FooterLinkSection title="Phụ kiện" links={accessoryLinks} pathPrefix="/accessories" />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800/80 pt-8 mt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 text-center lg:text-left">
            
            {/* Address & Contact */}
            <div className="text-xs sm:text-sm text-gray-400 space-y-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Địa chỉ & Liên hệ</h4>
              <p className="flex items-center justify-center lg:justify-start gap-2">
                <FiMapPin className="text-blue-500 shrink-0" />
                <span>97 Man Thiện, Thủ Đức, TP. Hồ Chí Minh</span>
              </p>
              <p className="flex items-center justify-center lg:justify-start gap-2">
                <FiPhone className="text-blue-500 shrink-0" />
                <span>Phone: <a href="tel:0012345678" className="text-gray-300 hover:text-blue-400 transition-colors">(00) 1234 5678</a></span>
              </p>
              <p className="flex items-center justify-center lg:justify-start gap-2">
                <FiMail className="text-blue-500 shrink-0" />
                <span>E-mail: <a href="mailto:shop@email.com" className="text-gray-300 hover:text-blue-400 transition-colors">shop@email.com</a></span>
              </p>
            </div>

            {/* Social & Payment Links */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kết nối với chúng tôi</span>
              <div className="flex items-center space-x-3">
                <a
                  href="https://www.facebook.com/tran.si.cuong.2025"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-300"
                  title="Facebook"
                >
                  <FiFacebook className="text-base" />
                </a>
                <a
                  href="https://www.facebook.com/tran.si.cuong.2025"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-gray-300 hover:text-white hover:bg-pink-600 hover:border-pink-600 transition-all duration-300"
                  title="Instagram"
                >
                  <FiInstagram className="text-base" />
                </a>
                <a
                  href="https://vnpay.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-gray-800/80 border border-gray-700/60 flex items-center justify-center text-gray-300 hover:text-white hover:bg-blue-500 hover:border-blue-500 transition-all duration-300"
                  title="VNPay"
                >
                  <FiCreditCard className="text-base" />
                </a>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-xs text-gray-500">
              <p>Copyright © 2026 Kyro Store Pty. Ltd.</p>
              <p className="mt-1">Tất cả các quyền được bảo lưu.</p>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;