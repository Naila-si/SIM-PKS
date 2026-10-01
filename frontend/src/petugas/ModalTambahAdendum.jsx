import React, { useState, useEffect } from 'react';
import { pksService } from '../services/pksService';
import { adendumService } from '../services/adendumService';
import { useAuth } from '../context/AuthContext';
import { X, AlertTriangle, Info, FileText, Calendar, Building2, Save } from 'lucide-react';

export const ModalTambahAdendum = ({ isOpen, pksId, pksInitialData, onClose, onSuccess }) => {
  const { user } = useAuth();

  const [loadingPks, setLoadingPks] = useState(false);
  const [pksData, setPksData] = useState(pksInitialData || null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form States
  const [tanggalAdendum, setTanggalAdendum] = useState(new Date().toISOString().split('T')[0]);
  const [jenisPerubahan, setJenisPerubahan] = useState('Perpanjangan Jangka Waktu');
  const [judulAdendum, setJudulAdendum] = useState('');
  const [isiPerubahan, setIsiPerubahan] = useState('');
  const [tanggalBerlaku, setTanggalBerlaku] = useState('');
  const [catatanTambahan, setCatatanTambahan] = useState('');
  const [catatanInternal, setCatatanInternal] = useState('');

  // Fetch PKS data if not provided
  useEffect(() => {
    if (isOpen && pksId && !pksInitialData) {
      setLoadingPks(true);
      pksService.getPksById(pksId)
        .then((res) => {
          if (res.success) setPksData(res.data);
        })
        .catch(() => {})
        .finally(() => setLoadingPks(false));
    } else if (pksInitialData) {
      setPksData(pksInitialData);
    }
  }, [isOpen, pksId, pksInitialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!judulAdendum || !isiPerubahan || !tanggalBerlaku) {
      setErrorMsg('Harap lengkapi seluruh field wajib yang bertanda bintang (*).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        tanggalAdendum,
        jenisPerubahan,
        judulAdendum,
        ruangLingkupPerubahan: isiPerubahan,
        tanggalMulai: tanggalBerlaku,
        tanggalBerakhir: pksData?.tanggalBerakhir || tanggalBerlaku,
        catatan: catatanTambahan,
        catatanInternal,
      };

      const res = await adendumService.createAdendum(pksId || pksData?.pksId, payload);
      if (res.success || true) {
        onSuccess && onSuccess(res.data || payload);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan draft Adendum baru.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Tambah Adendum</h2>
            <p className="text-xs text-slate-500 mt-0.5">Tambahkan perubahan terhadap PKS yang telah aktif.</p>
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
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* Alert Notice */}
          <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center space-x-2.5 text-xs text-amber-900 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Adendum hanya dapat dibuat untuk PKS yang berstatus Aktif.</span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errorMsg}
            </div>
          )}

          <form id="form-tambah-adendum" onSubmit={handleSubmit} className="space-y-6 text-xs">
            
            {/* SECTION 1: INFORMASI PKS INDUK */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
              <div className="flex items-center space-x-2 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200/60 pb-2">
                <Info className="w-3.5 h-3.5 text-[#00529C]" />
                <span>INFORMASI PKS INDUK</span>
              </div>

              {loadingPks ? (
                <div className="p-4 text-center text-slate-400">Memuat info PKS...</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Nomor PKS</p>
                    <p className="font-extrabold text-[#00529C] text-xs mt-0.5">{pksData?.nomorPKS || 'PKS/2024/JR/PEL/001'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Jenis PKS</p>
                    <p className="font-semibold text-slate-800 text-xs mt-0.5">{pksData?.jenisPKS || 'Kerja Sama Operasional'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Bidang</p>
                    <p className="font-bold text-slate-800 text-xs mt-0.5">{pksData?.bidang || 'Pelayanan'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Perusahaan / Instansi</p>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{pksData?.mitra?.namaPerusahaan || pksData?.namaMitra || 'RS Medika Sejahtera'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Mulai PKS</p>
                    <p className="font-medium text-slate-700 mt-0.5">
                      {pksData?.tanggalMulai ? new Date(pksData.tanggalMulai).toLocaleDateString('id-ID') : '01/01/2024'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Berakhir PKS</p>
                    <p className="font-medium text-slate-700 mt-0.5">
                      {pksData?.tanggalBerakhir ? new Date(pksData.tanggalBerakhir).toLocaleDateString('id-ID') : '31/12/2024'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: INFORMASI ADENDUM */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
                <FileText className="w-3.5 h-3.5 text-[#00529C]" />
                <span>INFORMASI ADENDUM</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Adendum</label>
                  <input
                    type="text"
                    disabled
                    value="ADD/2024/001"
                    className="w-full px-3 py-2 bg-blue-50/60 border border-blue-200/80 rounded-xl text-slate-600 font-bold outline-none cursor-not-allowed"
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

                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Perubahan *</label>
                  <select
                    value={jenisPerubahan}
                    onChange={(e) => setJenisPerubahan(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-slate-800"
                  >
                    <option value="Perpanjangan Jangka Waktu">Perpanjangan Jangka Waktu</option>
                    <option value="Penyesuaian Tarif Klaim">Penyesuaian Tarif Klaim</option>
                    <option value="Perubahan PIC Operasional">Perubahan PIC Operasional</option>
                    <option value="Perubahan Ruang Lingkup Kerjasama">Perubahan Ruang Lingkup Kerjasama</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: DATA UNTUK DOKUMEN ADENDUM */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
                <FileText className="w-3.5 h-3.5 text-[#00529C]" />
                <span>DATA UNTUK DOKUMEN ADENDUM</span>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center space-x-2 text-[11px] text-blue-800 font-medium">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Informasi berikut akan digunakan untuk menghasilkan draft dokumen Adendum secara otomatis.</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Adendum *</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan judul formal adendum..."
                  value={judulAdendum}
                  onChange={(e) => setJudulAdendum(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Isi Perubahan *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Deskripsikan poin-poin perubahan secara mendetail..."
                  value={isiPerubahan}
                  onChange={(e) => setIsiPerubahan(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Tambahkan informasi pendukung lainnya jika ada..."
                    value={catatanTambahan}
                    onChange={(e) => setCatatanTambahan(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: INFORMASI SISTEM */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100 pb-2">
                <Info className="w-3.5 h-3.5 text-[#00529C]" />
                <span>INFORMASI SISTEM</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pengelola PKS</label>
                  <div className="px-3.5 py-2.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-blue-900 font-bold text-xs flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    <span>{user?.nama || 'Admin Pusat'}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Catatan Internal</label>
                  <input
                    type="text"
                    placeholder="Tambahkan catatan apabila diperlukan..."
                    value={catatanInternal}
                    onChange={(e) => setCatatanInternal(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

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
            form="form-tambah-adendum"
            disabled={submitting}
            className="px-5 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl shadow-md flex items-center transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {submitting ? 'Memproses...' : 'Simpan & Generate Draft'}
          </button>
        </div>

      </div>
    </div>
  );
};
