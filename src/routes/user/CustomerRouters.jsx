import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '../../pages/user/Home/Home';
import UserAccount from '../../pages/user/UserAccount/UserAccount';
import UserOrders from '../../pages/user/UserAccount/UserOrders';
import OrderDetail from '../../pages/user/UserAccount/OrderDetail';
import Cart from '../../pages/user/Cart/Cart';
import Catalog from '../../pages/user/Catalog/Catalog';
import ProductDetail from '../../pages/user/ProductDetail/ProductDetail';
import AppLayout from '../../layouts/user/AppLayout';
import { FilterProvider } from '../../features/user/catalog/FilterContext';
import ForgotPassword from '../../pages/user/Auth/ForgotPassword';
import Checkout from '../../pages/user/Checkout/Checkout';
import OAuthRedirect from '../../pages/user/Auth/OAuthRedirect';
import ProtectedRoute from './ProtectedRoute';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const CustomerRouters = () => {
  return (
    <div>
      <ScrollToTop />
      <FilterProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="laptop/:secondLevelCategory?/:page?" element={<Catalog category="laptop" />} />
            <Route path="desktop-computers/:secondLevelCategory?/:page?" element={<Catalog category="desktops" />} />
            <Route path="accessories/:secondLevelCategory?/:page?" element={<Catalog category="accessories" />} />
            <Route path="phone/:secondLevelCategory?/:page?" element={<Catalog category="phone" />} />
            <Route path="computer-parts/:secondLevelCategory?/:page?" element={<Catalog category="components" />} />
            <Route path="other-products/:secondLevelCategory?/:page?" element={<Catalog category="others" />} />

            <Route path="product/all/:page?" element={<Catalog category="all" />} />
            <Route path="product/:productId" element={<ProductDetail />} />
            
            {/* Protected Routes */}
            <Route path="my-order" element={
              <ProtectedRoute>
                <UserOrders />
              </ProtectedRoute>
            } />
            
            <Route path="account" element={
              <ProtectedRoute>
                <UserAccount />
              </ProtectedRoute>
            } />
            
            <Route path="my-order/:orderId" element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            } />

            <Route path="cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />

            <Route path="checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />

            {/* Public Routes */}
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="oauth2/redirect" element={<OAuthRedirect />} />
            <Route path="search" element={<Catalog category="all" />} />
            <Route path="search/search=:search/:page?" element={<Catalog category="all" />} />
          </Route>
        </Routes>
      </FilterProvider>
    </div>
  )
}

export default CustomerRouters