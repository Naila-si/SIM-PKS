import React, { useState, useEffect } from 'react';
import { pksService } from '../services/pksService';
import { adendumService } from '../services/adendumService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ModalTambahAdendum } from './ModalTambahAdendum';
import {
  X, Info, FileText, Check, AlertCircle, Plus, MoreVertical,
  Eye, Edit3, Trash2, Download, Upload, Shield, Calendar
} from 'lucide-react';

export const ModalUbahPks = ({ isOpen, pksId, onClose, onSuccess }) => {
  const { user } = useAuth();

  // Data Loading States
  const [loading, setLoading] = useState(true);
  const [pksData, setPksData] = useState(null);
  const [adendumList, setAdendumList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields State - Section 1: Informasi PKS
  const [nomorPKS, setNomorPKS] = useState('');
  const [bidang, setBidang] = useState('');
  const [jenisPKS, setJenisPKS] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalBerakhir, setTanggalBerakhir] = useState('');
  const [judulPKS, setJudulPKS] = useState('');

  // Form Fields State - Section 2: Data Untuk Dokumen PKS (Mitra)
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [telepon, setTelepon] = useState('');
  const [email, setEmail] = useState('');

  // Addendum Filter & Popover State
  const [filterAdendumStatus, setFilterAdendumStatus] = useState('Semua');
  const [activeAdendumActionId, setActiveAdendumActionId] = useState(null);

  // Modal Tambah Adendum Interaktif
  const [isAddendumModalOpen, setIsAddendumModalOpen] = useState(false);
  const [addendumRuangLingkup, setAddendumRuangLingkup] = useState('');
  const [addendumTglMulai, setAddendumTglMulai] = useState('');
  const [addendumTglBerakhir, setAddendumTglBerakhir] = useState('');
  const [submittingAddendum, setSubmittingAddendum] = useState(false);

  // Load Data PKS & Adendum saat modal dibuka / pksId berubah
  useEffect(() => {
    if (isOpen && pksId) {
      const loadDetailData = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
          const [pksRes, adendumRes] = await Promise.all([
            pksService.getPksById(pksId),
            adendumService.getAdendumListByPks(pksId).catch(() => ({ success: false, data: [] })),
          ]);

          if (pksRes.success) {
            const p = pksRes.data;
            setPksData(p);
            setNomorPKS(p.nomor_pks || p.nomorPKS || '-');
            setBidang(p.bidang || '');
            setJenisPKS(p.jenis_pks || p.jenisPKS || '');
            setTanggalMulai(p.tanggal_mulai ? p.tanggal_mulai.split('T')[0] : (p.tanggalMulai ? p.tanggalMulai.split('T')[0] : ''));
            setTanggalBerakhir(p.tanggal_berakhir ? p.tanggal_berakhir.split('T')[0] : (p.tanggalBerakhir ? p.tanggalBerakhir.split('T')[0] : ''));
            setJudulPKS(p.ringkasan_pks || p.judulPKS || p.ruangLingkup || '');

            // Data Mitra
            setNamaPerusahaan(p.mitra?.nama_mitra || p.mitra?.namaPerusahaan || p.namaMitra || '');
            setAlamat(p.mitra?.alamat_mitra || p.mitra?.alamat || p.alamatMitra || '');
            setPenanggungJawab(p.mitra?.nama_pengelola || p.mitra?.penanggungJawab || p.penanggungJawabMitra || '');
            setJabatan(p.mitra?.jabatan || p.jabatanMitra || '-');
            setTelepon(p.mitra?.no_hp_pengelola || p.mitra?.kontak || p.teleponMitra || '');
            setEmail(p.mitra?.email_pengelola || p.mitra?.email || p.emailMitra || '');
          }

          if (adendumRes.success) {
            const rawAd = adendumRes.data;
            const adArray = Array.isArray(rawAd)
              ? rawAd
              : (Array.isArray(rawAd?.data) ? rawAd.data : []);
            setAdendumList(adArray);
          }
        } catch (err) {
          setErrorMsg('Gagal memuat detail PKS.');
        } finally {
          setLoading(false);
        }
      };
      loadDetailData();
    }
  }, [isOpen, pksId]);

  if (!isOpen) return null;

  // Penentuan Status: Apakah PKS Sudah Disetujui (Final) atau Masih Draft/Revisi
  const isDisetujui =
    (pksData?.status_persetujuan || pksData?.statusPersetujuan) === 'Disetujui' ||
    (pksData?.status_pks || pksData?.statusPks) === 'Aktif' ||
    (pksData?.status_pks || pksData?.statusPks) === 'Segera Berakhir' ||
    (pksData?.status_pks || pksData?.statusPks) === 'Berakhir';

  const isDraftOrRevisi = !isDisetujui;

  // User Roles
  const isPengelolaOrAdmin = user?.role === 'pengelola_pks' || user?.role === 'admin_utama';

  // Handler Perubahan Bidang
  const handleBidangChange = (newBidang) => {
    setBidang(newBidang);
    if (newBidang === 'IW') {
      setJenisPKS('IWKL Borongan');
    } else {
      setJenisPKS('Kerja Sama Operasional');
    }
  };

  // Submit Update PKS
  const handleSavePks = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (tanggalMulai && tanggalBerakhir && new Date(tanggalBerakhir) <= new Date(tanggalMulai)) {
      setErrorMsg('Tanggal Berakhir harus lebih besar dari Tanggal Mulai.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        bidang,
        jenis_pks: jenisPKS,
        ringkasan_pks: judulPKS || pksData?.ringkasan_pks || `PKS ${bidang} - ${namaPerusahaan}`,
        tanggal_mulai: tanggalMulai,
        tanggal_berakhir: tanggalBerakhir,
      };

      const res = await pksService.updatePks(pksId, payload);
      if (res.success) {
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        setErrorMsg(res.message || 'Gagal menyimpan perubahan PKS.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Adendum Baru
  const handleCreateAddendumSubmit = async (e) => {
    e.preventDefault();
    if (!addendumRuangLingkup || !addendumTglMulai || !addendumTglBerakhir) return;

    setSubmittingAddendum(true);
    try {
      const res = await adendumService.createAdendum(pksId, {
        ruangLingkupPerubahan: addendumRuangLingkup,
        tanggalMulai: addendumTglMulai,
        tanggalBerakhir: addendumTglBerakhir,
      });

      if (res.success) {
        const newAd = res.data;
        setAdendumList((prev) => [newAd, ...prev]);
        setIsAddendumModalOpen(false);
        setAddendumRuangLingkup('');
        setAddendumTglMulai('');
        setAddendumTglBerakhir('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat Adendum baru.');
    } finally {
      setSubmittingAddendum(false);
    }
  };

  // Filter Adendum Data
  const filteredAdendumList = adendumList.filter((item) => {
    if (filterAdendumStatus === 'Semua') return true;
    return (item.statusPersetujuan || item.status) === filterAdendumStatus;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* ================= STICKY HEADER MODAL ================= */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white z-10">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Ubah PKS</h2>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                (pksData?.status_pks || pksData?.statusPks) === 'Aktif'
                  ? 'bg-emerald-100 text-emerald-700'
                  : ((pksData?.status_pks || pksData?.statusPks) === 'Draft' || (pksData?.status_pks || pksData?.statusPks) === 'Draf')
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  (pksData?.status_pks || pksData?.statusPks) === 'Aktif'
                    ? 'bg-emerald-500'
                    : ((pksData?.status_pks || pksData?.statusPks) === 'Draft' || (pksData?.status_pks || pksData?.statusPks) === 'Draf')
                    ? 'bg-emerald-500'
                    : 'bg-rose-500'
                }`} />
                {pksData?.status_pks || pksData?.statusPks || 'Draf'}
              </span>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                (pksData?.status_persetujuan || pksData?.statusPersetujuan) === 'Disetujui'
                  ? 'bg-emerald-100 text-emerald-700'
                  : (pksData?.status_persetujuan || pksData?.statusPersetujuan || '').includes('Kabag')
                  ? 'bg-purple-100 text-purple-700'
                  : ((pksData?.status_persetujuan || pksData?.statusPersetujuan || '') === 'Menunggu Penyerahan')
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  (pksData?.status_persetujuan || pksData?.statusPersetujuan) === 'Disetujui'
                    ? 'bg-emerald-500'
                    : (pksData?.status_persetujuan || pksData?.statusPersetujuan || '').includes('Kabag')
                    ? 'bg-purple-500'
                    : ((pksData?.status_persetujuan || pksData?.statusPersetujuan || '') === 'Menunggu Penyerahan')
                    ? 'bg-blue-500'
                    : 'bg-emerald-500'
                }`} />
                {pksData?.status_persetujuan || pksData?.statusPersetujuan || 'Draf'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Perbarui Informasi PKS.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= SCROLLABLE FORM BODY ================= */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex-1">Memuat data PKS...</div>
        ) : (
          <form onSubmit={handleSavePks} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Notice Keterangan Editability */}
              {isDisetujui ? (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>PKS Telah Disetujui:</strong> Data inti template PKS (Nomor, Bidang, Tanggal, Mitra) dikunci agar sesuai dengan dokumen tercetak. Anda hanya dapat memperbarui informasi kontak/telepon atau menambahkan Adendum.
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Status Draft / Revisi:</strong> Seluruh form data PKS dapat diubah secara bebas oleh Petugas sebelum diajukan ke tahap persetujuan final.
                  </span>
                </div>
              )}

              {/* ================= SECTION 1: INFORMASI PKS (MATCHING IMAGE 5) ================= */}
              <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-[#00529C]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Informasi PKS
                  </h3>
                </div>

                {/* Grid Input Nomor PKS & Tanggal Mulai */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor PKS</label>
                    <input
                      type="text"
                      disabled
                      value={nomorPKS || '-'}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#EEF4FF] text-slate-700 font-bold outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Misal: 2026-10-03"
                        value={tanggalMulai || ''}
                        onChange={(e) => setTanggalMulai(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    </div>
                  </div>
                </div>

                {/* Grid Bidang & Tanggal Berakhir */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bidang</label>
                    <input
                      type="text"
                      disabled
                      value={bidang || '-'}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-[#EEF4FF] text-slate-700 font-medium outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Berakhir</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Misal: 2026-10-31"
                        value={tanggalBerakhir || ''}
                        onChange={(e) => setTanggalBerakhir(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    </div>
                  </div>
                </div>

                {/* Jenis PKS */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis PKS</label>
                  <select
                    value={jenisPKS || ''}
                    onChange={(e) => setJenisPKS(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {bidang === 'SW' && (
                      <option value="Sumbangan Wajib Dana Kecelakaan Lalu Lintas Jalan (SWDKLLJ)">
                        Sumbangan Wajib Dana Kecelakaan Lalu Lintas Jalan (SWDKLLJ)
                      </option>
                    )}
                    {bidang === 'IW' && (
                      <>
                        <option value="IWKL Manifest">IWKL Manifest</option>
                        <option value="IWKL Borongan">IWKL Borongan</option>
                        <option value="IWKBU">IWKBU</option>
                      </>
                    )}
                    {bidang === 'Pelayanan' && (
                      <option value="Pelayanan Kesehatan">Pelayanan Kesehatan</option>
                    )}
                    {(!bidang || !['SW', 'IW', 'Pelayanan'].includes(bidang)) && (
                      <>
                        <option value="PKS Rumah Sakit">PKS Rumah Sakit</option>
                        <option value="Kerja Sama Operasional">Kerja Sama Operasional</option>
                        <option value="IWKL Borongan">IWKL Borongan</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* ================= SECTION 2: DATA UNTUK DOKUMEN PKS (MATCHING IMAGE 5) ================= */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#00529C]" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Data Untuk Dokumen PKS
                  </h3>
                </div>

                {/* Info Alert Callout */}
                <div className="p-3.5 rounded-xl bg-[#EEF4FF] border border-blue-200 text-blue-900 text-xs flex items-start space-x-2 leading-relaxed">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>
                    Perubahan pada bagian ini akan mempengaruhi isi draft dokumen PKS yang dihasilkan oleh sistem. Harap pastikan data yang dimasukkan sudah valid.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Perusahaan</label>
                    <input
                      type="text"
                      value={namaPerusahaan || ''}
                      onChange={(e) => setNamaPerusahaan(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat</label>
                    <textarea
                      rows="3"
                      value={alamat || ''}
                      onChange={(e) => setAlamat(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon</label>
                      <input
                        type="text"
                        value={telepon || ''}
                        onChange={(e) => setTelepon(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={email || ''}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Penanggung Jawab</label>
                    <input
                      type="text"
                      value={penanggungJawab || ''}
                      onChange={(e) => setPenanggungJawab(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>



              {/* ================= SECTION 5: INFORMASI ADENDUM (MATCHING IMAGE 5) ================= */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-[#00529C]" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                      Informasi Adendum
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (pksData?.status_pks === 'Aktif' || pksData?.statusPks === 'Aktif') {
                        setIsAddendumModalOpen(true);
                      } else {
                        alert('Adendum hanya dapat dibuat untuk PKS yang berstatus Aktif.');
                      }
                    }}
                    disabled={pksData?.status_pks !== 'Aktif' && pksData?.statusPks !== 'Aktif'}
                    className={`inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 ${
                      (pksData?.status_pks === 'Aktif' || pksData?.statusPks === 'Aktif')
                        ? 'bg-[#00529C] hover:bg-[#003E75] text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Tambah Adendum
                  </button>
                </div>

                {/* 3 Ringkasan Card Adendum */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#EEF4FF] p-3.5 rounded-2xl border border-blue-100">
                    <p className="text-[11px] font-semibold text-slate-500">Jumlah Adendum</p>
                    <p className="text-xl font-extrabold text-slate-900 mt-0.5">{filteredAdendumList.length}</p>
                  </div>

                  <div className="bg-[#EEF4FF] p-3.5 rounded-2xl border border-blue-100">
                    <p className="text-[11px] font-semibold text-slate-500">Tanggal Adendum Terakhir</p>
                    <p className="text-xs font-bold text-slate-900 mt-1">
                      {filteredAdendumList.length > 0
                        ? (filteredAdendumList[0].tanggal_mulai || filteredAdendumList[0].tanggalMulai
                            ? new Date(filteredAdendumList[0].tanggal_mulai || filteredAdendumList[0].tanggalMulai).toLocaleDateString('id-ID')
                            : '-')
                        : '-'}
                    </p>
                  </div>

                  <div className="bg-[#EEF4FF] p-3.5 rounded-2xl border border-blue-100">
                    <p className="text-[11px] font-semibold text-slate-500">Status PKS Induk</p>
                    <p className="text-xs font-bold text-emerald-600 mt-1">{pksData?.status_pks || pksData?.statusPks || '-'}</p>
                  </div>
                </div>

                {/* Tabel Adendum */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 uppercase font-extrabold text-[10px]">
                        <tr>
                          <th className="px-4 py-3">Nomor Adendum</th>
                          <th className="px-4 py-3">Tanggal Dibuat</th>
                          <th className="px-4 py-3">Jenis Perubahan</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAdendumList.length > 0 ? (
                          filteredAdendumList.map((ad, idx) => (
                            <tr key={ad.adendumId || ad.id || idx} className="hover:bg-slate-50/70 transition-colors font-medium">
                              <td className="px-4 py-3.5 font-bold text-slate-900">
                                {ad.nomor_adendum || ad.nomorAdendum || ad.nomor || '-'}
                              </td>
                              <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                                {(ad.tanggal_mulai || ad.tanggalMulai) ? new Date(ad.tanggal_mulai || ad.tanggalMulai).toLocaleDateString('id-ID') : '-'}
                              </td>
                              <td className="px-4 py-3.5 text-slate-800">
                                {ad.ruang_lingkup || ad.ruangLingkupPerubahan || ad.jenis || '-'}
                              </td>
                              <td className="px-4 py-3.5 whitespace-nowrap">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {ad.status_persetujuan || ad.statusPersetujuan || ad.status || '-'}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="px-4 py-6 text-center text-slate-400">
                              Belum ada data adendum.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= STICKY FOOTER ACTIONS ================= */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0 bg-white z-10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-md flex items-center transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Memproses...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}

        {/* ================= MODAL TAMBAH ADENDUM INTERAKTIF ================= */}
        {isAddendumModalOpen && (
          <ModalTambahAdendum
            isOpen={isAddendumModalOpen}
            pksId={pksId}
            pksInitialData={pksData}
            onClose={() => setIsAddendumModalOpen(false)}
            onSuccess={(newAd) => {
              setAdendumList((prev) => [newAd, ...prev]);
            }}
          />
        )}
      </div>
    </div>
  );
};
