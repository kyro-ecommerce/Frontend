// src/components/layout/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div className="flex w-full min-h-screen font-sans bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-x-hidden">
                <Header />
                <div className="p-3 flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;