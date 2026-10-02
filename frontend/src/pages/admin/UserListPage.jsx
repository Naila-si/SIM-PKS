import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  UserPlus,
  Search,
  RotateCcw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Crown,
  Check,
  X,
  Eye
} from 'lucide-react';
import { authService } from '../../services/authService';
import UserFormModal from '../../components/UserFormModal';
import UserDetailModal from '../../components/UserDetailModal';

const ROLE_CONFIG = {
  admin_utama: {
    label: 'Administrator Utama',
    bg: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Crown,
  },
  pengelola_pks: {
    label: 'Pengelola PKS',
    bg: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: null,
  },
  petugas_jr: {
    label: 'Petugas JR',
    bg: 'bg-sky-100 text-sky-800 border-sky-200',
    icon: null,
  },
  kabag: {
    label: 'Kepala Bagian',
    bg: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: null,
  },
  pimpinan: {
    label: 'Pimpinan',
    bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: null,
  },
};

export const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'active'
  const [sortOrder, setSortOrder] = useState('Terbaru');
  const [roleFilter, setRoleFilter] = useState('Semua Peran');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Popovers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDetailUser, setSelectedDetailUser] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authService.getAllUsers();
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleResetFilter = () => {
    setSortOrder('Terbaru');
    setRoleFilter('Semua Peran');
    setStatusFilter('Semua Status');
    setSearchQuery('');
    setActiveTab('all');
  };

  const handleApprove = async (penggunaId) => {
    try {
      await authService.approveUser(penggunaId);
      fetchUsers();
    } catch (err) {
      alert('Gagal menyetujui pengguna.');
    }
  };

  const handleReject = async (penggunaId) => {
    try {
      await authService.rejectUser(penggunaId);
      fetchUsers();
    } catch (err) {
      alert('Gagal menolak pengguna.');
    }
  };

  const handleToggleStatus = async (userItem) => {
    try {
      await authService.toggleUserStatus(userItem.penggunaId);
      fetchUsers();
    } catch (err) {
      alert('Gagal mengubah status pengguna.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    try {
      await authService.deleteUser(deleteConfirmUser.penggunaId);
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (err) {
      alert('Gagal menghapus pengguna.');
      setDeleteConfirmUser(null);
    }
  };

  // Metrics calculation
  const totalUsers = users.length;
  const pendingCount = users.filter((u) => u.status === 'Menunggu Persetujuan' || u.status === 'Menunggu Verifikasi').length;
  const activeCount = users.filter((u) => u.status === 'Aktif').length;
  const inactiveCount = users.filter((u) => u.status === 'Nonaktif' || u.status === 'Ditolak').length;

  // Filtering Logic
  const filteredUsers = users.filter((u) => {
    // Tab filtering
    if (activeTab === 'pending') {
      if (u.status !== 'Menunggu Persetujuan' && u.status !== 'Menunggu Verifikasi') return false;
    } else if (activeTab === 'active') {
      if (u.status !== 'Aktif') return false;
    }

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const namaMatch = (u.nama || '').toLowerCase().includes(q);
      const emailMatch = (u.email || '').toLowerCase().includes(q);
      if (!namaMatch && !emailMatch) return false;
    }

    // Role filter
    if (roleFilter !== 'Semua Peran') {
      if (u.role !== roleFilter) return false;
    }

    // Status filter
    if (statusFilter !== 'Semua Status') {
      const uStatus = u.status || (u.isActive ? 'Aktif' : 'Nonaktif');
      if (uStatus !== statusFilter) return false;
    }

    return true;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Pengguna</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola pengguna sistem, verifikasi pendaftaran baru, dan atur hak akses pengguna.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Pengguna Baru
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pengguna */}
        <div
          onClick={() => setActiveTab('all')}
          className={`bg-white rounded-2xl p-5 border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === 'all' ? 'ring-2 ring-[#002B49] border-transparent' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400">Total Pengguna</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalUsers}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Menunggu Persetujuan */}
        <div
          onClick={() => setActiveTab('pending')}
          className={`bg-white rounded-2xl p-5 border shadow-2xs flex items-center justify-between cursor-pointer transition-all relative ${
            activeTab === 'pending' ? 'ring-2 ring-amber-500 border-transparent' : 'border-slate-200 hover:border-amber-300'
          }`}
        >
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-bounce shadow-xs">
              {pendingCount} Pengajuan
            </span>
          )}
          <div>
            <p className="text-xs font-bold text-slate-400">Menunggu Persetujuan</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-1">{pendingCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Pengguna Aktif */}
        <div
          onClick={() => setActiveTab('active')}
          className={`bg-white rounded-2xl p-5 border shadow-2xs flex items-center justify-between cursor-pointer transition-all ${
            activeTab === 'active' ? 'ring-2 ring-emerald-600 border-transparent' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <p className="text-xs font-bold text-slate-400">Pengguna Aktif</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{activeCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Pengguna Nonaktif / Ditolak */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Nonaktif / Ditolak</p>
            <p className="text-3xl font-extrabold text-slate-700 mt-1">{inactiveCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4">
        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 space-x-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'all' ? 'text-[#002B49]' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua Pengguna ({totalUsers})
            {activeTab === 'all' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#002B49] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'pending' ? 'text-amber-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Menunggu Persetujuan</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-extrabold">
                {pendingCount}
              </span>
            )}
            {activeTab === 'pending' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === 'active' ? 'text-emerald-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Pengguna Aktif ({activeCount})
            {activeTab === 'active' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600 rounded-full" />
            )}
          </button>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Cari Pengguna:</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama, email, NIP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Peran */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Peran:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="Semua Peran">Semua Peran</option>
              <option value="admin_utama">Administrator Utama</option>
              <option value="pengelola_pks">Pengelola PKS</option>
              <option value="petugas_jr">Petugas JR</option>
              <option value="kabag">Kepala Bagian</option>
              <option value="pimpinan">Pimpinan</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
              <option value="Nonaktif">Nonaktif</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          {/* Reset Filter */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilter}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl transition-all cursor-pointer h-[38px]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Users Data Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat data pengguna...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak Ada Data Pengguna</p>
            <p className="text-xs text-slate-400">Silakan ubah filter pencarian atau pilih tab yang lain.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-blue-50/50 border-b border-slate-100 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">NAMA & DETAIL</th>
                  <th className="px-6 py-4">PERAN</th>
                  <th className="px-6 py-4">KONTAK</th>
                  <th className="px-6 py-4">WILAYAH / BIDANG</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-center">AKSI / SETUJUI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((item) => {
                  const roleConf = ROLE_CONFIG[item.role] || {
                    label: item.jabatan || item.role,
                    bg: 'bg-slate-100 text-slate-700 border-slate-200',
                  };
                  const CrownIcon = roleConf.icon;
                  const itemStatus = item.status || (item.isActive ? 'Aktif' : 'Nonaktif');
                  const isPending = itemStatus === 'Menunggu Persetujuan' || itemStatus === 'Menunggu Verifikasi';

                  return (
                    <tr key={item.penggunaId} className={`hover:bg-slate-50/70 transition-colors ${isPending ? 'bg-amber-50/20' : ''}`}>
                      {/* NAMA + Avatar initials */}
                      <td className="px-6 py-4">
                        <div
                          onClick={() => setSelectedDetailUser(item)}
                          className="flex items-center space-x-3 cursor-pointer group"
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 transition-transform group-hover:scale-105 ${
                            isPending ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                          }`}>
                            {getInitials(item.nama)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs group-hover:text-blue-600 transition-colors">{item.nama}</p>
                            <p className="text-[10px] text-slate-500 font-medium">
                              {item.jabatan || 'Pengguna System'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PERAN Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold border ${roleConf.bg}`}>
                          {CrownIcon && <CrownIcon className="w-3.5 h-3.5 mr-1 text-amber-500" />}
                          {roleConf.label}
                        </span>
                      </td>

                      {/* KONTAK */}
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{item.email}</p>
                        {!['admin_utama', 'kabag', 'pimpinan'].includes(item.role) && (
                          <p className="text-[11px] text-slate-400 font-normal">{item.nomorHp || item.telepon || '-'}</p>
                        )}
                      </td>

                      {/* WILAYAH / BIDANG */}
                      <td className="px-6 py-4 text-slate-700">
                        {item.role === 'petugas_jr' ? (
                          <div>
                            <p className="font-bold text-xs text-slate-800">{item.wilayah || 'Wilayah Riau'}</p>
                            <p className="text-[10px] text-slate-500">{item.samsat || '-'}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-xs text-slate-800">{item.bidang || 'Lintas Bidang'}</p>
                            <p className="text-[10px] text-slate-500">{item.unitKerja || 'Kantor Wilayah'}</p>
                          </div>
                        )}
                      </td>

                      {/* STATUS Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          itemStatus === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse'
                            : itemStatus === 'Ditolak'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {itemStatus}
                        </span>
                      </td>

                      {/* AKSI Quick Buttons & Three Dots */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {isPending ? (
                            <>
                              <button
                                onClick={() => handleApprove(item.penggunaId)}
                                className="inline-flex items-center px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                                title="Setujui Pengguna Ini"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Setujui
                              </button>
                              <button
                                onClick={() => handleReject(item.penggunaId)}
                                className="inline-flex items-center px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                                title="Tolak Pengajuan"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : null}

                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setActiveActionId(activeActionId === item.penggunaId ? null : item.penggunaId)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeActionId === item.penggunaId && (
                              <div
                                className="origin-top-right absolute right-0 top-8 w-44 rounded-xl shadow-lg bg-white border border-slate-200 ring-1 ring-black/5 z-30 py-1 text-left"
                                onMouseLeave={() => setActiveActionId(null)}
                              >
                                {/* Detail option */}
                                <button
                                  onClick={() => {
                                    setActiveActionId(null);
                                    setSelectedDetailUser(item);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-2 text-sky-600" />
                                  Detail Pengguna
                                </button>

                                {/* Edit option (Always available) */}
                                <button
                                  onClick={() => {
                                    setActiveActionId(null);
                                    setSelectedUser(item);
                                    setIsModalOpen(true);
                                  }}
                                  className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5 mr-2 text-blue-600" />
                                  Edit Pengguna
                                </button>

                                {/* Options for Non-Preset Users Only */}
                                {!['admin_utama', 'kabag', 'pimpinan'].includes(item.role) && (
                                  <>
                                    {isPending && (
                                      <>
                                        <button
                                          onClick={() => {
                                            setActiveActionId(null);
                                            handleApprove(item.penggunaId);
                                          }}
                                          className="flex items-center w-full px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 font-medium cursor-pointer"
                                        >
                                          <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                                          Setujui Akun
                                        </button>

                                        <button
                                          onClick={() => {
                                            setActiveActionId(null);
                                            handleReject(item.penggunaId);
                                          }}
                                          className="flex items-center w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                                        >
                                          <XCircle className="w-3.5 h-3.5 mr-2 text-rose-600" />
                                          Tolak Akun
                                        </button>
                                      </>
                                    )}

                                    <button
                                      onClick={() => {
                                        setActiveActionId(null);
                                        handleToggleStatus(item);
                                      }}
                                      className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                                    >
                                      {itemStatus === 'Aktif' ? (
                                        <>
                                          <XCircle className="w-3.5 h-3.5 mr-2 text-amber-600" />
                                          Nonaktifkan
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                                          Aktifkan
                                        </>
                                      )}
                                    </button>

                                    <button
                                      onClick={() => {
                                        setActiveActionId(null);
                                        setDeleteConfirmUser(item);
                                      }}
                                      className="flex items-center w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium cursor-pointer border-t border-slate-100"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-600" />
                                      Hapus
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>
            Menampilkan <span className="font-bold text-slate-800">{filteredUsers.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{totalUsers}</span> pengguna terdaftar
          </p>
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedDetailUser && (
        <UserDetailModal
          isOpen={!!selectedDetailUser}
          user={selectedDetailUser}
          onClose={() => setSelectedDetailUser(null)}
          onEdit={(u) => {
            setSelectedUser(u);
            setIsModalOpen(true);
          }}
        />
      )}

      {/* User Form Modal */}
      {isModalOpen && (
        <UserFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          userToEdit={selectedUser}
          onSuccess={() => fetchUsers()}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-sm font-extrabold text-slate-900">Konfirmasi Hapus Pengguna</h3>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus akun <strong>{deleteConfirmUser.nama}</strong> ({deleteConfirmUser.email})?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListPage;


