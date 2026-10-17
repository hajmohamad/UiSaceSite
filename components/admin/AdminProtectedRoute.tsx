import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getMe, removeSession } from '../../services/adminApi';

const AdminProtectedRoute: React.FC = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      setIsVerifying(false);
      setIsValid(false);
      return;
    }

    // Verify token validity with backend
    getMe()
      .then(() => {
        setIsValid(true);
      })
      .catch(() => {
        removeSession();
        setIsValid(false);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-300 font-medium">در حال بررسی دسترسی مدیریت...</p>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
