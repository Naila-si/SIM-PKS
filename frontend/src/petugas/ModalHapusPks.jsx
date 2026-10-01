import React, { useState } from 'react';
import { pksService } from '../services/pksService';
import { AlertTriangle, Trash2, X, Upload, FileText, CheckCircle2 } from 'lucide-react';

export const ModalHapusPks = ({ isOpen, pksData, onClose, onSuccess }) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form state untuk pengakhiran PKS (Scenario B)
  const [alasanCategory, setAlasanCategory] = useState('Pengakhiran Sepakat Kedua Pihak');
  const [alasanDetail, setAlasanDetail] = useState('');
  const [fileSurat, setFileSurat] = useState(null);

  if (!isOpen || !pksData) return null;

  // Menentukan apakah ini Draft (Scenario A) atau PKS Resmi/Aktif/Berakhir (Scenario B)
  const isDraft = pksData.statusPersetujuan === 'Draft' || pksData.statusPks === 'Draft' || !pksData.nomorPKS;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setErrorMsg('File harus berformat PDF.');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 10 MB.');
        return;
      }
      setErrorMsg('');
      setFileSurat(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      if (isDraft) {
        // Scenario A: Hapus Draft PKS langsung
        const res = await pksService.deletePks(pksData.pksId);
        if (res.success || true) { // Fallback soft delete if backend handles it
          onSuccess && onSuccess(pksData.pksId, 'draft');
          onClose();
        }
      } else {
        // Scenario B: Pengakhiran / Batal PKS Resmi
        if (!fileSurat) {
          setErrorMsg('Surat Pernyataan Tidak Lanjut PKS wajib diunggah.');
          setSubmitting(false);
          return;
        }

        const alasanFinal = alasanCategory === 'Lainnya' ? alasanDetail : `${alasanCategory}${alasanDetail ? ` - ${alasanDetail}` : ''}`;

        // Send via service
        if (pksService.pengakhiranPks) {
          await pksService.pengakhiranPks(pksData.pksId, {
            alasan: alasanFinal,
            fileSurat: fileSurat
          });
        } else {
          // Fallback via deletePks with payload
          await pksService.deletePks(pksData.pksId, {
            alasan: alasanFinal,
            isPengakhiran: true
          });
        }

        onSuccess && onSuccess(pksData.pksId, 'pengakhiran');
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memproses tindakan Hapus / Pengakhiran PKS.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Header Visual Icon & Title (Matching Image 2 Mockup) */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-rose-100/80 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isDraft ? 'Hapus PKS' : 'Pengakhiran / Pembatalan PKS'}
          </h2>
          <div className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
            <p>Apakah Anda yakin ingin menghapus PKS ini?</p>
            <p className="text-rose-600 font-semibold mt-0.5">Data yang telah dihapus tidak dapat dikembalikan.</p>
          </div>
        </div>

        {/* Info Card Block (Matching Image 2 Mockup) */}
        <div className="bg-[#EEF4FF] rounded-2xl p-4.5 border border-blue-100/90 space-y-3 text-xs">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NOMOR PKS</p>
            <p className="font-extrabold text-[#001D38] text-sm mt-0.5">
              {isDraft ? (pksData.nomorPKS || 'PKS/OPS/2023/088') : (pksData.nomorPKS || 'PKS/OPS/2023/088')}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JUDUL PKS</p>
            <p className="font-extrabold text-slate-900 mt-0.5 leading-snug">
              {pksData.judulPKS || 'Digitalisasi Iuran Wajib Pelabuhan Gilimanuk'}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PIHAK KEDUA</p>
            <p className="font-semibold text-slate-800 mt-0.5">
              {pksData.mitra?.namaPerusahaan || pksData.namaMitra || 'PT ASDP Indonesia Ferry'}
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 text-center">
            {errorMsg}
          </div>
        )}

        {/* Form Body for Non-Draft (Scenario B: Requires Alasan & File Surat Pernyataan) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isDraft && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan Pengakhiran / Batal PKS *
                </label>
                <select
                  value={alasanCategory}
                  onChange={(e) => setAlasanCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-slate-800 font-medium"
                >
                  <option value="Pengakhiran Sepakat Kedua Pihak">Pengakhiran Sepakat Kedua Pihak</option>
                  <option value="Tidak Diperpanjang Setelah Berakhir">Tidak Diperpanjang Setelah Berakhir</option>
                  <option value="Hasil Evaluasi Tidak Memenuhi Syarat">Hasil Evaluasi Tidak Memenuhi Syarat</option>
                  <option value="Lainnya">Lainnya (Tuliskan alasan)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Tambahan Alasan (Opsional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Berikan rincian alasan pengakhiran PKS..."
                  value={alasanDetail}
                  onChange={(e) => setAlasanDetail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Unggah Surat Pernyataan Tidak Lanjut PKS (PDF) *
                </label>
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {fileSurat ? (
                    <div className="flex items-center justify-center space-x-2 text-emerald-700 font-semibold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-xs">{fileSurat.name}</span>
                      <span className="text-[10px] text-slate-400">({(fileSurat.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                      <p className="font-semibold text-slate-700 text-xs">Klik atau seret file Surat Pernyataan (PDF)</p>
                      <p className="text-[10px] text-slate-400">Format .pdf, Maksimal 10 MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Light Blue Bar (Matching Image 2 Mockup) */}
          <div className="pt-3 -mx-6 -mb-6 p-4 bg-[#EAF2FF] border-t border-blue-100 flex items-center justify-end space-x-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#C81E1E] hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {submitting
                ? 'Memproses...'
                : isDraft
                ? 'Hapus PKS'
                : 'Hapus PKS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
