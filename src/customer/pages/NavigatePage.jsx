// src/pages/NavigatePage.jsx
import React, { useState } from 'react';
import Home from './Home/Home';

const NavigatePage = () => {
  const [currentPage, setCurrentPage] = useState('home'); // Mặc định hiển thị trang Home

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      <nav>
        <button className="mr-5" onClick={() => setCurrentPage('home')}>Home</button>
        {/* Thêm các nút điều hướng khác */}
      </nav>
      {renderPage()}
    </>
  );
}

export default NavigatePage;