import React, { useState, useEffect } from 'react';
import { adendumService } from '../services/adendumService';
import { StatusBadge } from '../components/StatusBadge';
import { X, FileText, AlertTriangle, Download, Eye, Edit3, Trash2, Clock, CheckCircle2 } from 'lucide-react';

export const ModalDetailAdendum = ({ isOpen, adendumId, adendumData, onClose, onEditClick, onDeleteClick }) => {
  const [loading, setLoading] = useState(false);
  const [adendum, setAdendum] = useState(adendumData || null);

  useEffect(() => {
    if (isOpen && adendumId && !adendumData) {
      setLoading(true);
      adendumService.getAdendumById(adendumId)
        .then((res) => {
          if (res.success) setAdendum(res.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (adendumData) {
      setAdendum(adendumData);
    }
  }, [isOpen, adendumId, adendumData]);

  if (!isOpen) return null;

  const statusPersetujuan = adendum?.statusPersetujuan || adendum?.status || 'Draft';
  const isFinalUploaded = !!adendum?.fileScanFinal;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Detail Adendum</h2>
            <div className="h-4 w-px bg-slate-200" />
            <StatusBadge status="Draft" />
            <StatusBadge status={statusPersetujuan} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex-1">Memuat detail adendum...</div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* SECTION I. INFORMASI ADENDUM */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                I. INFORMASI ADENDUM
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Adendum</p>
                  <p className="font-extrabold text-[#00529C] text-sm mt-0.5">
                    {adendum?.nomorAdendum || 'AD/2024/0045/JR/X'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor PKS Induk</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {adendum?.pks?.nomorPKS || adendum?.nomorPKS || 'PKS/2022/JR/1102'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis Perubahan</p>
                  <p className="font-semibold text-slate-800 text-xs mt-0.5">
                    {adendum?.jenisPerubahan || adendum?.ruangLingkupPerubahan || 'Perpanjangan Jangka Waktu'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Adendum</p>
                  <p className="font-semibold text-slate-700 text-xs mt-0.5">
                    {adendum?.createdAt ? new Date(adendum.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '12 Oktober 2024'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Berlaku</p>
                  <p className="font-semibold text-slate-700 text-xs mt-0.5">
                    {adendum?.tanggalMulai ? new Date(adendum.tanggalMulai).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '01 Januari 2025'}
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION II. ISI PERUBAHAN */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                II. ISI PERUBAHAN
              </h3>
              
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100/90 text-xs text-slate-800 leading-relaxed space-y-2">
                <p>
                  {adendum?.ruangLingkupPerubahan ||
                    'Para Pihak dengan ini sepakat untuk melakukan perubahan pada Pasal 4 (Empat) mengenai Jangka Waktu Perjanjian yang semula berakhir pada tanggal 31 Desember 2024, diubah menjadi berakhir pada tanggal 31 Desember 2025.'}
                </p>
                <p className="text-slate-600 italic">
                  Ketentuan lainnya dalam Perjanjian Kerjasama Induk Nomor {adendum?.nomorPKS || 'PKS/2022/JR/1102'} tetap berlaku dan mengikat sepanjang tidak diubah dalam Adendum ini.
                </p>
              </div>
            </div>

            {/* SECTION III & IV GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* III. DRAFT DOKUMEN ADENDUM */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  III. DRAFT DOKUMEN ADENDUM
                </h3>
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#00529C] flex items-center justify-center font-bold shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 truncate">Draft_Adendum_V4_Final_Check.pdf</p>
                      <p className="text-[10px] text-slate-400">Versi: 4.0 • Generated: 12/10/2024 14:20</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => alert('Membuka pratinjau Draft Adendum...')}
                      className="px-3 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 text-xs flex items-center justify-center cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" /> Lihat Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Mengunduh Draft Adendum...')}
                      className="px-3 py-1.5 border border-blue-200 text-blue-700 font-semibold rounded-xl hover:bg-blue-50 text-xs flex items-center justify-center cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 mr-1 text-blue-600" /> Unduh Draft
                    </button>
                  </div>
                </div>
              </div>

              {/* IV. DOKUMEN FINAL ADENDUM */}
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  IV. DOKUMEN FINAL ADENDUM
                </h3>

                {isFinalUploaded ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Dokumen Final Scan Bertanda Tangan</span>
                    </div>
                    <button
                      type="button"
                      className="w-full px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 flex items-center justify-center cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Unduh Dokumen Final
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Dokumen Adendum final belum diunggah oleh Admin.</span>
                  </div>
                )}
              </div>

            </div>

            {/* SECTION V. RIWAYAT PERSETUJUAN */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                V. RIWAYAT PERSETUJUAN
              </h3>

              <div className="relative border-l-2 border-slate-200 ml-3.5 space-y-5 py-1 text-xs">
                <div className="ml-5 relative bg-blue-50/60 p-3.5 rounded-xl border border-blue-100">
                  <span className="absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">Penyusunan Draft Selesai</p>
                    <span className="text-[10px] text-slate-400 font-medium">12 Okt 2024, 09:15</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">Oleh: Admin Perjanjian (Andi Wijaya)</p>
                  <p className="text-[11px] text-slate-500 italic mt-1 font-mono">"Draft awal sesuai permintaan user unit operasional."</p>
                </div>

                <div className="ml-5 relative bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">Menunggu Pemeriksaan Pengelola PKS</p>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">In Progress</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Target: Pengelola PKS Pusat</p>
                </div>

                <div className="ml-5 relative opacity-60">
                  <span className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-300" />
                  <p className="font-bold text-slate-700">Persetujuan Kepala Bagian</p>
                  <p className="text-[11px] text-slate-400">Antrian Berikutnya</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Sticky Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onEditClick) onEditClick(adendum?.adendumId || adendumId);
              }}
              className="px-4 py-2 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Ubah Adendum
            </button>
            
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onDeleteClick) onDeleteClick(adendum || { adendumId });
              }}
              className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-xl flex items-center transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus Adendum
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
