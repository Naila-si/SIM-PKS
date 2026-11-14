import React, { useState } from 'react';
import { pksService } from '../services/pksService';
import { X, Upload, FileText, AlertTriangle, CheckCircle2, Ban } from 'lucide-react';

export const ModalHentikanPks = ({ pks, isOpen, onClose, onSuccess }) => {
  const [alasan, setAlasan] = useState('');
  const [fileSurat, setFileSurat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !pks) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Berkas surat pernyataan harus berformat PDF.');
        setFileSurat(null);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Ukuran berkas tidak boleh melebihi 10MB.');
        setFileSurat(null);
        return;
      }
      setError('');
      setFileSurat(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!alasan.trim()) {
      setError('Harap isi alasan penghentian PKS.');
      return;
    }
    if (!fileSurat) {
      setError('Surat pernyataan tidak melanjutkan PKS wajib diunggah.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('alasan_penghentian', alasan.trim());
      formData.append('surat_penghentian', fileSurat);

      const pksId = pks.pksId || pks.id;
      const res = await pksService.hentikanPks(pksId, formData);

      if (res.success) {
        onSuccess && onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || 'Gagal memproses penghentian PKS.');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan pada server saat memproses data.');
    } finally {
      setLoading(false);
    }
  };

  const nomorPks = pks.nomorPKS || pks.nomor_pks || `ID: ${pks.pksId || pks.id}`;
  const namaMitra = pks.mitra?.namaPerusahaan || pks.mitra?.nama_mitra || pks.mitra?.nama || '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header Modal */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-50 via-slate-50 to-white border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Ban className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Penghentian Kerja Sama PKS
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pernyataan resmi bahwa PKS tidak dilanjutkan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Card Info PKS yang Dibatalkan */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-slate-500 uppercase">Nomor PKS</span>
              <span className="font-extrabold text-slate-800">{nomorPks}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-slate-500 uppercase">Mitra Rekanan</span>
              <span className="font-extrabold text-[#00529C]">{namaMitra}</span>
            </div>
          </div>

          {/* Alert Peringatan */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Tindakan ini akan mengubah status PKS menjadi <strong>"Tidak Dilanjutkan"</strong> dan mengarsipkan surat pernyataan sebagai bukti hukum digital.
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Input Alasan Penghentian */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Alasan Tidak Melanjutkan PKS <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Contoh: Kesepakatan kedua belah pihak untuk tidak memperpanjang masa kerja sama..."
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Unggah Berkas PDF Surat Pernyataan */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-800">
              Unggah Surat Pernyataan Tidak Melanjutkan (.pdf) <span className="text-rose-500">*</span>
            </label>
            
            <div className="relative border-2 border-dashed border-slate-200 hover:border-rose-400 rounded-2xl p-4 transition-all text-center bg-slate-50/50 hover:bg-rose-50/30">
              <input
                type="file"
                accept=".pdf,application/pdf"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {fileSurat ? (
                <div className="flex items-center justify-center space-x-2 text-rose-700 font-bold">
                  <FileText className="w-5 h-5 text-rose-600" />
                  <span className="truncate max-w-xs">{fileSurat.name}</span>
                  <span className="text-[10px] text-slate-400">({(fileSurat.size / 1024).toFixed(0)} KB)</span>
                </div>
              ) : (
                <div className="space-y-1 text-slate-500">
                  <Upload className="w-6 h-6 mx-auto text-slate-400" />
                  <p className="font-semibold text-slate-700">Klik atau geser berkas PDF ke sini</p>
                  <p className="text-[10px] text-slate-400">Format PDF, maksimal 10 MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20 transition-all flex items-center cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Konfirmasi Tidak Dilanjutkan'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

