import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Building2, Layers, CheckSquare,
  Bell, History, Users, LogOut
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/pks' && (location.pathname === '/pks' || location.pathname.startsWith('/pks/'))) {
      return location.pathname === '/pks';
    }
    if (path === '/approval') {
      return location.pathname === '/approval' || location.pathname === '/approvals';
    }
    return location.pathname === path;
  };

  const role = user?.role;
  const isPengelola = role === 'pengelola_pks';
  const isAdminUtama = role === 'admin_utama';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col justify-between shrink-0 font-sans z-20">
      <div className="p-5 space-y-6">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-9 h-9 rounded-xl bg-[#00529C] text-white flex items-center justify-center font-extrabold text-lg shadow-xs">
            JR
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
              JASA RAHARJA
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
              A Member of IFG
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {/* 1. Dashboard */}
          <Link
            to="/dashboard"
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/dashboard')
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>

          {/* 2. Manajemen PKS */}
          <Link
            to="/pks"
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/pks')
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Manajemen PKS</span>
          </Link>

          {/* 3. Manajemen Perusahaan */}
          <Link
            to="/mitra"
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/mitra')
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Manajemen Perusahaan</span>
          </Link>

          {/* 4. Manajemen Template PKS (Pengelola PKS & Admin Utama) */}
          {(isPengelola || isAdminUtama) && (
            <Link
              to="/templates"
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive('/templates') || isActive('/template')
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Manajemen Template PKS</span>
            </Link>
          )}

          {/* 5. Persetujuan PKS */}
          <Link
            to="/approval"
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/approval')
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Persetujuan PKS</span>
          </Link>

          <div className="pt-4 pb-2">
            <div className="border-t border-slate-100" />
          </div>

          {/* 6. Notifikasi */}
          <Link
            to="/notifications"
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/notifications')
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifikasi</span>
          </Link>

          {/* 7. Riwayat */}
          <Link
            to="/riwayat"
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/riwayat')
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat</span>
          </Link>

          {/* 8. Manajemen Pengguna (Administrator Utama) */}
          {isAdminUtama && (
            <Link
              to="/pengguna"
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive('/pengguna') || isActive('/admin/users')
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manajemen Pengguna</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-5 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3.5 py-2.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};
