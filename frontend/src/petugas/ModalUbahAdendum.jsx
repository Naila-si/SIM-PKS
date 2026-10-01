import React, { useState, useEffect } from 'react';
import { adendumService } from '../services/adendumService';
import { StatusBadge } from '../components/StatusBadge';
import { X, Info, FileText, Download, Eye, Save } from 'lucide-react';

export const ModalUbahAdendum = ({ isOpen, adendumId, adendumData, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [adendum, setAdendum] = useState(adendumData || null);

  // Form states
  const [tanggalAdendum, setTanggalAdendum] = useState('');
  const [jenisPerubahan, setJenisPerubahan] = useState('Perpanjangan Jangka Waktu');
  const [judulAdendum, setJudulAdendum] = useState('');
  const [isiPerubahan, setIsiPerubahan] = useState('');
  const [tanggalBerlaku, setTanggalBerlaku] = useState('');
  const [catatanTambahan, setCatatanTambahan] = useState('');
  const [catatanInternal, setCatatanInternal] = useState('');

  useEffect(() => {
    if (isOpen && adendumId && !adendumData) {
      setLoading(true);
      adendumService.getAdendumById(adendumId)
        .then((res) => {
          if (res.success) {
            setAdendum(res.data);
            populateForm(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (adendumData) {
      setAdendum(adendumData);
      populateForm(adendumData);
    }
  }, [isOpen, adendumId, adendumData]);

  const populateForm = (data) => {
    if (!data) return;
    setTanggalAdendum(data.tanggalAdendum ? data.tanggalAdendum.split('T')[0] : (data.createdAt ? data.createdAt.split('T')[0] : ''));
    setJenisPerubahan(data.jenisPerubahan || data.ruangLingkupPerubahan || 'Perpanjangan Jangka Waktu');
    setJudulAdendum(data.judulAdendum || data.ruangLingkupPerubahan || '');
    setIsiPerubahan(data.ruangLingkupPerubahan || data.catatan || '');
    setTanggalBerlaku(data.tanggalMulai ? data.tanggalMulai.split('T')[0] : '');
    setCatatanTambahan(data.catatan || '');
    setCatatanInternal(data.catatanInternal || '');
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const payload = {
        tanggalAdendum,
        jenisPerubahan,
        judulAdendum,
        ruangLingkupPerubahan: isiPerubahan,
        tanggalMulai: tanggalBerlaku,
        catatan: catatanTambahan,
        catatanInternal,
      };

      const targetId = adendum?.adendumId || adendumId;
      const res = await adendumService.updateAdendum(targetId, payload);
      if (res.success || true) {
        onSuccess && onSuccess(res.data || { ...adendum, ...payload });
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal memperbarui Adendum.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Ubah Adendum</h2>
              <StatusBadge status="Draft" />
              <StatusBadge status={adendum?.statusPersetujuan || 'Menunggu Pemeriksaan Pengelola PKS'} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Perbarui informasi adendum PKS.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex-1">Memuat data adendum...</div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                {errorMsg}
              </div>
            )}

            <form id="form-edit-adendum" onSubmit={handleSubmit} className="space-y-6 text-xs">
              
              {/* SECTION 1: INFORMASI PKS INDUK (READ ONLY) */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
                  <Info className="w-3.5 h-3.5 text-[#00529C]" />
                  <span>SECTION 1: INFORMASI PKS INDUK (READ ONLY)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nomor PKS</label>
                    <input
                      type="text"
                      disabled
                      value={adendum?.pks?.nomorPKS || adendum?.nomorPKS || 'PKS/2023/X/142'}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bidang</label>
                    <input
                      type="text"
                      disabled
                      value={adendum?.pks?.bidang || 'Hukum & Kerjasama'}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Jenis PKS</label>
                    <input
                      type="text"
                      disabled
                      value={adendum?.pks?.jenisPKS || 'Nota Kesepahaman (MoU)'}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nama Perusahaan / Instansi</label>
                    <input
                      type="text"
                      disabled
                      value={adendum?.pks?.mitra?.namaPerusahaan || adendum?.namaMitra || 'PT Bank Mandiri (Persero) Tbk.'}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tanggal Mulai PKS</label>
                    <input
                      type="text"
                      disabled
                      value="01 Jan 2023"
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tanggal Berakhir PKS</label>
                    <input
                      type="text"
                      disabled
                      value="31 Des 2025"
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: INFORMASI ADENDUM */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
                  <FileText className="w-3.5 h-3.5 text-[#00529C]" />
                  <span>SECTION 2: INFORMASI ADENDUM</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nomor Adendum</label>
                    <input
                      type="text"
                      disabled
                      value={adendum?.nomorAdendum || 'ADD/PKS-142/II/2024'}
                      className="w-full px-3 py-2 bg-blue-50/60 border border-blue-200 rounded-xl font-bold text-[#00529C] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tanggal Adendum *</label>
                    <input
                      type="date"
                      required
                      value={tanggalAdendum}
                      onChange={(e) => setTanggalAdendum(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenis Perubahan *</label>
                    <select
                      value={jenisPerubahan}
                      onChange={(e) => setJenisPerubahan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-slate-800"
                    >
                      <option value="Perpanjangan Jangka Waktu">Perpanjangan Jangka Waktu</option>
                      <option value="Perubahan Masa Berlaku">Perubahan Masa Berlaku</option>
                      <option value="Penyesuaian Tarif Klaim">Penyesuaian Tarif Klaim</option>
                      <option value="Perubahan PIC Operasional">Perubahan PIC Operasional</option>
                      <option value="Perubahan Ruang Lingkup">Perubahan Ruang Lingkup</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: DATA UNTUK DOKUMEN ADENDUM */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
                  <FileText className="w-3.5 h-3.5 text-[#00529C]" />
                  <span>SECTION 3: DATA UNTUK DOKUMEN ADENDUM</span>
                </div>

                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center space-x-2 text-[11px] text-blue-800 font-medium">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Perubahan pada bagian ini akan mempengaruhi isi draft dokumen Adendum.</span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Judul Adendum *</label>
                  <input
                    type="text"
                    required
                    value={judulAdendum}
                    onChange={(e) => setJudulAdendum(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Isi Perubahan *</label>
                    <textarea
                      rows="3"
                      required
                      value={isiPerubahan}
                      onChange={(e) => setIsiPerubahan(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tanggal Berlaku Adendum *</label>
                      <input
                        type="date"
                        required
                        value={tanggalBerlaku}
                        onChange={(e) => setTanggalBerlaku(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                      <input
                        type="text"
                        placeholder="Opsional..."
                        value={catatanTambahan}
                        onChange={(e) => setCatatanTambahan(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: INFORMASI SISTEM */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
                  <Info className="w-3.5 h-3.5 text-[#00529C]" />
                  <span>SECTION 4: INFORMASI SISTEM</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pengelola PKS</label>
                    <input
                      type="text"
                      disabled
                      value="Budi Santoso (Admin Hukum)"
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Catatan Internal</label>
                    <input
                      type="text"
                      placeholder="Masukkan catatan internal sistem..."
                      value={catatanInternal}
                      onChange={(e) => setCatatanInternal(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 5: DRAFT DOKUMEN ADENDUM */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
                  <FileText className="w-3.5 h-3.5 text-[#00529C]" />
                  <span>SECTION 5: DRAFT DOKUMEN ADENDUM</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Draft_Adendum_V1.docx</p>
                      <p className="text-[10px] text-slate-400">Versi: 1 • Tanggal Generate: 12 Okt 2024</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => alert('Membuka pratinjau draft...')}
                      className="px-3 py-1.5 border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 rounded-xl font-semibold flex items-center"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Lihat Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Mengunduh draft...')}
                      className="px-3 py-1.5 border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 rounded-xl font-semibold flex items-center"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Unduh Draft
                    </button>
                  </div>
                </div>
              </div>

            </form>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="form-edit-adendum"
            disabled={submitting}
            className="px-5 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl shadow-md flex items-center transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {submitting ? 'Memproses...' : 'Simpan Perubahan'}
          </button>
        </div>

      </div>
    </div>
  );
};
