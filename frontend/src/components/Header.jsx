import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, FileText, Building2, CheckCheck, ArrowRight, X, Clock, UserCheck, AlertTriangle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Search & Dropdown States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(12);

  const searchRef = useRef(null);
  const notifRef = useRef(null);

  const roleLabels = {
    petugas_jr: 'PETUGAS JR',
    pengelola_pks: 'PENGELOLA PKS',
    kabag: 'KEPALA BAGIAN (KABAG)',
    pimpinan: 'PIMPINAN KANWIL',
    admin_utama: 'ADMINISTRATOR UTAMA',
  };

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sample Search Data Pool
  const mockPksData = [
    { id: 101, nomor: 'PKS/2024/001', mitra: 'RSUD Dr. Soetomo', bidang: 'Pelayanan', status: 'Disetujui' },
    { id: 102, nomor: 'PKS/2024/052', mitra: 'PT Astra International', bidang: 'IW', status: 'Menunggu Pimpinan' },
    { id: 103, nomor: 'PKS/2023/118', mitra: 'Bank Mandiri (Persero)', bidang: 'SW', status: 'Disetujui' },
    { id: 104, nomor: 'PKS/2022/902', mitra: 'RS Siloam Karawaci', bidang: 'Pelayanan', status: 'Ditolak' },
    { id: 105, nomor: 'PKS/2023/XI/0892', mitra: 'PT Integritas Nusantara Jaya', bidang: 'Teknologi Informasi', status: 'Draft' },
  ];

  const mockMitraData = [
    { id: 1, nama: 'PT Riau Transport', jenis: 'Perusahaan Angkutan Umum (PO)', status: 'Aktif' },
    { id: 2, nama: 'RSUD Bhayangkara Pusat', jenis: 'Provider Kesehatan', status: 'Aktif' },
    { id: 3, nama: 'PT Integritas Nusantara Jaya', jenis: 'Partner Teknologi', status: 'Aktif' },
  ];

  // Sample Notifications List for Quick Popover
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'PKS menunggu pemeriksaan Anda.',
      time: '10 menit yang lalu',
      type: 'Persetujuan',
      unread: true,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 2,
      title: 'PKS akan berakhir dalam 30 hari.',
      time: '2 jam yang lalu',
      type: 'Masa Berlaku',
      unread: true,
      color: 'bg-amber-100 text-amber-600',
    },
    {
      id: 3,
      title: 'PKS telah berakhir (RS Medika).',
      time: 'Kemarin, 14:20',
      type: 'Berakhir',
      unread: true,
      color: 'bg-rose-100 text-rose-600',
    },
    {
      id: 4,
      title: 'PKS PT Global Transindo disetujui.',
      time: '2 hari yang lalu',
      type: 'Disetujui',
      unread: false,
      color: 'bg-emerald-100 text-emerald-600',
    },
  ]);

  // Filter Search Items
  const filteredPks = searchQuery.trim()
    ? mockPksData.filter(
        (item) =>
          item.nomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.mitra.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredMitra = searchQuery.trim()
    ? mockMitraData.filter((item) =>
        item.nama.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/pks?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between font-sans sticky top-0 z-40 shadow-2xs">
      
      {/* 1. Global Quick Search Input Bar */}
      <div ref={searchRef} className="relative w-80 max-w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          onKeyDown={handleSearchSubmit}
          placeholder="Cari nomor PKS atau instansi..."
          className="w-full bg-[#F1F5F9] text-xs text-slate-700 pl-9 pr-8 py-2 rounded-xl border border-transparent focus:bg-white focus:border-blue-500/40 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium placeholder:text-slate-400"
        />

        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Dropdown Floating Quick Search Results */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150 text-xs">
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Hasil Pencarian
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Tekan Enter untuk cari</span>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
              
              {/* PKS Matches */}
              {filteredPks.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">
                    Dokumen PKS
                  </p>
                  {filteredPks.map((pks) => (
                    <div
                      key={pks.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigate('/pks');
                      }}
                      className="p-2 rounded-xl hover:bg-blue-50/60 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{pks.nomor}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{pks.mitra}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {pks.bidang}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Mitra Matches */}
              {filteredMitra.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">
                    Perusahaan / Mitra
                  </p>
                  {filteredMitra.map((mitra) => (
                    <div
                      key={mitra.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        navigate('/mitra');
                      }}
                      className="p-2 rounded-xl hover:bg-emerald-50/60 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{mitra.nama}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{mitra.jenis}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {mitra.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty Results Case */}
              {filteredPks.length === 0 && filteredMitra.length === 0 && (
                <div className="p-6 text-center text-slate-400 space-y-1">
                  <Search className="w-6 h-6 mx-auto text-slate-300" />
                  <p className="font-semibold text-slate-600 text-xs">Tidak ada hasil untuk "{searchQuery}"</p>
                  <p className="text-[11px]">Coba cari dengan nomor PKS atau kata kunci lain.</p>
                </div>
              )}
            </div>

            {/* Footer Direct Action */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  navigate(`/pks?search=${encodeURIComponent(searchQuery)}`);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center mx-auto cursor-pointer"
              >
                Lihat Semua Hasil Pencarian <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Right User Control Bar & Notification Popover */}
      <div className="flex items-center space-x-4">
        
        {/* Notification Bell Icon & Popover Container */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-extrabold text-[9px] shadow-xs border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notification Quick Popover Dropdown */}
          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150 text-xs">
              
              {/* Header Popover */}
              <div className="p-4 bg-[#001D38] text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-blue-300" />
                  <h3 className="font-extrabold text-xs">Notifikasi Terbaru</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-blue-200 hover:text-white flex items-center cursor-pointer transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1" /> Tandai Dibaca
                </button>
              </div>

              {/* List Notifications */}
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigate('/notifications');
                    }}
                    className={`p-3.5 hover:bg-blue-50/50 cursor-pointer transition-colors flex items-start space-x-3 ${
                      n.unread ? 'bg-blue-50/20' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 ${n.color}`}>
                      <Bell className="w-4 h-4" />
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {n.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{n.time}</span>
                      </div>
                      <p className="font-bold text-slate-900 text-xs leading-snug">{n.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer View All Notifications Link */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-bold text-[#00529C] hover:text-blue-800 flex items-center justify-center cursor-pointer"
                >
                  Lihat Semua Notifikasi <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          )}
        </div>

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
          <div className="w-9 h-9 rounded-full bg-[#0F2238] text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 shrink-0 uppercase shadow-2xs">
            {user?.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </div>

    </header>
  );
};

export default Header;
