import React, { useState } from 'react';
import { AlertOctagon, X, Send } from 'lucide-react';

export const ApprovalActionModal = ({ isOpen, onClose, onSubmit, title, label }) => {
  const [catatanRevisi, setCatatanRevisi] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (catatanRevisi.trim().length < 10) {
      setError('Catatan revisi wajib diisi minimal 10 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(catatanRevisi);
      setCatatanRevisi('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal menyimpan catatan penolakan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title || 'Kembalikan Untuk Direvisi'}</h3>
            <p className="text-xs text-slate-500">Jelaskan poin perbaikan yang wajib diperbaiki oleh Petugas JR</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {label || 'Catatan Revisi / Alasan Penolakan * (Minimal 10 karakter)'}
            </label>
            <textarea
              rows="4"
              value={catatanRevisi}
              onChange={(e) => setCatatanRevisi(e.target.value)}
              placeholder="Contoh: Pasal 3 mengenai nilai santunan belum sesuai dengan SK Direksi terbaru. Mohon disesuaikan..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 flex items-center shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {isSubmitting ? 'Kirim...' : 'Kirim Catatan Revisi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
