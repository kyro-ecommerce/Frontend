import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const TECH_SLIDES = [
  {
    category: "LAPTOP CAO CẤP & GAMING",
    title: "LAPTOP PRO & GAMING 2026",
    description: "Sở hữu ngay các dòng Laptop mỏng nhẹ cao cấp và Laptop Gaming hiệu năng vượt trội với ưu đãi lên đến 35%. Hỗ trợ trả góp 0%.",
    bg: '#1E293B',
    ghostText: "LAPTOP",
    tag: "BẢO HÀNH 24 THÁNG",
    link: "/laptop",
    src: '/laptop.png'
  },
  {
    category: "SMARTPHONE FLAGSHIP",
    title: "ĐIỆN THOẠI THÔNG MINH",
    description: "Trải nghiệm các dòng Smartphone Flagship mới nhất với camera 200MP, màn hình 120Hz mượt mà và sạc siêu nhanh.",
    bg: '#0F766E',
    ghostText: "PHONE",
    tag: "GIẢM SỐC TỚI 40%",
    link: "/phone",
    src: '/phone.png'
  },
  {
    category: "LINH KIỆN MÁY TÍNH",
    title: "LINH KIỆN & CẤU HÌNH PC",
    description: "Bứt phá sức mạnh dàn PC của bạn với Card đồ họa RTX 40 Series, CPU thế hệ mới, RAM DDR5 và SSD NVMe chính hãng.",
    bg: '#831843',
    ghostText: "HARDWARE",
    tag: "CHÍNH HÃNG 100%",
    link: "/computer-parts",
    src: '/hardware.png'
  },
  {
    category: "PHỤ KIỆN CAO CẤP",
    title: "PHỤ KIỆN & GEAR GAMING",
    description: "Nâng tầm không gian làm việc với bàn phím cơ, tai nghe chống ồn, chuột không dây và các thiết bị ngoại vi hiện đại.",
    bg: '#1D4ED8',
    ghostText: "GEAR",
    tag: "MIỄN PHÍ GIAO HÀNG",
    link: "/accessories",
    src: '/device.png'
  }
];

const Slider = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Preload images on mount
  useEffect(() => {
    TECH_SLIDES.forEach((item) => {
      const img = new Image();
      img.src = item.src;
    });

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigate = useCallback((direction) => {
    if (isAnimating) return;
    setIsAnimating(true);

    if (direction === 'next') {
      setActiveIndex((prev) => (prev + 1) % 4);
    } else {
      setActiveIndex((prev) => (prev + 3) % 4);
    }

    setTimeout(() => {
      setIsAnimating(false);
    }, 650);
  }, [isAnimating]);

  // Autoplay tự động chuyển slide sau mỗi 4.5 giây (Tự động dừng khi rê chuột vào)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      navigate('next');
    }, 2000); 

    return () => clearInterval(timer);
  }, [navigate, isPaused]);

  const getItemRole = (index) => {
    if (index === activeIndex) return 'center';
    if (index === (activeIndex + 3) % 4) return 'left';
    if (index === (activeIndex + 1) % 4) return 'right';
    return 'back';
  };

  const getRoleStyle = (role, mobile) => {
    switch (role) {
      case 'center':
        return {
          transform: `translateX(-50%) scale(${mobile ? 1.1 : 1.35})`,
          filter: 'blur(0px)',
          opacity: 1,
          zIndex: 20,
          left: '50%',
          height: mobile ? '45%' : '75%',
          bottom: mobile ? '32%' : '20%',
        };
      case 'left':
        return {
          transform: 'translateX(-50%) scale(0.85)',
          filter: 'blur(2px)',
          opacity: 0.85,
          zIndex: 10,
          left: mobile ? '20%' : '30%',
          height: mobile ? '14%' : '24%',
          bottom: mobile ? '40%' : '26%',
        };
      case 'right':
        return {
          transform: 'translateX(-50%) scale(0.85)',
          filter: 'blur(2px)',
          opacity: 0.85,
          zIndex: 10,
          left: mobile ? '80%' : '70%',
          height: mobile ? '14%' : '24%',
          bottom: mobile ? '40%' : '26%',
        };
      case 'back':
        return {
          transform: 'translateX(-50%) scale(0.85)',
          filter: 'blur(4px)',
          opacity: 1,
          zIndex: 5,
          left: '50%',
          height: mobile ? '11%' : '18%',
          bottom: mobile ? '40%' : '26%',
        };
      default:
        return {};
    }
  };

  const currentSlide = TECH_SLIDES[activeIndex];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-screen overflow-hidden select-none"
      style={{
        backgroundColor: currentSlide.bg,
        transition: 'background-color 650ms cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* 1. Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-50 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='noise'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23noise)' opacity='0.08'/></svg>")`,
            backgroundSize: '200px 200px',
          }}
        />

        {/* 2. Giant ghost text dynamically updated per slide */}
        <div
          className="absolute inset-x-0 flex items-center justify-center pointer-events-none select-none z-[2] uppercase text-white/90 font-black whitespace-nowrap transition-all duration-650"
          style={{
            fontFamily: "'Anton', sans-serif",
            fontSize: 'clamp(80px, 22vw, 320px)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            top: '22%',
          }}
        >
          {currentSlide.ghostText}
        </div>

        {/* 3. Top-left brand label */}
        <div className="absolute top-28 left-6 sm:top-32 sm:left-12 z-[60] flex items-center gap-2">
          <span className="text-xs font-bold uppercase text-white opacity-90 tracking-[0.18em] bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            THẾ GIỚI CÔNG NGHỆ TECHSHOP
          </span>
        </div>

        {/* 4. Carousel 3D Figurines */}
        <div className="absolute inset-0 z-[3]">
          {TECH_SLIDES.map((item, index) => {
            const role = getItemRole(index);
            const style = getRoleStyle(role, isMobile);
            return (
              <div
                key={index}
                className="absolute transition-all duration-[650ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[transform,filter,opacity]"
                style={{
                  aspectRatio: '0.6 / 1',
                  ...style,
                }}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-contain object-bottom select-none pointer-events-none"
                  draggable={false}
                />
              </div>
            );
          })}
        </div>

        {/* 5. Bottom-left text + nav buttons */}
        <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-12 z-[60] max-w-sm sm:max-w-md text-left">
          <span className="inline-block text-[11px] font-bold uppercase text-blue-300 bg-blue-900/60 border border-blue-400/30 px-3 py-0.5 rounded-full mb-2 backdrop-blur-sm">
            {currentSlide.tag}
          </span>
          <h2 className="mb-2 text-xl sm:text-2xl md:text-3xl font-extrabold uppercase text-white opacity-98 tracking-tight">
            {currentSlide.title}
          </h2>
          <p className="hidden sm:block text-xs sm:text-sm text-gray-200 opacity-90 leading-relaxed mb-4 line-clamp-3">
            {currentSlide.description}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('prev')}
              aria-label="Trang trước"
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/25 border-2 border-white/80 text-white flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.25]" />
            </button>
            <button
              onClick={() => navigate('next')}
              aria-label="Trang tiếp theo"
              className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/25 border-2 border-white/80 text-white flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-md"
            >
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.25]" />
            </button>
          </div>
        </div>

        {/* 6. Bottom-right link "KHÁM PHÁ NGAY" */}
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-12 z-[60]">
          <a
            href={currentSlide.link}
            className="flex items-center gap-2 text-white opacity-95 hover:opacity-100 hover:scale-105 transition-all duration-200 uppercase tracking-[-0.02em] leading-none group"
            style={{
              fontFamily: "'Anton', sans-serif",
              fontSize: 'clamp(20px, 3.5vw, 48px)',
              fontWeight: 400,
              textDecoration: 'none',
            }}
          >
            <span>KHÁM PHÁ NGAY</span>
            <ArrowRight className="w-6 h-6 sm:w-9 sm:h-9 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Slider;
