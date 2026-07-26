// src/components/layout/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../store/user/AuthContext';
import { useCartContext } from '../../store/user/CartContext';
import AuthForms from '../../pages/user/Auth/AuthForm';
import { Menu, MenuItem, Avatar, CircularProgress } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchBar from '../../features/user/search/SearchBar';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    isLoading,
    isAuthenticated,
    logout: authLogout,
  } = useAuthContext();
  const { cart } = useCartContext();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const modalRef = useRef(null);

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          className="py-1.5 px-5 text-sm text-blue-600 cursor-pointer border-2 border-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-300"
          onClick={() => setShowLoginForm(true)}
        >
          Đăng nhập
        </button>
      );
    }
  };

  return (
    <header className="fixed top-3 left-0 right-0 z-50 w-full px-4 sm:px-6 transition-all duration-300">
      <div
        className={`max-w-screen-xl mx-auto flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 rounded-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/85 backdrop-blur-md shadow-xl border border-gray-200/80"
            : "bg-white/95 backdrop-blur-sm shadow-md border border-gray-100"
        }`}
      >
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/ShopIcon.png"
            className="object-contain h-10 w-auto"
            alt="Tech Shop"
          />
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold">
          <Link
            to="/"
            className={`py-1 hover:text-blue-600 transition-colors duration-300 cursor-pointer ${
              isActive('/') ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-700'
            }`}
          >
            Trang chủ
          </Link>
          <Link
            to="/laptop"
            className={`py-1 hover:text-blue-600 transition-colors duration-300 cursor-pointer ${
              isActive('/laptop') ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-700'
            }`}
          >
            Laptop
          </Link>
          <Link
            to="/desktop-computers"
            className={`py-1 hover:text-blue-600 transition-colors duration-300 cursor-pointer ${
              isActive('/desktop-computers') ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-700'
            }`}
          >
            Máy tính bàn
          </Link>
          <Link
            to="/accessories"
            className={`py-1 hover:text-blue-600 transition-colors duration-300 cursor-pointer ${
              isActive('/accessories') ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-700'
            }`}
          >
            Phụ kiện
          </Link>
          <Link
            to="/phone"
            className={`py-1 hover:text-blue-600 transition-colors duration-300 cursor-pointer ${
              isActive('/phone') ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-700'
            }`}
          >
            Điện thoại
          </Link>
          <Link
            to="/computer-parts"
            className={`py-1 hover:text-blue-600 transition-colors duration-300 cursor-pointer ${
              isActive('/computer-parts') ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-700'
            }`}
          >
            Linh kiện
          </Link>
          <Link
            to="/product/all"
            className={`py-1 hover:text-blue-600 transition-colors duration-300 cursor-pointer ${
              isActive('/product/all') ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-700'
            }`}
          >
            Tất cả
          </Link>
          {isAuthenticated && user && (
            <Link
              to="/my-order"
              className={`px-4 py-1 text-xs text-blue-600 border border-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-colors duration-300 cursor-pointer ${
                isActive('/my-order') ? 'bg-blue-600 text-white font-bold' : ''
              }`}
            >
              Đơn hàng
            </Link>
          )}
        </nav>

        {/* SearchBar, Cart Icon & User Button */}
        <div className="flex items-center gap-3 shrink-0">
          <SearchBar />

          {isAuthenticated && user && (
            <div
              className="relative cursor-pointer p-1.5 hover:bg-gray-100/80 rounded-full transition-colors"
              aria-label="Shopping Cart"
              onClick={handleCartClick}
            >
              <img
                src="/CartIcon.png"
                className="object-contain w-7 h-7"
                alt="Cart Icon"
              />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 text-white bg-blue-600 rounded-full text-[10px] font-bold px-1.5 py-0.2 shadow">
                  {totalItems}
                </span>
              )}
            </div>
          )}

          <div>{renderUserDisplay()}</div>
        </div>
      </div>

      {/* Modal LoginForm */}
      {showLoginForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <div
            ref={modalRef}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <AuthForms handleClose={handleClose} />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;