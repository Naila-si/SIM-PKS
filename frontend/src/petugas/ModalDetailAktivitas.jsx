import React from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, FileText } from 'lucide-react';

export const ModalDetailAktivitas = ({ isOpen, activityData, onClose }) => {
  if (!isOpen || !activityData) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal (Matching Image 3) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <h3 className="text-base font-extrabold text-[#001D38] tracking-tight">Detail Aktivitas</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Metadata Grid (2 Columns, Matching Image 3) */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TANGGAL</p>
              <p className="font-extrabold text-slate-900 text-xs mt-0.5">
                {activityData.tanggal || '12 Januari 2027'}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WAKTU</p>
              <p className="font-extrabold text-slate-900 text-xs mt-0.5">
                {activityData.waktu || '14:20 WIB'}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NAMA PENGGUNA</p>
              <p className="font-extrabold text-slate-900 text-xs mt-0.5">
                {activityData.actorUser || 'Budi Santoso'}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PERAN</p>
              <div className="mt-1">
                <span className="px-3 py-1 bg-[#3B82F6] text-white font-extrabold text-[11px] rounded-lg inline-block shadow-2xs">
                  {activityData.actorRole || 'Pengelola PKS'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JENIS AKTIVITAS</p>
              <p className="font-extrabold text-slate-900 text-xs mt-0.5 flex items-center">
                <span className="w-4 h-4 rounded-full border border-blue-600 text-blue-600 flex items-center justify-center font-bold text-[9px] mr-1.5 shrink-0">
                  ✓
                </span>
                {activityData.jenisAktivitas || 'Persetujuan Dokumen'}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NOMOR PKS</p>
              <p className="font-extrabold text-[#001D38] text-xs mt-0.5">
                {activityData.nomorPKS || 'PKS/2026/08/001'}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200/80" />

          {/* DESKRIPSI Section */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DESKRIPSI</p>
            <p className="font-medium text-slate-700 leading-relaxed text-xs">
              {activityData.deskripsi || 'Pengelola PKS telah menyetujui dokumen PKS dan meneruskan ke tahap berikutnya.'}
            </p>
          </div>

          {/* Attachment Box (Matching Image 3 Box) */}
          <div className="p-4 rounded-2xl bg-[#EEF4FF] border border-dashed border-blue-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-extrabold text-slate-900 text-xs">{activityData.fileName || 'Draft_PKS_RSUD_Soetomo.pdf'}</p>
                <p className="text-[10px] text-slate-400 font-medium">Dokumen terlampir untuk aktivitas ini</p>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-slate-200/80 rounded-lg text-[10px] font-mono font-bold text-slate-600">
              {activityData.fileVersion || 'v2.0'}
            </span>
          </div>

        </div>

        {/* Footer Container with Soft Blue Background (Matching Image 3) */}
        <div className="px-6 py-4 bg-[#EEF4FF] border-t border-blue-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ModalDetailAktivitas;
