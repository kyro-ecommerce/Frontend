import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircularProgress, Typography, Box, Alert } from '@mui/material';
import { useAuthContext } from '../../contexts/AuthContext';
import { saveTokenToLocalStorage } from '../../services/util';

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthTokenAndFetchUser } = useAuthContext();

  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log('OAuthRedirect mounted');
    console.log('Current location:', location);
    console.log('Search params:', location.search);

    const handleOAuthRedirect = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const oauthError = params.get('error');

        console.log('Token from URL:', token);
        console.log('Error from URL:', oauthError);

        if (oauthError) {
          console.error("OAuth error from backend:", oauthError);
          setStatus('error');
          setErrorMessage(`Đăng nhập thất bại: ${oauthError}`);
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (token) {
          console.log('Processing token...');
          setStatus('loading');
          
          try {
            // Lưu token vào localStorage trước
            saveTokenToLocalStorage(token);
            
            if (setAuthTokenAndFetchUser && typeof setAuthTokenAndFetchUser === 'function') {
              console.log('Calling setAuthTokenAndFetchUser...');
              await setAuthTokenAndFetchUser(token);
            } else {
              console.warn('setAuthTokenAndFetchUser not available, using fallback');
            }
            
            setStatus('success');
            console.log('OAuth success, redirecting to home...');
            
            setTimeout(() => {
              navigate('/');
            }, 1500);
            
          } catch (error) {
            console.error("Error processing token:", error);
            setStatus('error');
            setErrorMessage('Có lỗi xảy ra khi xử lý thông tin đăng nhập.');
            setTimeout(() => navigate('/'), 3000);
          }
        } else {
          console.error("No token found in URL");
          setStatus('error');
          setErrorMessage('Không tìm thấy thông tin xác thực.');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error("Unexpected error in handleOAuthRedirect:", error);
        setStatus('error');
        setErrorMessage('Có lỗi không mong muốn xảy ra.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleOAuthRedirect();
  }, [navigate, location.search, setAuthTokenAndFetchUser]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: 3,
        backgroundColor: '#f5f5f5',
      }}
    >
      {status === 'loading' && (
        <>
          <CircularProgress size={60} thickness={4} color="primary" />
          <Typography variant="h6" sx={{ mt: 4, color: 'text.secondary' }}>
            Đang xác thực...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.disabled' }}>
            Vui lòng đợi trong giây lát
          </Typography>
        </>
      )}

      {status === 'success' && (
        <>
          <Alert
            severity="success"
            sx={{ width: '100%', maxWidth: 500, marginTop: 2 }}
          >
            Xác thực thành công! Đang chuyển hướng về trang chủ...
          </Alert>
        </>
      )}

      {status === 'error' && (
        <>
          <Alert
            severity="error"
            sx={{ width: '100%', maxWidth: 500, marginTop: 2 }}
          >
            {errorMessage || 'Đã có lỗi xảy ra.'} Đang chuyển hướng về trang chủ...
          </Alert>
        </>
      )}
    </Box>
  );
};

export default OAuthRedirect;