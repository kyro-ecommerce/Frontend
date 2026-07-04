import React from "react";
import { Link, useLocation } from "react-router-dom";

const BreadcrumbNav = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
  
  const breadcrumbMap = {
    'laptop': 'Laptop',
    'desktop-computers': 'Máy tính bàn',
    'accessories': 'Phụ kiện',
    'phone': 'Điện thoại',
    'computer-parts': 'Linh kiện máy tính',
    'other-products': 'Sản phẩm khác',
    'my-order': 'Đơn hàng của tôi',
    'product': 'Sản phẩm',
    'detail': 'Chi tiết sản phẩm',
    'account': 'Tài khoản',
    'cart': 'Giỏ hàng',
    'information': 'Thông tin',
    'review': 'Đánh giá',
    'all': 'Tất cả sản phẩm'
  };

  return (
    <nav className="self-start mt-5 mb-3 text-xs font-light text-center text-neutral-400 max-md:max-w-full">
      <Link to="/" className="text-black">
        Home
      </Link>
      
      {pathSegments.map((segment, index) => {
        // Xây dựng URL cho breadcrumb
        const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        
        // Xử lý trường hợp segment là số trang
        const isPageNumber = !isNaN(parseInt(segment));
        const label = isPageNumber 
          ? `Trang ${segment}` 
          : (breadcrumbMap[segment] || segment);
        
        return (
          <React.Fragment key={segment}>
            <span className="text-blue-600"> › </span>
            {isLast ? (
              <span className="text-gray-400">{label}</span>
            ) : (
              <Link to={url} className="text-black">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default BreadcrumbNav;