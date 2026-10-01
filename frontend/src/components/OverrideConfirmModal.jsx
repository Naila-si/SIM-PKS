import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

const OverrideConfirmModal = ({ isOpen, onClose, onConfirm, actionType = 'edit', title = '', loading = false }) => {
  const [alasanOverride, setAlasanOverride] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!alasanOverride || alasanOverride.trim().length < 5) {
      setError('Alasan override wajib diisi (minimal 5 karakter).');
      return;
    }
    setError('');
    onConfirm(alasanOverride);
  };

  const isDelete = actionType === 'delete';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-amber-200 dark:border-amber-900/50">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800/60">
          <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <h3 className="font-semibold text-base">
              Konfirmasi Override Admin ({isDelete ? 'Hapus' : 'Edit'})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <p>
              Anda akan melakukan <strong>{isDelete ? 'penghapusan' : 'perubahan'}</strong> PKS melalui hak akses paksa (Override Administrator Utama).
            </p>
            {title && (
              <p className="p-2 bg-slate-100 dark:bg-slate-700/60 rounded text-slate-800 dark:text-slate-200 font-mono text-xs">
                Target: {title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Alasan Override <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={alasanOverride}
              onChange={(e) => setAlasanOverride(e.target.value)}
              placeholder="Contoh: Pembatalan PKS atas instruksi direksi / Perbaikan nomor dokumen"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 ${
                isDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{loading ? 'Proses...' : isDelete ? 'Hapus (Override)' : 'Simpan (Override)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OverrideConfirmModal;
