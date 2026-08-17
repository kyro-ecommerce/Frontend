import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useAuthContext } from "../../store/user/AuthContext";
import { authService } from "../../services/user/auth.service";
import { getErrorMessage } from "../../utils/errorUtils";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const useAuthForms = (handleClose = () => {}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, register, isAuthenticated, isLoading: authIsLoading, error: authError, clearAuthError } = useAuthContext();

  const toggleTab = useCallback((loginTab) => {
    setIsLogin(loginTab);
    clearAuthError();
  }, [clearAuthError]);

  const handleForgotPasswordOpen = useCallback(() => setShowForgotPassword(true), []);
  const handleForgotPasswordClose = useCallback(() => setShowForgotPassword(false), []);

  useEffect(() => {
    if (isAuthenticated) {
      handleClose?.();
    }
  }, [isAuthenticated, handleClose]);

  const handleGoogleLogin = useCallback(() => {
    window.location.href = `${BACKEND_URL}/oauth2/authorization/google`;
  }, []);

  return {
    isLogin,
    setIsLogin,
    showForgotPassword,
    setShowForgotPassword,
    authIsLoading,
    authError,
    login,
    register,
    clearAuthError,
    toggleTab,
    handleForgotPasswordOpen,
    handleForgotPasswordClose,
    handleGoogleLogin
  };
};
