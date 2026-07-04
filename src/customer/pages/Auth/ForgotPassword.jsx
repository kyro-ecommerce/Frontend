// src/pages/Auth/ForgotPassword.jsx
import React, { useState } from "react";
import {
    Button,
    TextField,
    Card,
    CardContent,
    Typography,
    Box,
    InputAdornment,
    IconButton,
    Stack,
    CircularProgress,
    Alert,
    AlertTitle
} from "@mui/material";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PropTypes from "prop-types";
import { authService } from "../../services/auth.service"; // Import the auth service

function ForgotPassword({ onBackToLogin }) {
    const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState({
        sendOtp: false,
        reset: false,
    });
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null); // For success/info messages
    const [apiError, setApiError] = useState(null); // For API errors

    const clearMessages = () => {
        setMessage(null);
        setApiError(null);
        setErrors({});
    };

    // --- Validation ---
    const validateEmail = () => {
        clearMessages();
        if (!email) {
            setErrors({ email: "Email is required" });
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: "Email is invalid" });
            return false;
        }
        setErrors({});
        return true;
    };

    const validateStep2 = () => {
        clearMessages();
        const newErrors = {};
        if (!otp.trim()) {
            newErrors.otp = "OTP is required";
        } else if (!/^\d{6}$/.test(otp.trim())) { // Assuming OTP is 6 digits
            newErrors.otp = "OTP must be 6 digits";
        }
        if (!newPassword) {
            newErrors.newPassword = "New password is required";
        } else if (newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your new password";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // --- Event Handlers ---
    const handleEmailChange = (e) => {
        e.stopPropagation();
        setEmail(e.target.value);
        if (errors.email) setErrors({});
        if (apiError) setApiError(null);
    };

    const handleOtpChange = (e) => {
        e.stopPropagation();
        setOtp(e.target.value);
        if (errors.otp) setErrors(prev => ({ ...prev, otp: null }));
        if (apiError) setApiError(null);
    };

     const handlePasswordChange = (e) => {
        e.stopPropagation();
        const { name, value } = e.target;
        if (name === 'newPassword') setNewPassword(value);
        if (name === 'confirmPassword') setConfirmPassword(value);
        if (errors.newPassword || errors.confirmPassword) {
            setErrors(prev => ({ ...prev, newPassword: null, confirmPassword: null }));
        }
        if (apiError) setApiError(null);
    };


    const handleTogglePassword = (e) => {
        e.stopPropagation();
        setShowPassword(!showPassword);
    };

    const handleToggleConfirmPassword = (e) => {
        e.stopPropagation();
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSendOtp = async (e) => {
      e.preventDefault(); // Ngăn form submit mặc định
      e.stopPropagation(); // Ngăn sự kiện lan ra ngoài form
      console.log("handleSendOtp triggered"); // Thêm log
        if (!validateEmail()) return;

        setLoading(prev => ({ ...prev, sendOtp: true }));
        clearMessages();

        try {
            // Assuming your authService.resendOtp sends the OTP
            const response = await authService.resendOtp(email);
            setMessage(response.data?.message || "OTP sent to your email address. Please check your inbox (and spam folder).");
            setStep(2); // Move to the next step
        } catch (error) {
            console.error("Error sending OTP:", error);
            setApiError(error.response?.data?.message || "Failed to send OTP. Please try again.");
        } finally {
            setLoading(prev => ({ ...prev, sendOtp: false }));
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!validateStep2()) return;

        setLoading(prev => ({ ...prev, reset: true }));
        clearMessages();

        try {
             // IMPORTANT: Use the correct service function based on your API endpoint
             // Option 1: If resetPassword takes email, newPassword, otp
             const response = await authService.resetPassword(email, newPassword, otp);

             // Option 2: If you have a separate verifyOtp step first (adjust logic if needed)
             // await authService.verifyOtp(email, otp); // Verify first
             // const response = await authService.resetPassword(...) // Then reset

            setMessage(response.data?.message || "Password has been reset successfully!");
            // Optionally clear fields or redirect after success
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            // Maybe call onBackToLogin after a delay?
            setTimeout(onBackToLogin, 2000);

        } catch (error) {
            console.error("Error resetting password:", error);
            setApiError(error.response?.data?.message || "Failed to reset password. The OTP might be incorrect or expired.");
        } finally {
            setLoading(prev => ({ ...prev, reset: false }));
        }
    };

    const handleBackClick = (e) => {
        e.stopPropagation();
        if (step === 2) {
            // Go back from step 2 to step 1
            setStep(1);
            clearMessages();
            setOtp("");
            setNewPassword("");
            setConfirmPassword("");
            setErrors({});
        } else {
            // Go back from step 1 to the login form
            onBackToLogin();
        }
    };

    // --- Render Logic ---
    return (
        <Card sx={{ width: "100%", mx: "auto", boxShadow: 0 }} onClick={(e) => e.stopPropagation()}>
            <CardContent sx={{ p: 2 }} onClick={(e) => e.stopPropagation()}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <IconButton onClick={handleBackClick} size="small" sx={{ mr: 1 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" component="h1" fontWeight="bold">
                        {step === 1 ? "Forgot Password" : "Reset Password"}
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                    {step === 1
                        ? "Enter your email address and we'll send you an OTP to reset your password."
                        : `An OTP has been sent to ${email}. Please check your inbox (and spam folder).`}
                </Typography>

                {/* --- Display Messages/Errors --- */}
                {apiError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError(null)}>
                         {apiError}
                    </Alert>
                )}
                {message && !apiError && ( // Only show success message if no API error
                     <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage(null)}>
                        {message}
                    </Alert>
                )}


                {/* --- Step 1: Enter Email --- */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} onClick={(e) => e.stopPropagation()}>
                        <Stack spacing={2.5}>
                            <TextField
                                label="Email Address"
                                variant="outlined"
                                fullWidth
                                type="email"
                                name="email"
                                value={email}
                                onChange={handleEmailChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                placeholder="you@example.com"
                                disabled={loading.sendOtp}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                                inputProps={{
                                    onClick: e => e.stopPropagation(),
                                    onFocus: e => e.stopPropagation(),
                                    onMouseDown: e => e.stopPropagation()
                                }}
                            />
                          <Button
                              type="submit"
                              variant="contained"
                              color="primary"
                              fullWidth
                              disabled={loading.sendOtp}
                              sx={{ py: 1.5 }}
                              // onClick này rất quan trọng
                              onClick={(e) => {
                                  console.log("Button onClick triggered"); // Thêm log để kiểm tra
                                  e.stopPropagation();
                              }}
                          >
                              {loading.sendOtp ? <CircularProgress size={24} color="inherit" /> : "Send OTP"}
                          </Button>
                        </Stack>
                    </form>
                )}

                {/* --- Step 2: Enter OTP & New Password --- */}
                {step === 2 && (
                    <form onSubmit={handleResetPassword} onClick={(e) => e.stopPropagation()}>
                        <Stack spacing={2.5}>
                            {/* OTP Field */}
                            <TextField
                                label="OTP Code"
                                variant="outlined"
                                fullWidth
                                name="otp"
                                value={otp}
                                onChange={handleOtpChange}
                                error={!!errors.otp}
                                helperText={errors.otp}
                                placeholder="Enter 6-digit code"
                                disabled={loading.reset}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                                inputProps={{
                                    maxLength: 6, // Optional: limit length
                                    onClick: e => e.stopPropagation(),
                                    onFocus: e => e.stopPropagation(),
                                    onMouseDown: e => e.stopPropagation()
                                }}
                            />

                            {/* New Password Field */}
                            <TextField
                                label="New Password"
                                variant="outlined"
                                fullWidth
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                value={newPassword}
                                onChange={handlePasswordChange}
                                error={!!errors.newPassword}
                                helperText={errors.newPassword}
                                disabled={loading.reset}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                                inputProps={{
                                    onClick: e => e.stopPropagation(),
                                    onFocus: e => e.stopPropagation(),
                                    onMouseDown: e => e.stopPropagation()
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end" onClick={(e) => e.stopPropagation()}>
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleTogglePassword}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                edge="end"
                                                disabled={loading.reset}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Confirm New Password Field */}
                            <TextField
                                label="Confirm New Password"
                                variant="outlined"
                                fullWidth
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handlePasswordChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                disabled={loading.reset}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                                inputProps={{
                                    onClick: e => e.stopPropagation(),
                                    onFocus: e => e.stopPropagation(),
                                    onMouseDown: e => e.stopPropagation()
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end" onClick={(e) => e.stopPropagation()}>
                                            <IconButton
                                                aria-label="toggle confirm password visibility"
                                                onClick={handleToggleConfirmPassword}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                edge="end"
                                                disabled={loading.reset}
                                            >
                                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={loading.reset}
                                sx={{ py: 1.5, mt: 1 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {loading.reset ? <CircularProgress size={24} color="inherit" /> : "Reset Password"}
                            </Button>
                        </Stack>
                    </form>
                )}

            </CardContent>
        </Card>
    );
}

ForgotPassword.propTypes = {
    onBackToLogin: PropTypes.func.isRequired, // Function to close the dialog/go back
};

export default ForgotPassword;