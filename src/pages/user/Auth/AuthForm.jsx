import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-hot-toast";
import { useAuthContext } from '../../../store/user/AuthContext';
import ForgotPassword from "./ForgotPassword";
import { authService } from "../../../services/user/auth.service";
import { getErrorMessage } from "../../../utils/errorUtils";
import {
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogContent,
  Alert,
  CircularProgress
} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CloseIcon from '@mui/icons-material/Close';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const AuthForms = ({ handleClose = () => {} }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, register, isAuthenticated, isLoading: authIsLoading, error: authError, clearAuthError } = useAuthContext();

  const toggleTab = (loginTab) => {
    setIsLogin(loginTab);
    clearAuthError();
  };

  const handleForgotPasswordOpen = () => setShowForgotPassword(true);
  const handleForgotPasswordClose = () => setShowForgotPassword(false);

  useEffect(() => {
    if (isAuthenticated) {
      handleClose?.();
    }
  }, [isAuthenticated, handleClose]);

  return (
    <div className="w-full relative bg-white rounded-3xl overflow-hidden p-3 sm:p-5" onClick={(e) => e.stopPropagation()}>
      {/* Top Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors cursor-pointer z-10"
        aria-label="Đóng"
      >
        <CloseIcon fontSize="small" />
      </button>

      {/* Pill Segmented Tab Bar */}
      <div className="flex bg-gray-100 p-1 rounded-2xl mb-5 max-w-xs mx-auto mt-1">
        <button
          onClick={() => toggleTab(true)}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            isLogin
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Đăng nhập
        </button>
        <button
          onClick={() => toggleTab(false)}
          className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer ${
            !isLogin
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Đăng ký
        </button>
      </div>

      {isLogin ? (
        <LoginForm
          handleClose={handleClose}
          toggleForm={() => toggleTab(false)}
          onForgotPasswordClick={handleForgotPasswordOpen}
          loginUser={login}
          authIsLoading={authIsLoading}
          authError={authError}
          clearAuthError={clearAuthError}
        />
      ) : (
        <RegisterForm
          handleClose={handleClose}
          toggleForm={() => toggleTab(true)}
          authIsLoading={authIsLoading}
          authError={authError}
          clearAuthError={clearAuthError}
          contextLogin={login}
        />
      )}

      {/* Forgot Password Dialog */}
      <Dialog
        open={showForgotPassword}
        onClose={handleForgotPasswordClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '24px', p: 1 }
        }}
      >
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <ForgotPassword onBackToLogin={handleForgotPasswordClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

AuthForms.propTypes = { handleClose: PropTypes.func.isRequired };

// --- LOGIN FORM COMPONENT ---
function LoginForm({
  toggleForm,
  onForgotPasswordClick,
  loginUser,
  authIsLoading,
  authError,
  clearAuthError
}) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({ email: "", password: "" });

  const validateForm = () => {
    let newErrors = { email: "", password: "" };
    let isValid = true;
    if (!formData.email) {
      newErrors.email = "Vui lòng nhập email.";
      isValid = false;
    } else if (!formData.email.includes("@")) {
      newErrors.email = "Email không hợp lệ.";
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu.";
      isValid = false;
    }
    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearAuthError();
    if (validateForm()) {
      try {
        await loginUser(formData);
      } catch (err) {
        console.error("Login failed:", err);
      }
    }
  };

  const handleTogglePassword = (e) => { e.stopPropagation(); setShowPassword(!showPassword); };
  const handleForgotPasswordClick = (e) => { e.preventDefault(); e.stopPropagation(); if (onForgotPasswordClick) onForgotPasswordClick(); };
  const handleGoogleLogin = (e) => { e.stopPropagation(); window.location.href = `${BACKEND_URL}/oauth2/authorization/google`; };
  const handleGitHubLogin = (e) => { e.stopPropagation(); window.location.href = `${BACKEND_URL}/oauth2/authorization/github`; };

  return (
    <div className="w-full max-w-sm mx-auto px-1 pb-1">
      {/* Title */}
      <div className="text-center mb-5">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Đăng Nhập Tài Khoản</h2>
        <p className="text-xs text-gray-500 font-medium mt-1">Vui lòng đăng nhập để tiếp tục trải nghiệm mua sắm</p>
      </div>

      {authError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '14px' }} onClose={clearAuthError}>
          {getErrorMessage(authError, "Email hoặc mật khẩu không chính xác.")}
        </Alert>
      )}

      {/* Social Login Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={handleGitHubLogin}
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <svg className="w-4 h-4 fill-gray-900" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          <span>GitHub</span>
        </button>
      </div>

      <div className="relative flex py-2 items-center mb-3">
        <div className="grow border-t border-gray-100"></div>
        <span className="shrink mx-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">hoặc sử dụng email</span>
        <div className="grow border-t border-gray-100"></div>
      </div>

      {/* Login Form Inputs with Top Labels */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 text-left">
            Địa chỉ Email
          </label>
          <TextField
            fullWidth
            required
            placeholder="Nhập địa chỉ email..."
            type="email"
            size="small"
            value={formData.email}
            onChange={(e) => { e.stopPropagation(); setFormData({ ...formData, email: e.target.value }); if (formErrors.email) setFormErrors(prev => ({ ...prev, email: "" })); }}
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={authIsLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon fontSize="small" className="text-gray-400" />
                </InputAdornment>
              ),
              sx: { borderRadius: '14px', bg: '#FAFAFA' }
            }}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1 text-left">
            Mật khẩu
          </label>
          <TextField
            fullWidth
            required
            placeholder="Nhập mật khẩu..."
            type={showPassword ? "text" : "password"}
            size="small"
            value={formData.password}
            onChange={(e) => { e.stopPropagation(); setFormData({ ...formData, password: e.target.value }); if (formErrors.password) setFormErrors(prev => ({ ...prev, password: "" })); }}
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={authIsLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" className="text-gray-400" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton aria-label="toggle password visibility" onClick={handleTogglePassword} edge="end" disabled={authIsLoading}>
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
              sx: { borderRadius: '14px', bg: '#FAFAFA' }
            }}
          />
        </div>

        <div className="flex justify-end pt-0.5">
          <button
            type="button"
            onClick={handleForgotPasswordClick}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            disabled={authIsLoading}
          >
            Quên mật khẩu?
          </button>
        </div>

        <button
          type="submit"
          disabled={authIsLoading}
          className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm py-3 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all duration-200 cursor-pointer active:scale-[0.99] flex items-center justify-center mt-2"
        >
          {authIsLoading ? <CircularProgress size={22} color="inherit" /> : "Đăng Nhập"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500 font-medium mt-4">
        Chưa có tài khoản?{" "}
        <button
          type="button"
          onClick={toggleForm}
          className="font-bold text-blue-600 hover:underline cursor-pointer"
        >
          Đăng ký ngay
        </button>
      </p>
    </div>
  );
}

LoginForm.propTypes = {
  handleClose: PropTypes.func,
  toggleForm: PropTypes.func.isRequired,
  onForgotPasswordClick: PropTypes.func,
  loginUser: PropTypes.func.isRequired,
  authIsLoading: PropTypes.bool,
  authError: PropTypes.string,
  clearAuthError: PropTypes.func.isRequired,
};

// --- REGISTER FORM COMPONENT ---
function RegisterForm({
  toggleForm,
  authIsLoading,
  authError,
  clearAuthError,
  contextLogin
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", otp: "" });
  const [formErrors, setFormErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState({ register: false, verifyOtp: false, resendOtp: false });

  const handleChange = (e) => {
    e.stopPropagation();
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateAccountDetails = () => {
    const newErrors = {};
    let isValid = true;
    if (!formData.firstName.trim()) { newErrors.firstName = "Họ không được để trống"; isValid = false; }
    if (!formData.lastName.trim()) { newErrors.lastName = "Tên không được để trống"; isValid = false; }
    if (!formData.email) { newErrors.email = "Email không được để trống"; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(formData.email)) { newErrors.email = "Email không hợp lệ"; isValid = false; }
    if (!formData.password) { newErrors.password = "Mật khẩu không được để trống"; isValid = false; }
    else if (formData.password.length < 8) { newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự"; isValid = false; }
    if (!formData.confirmPassword) { newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu"; isValid = false; }
    else if (formData.confirmPassword !== formData.password) { newErrors.confirmPassword = "Mật khẩu không khớp"; isValid = false; }
    setFormErrors(newErrors);
    return isValid;
  };

  const validateOtp = () => {
    const newErrors = {};
    let isValid = true;
    if (!formData.otp.trim()) { newErrors.otp = "OTP không được để trống"; isValid = false; }
    else if (!/^\d{6}$/.test(formData.otp.trim())) { newErrors.otp = "OTP phải là 6 chữ số"; isValid = false; }
    setFormErrors(newErrors);
    return isValid;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault(); e.stopPropagation();
    clearAuthError(); setStatusMessage("");
    if (validateAccountDetails()) {
      setActionLoading(prev => ({ ...prev, register: true }));
      try {
        const userData = { email: formData.email, firstName: formData.firstName, lastName: formData.lastName, password: formData.password };
        await authService.register(userData);
        setActiveStep(1);
        setStatusMessage("Mã OTP đã được gửi đến email của bạn.");
        setMessageType("success");
        toast.success("Đã gửi mã OTP đến email!");
      } catch (err) {
        const errorMsg = getErrorMessage(err, "Đăng ký thất bại.");
        setStatusMessage(errorMsg);
        setMessageType("error");
        toast.error(errorMsg);
      } finally {
        setActionLoading(prev => ({ ...prev, register: false }));
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault(); e.stopPropagation();
    clearAuthError(); setStatusMessage("");
    if (validateOtp()) {
      setActionLoading(prev => ({ ...prev, verifyOtp: true }));
      try {
        await authService.verifyOtp(formData.email, formData.otp);
        setStatusMessage("Xác thực thành công! Đang đăng nhập...");
        setMessageType("success");
        toast.success("Xác thực OTP thành công!");
        await contextLogin({ email: formData.email, password: formData.password });
      } catch (err) {
        const errorMsg = getErrorMessage(err, "Xác thực OTP thất bại.");
        setStatusMessage(errorMsg);
        setMessageType("error");
        toast.error(errorMsg);
      } finally {
        setActionLoading(prev => ({ ...prev, verifyOtp: false }));
      }
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault(); e.stopPropagation();
    clearAuthError(); setStatusMessage("");
    setActionLoading(prev => ({ ...prev, resendOtp: true }));
    try {
      await authService.resendOtp(formData.email);
      setStatusMessage("Mã OTP mới đã được gửi vào email.");
      setMessageType("success");
      toast.success("Đã gửi lại mã OTP.");
    } catch (err) {
      const errorMsg = getErrorMessage(err, "Gửi lại OTP thất bại.");
      setStatusMessage(errorMsg);
      setMessageType("error");
      toast.error(errorMsg);
    } finally {
      setActionLoading(prev => ({ ...prev, resendOtp: false }));
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-1 pb-1">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Đăng Ký Tài Khoản</h2>
        <p className="text-xs text-gray-500 font-medium mt-1">
          {activeStep === 0 ? "Tạo tài khoản mới để mua sắm nhanh chóng" : "Nhập mã OTP vừa gửi tới Email của bạn"}
        </p>
      </div>

      {/* Stepper Dots */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className={`h-1.5 rounded-full transition-all duration-300 ${activeStep === 0 ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200'}`}></div>
        <div className={`h-1.5 rounded-full transition-all duration-300 ${activeStep === 1 ? 'w-8 bg-blue-600' : 'w-2 bg-gray-200'}`}></div>
      </div>

      {authError && activeStep === 0 && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '14px' }} onClose={clearAuthError}>
          {getErrorMessage(authError, "Đăng ký thất bại.")}
        </Alert>
      )}
      {statusMessage && (
        <Alert severity={messageType || "info"} sx={{ mb: 2, borderRadius: '14px' }} onClose={() => setStatusMessage("")}>{statusMessage}</Alert>
      )}

      {activeStep === 0 ? (
        <form onSubmit={handleRegisterSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Họ</label>
              <TextField
                placeholder="Nhập họ..."
                variant="outlined"
                size="small"
                fullWidth
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                error={!!formErrors.firstName}
                helperText={formErrors.firstName}
                disabled={actionLoading.register || authIsLoading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon fontSize="small" className="text-gray-400" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: '14px' }
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Tên</label>
              <TextField
                placeholder="Nhập tên..."
                variant="outlined"
                size="small"
                fullWidth
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                error={!!formErrors.lastName}
                helperText={formErrors.lastName}
                disabled={actionLoading.register || authIsLoading}
                InputProps={{
                  sx: { borderRadius: '14px' }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Địa chỉ Email</label>
            <TextField
              placeholder="Nhập địa chỉ email..."
              variant="outlined"
              size="small"
              fullWidth
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              disabled={actionLoading.register || authIsLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon fontSize="small" className="text-gray-400" />
                  </InputAdornment>
                ),
                sx: { borderRadius: '14px' }
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Mật khẩu</label>
            <TextField
              placeholder="Ít nhất 8 ký tự..."
              variant="outlined"
              size="small"
              fullWidth
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              disabled={actionLoading.register || authIsLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" className="text-gray-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" disabled={actionLoading.register || authIsLoading}>
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: '14px' }
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 text-left">Xác nhận mật khẩu</label>
            <TextField
              placeholder="Nhập lại mật khẩu..."
              variant="outlined"
              size="small"
              fullWidth
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              disabled={actionLoading.register || authIsLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" className="text-gray-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" disabled={actionLoading.register || authIsLoading}>
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { borderRadius: '14px' }
              }}
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading.register || authIsLoading}
            className="w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm py-3 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all duration-200 cursor-pointer active:scale-[0.99] flex items-center justify-center mt-3"
          >
            {actionLoading.register || authIsLoading ? <CircularProgress size={22} color="inherit" /> : "Tiếp tục"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="bg-blue-50/70 p-3 rounded-2xl text-center border border-blue-100 mb-2">
            <p className="text-xs text-gray-600 font-medium">Mã OTP 6 chữ số đã được gửi tới:</p>
            <p className="text-sm font-bold text-blue-900 mt-0.5">{formData.email}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 text-center">Mã OTP xác nhận</label>
            <TextField
              placeholder="123456"
              variant="outlined"
              fullWidth
              size="small"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              error={!!formErrors.otp}
              helperText={formErrors.otp}
              disabled={actionLoading.verifyOtp || authIsLoading}
              inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: '0.2em', fontWeight: 'bold' } }}
              InputProps={{
                sx: { borderRadius: '14px' }
              }}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveStep(0)}
              disabled={actionLoading.verifyOtp || actionLoading.resendOtp || authIsLoading}
              className="w-1/3 py-2.5 px-3 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
            >
              Quay lại
            </button>

            <button
              type="submit"
              disabled={actionLoading.verifyOtp || authIsLoading}
              className="flex-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-2xl shadow-lg shadow-blue-200 transition-all cursor-pointer flex items-center justify-center"
            >
              {actionLoading.verifyOtp || authIsLoading ? <CircularProgress size={20} color="inherit" /> : "Xác nhận & Đăng nhập"}
            </button>
          </div>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={actionLoading.resendOtp || actionLoading.verifyOtp || authIsLoading}
              className="text-xs font-bold text-blue-600 hover:underline cursor-pointer disabled:opacity-50"
            >
              {actionLoading.resendOtp ? "Đang gửi lại..." : "Gửi lại mã OTP"}
            </button>
          </div>
        </form>
      )}

      <p className="text-center text-xs text-gray-500 font-medium mt-4">
        Đã có tài khoản?{" "}
        <button
          type="button"
          onClick={toggleForm}
          className="font-bold text-blue-600 hover:underline cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </p>
    </div>
  );
}

RegisterForm.propTypes = {
  handleClose: PropTypes.func,
  toggleForm: PropTypes.func.isRequired,
  authIsLoading: PropTypes.bool,
  authError: PropTypes.string,
  clearAuthError: PropTypes.func.isRequired,
  contextLogin: PropTypes.func.isRequired,
};

export default AuthForms;