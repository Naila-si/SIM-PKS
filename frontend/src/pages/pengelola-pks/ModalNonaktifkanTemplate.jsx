import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

export const ModalNonaktifkanTemplate = ({ isOpen, templateData, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const data = templateData || {
    namaTemplate: 'Template PKS Penjaminan RS',
    versi: 'v3.0',
    bidang: 'PELAYANAN',
    jenisPks: 'Kerjasama Layanan Kesehatan',
  };

  const handleConfirm = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 500);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Header Visual Icon & Title (Matching Image 4 Mockup) */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-amber-100/70 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-extrabold text-[#001D38] tracking-tight">
            Nonaktifkan Template
          </h2>
          <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            Apakah Anda yakin ingin menonaktifkan template ini? Template yang dinonaktifkan tidak dapat digunakan untuk membuat draft PKS baru, namun riwayat template tetap tersimpan di dalam sistem.
          </p>
        </div>

        {/* Info Card Block (Matching Image 4 Mockup) */}
        <div className="bg-[#EEF4FF] rounded-2xl p-4.5 border border-blue-100/90 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Template</p>
            <p className="font-extrabold text-[#001D38] text-xs mt-0.5">{data.namaTemplate}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Versi</p>
            <p className="font-extrabold text-[#001D38] text-xs mt-0.5">{data.versi || 'v3.0'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bidang</p>
            <p className="font-extrabold text-[#001D38] uppercase text-xs mt-0.5">{data.bidang || 'PELAYANAN'}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis PKS</p>
            <p className="font-extrabold text-[#001D38] text-xs mt-0.5">{data.jenisPks || 'Kerjasama Layanan Kesehatan'}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs text-center"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="w-1/2 py-2.5 bg-[#F59E0B] hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 text-center"
          >
            {submitting ? 'Memproses...' : 'Nonaktifkan Template'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
