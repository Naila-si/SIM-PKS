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

export const ModalDetailPks = ({ isOpen, pksId, onClose, onEditClick }) => {
  const [loading, setLoading] = useState(false);
  const [pks, setPks] = useState(null);
  const [adendumList, setAdendumList] = useState([]);

  // Modal State Adendum Interaktif
  const [isAddendumModalOpen, setIsAddendumModalOpen] = useState(false);
  const [viewingAdendum, setViewingAdendum] = useState(null);
  const [editingAdendum, setEditingAdendum] = useState(null);
  const [deletingAdendum, setDeletingAdendum] = useState(null);

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

  // Mock data matching Image 4 fallback
  const mockPks = {
    nomorPKS: 'PKS/JR/VIII/2023/0042',
    bidang: 'Pelayanan Klaim & Rumah Sakit',
    jenisPKS: 'Kerjasama Strategis Nasional',
    tanggalMulai: '15 Agu 2023',
    tanggalBerakhir: '15 Agu 2025',
    perusahaan: 'RSUD Bhayangkara Pusat',
    nomorTelepon: '+62 21 5550 1234',
    alamat: 'Jl. Sultan Hasanuddin No. 3, Kebayoran Baru, Jakarta Selatan, 12110',
    penanggungJawab: 'dr. Ahmad Santoso, Sp.OT',
    jabatan: 'Direktur Operasional',
    email: 'kerjasama@bhsyangkara-rs.id',
    statusPks: 'Aktif',
    statusPersetujuan: 'Disetujui',
    pengelola: 'Budi Darmawan (Admin Pusat)',
    tanggalDibuat: '12 Agu 2023, 09:15 WIB',
    terakhirDiperbarui: '25 Okt 2023, 11:30 WIB',
    catatanInternal: 'Prioritas utama untuk integrasi sistem klaim online di bulan November.',
  };

  const data = pks || mockPks;

  const mockAdendum = [
    { id: 1, nomor: 'ADN/01/VIII/2023', tanggal: '10 Sep 2023', jenis: 'Penyesuaian Tarif Klaim', status: 'Selesai' },
    { id: 2, nomor: 'ADN/02/X/2023', tanggal: '24 Okt 2023', jenis: 'Perubahan PIC Operasional', status: 'Selesai' },
  ];

  const displayAdendum = adendumList.length > 0 ? adendumList : mockAdendum;

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
                {data.statusPks || 'Aktif'}
              </span>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-700 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                {data.statusPersetujuan || 'Disetujui'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
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
                      {data.nomorPKS || 'PKS/JR/VIII/2023/0042'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BIDANG</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{data.bidang || 'Pelayanan Klaim & Rumah Sakit'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JENIS PKS</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{data.jenisPKS || 'Kerjasama Strategis Nasional'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TGL MULAI</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{data.tanggalMulai || '15 Agu 2023'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TGL BERAKHIR</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{data.tanggalBerakhir || '15 Agu 2025'}</p>
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
                      {data.perusahaan || data.mitra?.namaPerusahaan || 'RSUD Bhayangkara Pusat'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NOMOR TELEPON</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {data.nomorTelepon || data.mitra?.kontak || '+62 21 5550 1234'}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ALAMAT INSTANSI</p>
                    <p className="font-medium text-slate-700 mt-0.5 leading-relaxed">
                      {data.alamat || data.mitra?.alamat || 'Jl. Sultan Hasanuddin No. 3, Kebayoran Baru, Jakarta Selatan, 12110'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PENANGGUNG JAWAB</p>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {data.penanggungJawab || 'dr. Ahmad Santoso, Sp.OT'}
                    </p>
                    <p className="text-[10px] text-slate-400 italic font-medium">
                      {data.jabatan || 'Direktur Operasional'}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EMAIL</p>
                    <p className="font-semibold text-blue-600 mt-0.5">
                      {data.email || 'kerjasama@bhsyangkara-rs.id'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. DOKUMEN PKS (DRAFT & FINAL SIDE-BY-SIDE MATCHING IMAGE 4) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Card: Draft Dokumen */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-[#00529C]" />
                    <h3 className="text-xs font-bold text-slate-800">Draft Dokumen</h3>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Versi 1.4 (Internal)</p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                    <p className="font-extrabold text-slate-900 truncate">
                      PKS_RSUD_Bhayangkara_Draft_V14.docx
                    </p>
                    <p className="text-[10px] text-slate-400">Generated: 12 Agu 2023, 14:20 WIB</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => alert('Pratinjau Draft Dokumen PKS')}
                      className="py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                    >
                      Lihat
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Unduh Draft Dokumen PKS')}
                      className="py-2 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Unduh
                    </button>
                  </div>
                </div>

                {/* Right Card: Dokumen PKS Final Warning Box (Matching Image 4) */}
                <div className="bg-[#FFF9EE] rounded-2xl border border-[#FDE68A] p-5 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-amber-900">Dokumen PKS Final</h4>
                  <p className="text-[11px] text-amber-700 font-medium max-w-xs leading-snug">
                    Dokumen PKS final yang ditandatangani belum diunggah ke sistem.
                  </p>
                  <button
                    type="button"
                    onClick={() => alert('Silakan unggah dokumen PKS final.')}
                    className="text-xs font-bold text-amber-800 underline hover:text-amber-900 cursor-pointer pt-1"
                  >
                    Unggah Sekarang
                  </button>
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

                  <button
                    type="button"
                    onClick={() => setIsAddendumModalOpen(true)}
                    className="inline-flex items-center px-3.5 py-2 bg-[#0F2238] hover:bg-[#0A1828] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Tambah Adendum
                  </button>
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
                      {displayAdendum.map((ad, idx) => (
                        <tr key={ad.adendumId || ad.id || idx} className="hover:bg-slate-50/70 font-medium">
                          <td className="px-3 py-3 font-bold text-slate-900">
                            {ad.nomorAdendum || ad.nomor || 'ADN/01/VIII/2023'}
                          </td>
                          <td className="px-3 py-3 text-[11px] whitespace-nowrap text-slate-600">
                            {ad.tanggal || (ad.tanggalMulai ? new Date(ad.tanggalMulai).toLocaleDateString('id-ID') : '10 Sep 2023')}
                          </td>
                          <td className="px-3 py-3 max-w-xs text-slate-800 font-semibold">
                            {ad.ruangLingkupPerubahan || ad.jenis || 'Penyesuaian Tarif Klaim'}
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
                      ))}
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pengelola PKS</p>
                      <p className="font-bold text-slate-900 mt-0.5">{data.pengelola || 'Budi Darmawan (Admin Pusat)'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Dibuat</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{data.tanggalDibuat || '12 Agu 2023, 09:15 WIB'}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terakhir Diperbarui</p>
                      <p className="font-semibold text-slate-800 mt-0.5">{data.terakhirDiperbarui || '25 Okt 2023, 11:30 WIB'}</p>
                    </div>
                  </div>

                  {/* Inner Light Blue Callout Box for Catatan Internal */}
                  <div className="p-3.5 rounded-xl bg-[#EEF4FF] border border-blue-100/80 text-xs space-y-1">
                    <p className="text-[10px] font-bold text-slate-500">Catatan Internal:</p>
                    <p className="text-slate-800 font-medium italic">
                      "{data.catatanInternal || 'Prioritas utama untuk integrasi sistem klaim online di bulan November.'}"
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
                  {/* Step 1 */}
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-[#00529C] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">Pengajuan Draft</p>
                      <p className="text-[11px] text-slate-500 font-medium">Staf Administrasi Kemitraan</p>
                      <p className="text-[10px] text-slate-400">12 Agu 2023 • 10:00</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-[#00529C] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">Verifikasi Dokumen</p>
                      <p className="text-[11px] text-slate-500 font-medium">Kepala Bagian Kerjasama</p>
                      <p className="text-[10px] text-slate-400">13 Agu 2023 • 15:45</p>
                    </div>
                  </div>

                  {/* Step 3 (Highlighted Box Matching Image 4) */}
                  <div className="p-3.5 rounded-xl bg-[#EEF4FF] border border-blue-100 flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-[#00529C] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">Persetujuan Pimpinan</p>
                      <p className="text-[11px] text-slate-600 font-medium">Kepala Cabang / Divisi Pusat</p>
                      <p className="text-[10px] text-slate-400">14 Agu 2023 • 09:20</p>
                    </div>
                  </div>
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
    </div>
  );
};

export default ModalDetailPks;
