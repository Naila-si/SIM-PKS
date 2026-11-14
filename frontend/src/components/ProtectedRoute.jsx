import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#00529C] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Memuat SIM PKS...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user?.role || '').toLowerCase();
    const isAllowed = allowedRoles.some((role) => {
      const targetRole = role.toLowerCase();
      // Handle variasi nama role umum (misal admin / admin_utama, pengelola / pengelola_pks)
      if (targetRole === 'admin_utama' && (userRole === 'admin_utama' || userRole === 'admin')) return true;
      if (targetRole === 'pengelola_pks' && (userRole === 'pengelola_pks' || userRole === 'pengelola')) return true;
      if (targetRole === 'petugas_jr' && (userRole === 'petugas_jr' || userRole === 'petugas')) return true;
      return userRole === targetRole;
    });

    if (!isAllowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};
