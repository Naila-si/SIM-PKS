import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle } from 'lucide-react';
import { userService } from '../services/userService';

const BIDANG_OPTIONS = [
  'Bidang Asuransi',
  'Bidang Operasional',
  'Bidang Keuangan',
  'Bidang Hukum & SDM',
];

const UserFormModal = ({ isOpen, onClose, onSuccess, userToEdit = null }) => {
  const isEdit = !!userToEdit;
  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    email: '',
    password: '',
    role: 'petugas_jr',
    bidang: 'Bidang Asuransi',
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        nama: userToEdit.nama || '',
        nip: userToEdit.nip || '',
        email: userToEdit.email || '',
        password: '', // empty means unchanged on edit
        role: userToEdit.role || 'petugas_jr',
        bidang: userToEdit.bidang || '',
        isActive: userToEdit.isActive ?? true,
      });
    } else {
      setFormData({
        nama: '',
        nip: '',
        email: '',
        password: '',
        role: 'petugas_jr',
        bidang: 'Bidang Asuransi',
        isActive: true,
      });
    }
    setError(null);
  }, [userToEdit, isOpen]);

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    let newBidang = formData.bidang;

    if (['pimpinan', 'admin_utama'].includes(newRole)) {
      newBidang = '';
    } else if (['petugas_jr', 'pengelola_pks'].includes(newRole) && !newBidang) {
      newBidang = BIDANG_OPTIONS[0];
    }

    setFormData((prev) => ({
      ...prev,
      role: newRole,
      bidang: newBidang,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = { ...formData };
      if (['pimpinan', 'admin_utama'].includes(payload.role)) {
        payload.bidang = null;
      }
      if (payload.role === 'kabag' && !payload.bidang) {
        payload.bidang = null;
      }
      if (isEdit && !payload.password) {
        delete payload.password;
      }

      if (isEdit) {
        await userService.updateUser(userToEdit.penggunaId, payload);
      } else {
        await userService.createUser(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('User form submit error:', err);
      const msg = err.response?.data?.message || 'Gagal menyimpan data pengguna.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const requiresBidang = ['petugas_jr', 'pengelola_pks'].includes(formData.role);
  const hideBidang = ['pimpinan', 'admin_utama'].includes(formData.role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {isEdit ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder="Contoh: Ahmad Subagyo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                NIP (Opsional)
              </label>
              <input
                type="text"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="1995..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Email Perusahaan <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="user@jasaraharja.co.id"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password {isEdit ? '(Kosongkan jika tidak diubah)' : <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              required={!isEdit}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              placeholder={isEdit ? '••••••••' : 'Password baru (min 6 karakter)'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Peran (Role) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={handleRoleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              >
                <option value="petugas_jr">Petugas JR</option>
                <option value="pengelola_pks">Pengelola PKS</option>
                <option value="kabag">Kepala Bagian (Kabag)</option>
                <option value="pimpinan">Pimpinan</option>
                <option value="admin_utama">Administrator Utama</option>
              </select>
            </div>

            <div>
              {!hideBidang ? (
                <>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Bidang {requiresBidang && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={formData.bidang || ''}
                    onChange={(e) => setFormData({ ...formData, bidang: e.target.value })}
                    required={requiresBidang}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  >
                    {!requiresBidang && <option value="">-- Tanpa Bidang Spesifik --</option>}
                    {BIDANG_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-400 dark:text-slate-500 mb-1">
                    Bidang
                  </label>
                  <div className="px-3 py-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-xs text-slate-500 dark:text-slate-400">
                    Lintas Bidang (Null)
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isActiveCheck" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Akun Aktif (Dapat Login ke Sistem)
            </label>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
