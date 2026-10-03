import React, { useState, useEffect } from 'react';
import { pksService } from '../services/pksService';
import { adendumService } from '../services/adendumService';
import { ModalTambahAdendum } from './ModalTambahAdendum';
import { ModalDetailAdendum } from './ModalDetailAdendum';
import { ModalHapusAdendum } from './ModalHapusAdendum';
import { ModalUbahAdendum } from './ModalUbahAdendum';
import {
  X, FileText, Building2, Calendar, Clock, User, CheckCircle2,
  AlertTriangle, Plus, ShieldCheck, Info
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export const ModalDetailPks = ({ isOpen, pksId, onClose, onEditClick }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pks, setPks] = useState(null);
  const [adendumList, setAdendumList] = useState([]);

  // Modal State Adendum Interaktif
  const [isAddendumModalOpen, setIsAddendumModalOpen] = useState(false);
  const [viewingAdendum, setViewingAdendum] = useState(null);
  const [editingAdendum, setEditingAdendum] = useState(null);
  const [deletingAdendum, setDeletingAdendum] = useState(null);

  // Custom Professional Dialog State
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'info', // 'info' | 'confirm'
    title: '',
    message: '',
    onConfirm: null,
  });

  const showDialog = (type, title, message, onConfirm = null) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };
  const closeDialog = () => setDialog({ ...dialog, isOpen: false });

  const handleTandaiSiap = async () => {
    showDialog(
      'confirm',
      'Konfirmasi Penyerahan',
      'Apakah Anda yakin dokumen fisik sudah siap diserahkan? Status PKS akan diubah menjadi "Menunggu Penyerahan".',
      async () => {
        try {
          setLoading(true);
          await pksService.addApproval({
            pks_id: pksId,
            user_id: user?.penggunaId || user?.id || null,
            status_aksi: 'Menunggu Penyerahan',
            catatan: 'Dokumen fisik siap diserahkan oleh Petugas'
          });
          window.location.reload();
        } catch (error) {
          showDialog('info', 'Gagal', 'Terjadi kesalahan saat mengupdate status.');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  useEffect(() => {
    if (isOpen && pksId) {
      const loadDetail = async () => {
        setLoading(true);
        try {
          const [pksRes, adendumRes] = await Promise.all([
            pksService.getPksById(pksId).catch(() => null),
            adendumService.getAdendumListByPks(pksId).catch(() => null),
          ]);

          if (pksRes?.success && pksRes?.data) {
            setPks(pksRes.data);
          } else {
            setPks(null);
          }

          if (adendumRes?.success && adendumRes?.data) {
            const aArray = Array.isArray(adendumRes.data) ? adendumRes.data : (Array.isArray(adendumRes.data?.data) ? adendumRes.data.data : []);
            setAdendumList(aArray);
          }
        } catch (err) {
          // Fallback
        } finally {
          setLoading(false);
        }
      };
      loadDetail();
    }
  }, [isOpen, pksId]);

  if (!isOpen) return null;

  const data = pks || {};
  const displayAdendum = adendumList;

  // RBAC & Ownership Logic
  const creatorName = data.pengguna?.nama || data.pengguna?.nama_pengguna || data.pembuat?.nama || data.pengelola || 'Sistem';
  const isCreator = user?.nama === creatorName || user?.nama_pengguna === creatorName || user?.penggunaId === data?.penggunaId || user?.penggunaId === data?.pengguna?.penggunaId;
  const isDraft = ['draft', 'draf'].includes((data.status_pks || data.statusPks || 'Draf').toLowerCase());
  const isPemeriksaanPengelola = ['pemeriksaan pengelola', 'menunggu penyerahan'].includes((data.status_persetujuan || data.statusPersetujuan || '').toLowerCase());
  const isDisetujui = ['disetujui', 'aktif'].includes((data.status_pks || data.statusPks || '').toLowerCase());
  const isDraftPersetujuan = ['draft', 'draf'].includes((data.status_persetujuan || data.statusPersetujuan || 'Draf').toLowerCase());

  const isPetugas = ['petugas', 'petugas_jr'].includes(user?.role);
  const isPengelolaOrAdmin = ['pengelola_pks', 'admin_utama', 'admin', 'pengelola'].includes(user?.role);
  const isKabagOrPimpinan = ['kabag', 'pimpinan'].includes(user?.role);

  const canShowSiapDiserahkan = isPetugas && isCreator && isDraftPersetujuan;
  const canShowTambahAdendum = isPetugas && isCreator;
  const canShowApprovalPengelola = isPengelolaOrAdmin && isPemeriksaanPengelola;
  const canShowUploadFinal = isPengelolaOrAdmin && isDisetujui;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* ================= HEADER MODAL (Matching Image 4) ================= */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-extrabold text-[#001D38] tracking-tight">Detail PKS</h2>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-700 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                {data.status_pks || data.statusPks || 'Draf'}
              </span>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-700 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                {data.status_persetujuan || data.statusPersetujuan || 'Draf'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Action untuk Petugas Pembuat */}
            {canShowSiapDiserahkan && (
              <button
                type="button"
                disabled={loading}
                onClick={handleTandaiSiap}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                {loading ? 'Memproses...' : 'Tandai Siap Diserahkan'}
              </button>
            )}

            {/* Action untuk Pengelola / Admin Utama (Pemeriksaan) */}
            {canShowApprovalPengelola && (
              <>
                <button
                  type="button"
                  onClick={() => showDialog('info', 'Info', 'Menolak/Revisi PKS. (API Integrasi Menyusul)')}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center cursor-pointer"
                >
                  Revisi
                </button>
                <button
                  type="button"
                  onClick={() => showDialog('info', 'Info', 'Menyetujui PKS. (API Integrasi Menyusul)')}
                  className="px-4 py-2 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Setujui
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= SCROLLABLE BODY CONTENT ================= */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ================= LEFT COLUMN (2 COLS MATCHING IMAGE 4) ================= */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. INFORMASI PKS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <FileText className="w-4 h-4 text-[#00529C]" />
                  <h3 className="text-xs font-extrabold text-slate-800">
                    Informasi PKS
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NOMOR PKS</p>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">
                      {data.nomor_pks || data.nomorPKS || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BIDANG</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{data.bidang || '-'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JENIS PKS</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{data.jenis_pks || data.jenisPKS || '-'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TGL MULAI</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{data.tanggal_mulai || data.tanggalMulai || '-'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TGL BERAKHIR</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{data.tanggal_berakhir || data.tanggalBerakhir || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 2. DATA DOKUMEN PKS (MITRA) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Building2 className="w-4 h-4 text-[#00529C]" />
                  <h3 className="text-xs font-extrabold text-slate-800">
                    Data Dokumen PKS (Mitra)
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NAMA PERUSAHAAN/INSTANSI</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">
                      {data.mitra?.nama_mitra || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NOMOR TELEPON</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {data.mitra?.no_hp_pengelola || data.nomorTelepon || data.mitra?.kontak || '-'}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ALAMAT INSTANSI</p>
                    <p className="font-medium text-slate-700 mt-0.5 leading-relaxed">
                      {data.mitra?.alamat_mitra || data.alamat || data.mitra?.alamat || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PENANGGUNG JAWAB</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {data.mitra?.nama_pengelola || data.penanggungJawab || '-'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EMAIL</p>
                    <p className="font-semibold text-blue-600 mt-0.5">
                      {data.mitra?.email_pengelola || data.email || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. DOKUMEN PKS FINAL */}
              <div className="grid grid-cols-1 gap-4">
                {/* Right Card: Dokumen PKS Final Warning Box (Matching Image 4) */}
                <div className="bg-[#FFF9EE] rounded-2xl border border-[#FDE68A] p-5 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-amber-900">Dokumen PKS Final</h4>
                  <p className="text-[11px] text-amber-700 font-medium max-w-xs leading-snug">
                    Dokumen PKS final yang ditandatangani belum diunggah ke sistem.
                  </p>
                  {canShowUploadFinal ? (
                    <button
                      type="button"
                      onClick={() => showDialog('info', 'Fitur Belum Tersedia', 'Fitur Unggah Dokumen Final (API Menyusul)')}
                      className="mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center"
                    >
                      <FileText className="w-4 h-4 mr-1.5" />
                      Unggah Dokumen Final
                    </button>
                  ) : (
                    <p className="text-[10px] text-amber-800/80 pt-1 italic">
                      Menunggu Pengelola PKS mengunggah dokumen akhir.
                    </p>
                  )}
                </div>
              </div>

              {/* 4. RIWAYAT ADENDUM (MATCHING IMAGE 4) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[#00529C]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Riwayat Adendum
                    </h3>
                    <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      TOTAL <span className="font-extrabold">{displayAdendum.length} Adendum</span>
                    </span>
                  </div>

                  {canShowTambahAdendum && (
                    <button
                      type="button"
                      onClick={() => {
                        if (data?.status_pks === 'Aktif' || data?.statusPks === 'Aktif') {
                          setIsAddendumModalOpen(true);
                        } else {
                          showDialog('info', 'Akses Ditolak', 'Adendum hanya dapat dibuat untuk PKS yang berstatus Aktif.');
                        }
                      }}
                      disabled={data?.status_pks !== 'Aktif' && data?.statusPks !== 'Aktif'}
                      className={`inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-xl shadow-xs ${
                        (data?.status_pks === 'Aktif' || data?.statusPks === 'Aktif')
                          ? 'bg-[#0F2238] hover:bg-[#0A1828] text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Tambah Adendum
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-[#EBF3FA] border-b border-slate-100 text-slate-700 uppercase font-extrabold text-[10px]">
                      <tr>
                        <th className="px-3 py-2.5">NOMOR</th>
                        <th className="px-3 py-2.5">TANGGAL</th>
                        <th className="px-3 py-2.5">JENIS PERUBAHAN</th>
                        <th className="px-3 py-2.5">STATUS</th>
                        <th className="px-3 py-2.5 text-center">AKSI</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayAdendum && displayAdendum.length > 0 ? (
                        displayAdendum.map((ad, idx) => (
                          <tr key={ad.adendumId || ad.id || idx} className="hover:bg-slate-50/70 font-medium">
                            <td className="px-3 py-3 font-bold text-slate-900">
                              {ad.nomor_adendum || ad.nomorAdendum || ad.nomor || '-'}
                            </td>
                            <td className="px-3 py-3 text-[11px] whitespace-nowrap text-slate-600">
                              {(ad.tanggal_mulai || ad.tanggalMulai) ? new Date(ad.tanggal_mulai || ad.tanggalMulai).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="px-3 py-3 max-w-xs text-slate-800 font-semibold">
                              {ad.ruang_lingkup || ad.ruangLingkupPerubahan || ad.jenis || '-'}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Selesai
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => setViewingAdendum(ad)}
                                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                              >
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="px-3 py-6 text-center text-slate-400 font-medium">
                            Belum ada adendum.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN (1 COL MATCHING IMAGE 4) ================= */}
            <div className="space-y-6">
              
              {/* INFORMASI SISTEM */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Info className="w-4 h-4 text-[#00529C]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Informasi Sistem
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dibuat Oleh</p>
                      <p className="font-bold text-slate-900 mt-0.5">{creatorName}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Dibuat</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {data.created_at ? new Date(data.created_at).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}) : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terakhir Diperbarui</p>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {data.updated_at && data.created_at && Math.abs(new Date(data.updated_at) - new Date(data.created_at)) > 5000
                          ? new Date(data.updated_at).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}) 
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Inner Light Blue Callout Box for Catatan Internal */}
                  <div className="p-3.5 rounded-xl bg-[#EEF4FF] border border-blue-100/80 text-xs space-y-1">
                    <p className="text-[10px] font-bold text-slate-500">Catatan Internal:</p>
                    <p className="text-slate-800 font-medium italic">
                      "{data.catatan_internal || data.catatanInternal || 'Tidak ada catatan'}"
                    </p>
                  </div>
                </div>
              </div>

              {/* RIWAYAT PERSETUJUAN (MATCHING IMAGE 4 TIMELINE) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-4 h-4 text-[#00529C]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Riwayat Persetujuan
                  </h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-[#00529C] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">Draft Dibuat</p>
                      <p className="text-[11px] text-slate-500 font-medium">{creatorName}</p>
                      <p className="text-[10px] text-slate-400">
                        {data.created_at ? new Date(data.created_at).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}) : '-'}
                      </p>
                    </div>
                  </div>
                  
                  {data.riwayat_persetujuan && data.riwayat_persetujuan.length > 0 && (
                    data.riwayat_persetujuan.map((riwayat, idx) => (
                      <div key={idx} className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-[#00529C] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{riwayat.status_aksi || riwayat.judul || '-'}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{riwayat.user?.nama || riwayat.aktor || '-'}</p>
                          <p className="text-[10px] text-slate-400">
                            {riwayat.created_at ? new Date(riwayat.created_at).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}) : (riwayat.tanggal || '-')}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FOOTER ACTIONS (MATCHING IMAGE 4) ================= */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end shrink-0 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Tutup
          </button>
        </div>

        {/* ================= MODAL ADENDUM INTERAKTIF ================= */}
        {isAddendumModalOpen && (
          <ModalTambahAdendum
            isOpen={isAddendumModalOpen}
            pksId={pksId}
            pksInitialData={data}
            onClose={() => setIsAddendumModalOpen(false)}
            onSuccess={(newAd) => {
              setAdendumList((prev) => [newAd, ...prev]);
            }}
          />
        )}

        {viewingAdendum && (
          <ModalDetailAdendum
            isOpen={!!viewingAdendum}
            adendumData={viewingAdendum}
            onClose={() => setViewingAdendum(null)}
            onEditClick={(adData) => setEditingAdendum(adData)}
            onDeleteClick={(adData) => setDeletingAdendum(adData)}
          />
        )}

        {editingAdendum && (
          <ModalUbahAdendum
            isOpen={!!editingAdendum}
            adendumData={editingAdendum}
            onClose={() => setEditingAdendum(null)}
            onSuccess={(updatedAd) => {
              setAdendumList((prev) =>
                prev.map((a) => (a.adendumId === updatedAd.adendumId ? { ...a, ...updatedAd } : a))
              );
            }}
          />
        )}

        {deletingAdendum && (
          <ModalHapusAdendum
            isOpen={!!deletingAdendum}
            adendumData={deletingAdendum}
            onClose={() => setDeletingAdendum(null)}
            onSuccess={(deletedId) => {
              setAdendumList((prev) => prev.filter((a) => a.adendumId !== deletedId));
            }}
          />
        )}
      </div>

      {/* ================= PROFESSIONAL CUSTOM DIALOG ================= */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full mb-4 mx-auto bg-slate-50 text-slate-600">
                {dialog.type === 'confirm' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                ) : (
                  <Info className="w-6 h-6 text-blue-500" />
                )}
              </div>
              <h3 className="text-center text-base font-extrabold text-slate-900 mb-2">
                {dialog.title}
              </h3>
              <p className="text-center text-sm text-slate-600 font-medium leading-relaxed">
                {dialog.message}
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
              {dialog.type === 'confirm' && (
                <button
                  type="button"
                  onClick={closeDialog}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (dialog.onConfirm) {
                    dialog.onConfirm();
                  } else {
                    closeDialog();
                  }
                }}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  dialog.type === 'confirm' ? 'bg-[#00529C] hover:bg-[#003E75]' : 'bg-[#00529C] hover:bg-[#003E75] w-full'
                }`}
              >
                {dialog.type === 'confirm' ? 'Ya, Lanjutkan' : 'Mengerti'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalDetailPks;
