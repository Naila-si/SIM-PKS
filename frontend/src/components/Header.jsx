import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Header = () => {
  const { user } = useAuth();

  const roleLabels = {
    petugas_jr: 'PETUGAS JR',
    pengelola_pks: 'PENGELOLA PKS',
    kabag: 'KEPALA BAGIAN (KABAG)',
    pimpinan: 'PIMPINAN KANWIL',
    admin_utama: 'ADMINISTRATOR UTAMA',
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between font-sans sticky top-0 z-10 shadow-2xs">
      {/* Search Input Box */}
      <div className="relative w-80 max-w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari nomor PKS atau instansi..."
          className="w-full bg-[#F1F5F9] text-xs text-slate-700 pl-9 pr-4 py-2 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400 font-medium"
        />
      </div>

      {/* Right User Control Bar */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell Icon */}
        <Link
          to="/notifications"
          className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Notifikasi"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </Link>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Card */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {user?.nama || 'User'}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
              {roleLabels[user?.role] || user?.role?.replace('_', ' ') || 'PETUGAS JR'}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 shrink-0 uppercase">
            {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
