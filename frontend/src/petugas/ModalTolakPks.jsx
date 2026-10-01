import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Ban } from 'lucide-react';

export const ModalTolakPks = ({ isOpen, pksData, onClose, onSuccess }) => {
  const [alasan, setAlasan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const data = pksData || {
    nomorPKS: 'PKS/2023/XI/0892',
    bidang: 'Teknologi Informasi',
    perusahaan: 'PT Integritas Nusantara Jaya',
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!alasan.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (onSuccess) onSuccess(alasan);
      onClose();
    }, 500);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Main Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Top Warning Icon Header (Matching Image 2) */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center mx-auto shrink-0">
              <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h2 className="text-xl font-extrabold text-[#001D38] tracking-tight">
              Tolak PKS
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              PKS akan dikembalikan kepada Petugas JR untuk dilakukan perbaikan.
            </p>
          </div>

          {/* Light Blue Info Box #EEF4FF (Matching Image 2) */}
          <div className="bg-[#EEF4FF] rounded-2xl p-4.5 border border-blue-100/80 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NOMOR PKS</p>
                <p className="font-extrabold text-[#001D38] text-xs mt-0.5">{data.nomorPKS}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BIDANG</p>
                <p className="font-extrabold text-[#001D38] text-xs mt-0.5">{data.bidang}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PERUSAHAAN / INSTANSI</p>
              <p className="font-extrabold text-[#001D38] text-xs mt-0.5">{data.perusahaan}</p>
            </div>
          </div>

          {/* Form Field: Alasan Penolakan */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Alasan Penolakan</label>
              <span className="text-[11px] font-semibold text-rose-600">* Wajib diisi</span>
            </div>
            <textarea
              rows={3}
              required
              placeholder="Tuliskan alasan penolakan secara jelas."
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-blue-500 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs resize-none"
            />
            <p className="text-[11px] text-slate-400 font-medium pt-0.5">
              Pastikan alasan mencakup detail bagian yang memerlukan perbaikan.
            </p>
          </div>

          {/* Light Blue Footer Actions (Matching Image 2) */}
          <div className="pt-2 -mx-6 -mb-6 px-6 py-4 bg-[#EEF4FF] border-t border-blue-100/60 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !alasan.trim()}
              className="px-5 py-2.5 bg-[#C92A2A] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
            >
              <Ban className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              {submitting ? 'Memproses...' : 'Tolak PKS'}
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
};

export default ModalTolakPks;
