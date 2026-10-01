import React, { useState } from 'react';
import { mitraService } from '../services/mitraService';
import { X, Building, Check } from 'lucide-react';

export const CreateMitraModal = ({ isOpen, onClose, onSuccess }) => {
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kontak, setKontak] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await mitraService.createMitra({
        namaPerusahaan,
        alamat,
        kontak,
        penanggungJawab,
      });

      if (res.success) {
        onSuccess(res.data);
        onClose();
        setNamaPerusahaan('');
        setAlamat('');
        setKontak('');
        setPenanggungJawab('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan mitra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00529C] flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Tambah Perusahaan Mitra</h3>
            <p className="text-xs text-slate-500">Tambah mitra baru secara cepat</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Perusahaan / Instansi *
            </label>
            <input
              type="text"
              value={namaPerusahaan}
              onChange={(e) => setNamaPerusahaan(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C] focus:outline-none"
              placeholder="Contoh: PT Transportasi Jaya"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Alamat Lengkap
            </label>
            <textarea
              rows="2"
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C] focus:outline-none"
              placeholder="Jl. Sudirman No. 10..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kontak / Telepon
              </label>
              <input
                type="text"
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C] focus:outline-none"
                placeholder="0812..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Penanggung Jawab
              </label>
              <input
                type="text"
                value={penanggungJawab}
                onChange={(e) => setPenanggungJawab(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C] focus:outline-none"
                placeholder="Nama Penanggung Jawab"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-3">
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
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#00529C] text-white hover:bg-[#003E75] flex items-center"
            >
              <Check className="w-3.5 h-3.5 mr-1" />
              Simpan Mitra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
