import React from 'react';
import { X, User, Mail, Phone, MapPin, Building, ShieldCheck, Calendar, Clock, Crown, Edit2 } from 'lucide-react';

const ROLE_LABELS = {
  admin_utama: 'Administrator Utama',
  pengelola_pks: 'Pengelola PKS',
  petugas_jr: 'Petugas JR',
  kabag: 'Kepala Bagian',
  pimpinan: 'Pimpinan',
};

export const UserDetailModal = ({ isOpen, onClose, user, onEdit }) => {
  if (!isOpen || !user) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isPending = user.status === 'Menunggu Persetujuan' || user.status === 'Menunggu Verifikasi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        
        {/* Top Header Card Background */}
        <div className="bg-gradient-to-r from-[#002B49] to-[#00529C] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-extrabold text-xl shadow-inner shrink-0">
              {getInitials(user.nama)}
            </div>
            <div className="space-y-1 overflow-hidden">
              <h3 className="font-extrabold text-base text-white truncate">{user.nama}</h3>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                {user.role === 'admin_utama' && <Crown className="w-3 h-3 mr-1 text-amber-300" />}
                {ROLE_LABELS[user.role] || user.jabatan || user.role}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Status Badge Row */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="font-bold text-slate-500">Status Akun:</span>
            <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold border ${
              user.status === 'Aktif'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                : isPending
                ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                : 'bg-rose-100 text-rose-700 border-rose-200'
            }`}>
              {user.status || 'Aktif'}
            </span>
          </div>

          {/* Details List Grid */}
          <div className="space-y-3 pt-1">
            
            {/* Email */}
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-blue-50 text-[#00529C] shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Email Perusahaan</p>
                <p className="font-bold text-slate-900 text-xs mt-0.5">{user.email}</p>
              </div>
            </div>

            {/* Nomor HP (If applicable) */}
            {user.nomorHp && user.nomorHp !== '-' && (
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Nomor HP / WhatsApp</p>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">{user.nomorHp}</p>
                </div>
              </div>
            )}

            {/* Wilayah & Samsat (For Petugas JR) */}
            {user.role === 'petugas_jr' && (
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Penugasan Samsat</p>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">{user.samsat || '-'}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{user.wilayah || 'Wilayah Riau'}</p>
                </div>
              </div>
            )}

            {/* Bidang (For Pengelola PKS & Admin Utama) */}
            {(user.role === 'pengelola_pks' || user.role === 'admin_utama') && (
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Bidang Kerja</p>
                  <p className="font-bold text-slate-900 text-xs mt-0.5">{user.bidang || 'Sumbangan Wajib (SW)'}</p>
                </div>
              </div>
            )}

            {/* Tanggal Terdaftar */}
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Waktu Terdaftar</p>
                <p className="font-bold text-slate-900 text-xs mt-0.5">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  }) : '12 Januari 2026'}
                </p>
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Tutup
            </button>
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(user);
                }}
                className="px-4 py-2 bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold rounded-xl inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Pengguna</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserDetailModal;
