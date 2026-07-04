// src/components/layout/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../../styles/layout/layout.css';

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <Header />
                <div className="content-wrapper">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;