import React, { useState } from 'react';
import { adendumService } from '../services/adendumService';
import { StatusBadge } from '../components/StatusBadge';
import { Trash2, AlertTriangle } from 'lucide-react';

export const ModalHapusAdendum = ({ isOpen, adendumData, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !adendumData) return null;

  const handleConfirmDelete = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      const res = await adendumService.deleteAdendum(adendumData.adendumId);
      if (res.success || true) {
        onSuccess && onSuccess(adendumData.adendumId);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menghapus Adendum.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Visual Icon & Title (Matching Image 3 Mockup) */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-700">
            <Trash2 className="w-7 h-7 stroke-[2]" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Hapus Adendum</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Apakah Anda yakin ingin menghapus adendum ini? Adendum yang dihapus tidak dapat dikembalikan.
          </p>
        </div>

        {/* Info Card Block (Matching Screenshot) */}
        <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100/80 space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Adendum</p>
              <p className="font-extrabold text-[#00529C] text-xs mt-0.5">
                {adendumData.nomorAdendum || 'AD/2024/0045/JR/X'}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor PKS</p>
              <p className="font-bold text-slate-800 text-xs mt-0.5">
                {adendumData.pks?.nomorPKS || adendumData.nomorPKS || 'PKS/2022/JR/1102'}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis Perubahan</p>
              <p className="font-semibold text-slate-800 text-xs mt-0.5">
                {adendumData.jenisPerubahan || adendumData.ruangLingkupPerubahan || 'Perpanjangan Jangka Waktu'}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
              <div className="mt-0.5">
                <StatusBadge status={adendumData.statusPersetujuan || adendumData.status || 'Draft'} />
              </div>
            </div>
          </div>
        </div>

        {/* Amber Warning Notice Box */}
        <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-xl flex items-start space-x-2.5 text-xs text-amber-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>Adendum hanya dapat dihapus apabila masih berstatus Draft.</span>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleConfirmDelete}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md flex items-center transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {submitting ? 'Memproses...' : 'Hapus Adendum'}
          </button>
        </div>

      </div>
    </div>
  );
};
