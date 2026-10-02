import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

const SAMSAT_DATA = {
  'Wilayah Riau': [
    'Samsat Pekanbaru Kota',
    'Samsat Pekanbaru Selatan',
    'Samsat Dumai',
    'Samsat Bengkalis',
    'Samsat Kampar (Bangkinang)',
    'Samsat Indragiri Hulu (Rengat)',
  ],
  'Wilayah Kepri': [
    'Samsat Batam Center',
    'Samsat Batam Batu Ampar',
    'Samsat Tanjungpinang',
    'Samsat Bintan',
    'Samsat Karimun',
  ],
  'Wilayah Sumbar': [
    'Samsat Padang',
    'Samsat Bukittinggi',
    'Samsat Payakumbuh',
    'Samsat Solok',
    'Samsat Pesisir Selatan',
  ],
};

const BIDANG_OPTIONS = [
  'Sumbangan Wajib (SW)',
  'Iuran Wajib (IW)',
  'Pelayanan',
];

const ROLE_OPTIONS = [
  { value: 'petugas_jr', label: 'Petugas JR' },
  { value: 'pengelola_pks', label: 'Pengelola PKS' },
];

const UserFormModal = ({ isOpen, onClose, onSuccess, userToEdit = null }) => {
  const isEdit = !!userToEdit;
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nomorHp: '',
    password: '',
    role: 'petugas_jr',
    wilayah: 'Wilayah Riau',
    samsat: SAMSAT_DATA['Wilayah Riau'][0],
    bidang: 'Sumbangan Wajib (SW)',
    status: 'Aktif',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userToEdit) {
      const w = userToEdit.wilayah || 'Wilayah Riau';
      const samsatList = SAMSAT_DATA[w] || [];
      const s = userToEdit.samsat || (samsatList.length > 0 ? samsatList[0] : '');

      setFormData({
        nama: userToEdit.nama || '',
        email: userToEdit.email || '',
        nomorHp: userToEdit.nomorHp || userToEdit.telepon || '',
        password: '', // empty on edit unless user changes it
        role: userToEdit.role || 'petugas_jr',
        wilayah: w,
        samsat: s,
        bidang: userToEdit.bidang || 'Sumbangan Wajib (SW)',
        status: userToEdit.status || (userToEdit.isActive ? 'Aktif' : 'Nonaktif'),
      });
    } else {
      setFormData({
        nama: '',
        email: '',
        nomorHp: '',
        password: '',
        role: 'petugas_jr',
        wilayah: 'Wilayah Riau',
        samsat: SAMSAT_DATA['Wilayah Riau'][0],
        bidang: 'Sumbangan Wajib (SW)',
        status: 'Aktif',
      });
    }
    setError(null);
  }, [userToEdit, isOpen]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setFormData((prev) => ({
      ...prev,
      role: newRole,
    }));
  };

  const handleWilayahChange = (e) => {
    const selectedW = e.target.value;
    const samsatList = SAMSAT_DATA[selectedW] || [];
    setFormData((prev) => ({
      ...prev,
      wilayah: selectedW,
      samsat: samsatList.length > 0 ? samsatList[0] : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit) {
        const payload = { ...formData };
        if (!payload.password) {
          delete payload.password;
        }
        await authService.updateUser(userToEdit.penggunaId, payload);
      } else {
        await authService.addUserByAdmin(formData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('User form submit error:', err);
      setError(err.message || 'Gagal menyimpan data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isPresetUser = ['admin_utama', 'kabag', 'pimpinan'].includes(formData.role);
  const samsatOptions = SAMSAT_DATA[formData.wilayah] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-[#002B49]" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              {isEdit ? (isPresetUser ? `Edit Akun ${userToEdit?.nama || 'Sistem'}` : 'Edit Data Pengguna') : 'Tambah Pengguna Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isPresetUser && (
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
              <p className="font-extrabold text-blue-950">Akun Inti Sistem ({userToEdit?.nama})</p>
              <p className="text-[11px] text-blue-700">
                Perbarui Email & Password di bawah ini jika terjadi pergantian pejabat baru.
              </p>
            </div>
          )}

          {/* Nama / Peran Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Peran / Pengguna <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isPresetUser}
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs disabled:bg-slate-100 disabled:text-slate-600 font-medium"
              placeholder="Contoh: Ahmad Subagyo"
            />
          </div>

          {/* Email & Nomor HP */}
          <div className={`grid grid-cols-1 ${isPresetUser ? '' : 'sm:grid-cols-2'} gap-4`}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Login / Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                placeholder="user@jasaraharja.co.id"
              />
            </div>

            {!isPresetUser && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp / HP
                </label>
                <input
                  type="text"
                  value={formData.nomorHp}
                  onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
                  placeholder="0812..."
                />
              </div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password {isEdit ? '(Kosongkan jika tidak diubah)' : <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              required={!isEdit}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs"
              placeholder={isEdit ? '•••••••• (Tetap sama jika kosong)' : 'Password baru'}
            />
          </div>

          {!isPresetUser && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role / Peran */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Peran (Role) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={handleRoleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-medium"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Akun
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-medium"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
                  <option value="Nonaktif">Nonaktif</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
            </div>
          )}

          {/* DYNAMIC FIELDS DEPENDING ON ROLE */}
          {formData.role === 'petugas_jr' && (
            <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100 space-y-3">
              <p className="text-[11px] font-bold text-sky-900">Informasi Khusus Petugas JR</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Wilayah</label>
                  <select
                    value={formData.wilayah}
                    onChange={handleWilayahChange}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                  >
                    {Object.keys(SAMSAT_DATA).map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Samsat</label>
                  <select
                    value={formData.samsat}
                    onChange={(e) => setFormData({ ...formData, samsat: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                  >
                    {samsatOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {(formData.role === 'pengelola_pks' || formData.role === 'admin_utama') && (
            <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 space-y-2">
              <p className="text-[11px] font-bold text-purple-900">Informasi Bidang</p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bidang Kerja</label>
                <select
                  value={formData.bidang}
                  onChange={(e) => setFormData({ ...formData, bidang: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none"
                >
                  {BIDANG_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-white bg-[#002B49] hover:bg-[#001D33] rounded-xl flex items-center space-x-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Pengguna'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;

