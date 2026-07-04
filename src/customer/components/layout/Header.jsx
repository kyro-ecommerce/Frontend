// src/components/layout/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { useCartContext } from '../../contexts/CartContext';
import AuthForms from '../../pages/Auth/AuthForm';
import { Menu, MenuItem, Avatar, CircularProgress } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchBar from '../features/search/SearchBar';

const Header = () => {
  const navigate = useNavigate();
  const {
    user,
    isLoading,
    isAuthenticated,
    logout: authLogout,
  } = useAuthContext();
  const { cart } = useCartContext();

  const [showLoginForm, setShowLoginForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const modalRef = useRef(null);

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowLoginForm(false);
    }
  };

  const handleClose = () => {
    setShowLoginForm(false);
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  const handleLogout = () => {
    authLogout();
    handleUserMenuClose();
  };

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/account');
    handleUserMenuClose();
  };

  useEffect(() => {
    if (showLoginForm) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLoginForm]);

  const totalItems = cart?.totalItems || 0;

  const getDisplayName = () => {
    if (!user) return '';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    if (user.email) {
      const emailParts = user.email.split('@');
      if (emailParts.length === 2) {
        return emailParts[0].length > 3
          ? `${emailParts[0].substring(0, 3)}...@${emailParts[1]}`
          : user.email;
      }
      return user.email;
    }
    return 'Người dùng';
  };

  const renderUserDisplay = () => {
    if (isLoading) {
      return <CircularProgress size={24} color="inherit" />;
    }

    if (isAuthenticated) {
      return (
        <div className="flex items-center">
          <button
            onClick={handleUserMenuOpen}
            className="flex items-center space-x-2 focus:outline-none px-3 py-1 rounded-full hover:bg-blue-50 transition duration-300"
          >
            {user?.imageUrl ? (
              <Avatar
                src={user?.imageUrl}
                alt={getDisplayName()}
                sx={{ width: 32, height: 32 }}
              />
            ) : (
              <AccountCircleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            )}
            <span className="text-sm hidden md:inline ml-2 text-blue-600 font-medium">{getDisplayName()}</span>
          </button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
          >
            <MenuItem onClick={handleProfileClick}>Thông tin cá nhân</MenuItem>
            <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
          </Menu>
        </div>
      );
    } else {
      return (
        <button
          className="py-2 px-6 text-blue-600 cursor-pointer border-2 border-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-300"
          onClick={() => setShowLoginForm(true)}
        >
          Đăng nhập
        </button>
      );
    }
  };

  return (
    <>
      <div className="flex flex-col self-center max-w-full font-semibold text-center w-full">
        <div className="flex flex-wrap gap-5 justify-center items-center mt-8 w-full text-sm text-black max-md:mr-2 max-md:max-w-full">
          <img
            src="/ShopIcon.png"
            className="object-contain aspect-square w-[65px]"
            alt="Tech Shop"
          />
          <Link to="/" className="self-stretch my-auto hover:text-blue-600 transition-colors duration-300 cursor-pointer">Trang chủ</Link>
          <Link to="/laptop" className="self-stretch my-auto hover:text-blue-600 transition-colors duration-300 cursor-pointer">Laptop</Link>
          <Link to="/desktop-computers" className="self-stretch my-auto hover:text-blue-600 transition-colors duration-300 cursor-pointer">Máy tính bàn</Link>
          <Link to="/accessories" className="self-stretch my-auto hover:text-blue-600 transition-colors duration-300 cursor-pointer">Phụ kiện</Link>
          <Link to="/phone" className="self-stretch my-auto hover:text-blue-600 transition-colors duration-300 cursor-pointer">Điện thoại</Link>
          <Link to="/computer-parts" className="self-stretch my-auto hover:text-blue-600 transition-colors duration-300 cursor-pointer">Linh kiện máy tính</Link>
          <Link to="/product/all" className="self-stretch my-auto hover:text-blue-600 transition-colors duration-300 cursor-pointer">Tất cả sản phẩm</Link>
          {isAuthenticated && user && (
          <Link to="/my-order" className="gap-2.5 self-stretch my-auto px-7 py-2 text-blue-600 border-2 border-solid border-[color:var(--Color---3,#0156FF)] rounded-[50px] max-md:px-5 hover:bg-blue-600 hover:text-white transition-colors duration-300 cursor-pointer">Đơn hàng của tôi</Link>
          )}
          <SearchBar />

          {isAuthenticated && user && (
            <div
              className="relative inline-block cursor-pointer"
              aria-label="Shopping Cart"
              onClick={handleCartClick}
            >
              <img
                src="/CartIcon.png"
                className="object-contain shrink-0 self-start aspect-[1.18] w-[33px]"
                alt="Cart Icon"
              />
              {totalItems > 0 && (
                <span
                  className="absolute bottom-3 left-3 text-white bg-blue-600 rounded-full text-xs px-1.5 py-0.5"
                >
                  {totalItems}
                </span>
              )}
            </div>
          )}

          <div>
            {renderUserDisplay()}
            {showLoginForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40" onClick={handleClose}>
                <div
                  ref={modalRef}
                  className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white p-6 md:p-8 rounded-lg shadow-xl w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AuthForms handleClose={handleClose} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <img
        src="/Bar.svg"
        className="object-contain mt-5 w-full aspect-[1000] stroke-[1px] stroke-gray-300 max-md:max-w-full"
        alt=""
      />
    </>
  );
};

export default Header;