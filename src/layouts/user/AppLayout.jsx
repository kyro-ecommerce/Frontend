import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Features from './Features';
import ChatBot from '../../features/user/chatbot/ChatBot';

const AppLayout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className="flex flex-col bg-white min-h-screen">
            <Header />
            <main className={`grow ${isHomePage ? '' : 'pt-24'}`}>
                <Outlet />
            </main>
            <Features />
            <Footer />
            <ChatBot />
        </div>
    );
};

export default AppLayout;