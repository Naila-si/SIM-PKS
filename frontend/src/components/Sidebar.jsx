import React, { useState } from 'react';
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
  
  // Default isCollapsed true (mode ringkas w-20)
  // Ketika kursor masuk (onMouseEnter) -> terbuka (w-64)
  // Ketika kursor keluar (onMouseLeave) -> tertutup kembali (w-20)
  const [isCollapsed, setIsCollapsed] = useState(true);

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
  const isPetugas = role === 'petugas_jr';

  // Badge counters config
  const unreadNotifCount = 12;
  const approvalPendingCount = 3;
  const revisionCount = 2;

  return (
    <aside
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={`bg-white border-r border-slate-200 h-screen sticky top-0 overflow-y-auto flex flex-col justify-between shrink-0 font-sans z-30 transition-all duration-300 ease-in-out shadow-xs ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`p-4 space-y-6 ${isCollapsed ? 'px-3' : 'p-5'}`}>
        
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-[#00529C] text-white flex items-center justify-center font-extrabold text-lg shadow-xs shrink-0">
            JR
          </div>
          <div className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 block'}`}>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight whitespace-nowrap">
              JASA RAHARJA
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase whitespace-nowrap">
              A Member of IFG
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          
          {/* 1. Dashboard */}
          <Link
            to="/dashboard"
            title="Dashboard"
            className={`group relative flex items-center rounded-xl text-xs font-semibold transition-all ${
              isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'
            } ${
              isActive('/dashboard')
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Dashboard</span>}

            {/* Floating Tooltip in Collapsed Mode */}
            {isCollapsed && (
              <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#0F2238] text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                Dashboard
              </div>
            )}
          </Link>

          {/* 2. Manajemen PKS */}
          <Link
            to="/pks"
            title="Manajemen PKS"
            className={`group relative flex items-center rounded-xl text-xs font-semibold transition-all ${
              isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'
            } ${
              isActive('/pks')
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Manajemen PKS</span>}

            {/* Floating Tooltip in Collapsed Mode */}
            {isCollapsed && (
              <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#0F2238] text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                Manajemen PKS
              </div>
            )}
          </Link>

          {/* 3. Manajemen Perusahaan */}
          <Link
            to="/mitra"
            title="Manajemen Perusahaan"
            className={`group relative flex items-center rounded-xl text-xs font-semibold transition-all ${
              isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'
            } ${
              isActive('/mitra')
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Manajemen Perusahaan</span>}

            {/* Floating Tooltip in Collapsed Mode */}
            {isCollapsed && (
              <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#0F2238] text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                Manajemen Perusahaan
              </div>
            )}
          </Link>

          {/* 4. Manajemen Template PKS (Pengelola PKS & Admin Utama) */}
          {(isPengelola || isAdminUtama) && (
            <Link
              to="/templates"
              title="Manajemen Template PKS"
              className={`group relative flex items-center rounded-xl text-xs font-semibold transition-all ${
                isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'
              } ${
                isActive('/templates') || isActive('/template')
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Manajemen Template PKS</span>}

              {/* Floating Tooltip in Collapsed Mode */}
              {isCollapsed && (
                <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#0F2238] text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                  Manajemen Template PKS
                </div>
              )}
            </Link>
          )}

          {/* 5. Persetujuan PKS (Badge Counter) */}
          <Link
            to="/approval"
            title="Persetujuan PKS"
            className={`group relative flex items-center justify-between rounded-xl text-xs font-semibold transition-all ${
              isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5'
            } ${
              isActive('/approval')
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <CheckSquare className="w-4 h-4 shrink-0" />
                {/* Badge Dot in Collapsed Mode */}
                {isCollapsed && (
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                    isPetugas ? 'bg-amber-500' : 'bg-[#00529C]'
                  }`} />
                )}
              </div>
              {!isCollapsed && <span className="truncate">Persetujuan PKS</span>}
            </div>

            {/* Badge Counter in Expanded Mode */}
            {!isCollapsed && (
              isPetugas ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-2xs">
                  {revisionCount}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00529C] text-white shadow-2xs">
                  {approvalPendingCount}
                </span>
              )
            )}

            {/* Floating Tooltip in Collapsed Mode */}
            {isCollapsed && (
              <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#0F2238] text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] flex items-center space-x-2">
                <span>Persetujuan PKS</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isPetugas ? 'bg-amber-500 text-white' : 'bg-[#00529C] text-white'
                }`}>
                  {isPetugas ? `${revisionCount} Revisi` : `${approvalPendingCount} Pending`}
                </span>
              </div>
            )}
          </Link>

          <div className="pt-3 pb-2">
            <div className="border-t border-slate-100" />
          </div>

          {/* 6. Notifikasi (Badge Counter Merah) */}
          <Link
            to="/notifications"
            title="Notifikasi"
            className={`group relative flex items-center justify-between rounded-xl text-xs font-semibold transition-all ${
              isCollapsed ? 'justify-center p-3' : 'px-3.5 py-2.5'
            } ${
              isActive('/notifications')
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-4 h-4 shrink-0" />
                {/* Red Badge Dot in Collapsed Mode */}
                {isCollapsed && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </div>
              {!isCollapsed && <span className="truncate">Notifikasi</span>}
            </div>

            {/* Red Badge Counter in Expanded Mode */}
            {!isCollapsed && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white shadow-2xs">
                {unreadNotifCount}
              </span>
            )}

            {/* Floating Tooltip in Collapsed Mode */}
            {isCollapsed && (
              <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#0F2238] text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] flex items-center space-x-2">
                <span>Notifikasi</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {unreadNotifCount}
                </span>
              </div>
            )}
          </Link>

          {/* 7. Riwayat */}
          <Link
            to="/riwayat"
            title="Riwayat"
            className={`group relative flex items-center rounded-xl text-xs font-semibold transition-all ${
              isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'
            } ${
              isActive('/riwayat')
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Riwayat</span>}

            {/* Floating Tooltip in Collapsed Mode */}
            {isCollapsed && (
              <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#0F2238] text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                Riwayat
              </div>
            )}
          </Link>

          {/* 8. Manajemen Pengguna (Administrator Utama) */}
          {isAdminUtama && (
            <Link
              to="/pengguna"
              title="Manajemen Pengguna"
              className={`group relative flex items-center rounded-xl text-xs font-semibold transition-all ${
                isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'
              } ${
                isActive('/pengguna') || isActive('/admin/users')
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Manajemen Pengguna</span>}

              {/* Floating Tooltip in Collapsed Mode */}
              {isCollapsed && (
                <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#0F2238] text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
                  Manajemen Pengguna
                </div>
              )}
            </Link>
          )}
        </nav>
      </div>

      {/* Logout Button Footer */}
      <div className={`p-4 border-t border-slate-100 ${isCollapsed ? 'px-3 text-center' : 'p-5'}`}>
        <button
          onClick={handleLogout}
          title="Keluar"
          className={`group relative flex items-center w-full rounded-xl text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center py-2.5' : 'space-x-3 px-3.5 py-2.5'
          }`}
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 shrink-0" />
          {!isCollapsed && <span className="truncate">Keluar</span>}

          {/* Floating Tooltip in Collapsed Mode */}
          {isCollapsed && (
            <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#0F2238] text-white text-xs font-bold rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100]">
              Keluar
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
