import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useAuthContext } from '../../contexts/AuthContext';
import ForgotPassword from "./ForgotPassword";
import { authService } from "../../services/auth.service";
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
  InputAdornment,
  IconButton,
  Divider,
  Stack,
  Dialog,
  DialogContent,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress // Thêm CircularProgress nếu bạn muốn dùng cho authIsLoading
} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Github from "@mui/icons-material/GitHub";
import Google from "@mui/icons-material/Google";

const BACKEND_URL = import.meta.env.VITE_API_URL;

const AuthForms = ({ handleClose }) => {
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login, register, isAuthenticated, isLoading: authIsLoading, error: authError, clearAuthError } = useAuthContext();


  const toggleForm = () => {
    setShowLoginForm(!showLoginForm);
    clearAuthError();
  };

  const handleForgotPasswordOpen = () => setShowForgotPassword(true);
  const handleForgotPasswordClose = () => setShowForgotPassword(false);

  useEffect(() => {
    if (isAuthenticated) {
      handleClose();
    }
  }, [isAuthenticated, handleClose]);

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div onClick={handleModalClick}>
      {showLoginForm ? (
        <LoginForm
          handleClose={handleClose}
          toggleForm={toggleForm}
          onForgotPasswordClick={handleForgotPasswordOpen}
          loginUser={login}
          authIsLoading={authIsLoading}
          authError={authError}
          clearAuthError={clearAuthError}
        />
      ) : (
        <RegisterForm
          handleClose={handleClose}
          toggleForm={toggleForm}
          registerUser={register} // Lưu ý: register trong context hiện tại đơn giản, cần authService cho OTP
          authIsLoading={authIsLoading}
          authError={authError}
          clearAuthError={clearAuthError}
          contextLogin={login} // Truyền hàm login của context cho RegisterForm để tự động login sau verify OTP
        />
      )}
      <Dialog
        open={showForgotPassword}
        onClose={handleForgotPasswordClose}
        maxWidth="sm"
        fullWidth
        onClick={handleModalClick}
      >
        <DialogContent onClick={handleModalClick}>
          <ForgotPassword onBackToLogin={handleForgotPasswordClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
AuthForms.propTypes = { handleClose: PropTypes.func.isRequired };

function LoginForm({
  handleClose,
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
        // Lỗi đã được AuthContext xử lý và set vào authError
        console.error("Login failed in LoginForm:", err);
      }
    }
  };

  const handleTogglePassword = (e) => { e.stopPropagation(); setShowPassword(!showPassword); };
  const handleForgotPasswordClick = (e) => { e.preventDefault(); e.stopPropagation(); if (onForgotPasswordClick) onForgotPasswordClick(); };
  const handleGoogleLogin = (e) => { e.stopPropagation(); window.location.href = `${BACKEND_URL}/oauth2/authorization/google`; };
  const handleGitHubLogin = (e) => { e.stopPropagation(); window.location.href = `${BACKEND_URL}/oauth2/authorization/github`; };

  return (
    <Card sx={{ maxWidth: 400, width: '100%', mx: "auto", p: { xs: 2, sm: 3 }, boxShadow: { xs: 0, sm: 3 } }} onClick={(e) => e.stopPropagation()}>
      <Typography variant="h5" gutterBottom align="center">Welcome Back</Typography>
      <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 2 }}>Sign in to your account</Typography>

      {authError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearAuthError}>
          {authError}
        </Alert>
      )}

      <CardContent className="space-y-4" sx={{ p: 0 }}>
        <Stack spacing={2} sx={{ mb: 2 }}>
          <Button fullWidth variant="outlined" onClick={handleGoogleLogin} startIcon={<Google />} sx={{ justifyContent: 'center' }}>
            Sign in with Google
          </Button>
          <Button fullWidth variant="outlined" onClick={handleGitHubLogin} startIcon={<Github />} sx={{ justifyContent: 'center', borderColor: 'rgba(0, 0, 0, 0.23)', color: 'inherit' }}>
            Sign in with GitHub
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }}>OR</Divider>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            required
            label="Email"
            type="email"
            name="email"
            margin="normal"
            value={formData.email}
            onChange={(e) => { e.stopPropagation(); setFormData({ ...formData, email: e.target.value }); if (formErrors.email) setFormErrors(prev => ({ ...prev, email: "" })); }}
            error={!!formErrors.email}
            helperText={formErrors.email}
            disabled={authIsLoading}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
          />
          <TextField
            fullWidth
            required
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            margin="normal"
            value={formData.password}
            onChange={(e) => { e.stopPropagation(); setFormData({ ...formData, password: e.target.value }); if (formErrors.password) setFormErrors(prev => ({ ...prev, password: "" })); }}
            error={!!formErrors.password}
            helperText={formErrors.password}
            disabled={authIsLoading}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" onClick={(e) => e.stopPropagation()}>
                  <IconButton aria-label="toggle password visibility" onClick={handleTogglePassword} onMouseDown={(e) => e.stopPropagation()} edge="end" disabled={authIsLoading}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleForgotPasswordClick} sx={{ textTransform: 'none' }} color="primary" disabled={authIsLoading}>
              Quên mật khẩu?
            </Button>
          </Box>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, py: 1.5 }} disabled={authIsLoading} onClick={(e) => e.stopPropagation()}>
            {authIsLoading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>
        </form>
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Don't have an account?{" "}
          <Button onClick={(e) => { e.stopPropagation(); toggleForm(); }} sx={{ textTransform: 'none', fontWeight: 'bold' }} color="primary" disabled={authIsLoading}>
            Sign Up Now
          </Button>
        </Typography>
      </CardContent>
    </Card>
  );
}
LoginForm.propTypes = {
  handleClose: PropTypes.func.isRequired,
  toggleForm: PropTypes.func.isRequired,
  onForgotPasswordClick: PropTypes.func,
  loginUser: PropTypes.func.isRequired,
  authIsLoading: PropTypes.bool,
  authError: PropTypes.string,
  clearAuthError: PropTypes.func.isRequired,
};

function RegisterForm({
  handleClose,
  toggleForm,
  // registerUser, // registerUser từ context đơn giản, nên ta sẽ dùng authService trực tiếp cho OTP flow
  authIsLoading,
  authError,
  clearAuthError,
  contextLogin // Nhận hàm login từ context
}) {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Account Details', 'OTP Verification'];
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", otp: "" });
  const [formErrors, setFormErrors] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", otp: "" });
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState({ register: false, verifyOtp: false, resendOtp: false });

  const handleChange = (e) => { e.stopPropagation(); const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: "" })); };
  const handleTogglePassword = (e) => { e.stopPropagation(); setShowPassword(!showPassword); };
  const handleToggleConfirmPassword = (e) => { e.stopPropagation(); setShowConfirmPassword(!showConfirmPassword); };

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
        setStatusMessage("Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra (cả thư mục spam).");
        setMessageType("success");
      } catch (err) {
        setStatusMessage(err.response?.data?.message || err.message || "Đăng ký thất bại. Vui lòng thử lại.");
        setMessageType("error");
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
        setStatusMessage("Xác thực tài khoản thành công! Đang đăng nhập...");
        setMessageType("success");
        await contextLogin({ email: formData.email, password: formData.password });
        // AuthContext sẽ tự xử lý việc đóng modal nếu login thành công
      } catch (err) {
        setStatusMessage(err.response?.data?.message || err.message || "Xác thực OTP thất bại. Vui lòng thử lại.");
        setMessageType("error");
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
      setStatusMessage("Mã OTP mới đã được gửi. Vui lòng kiểm tra email.");
      setMessageType("success");
    } catch (err) {
      setStatusMessage(err.response?.data?.message || err.message || "Gửi lại OTP thất bại.");
      setMessageType("error");
    } finally {
      setActionLoading(prev => ({ ...prev, resendOtp: false }));
    }
  };

  const handleBackToDetails = () => { setActiveStep(0); setStatusMessage(""); clearAuthError(); setFormErrors({}); };
  const handleGoogleSignUp = (e) => { e.stopPropagation(); window.location.href = `${BACKEND_URL}/oauth2/authorization/google`; };
  const handleGitHubSignUp = (e) => { e.stopPropagation(); window.location.href = `${BACKEND_URL}/oauth2/authorization/github`; };

  return (
    <Card sx={{ width: "100%", mx: "auto", boxShadow: 0 }} onClick={(e) => e.stopPropagation()}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h5" component="h1" gutterBottom align="center" fontWeight="bold">Create an Account</Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>Sign up to get started</Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (<Step key={label}><StepLabel>{label}</StepLabel></Step>))}
        </Stepper>

        {authError && activeStep === 0 && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={clearAuthError}>{authError}</Alert>
        )}
        {statusMessage && (
          <Alert severity={messageType || "info"} sx={{ mb: 2 }} onClose={() => { setStatusMessage(""); setMessageType(""); }}>{statusMessage}</Alert>
        )}

        {activeStep === 0 ? (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <Button fullWidth variant="outlined" startIcon={<Google />} onClick={handleGoogleSignUp} sx={{ py: 1.2, justifyContent: 'center' }} disabled={actionLoading.register || authIsLoading}>
                Google
              </Button>
              <Button fullWidth variant="outlined" startIcon={<Github />} onClick={handleGitHubSignUp} sx={{ py: 1.2, justifyContent: 'center', borderColor: 'rgba(0, 0, 0, 0.23)', color: 'inherit' }} disabled={actionLoading.register || authIsLoading}>
                GitHub
              </Button>
            </Stack>
            <Divider sx={{ my: 3 }}>OR</Divider>
            <form onSubmit={handleRegisterSubmit} onClick={(e) => e.stopPropagation()}>
              <Stack spacing={2}>
                <TextField label="First Name" variant="outlined" fullWidth name="firstName" value={formData.firstName} onChange={handleChange} error={!!formErrors.firstName} helperText={formErrors.firstName} disabled={actionLoading.register || authIsLoading} />
                <TextField label="Last Name" variant="outlined" fullWidth name="lastName" value={formData.lastName} onChange={handleChange} error={!!formErrors.lastName} helperText={formErrors.lastName} disabled={actionLoading.register || authIsLoading} />
                <TextField label="Email Address" variant="outlined" fullWidth type="email" name="email" value={formData.email} onChange={handleChange} error={!!formErrors.email} helperText={formErrors.email} disabled={actionLoading.register || authIsLoading} />
                <TextField
                  label="Password" variant="outlined" fullWidth type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} error={!!formErrors.password} helperText={formErrors.password} disabled={actionLoading.register || authIsLoading}
                  InputProps={{
                    endAdornment: (<InputAdornment position="end"><IconButton onClick={handleTogglePassword} edge="end" disabled={actionLoading.register || authIsLoading}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>),
                  }}
                />
                <TextField
                  label="Confirm Password" variant="outlined" fullWidth type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} error={!!formErrors.confirmPassword} helperText={formErrors.confirmPassword} disabled={actionLoading.register || authIsLoading}
                  InputProps={{
                    endAdornment: (<InputAdornment position="end"><IconButton onClick={handleToggleConfirmPassword} edge="end" disabled={actionLoading.register || authIsLoading}>{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>),
                  }}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={actionLoading.register || authIsLoading} sx={{ py: 1.5, mt: 1 }}>
                  {actionLoading.register || authIsLoading ? <CircularProgress size={24} color="inherit" /> : "Continue"}
                </Button>
              </Stack>
            </form>
          </>
        ) : (
          <form onSubmit={handleVerifyOtp} onClick={(e) => e.stopPropagation()}>
            <Stack spacing={2.5}>
              <Typography variant="body1" align="center" sx={{ mb: 1 }}>Enter the verification code sent to:</Typography>
              <Typography variant="body1" align="center" fontWeight="bold" sx={{ mb: 2 }}>{formData.email}</Typography>
              <TextField label="Verification Code" variant="outlined" fullWidth name="otp" value={formData.otp} onChange={handleChange} error={!!formErrors.otp} helperText={formErrors.otp} placeholder="Enter 6-digit code" disabled={actionLoading.verifyOtp || authIsLoading} inputProps={{ maxLength: 6 }} />
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="outlined" color="primary" fullWidth onClick={handleBackToDetails} disabled={actionLoading.verifyOtp || actionLoading.resendOtp || authIsLoading}>Back</Button>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={actionLoading.verifyOtp || authIsLoading}>
                  {actionLoading.verifyOtp || authIsLoading ? <CircularProgress size={24} color="inherit" /> : "Verify Account"}
                </Button>
              </Stack>
              <Button color="primary" onClick={handleResendOtp} disabled={actionLoading.resendOtp || actionLoading.verifyOtp || authIsLoading} sx={{ mt: 1, textTransform: 'none' }}>
                {actionLoading.resendOtp ? "Sending..." : "Resend Verification Code"}
              </Button>
            </Stack>
          </form>
        )}
        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Already have an account?{" "}
          <Button onClick={(e) => { e.stopPropagation(); toggleForm(); }} sx={{ textTransform: 'none', fontWeight: 'bold' }} color="primary" disabled={actionLoading.register || actionLoading.verifyOtp || actionLoading.resendOtp || authIsLoading}>
            Sign In Now
          </Button>
        </Typography>
      </CardContent>
    </Card>
  );
}
RegisterForm.propTypes = {
  handleClose: PropTypes.func.isRequired,
  toggleForm: PropTypes.func.isRequired,
  authIsLoading: PropTypes.bool,
  authError: PropTypes.string,
  clearAuthError: PropTypes.func.isRequired,
  contextLogin: PropTypes.func.isRequired,
};

export default AuthForms;