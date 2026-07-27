import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../store/user/AuthContext';
import AuthForms from './AuthForm';

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        window.location.href = '/admin';
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleClose = () => {
    if (user?.role === 'ADMIN') {
      window.location.href = '/admin';
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <AuthForms handleClose={handleClose} />
      </div>
    </div>
  );
};

export default LoginPage;
