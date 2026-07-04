import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Features from './Features';
import ChatBot from '../features/chatbot/ChatBot'; // Đường dẫn đến component ChatBot

const AppLayout = () => {
    return (
        <div className="flex flex-col bg-white min-h-screen">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Features />
            <Footer />
            <ChatBot /> {/* Thêm component ChatBot ở đây */}
        </div>
    );
};

export default AppLayout;