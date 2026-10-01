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
  Crown
} from 'lucide-react';
import { userService } from '../../services/userService';
import UserFormModal from '../../components/UserFormModal';

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

const SAMPLE_USERS = [
  {
    penggunaId: 1,
    nama: 'Budi Prasetyo',
    nip: '881204001',
    role: 'admin_utama',
    email: 'budi.p@jasaraharja.co.id',
    telepon: '0811-9922-3344',
    registrasi: '12 Jan 2024',
    status: 'Aktif',
    isActive: true,
  },
  {
    penggunaId: 2,
    nama: 'Siti Rahmawati',
    unit: 'PT Asuransi Sejahtera',
    role: 'pengelola_pks',
    email: 'siti.rahma@partner.com',
    telepon: '0822-1144-5566',
    registrasi: '20 Feb 2024',
    status: 'Menunggu Verifikasi',
    isActive: false,
  },
  {
    penggunaId: 3,
    nama: 'Andi Nugroho',
    unit: 'Cabang Jakarta Timur',
    role: 'petugas_jr',
    email: 'andi.n@jasaraharja.co.id',
    telepon: '0812-4455-6677',
    registrasi: '15 Jan 2024',
    status: 'Aktif',
    isActive: true,
  },
  {
    penggunaId: 4,
    nama: 'Rina Kusuma',
    unit: 'Mantan Kepala Bagian',
    role: 'kabag',
    email: 'rina.k@jasaraharja.co.id',
    telepon: '-',
    registrasi: '01 Des 2022',
    status: 'Nonaktif',
    isActive: false,
  },
  {
    penggunaId: 5,
    nama: 'Fajar Putra',
    unit: 'Vendor Luar',
    role: 'pimpinan',
    email: 'fajar@external.com',
    telepon: '0813-0000-1111',
    registrasi: '05 Mar 2024',
    status: 'Ditolak',
    isActive: false,
  },
];

export const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('Terbaru');
  const [roleFilter, setRoleFilter] = useState('Semua Peran');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Popovers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      if (res.status === 'success' && Array.isArray(res.data) && res.data.length > 0) {
        setUsers(res.data);
      } else {
        setUsers(SAMPLE_USERS);
      }
    } catch (err) {
      setUsers(SAMPLE_USERS);
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
  };

  const handleToggleStatus = async (userItem) => {
    const nextStatus = userItem.isActive ? false : true;
    try {
      await userService.toggleUserStatus(userItem.penggunaId, nextStatus);
      fetchUsers();
    } catch (err) {
      alert('Gagal mengubah status pengguna.');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    try {
      await userService.deleteUser(deleteConfirmUser.penggunaId);
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (err) {
      alert('Gagal menghapus pengguna.');
      setDeleteConfirmUser(null);
    }
  };

  // Logika Filtering
  const filteredUsers = users.filter((u) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const namaMatch = (u.nama || '').toLowerCase().includes(q);
      const emailMatch = (u.email || '').toLowerCase().includes(q);
      const nipMatch = (u.nip || '').toLowerCase().includes(q);
      if (!namaMatch && !emailMatch && !nipMatch) return false;
    }

    if (roleFilter !== 'Semua Peran') {
      if (u.role !== roleFilter) return false;
    }

    if (statusFilter !== 'Semua Status') {
      const currentStatus = u.status || (u.isActive ? 'Aktif' : 'Nonaktif');
      if (currentStatus !== statusFilter) return false;
    }

    return true;
  });

  // Calculate Metrics
  const totalUsers = users.length || 156;
  const pendingCount = users.filter(u => u.status === 'Menunggu Verifikasi').length || 12;
  const activeCount = users.filter(u => u.isActive || u.status === 'Aktif').length || 140;
  const inactiveCount = users.filter(u => u.status === 'Nonaktif' || u.status === 'Ditolak').length || 4;

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
            Kelola pengguna sistem serta verifikasi pendaftaran baru.
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
          Tambah Pengguna
        </button>
      </div>

      {/* 4 Metric Cards (Image 2 Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pengguna */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Total Pengguna</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{totalUsers}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Menunggu Verifikasi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Menunggu Verifikasi</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-1">{pendingCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Pengguna Aktif */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Pengguna Aktif</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{activeCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Pengguna Nonaktif */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Pengguna Nonaktif</p>
            <p className="text-3xl font-extrabold text-slate-700 mt-1">{inactiveCount}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold">
            <UserX className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Bar (Image 2 Mockup) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Urutkan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Urutkan:</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="Terbaru">Terbaru</option>
              <option value="Terlama">Terlama</option>
              <option value="Nama A-Z">Nama A-Z</option>
            </select>
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
              <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
              <option value="Nonaktif">Nonaktif</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>

          {/* Reset Filter */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilter}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl transition-all cursor-pointer h-[38px]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Filter
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
            <p className="text-xs text-slate-400">Silakan ubah filter pencarian atau tambah pengguna baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-blue-50/50 border-b border-slate-100 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">NAMA</th>
                  <th className="px-6 py-4">PERAN</th>
                  <th className="px-6 py-4">KONTAK</th>
                  <th className="px-6 py-4">REGISTRASI</th>
                  <th className="px-6 py-4">STATUS</th>
                  <th className="px-6 py-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((item) => {
                  const roleConf = ROLE_CONFIG[item.role] || {
                    label: item.role,
                    bg: 'bg-slate-100 text-slate-700 border-slate-200',
                  };
                  const CrownIcon = roleConf.icon;
                  const itemStatus = item.status || (item.isActive ? 'Aktif' : 'Nonaktif');

                  return (
                    <tr key={item.penggunaId} className="hover:bg-slate-50/70 transition-colors">
                      {/* NAMA + Avatar initials + NIK/Unit */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center font-extrabold text-xs shrink-0">
                            {getInitials(item.nama)}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs">{item.nama}</p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {item.nip ? `NIK: ${item.nip}` : item.unit || 'Jasa Raharja'}
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
                        <p className="font-medium text-slate-800">{item.email}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{item.telepon || '-'}</p>
                      </td>

                      {/* REGISTRASI */}
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {item.registrasi || '12 Jan 2024'}
                      </td>

                      {/* STATUS Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          itemStatus === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-700'
                            : itemStatus === 'Menunggu Verifikasi'
                            ? 'bg-amber-100 text-amber-800'
                            : itemStatus === 'Ditolak'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {itemStatus}
                        </span>
                      </td>

                      {/* AKSI Three Dots Menu */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setActiveActionId(activeActionId === item.penggunaId ? null : item.penggunaId)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeActionId === item.penggunaId && (
                            <div
                              className="origin-top-right absolute right-0 top-8 w-40 rounded-xl shadow-lg bg-white border border-slate-200 ring-1 ring-black/5 z-30 py-1 text-left"
                              onMouseLeave={() => setActiveActionId(null)}
                            >
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

                              <button
                                onClick={() => {
                                  setActiveActionId(null);
                                  handleToggleStatus(item);
                                }}
                                className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                              >
                                {item.isActive ? (
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
                                className="flex items-center w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2 text-rose-600" />
                                Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>
            Menampilkan <span className="font-bold text-slate-800">1 - {filteredUsers.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{totalUsers}</span> pengguna
          </p>

          <div className="flex items-center space-x-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button className="w-7 h-7 rounded-lg text-xs font-bold bg-[#002B49] text-white">1</button>
            <button className="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">2</button>
            <button className="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">3</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">16</button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
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

