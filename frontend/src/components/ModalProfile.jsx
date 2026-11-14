import React, { useState } from 'react';
import { X, Lock, User, Phone, Mail, Shield, Check, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';

export const ModalProfile = ({ isOpen, onClose }) => {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('password'); // 'password' | 'profile'

  // State Ganti Kata Sandi
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);

  // State Edit Profil
  const [nama, setNama] = useState(user?.nama || '');
  const [nomorHp, setNomorHp] = useState(user?.nomor_hp || user?.nomorHp || '');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  if (!isOpen) return null;

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      return showToast('warning', 'Harap isi seluruh kolom kata sandi.', 'Validasi Form');
    }

    if (newPassword.length < 8) {
      return showToast('warning', 'Kata sandi baru minimal harus 8 karakter.', 'Validasi Password');
    }

    if (newPassword !== confirmPassword) {
      return showToast('warning', 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.', 'Validasi Password');
    }

    setIsSubmittingPass(true);
    try {
      const res = await authService.changePassword(oldPassword, newPassword, confirmPassword);
      showToast('success', res.pesan || 'Kata sandi Anda berhasil diperbarui.', 'Berhasil');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      showToast('error', err.message || 'Gagal mengubah kata sandi.', 'Gagal');
    } finally {
      setIsSubmittingPass(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!nama.trim()) {
      return showToast('warning', 'Nama lengkap tidak boleh kosong.', 'Validasi Form');
    }

    setIsSubmittingProfile(true);
    try {
      const res = await authService.updateProfile(nama, nomorHp);
      if (res.data) {
        setUser(res.data);
      }
      showToast('success', 'Profil Anda berhasil diperbarui.', 'Berhasil');
      onClose();
    } catch (err) {
      showToast('error', err.message || 'Gagal memperbarui profil.', 'Gagal');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const roleNameMap = {
    petugas_jr: 'Petugas JR',
    pengelola_pks: 'Pengelola PKS',
    kabag: 'Kepala Bagian (Kabag)',
    pimpinan: 'Pimpinan Kanwil',
    admin_utama: 'Administrator Utama',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-[#001D38] to-[#00529C] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-extrabold text-sm border border-white/20 uppercase shadow-inner">
              {user?.nama ? user.nama.charAt(0) : 'U'}
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wide">{user?.nama || 'Profil Pengguna'}</h2>
              <p className="text-[11px] text-blue-200 font-medium">
                {roleNameMap[user?.role] || user?.role} {user?.bidang ? `• Bidang ${user.bidang}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 pt-3 bg-slate-50/70 shrink-0">
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'password'
                ? 'border-[#00529C] text-[#00529C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Ganti Kata Sandi</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#00529C] text-[#00529C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Informasi Akun</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3 text-[11px] text-slate-600 leading-relaxed">
                <span className="font-bold text-[#00529C]">Informasi Keamanan:</span> Masukkan kata sandi saat ini (password sementara) untuk verifikasi, lalu tentukan kata sandi baru minimal 8 karakter.
              </div>

              {/* Kata Sandi Lama */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi Lama / Saat Ini <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPass ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan kata sandi saat ini"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Kata Sandi Baru */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter rahasia"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingPass}
                  className="w-full py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPass ? 'Menyimpan Sandi...' : 'Simpan Kata Sandi Baru'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Email (Readonly) */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Alamat Email</label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-500 cursor-not-allowed outline-none"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 italic">Email kedinasan terhubung dan tidak dapat diubah sembarangan.</p>
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Nomor HP */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Nomor WhatsApp / HP</label>
                <input
                  type="text"
                  value={nomorHp}
                  onChange={(e) => setNomorHp(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Detail Penugasan */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hak Akses / Peran:</span>
                  <span className="font-bold text-slate-800">{roleNameMap[user?.role] || user?.role}</span>
                </div>
                {user?.bidang && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bidang Operasional:</span>
                    <span className="font-bold text-[#00529C]">{user.bidang}</span>
                  </div>
                )}
                {user?.wilayah && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wilayah Penempatan:</span>
                    <span className="font-bold text-slate-800">{user.wilayah}</span>
                  </div>
                )}
                {user?.samsat && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kantor Samsat:</span>
                    <span className="font-bold text-slate-800">{user.samsat}</span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="w-full py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingProfile ? 'Menyimpan Perubahan...' : 'Perbarui Profil'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
