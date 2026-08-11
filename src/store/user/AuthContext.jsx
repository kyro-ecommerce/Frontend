// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authService } from '../../services/user/auth.service';
import {
  saveTokenToLocalStorage,
  getTokenFromLocalStorage,
  clearAllTokens,
  extractTokensFromResponse
} from '../../services/user/util';

const AuthContext = createContext(null);

// Helper function to clean and validate seller URL
const cleanSellerUrl = (url) => {
  if (!url) return import.meta.env.VITE_SELLER_URL || "http://localhost:5174";
  
  // Remove trailing slash if exists
  url = url.replace(/\/$/, '');
  
  // Add protocol if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  
  return url;
};

const urlSeller = cleanSellerUrl(import.meta.env.VITE_SELLER_URL || "http://localhost:5174");

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [jwt, setJwt] = useState(getTokenFromLocalStorage());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserProfileInternal = useCallback(async (currentToken) => {
    if (!currentToken) {
      setUser(null);
      setJwt(null);
      return;
    }

    try {
      const response = await authService.getUserProfile();
      const userData = response.data?.data || response.data;
      setUser(userData);
      console.log("User profile fetched successfully:", userData);
      return userData;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      
      // Only clear tokens if it's an authentication error (401)
      if (err.response?.status === 401) {
        clearAllTokens();
        setJwt(null);
        setUser(null);
        setError("Session expired. Please login again.");
      } else {
        // For other errors, don't clear tokens but log the error
        console.warn("Non-auth error while fetching profile, keeping tokens");
        setError("Failed to load user profile. Please try again.");
      }
      return null;
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = getTokenFromLocalStorage();
      if (token) {
        setJwt(token);
        await fetchUserProfileInternal(token);
      } else {
        setUser(null);
        setJwt(null);
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
      setError("Authentication check failed");
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfileInternal]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting login with:", userData);
      const response = await authService.login(userData);
      console.log("Login response:", response);
      
      const { accessToken } = extractTokensFromResponse(response);

      if (!accessToken) {
        throw new Error("No access token received from login response");
      }

      saveTokenToLocalStorage(accessToken);
      setJwt(accessToken);

      const responseData = response.data?.data || response.data;
      const userFromLogin = responseData.user || responseData;

      // Extract roles safely
      const roles = userFromLogin?.roles || 
                   (userFromLogin?.authorities?.map(auth => 
                     auth.authority?.replace("ROLE_", "") || auth
                   )) || 
                   [];

      console.log("User roles:", roles);

      // Check if user is an ADMIN -> Redirect to /admin dashboard
      if (userFromLogin?.role === "ADMIN" || roles.includes("ADMIN")) {
        console.log("Admin detected, redirecting to admin dashboard");
        window.location.href = '/admin';
        return;
      }

      // Check if user is a seller and seller app is on a separate host/port
      const isExternalSellerApp = urlSeller && !urlSeller.includes(window.location.host);
      if ((roles.includes("SELLER") || userFromLogin?.role === "SELLER") && isExternalSellerApp) {
        console.log("Seller detected, redirecting to seller app");
        
        try {
          // Construct seller URL safely
          const sellerUrl = new URL(urlSeller);
          sellerUrl.pathname = '/dashboard';
          sellerUrl.searchParams.set('token', accessToken);
          
          console.log("Redirecting to:", sellerUrl.href);
          window.location.href = sellerUrl.href;
          return;
        } catch (urlError) {
          console.error("Error constructing seller URL:", urlError);
          setError("Failed to redirect to seller dashboard. Invalid seller URL configuration.");
          setIsLoading(false);
          return;
        }
      }

      // For regular users, fetch profile
      await fetchUserProfileInternal(accessToken);
      
    } catch (err) {
      console.error("Login error:", err);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setUser(null);
      setJwt(null);
      clearAllTokens();
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting registration with:", userData);
      const response = await authService.register(userData);
      console.log("Registration response:", response);
      
      // Registration successful - usually just sends OTP
      // Don't auto-login here, wait for OTP verification
      
    } catch (err) {
      console.error("Registration error:", err);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    
    try {
      await authService.logout();
      console.log("Logout API call successful");
    } catch (err) {
      console.error("Logout API error (can be ignored):", err);
    } finally {
      // Always clear local state regardless of API call result
      clearAllTokens();
      setUser(null);
      setJwt(null);
      
      // Redirect to home page if not already there
      if (window.location.pathname !== '/') {
        window.location.href = "/";
      }
    }
  };

  const setAuthTokenAndFetchUser = useCallback(async (token) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (token) {
        saveTokenToLocalStorage(token);
        setJwt(token);
        const userData = await fetchUserProfileInternal(token);
        return userData;
      } else {
        clearAllTokens();
        setJwt(null);
        setUser(null);
        setError("Invalid authentication token received");
        return null;
      }
    } catch (err) {
      console.error("Error setting auth token:", err);
      setError("Failed to authenticate with provided token");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUserProfileInternal]);

  const value = {
    user,
    jwt,
    isLoading,
    error,
    isAuthenticated: !!jwt && !!user,
    login,
    register,
    logout,
    fetchUserProfile: useCallback(() => {
      if (jwt) {
        return fetchUserProfileInternal(jwt);
      }
      return Promise.resolve();
    }, [jwt, fetchUserProfileInternal]),
    checkAuthStatus,
    clearAuthError: () => setError(null),
    setAuthTokenAndFetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
