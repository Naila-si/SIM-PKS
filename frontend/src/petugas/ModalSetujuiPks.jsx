import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2 } from 'lucide-react';

export const ModalSetujuiPks = ({ isOpen, pksData, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const data = pksData || {
    nomorPKS: 'PKS/2023/XI/0892',
    bidang: 'Teknologi Informasi',
    jenisPKS: 'Kerjasama Strategis',
    perusahaan: 'PT Integritas Nusantara Jaya',
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
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-5">
        
        {/* Top Header Icon & Subtitle (Matching Image 3) */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#E0EDFF] text-[#00529C] flex items-center justify-center mx-auto shrink-0">
            <div className="w-9 h-9 rounded-full bg-[#00529C] text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-[#001D38] tracking-tight">
            Setujui PKS
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Apakah Anda yakin data PKS telah sesuai dengan dokumen fisik yang diajukan? Setelah disetujui, PKS akan diteruskan secara otomatis ke tahap persetujuan berikutnya.
          </p>
        </div>

        {/* Info Card Block (Light Blue Background #EEF4FF, Matching Image 3) */}
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
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JENIS PKS</p>
              <p className="font-extrabold text-[#001D38] text-xs mt-0.5">{data.jenisPKS || 'Kerjasama Strategis'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PERUSAHAAN / INSTANSI</p>
              <p className="font-extrabold text-[#001D38] text-xs mt-0.5">{data.perusahaan}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions (Matching Image 3) */}
        <div className="pt-2 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="px-6 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Memproses...' : 'Setujui'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default ModalSetujuiPks;
