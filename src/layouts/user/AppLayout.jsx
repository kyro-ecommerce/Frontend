import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Features from './Features';
// Streaming multi-turn assistant (chat v2); the older JSON-only ChatBot is no longer mounted.
import { AIChatWidget } from '../../components/user/common/AIChatWidget';

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
            <AIChatWidget />
        </div>
    );
};

export default AppLayout;