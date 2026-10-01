import React, { useState } from 'react';
import { Upload, X, FileCheck, AlertCircle } from 'lucide-react';

export const DocumentUploadModal = ({ isOpen, onClose, onSubmit, title, description, accept = '.pdf', maxMB = 10 }) => {
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    if (selectedFile.size > maxMB * 1024 * 1024) {
      setError(`Ukuran file tidak boleh melebihi ${maxMB}MB.`);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Silakan pilih file dokumen terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(file);
      setFile(null);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Gagal mengunggah dokumen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{title || 'Unggah Dokumen'}</h3>
            <p className="text-xs text-slate-500">{description || 'Pilih file dokumen untuk diunggah ke sistem'}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 hover:border-[#00529C] rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
            <input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
              id="document-file-input"
            />
            <label htmlFor="document-file-input" className="cursor-pointer block space-y-2">
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              {file ? (
                <div className="flex items-center justify-center text-xs font-bold text-emerald-700">
                  <FileCheck className="w-4 h-4 mr-1 text-emerald-600" />
                  <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-slate-700">Klik untuk memilih file dokumen</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Format: {accept} (Maks. {maxMB}MB)</p>
                </div>
              )}
            </label>
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
              disabled={isSubmitting || !file}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#00529C] text-white hover:bg-[#003E75] flex items-center shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {isSubmitting ? 'Mengunggah...' : 'Unggah Dokumen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
