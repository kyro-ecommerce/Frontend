// src/services/index.js
// File này export tất cả các services để dễ dàng import

import api from './api';
import * as authService from './authService';
import * as dashboardService from './dashboardService';
import * as orderService from './orderService';
import * as productService from './productService';
import * as userService from './userService';

export {
    api,
    authService,
    dashboardService,
    orderService,
    productService,
    userService,
};