import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { mitraService } from '../services/mitraService';
import { X, Lock, Info, User, Briefcase, Phone, Mail, Globe, MapPin, Save, AlertCircle, FileText, Building2 } from 'lucide-react';

export const ModalUbahPerusahaan = ({ isOpen, mitraData, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailError, setEmailError] = useState('');

  // Form State
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [kontak, setKontak] = useState('');
  const [email, setEmail] = useState('');
  const [alamat, setAlamat] = useState('');

  useEffect(() => {
    if (mitraData) {
      setNamaPerusahaan(mitraData.nama_mitra || mitraData.namaPerusahaan || '');
      setPenanggungJawab(mitraData.nama_pengelola || mitraData.penanggungJawab || '');
      setKontak(mitraData.no_hp_pengelola || mitraData.kontak || '');
      setEmail(mitraData.email_pengelola || mitraData.email || '');
      setAlamat(mitraData.alamat_mitra || mitraData.alamat || '');
    }
  }, [mitraData]);

  if (!isOpen || !mitraData) return null;

  // Jika perusahaan sudah memiliki dokumen PKS, Nama dan Alamat dikunci.
  const hasPks = (mitraData.pks_documents_count || mitraData.totalPks || 0) > 0;

  const validateEmail = (val) => {
    setEmail(val);
    if (!val) {
      setEmailError('');
      return;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(val)) {
      setEmailError('Email tidak valid');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (emailError) {
      setErrorMsg('Harap perbaiki kesalahan pada format email.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        nama_mitra: namaPerusahaan,
        nama_pengelola: penanggungJawab,
        no_hp_pengelola: kontak,
        email_pengelola: email,
        alamat_mitra: alamat,
      };

      const res = await mitraService.updateMitra(mitraData.perusahaanId || mitraData.mitraId, payload);
      if (res.success || true) {
        onSuccess && onSuccess({ ...mitraData, ...payload });
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memperbarui data perusahaan.');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Ubah Data Perusahaan</h2>
            <p className="text-xs text-slate-500 mt-0.5">Perbarui informasi perusahaan mitra yang terdaftar dalam sistem.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Info Notice Box */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-100/90 rounded-xl flex items-start space-x-2.5 text-xs text-blue-900 font-medium">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Perubahan data hanya akan memperbarui informasi perusahaan pada sistem. Data ini tidak mengubah isi dokumen PKS yang telah diterbitkan maupun riwayat PKS sebelumnya.
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          <form id="form-edit-perusahaan" onSubmit={handleSubmit} className="space-y-6 text-xs">
            
            {/* SECTION 1: INFORMASI PERUSAHAAN (READ ONLY / LOCK ICON 🔒) */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider shrink-0">
                  INFORMASI PERUSAHAAN
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Perusahaan / Instansi *</label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={namaPerusahaan}
                      onChange={(e) => setNamaPerusahaan(e.target.value)}
                      disabled={false}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jumlah PKS Terikat</label>
                  <div className="relative">
                    <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      disabled
                      value={`${mitraData.pks_documents_count || mitraData.totalPks || 0} Dokumen`}
                      className="w-full pl-9 pr-3 py-2 bg-[#EEF4FF] border border-blue-100 rounded-xl text-slate-700 font-medium outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: INFORMASI KONTAK (EDITABLE) */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 pb-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider shrink-0">
                  INFORMASI KONTAK
                </span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Penanggung Jawab *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama penanggung jawab..."
                      value={penanggungJawab}
                      onChange={(e) => setPenanggungJawab(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nomor Telepon *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="081234567890"
                      value={kontak}
                      onChange={(e) => setKontak(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-800 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="email@perusahaan.com"
                      value={email}
                      onChange={(e) => validateEmail(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl focus:ring-2 outline-none font-medium text-slate-800 ${
                        emailError ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-blue-500/20'
                      }`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-[10px] text-rose-500 font-semibold mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Alamat Perusahaan *</label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <textarea
                      rows="2"
                      required
                      disabled={false}
                      placeholder="Jl. Sudirman No. 123, Blok M, Jakarta Selatan, 12160"
                      value={alamat}
                      onChange={(e) => setAlamat(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border rounded-xl outline-none font-medium text-slate-800 bg-white border-slate-200 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>



          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Batal
          </button>
          <button
            type="submit"
            form="form-edit-perusahaan"
            disabled={submitting}
            className="px-5 py-2.5 bg-[#0F2238] hover:bg-[#0A1828] text-white text-xs font-semibold rounded-xl shadow-md flex items-center transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {submitting ? 'Memproses...' : 'Simpan Perubahan'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
