import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Landing from '../pages/Landing';
import AdminDashboard from '../pages/AdminDashboard';
import TechnicianDashboard from '../pages/TechnicianDashboard';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center font-sans uppercase">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black text-slate-400 tracking-[0.2em]">Synchronizing State</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  // If children are provided, render them (Wrapper Mode)
  if (children) {
    return children;
  }

  // Legacy/Default Mode: Role-based dashboard routing
  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'TECHNICIAN':
      return <TechnicianDashboard />;
    case 'USER':
    default:
      return <Landing />;
  }
};

export default ProtectedRoute;
