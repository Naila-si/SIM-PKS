import React, { useState, useEffect } from 'react';
import { pksService } from '../services/pksService';
import { mitraService } from '../services/mitraService';
import { X, Search, Plus, Info, FileText, Check, AlertCircle } from 'lucide-react';

export const ModalTambahPks = ({ isOpen, onClose, onSuccess }) => {
  // Form State - Section 1: Informasi PKS
  const [bidang, setBidang] = useState('');
  const [jenisPKS, setJenisPKS] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalBerakhir, setTanggalBerakhir] = useState('');
  const [judulPKS, setJudulPKS] = useState('');

  // Form State - Section 2: Data Untuk Dokumen PKS (Mitra)
  const [mitraList, setMitraList] = useState([]);
  const [selectedMitraId, setSelectedMitraId] = useState('');
  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [telepon, setTelepon] = useState('');
  const [email, setEmail] = useState('');

  // Mode Tambah Perusahaan Manual
  const [isManualMitra, setIsManualMitra] = useState(false);

  // Status & Error
  const [loadingMitra, setLoadingMitra] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Mitra List saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const fetchMitra = async () => {
        setLoadingMitra(true);
        try {
          const res = await mitraService.getMitraList({ per_page: 100 });
          if (res.success) {
            const rawMitra = res.data;
            const mitraArray = Array.isArray(rawMitra)
              ? rawMitra
              : (Array.isArray(rawMitra?.data) ? rawMitra.data : []);
            setMitraList(mitraArray);
          }
        } catch (err) {
          console.error('Gagal memuat mitra:', err);
        } finally {
          setLoadingMitra(false);
        }
      };
      fetchMitra();
    }
  }, [isOpen]);

  // Handler Perubahan Bidang -> Otomatis atur Jenis PKS
  const handleBidangChange = (newBidang) => {
    setBidang(newBidang);
    if (newBidang === 'IW') {
      setJenisPKS('IWKL Borongan'); // Default jenis PKS untuk IW
    } else if (newBidang === 'SW' || newBidang === 'Pelayanan') {
      setJenisPKS('Kerja Sama Operasional'); // Single jenis PKS untuk SW & Pelayanan
    } else {
      setJenisPKS('');
    }
  };

  // Handler Pilihan Mitra Dari Dropdown
  const handleSelectMitra = (mitraId) => {
    setSelectedMitraId(mitraId);
    if (!mitraId) {
      setNamaPerusahaan('');
      setAlamat('');
      setPenanggungJawab('');
      setJabatan('');
      setTelepon('');
      setEmail('');
      return;
    }

    const found = mitraList.find((m) => String(m.perusahaanId || m.mitraId) === String(mitraId));
    if (found) {
      setNamaPerusahaan(found.namaPerusahaan || '');
      setAlamat(found.alamat || '');
      setPenanggungJawab(found.penanggungJawab || found.namaPenanggungJawab || '');
      setJabatan(found.jabatan || 'Direktur Utama');
      setTelepon(found.kontak || found.telepon || found.nomorTelepon || '');
      setEmail(found.email || '');
    }
  };

  // Handler Reset Form & Close
  const handleResetAndClose = () => {
    setBidang('');
    setJenisPKS('');
    setTanggalMulai('');
    setTanggalBerakhir('');
    setJudulPKS('');
    setSelectedMitraId('');
    setNamaPerusahaan('');
    setAlamat('');
    setPenanggungJawab('');
    setJabatan('');
    setTelepon('');
    setEmail('');
    setIsManualMitra(false);
    setErrorMsg('');
    onClose();
  };

  // Handler Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!bidang) {
      setErrorMsg('Silakan pilih Bidang terlebih dahulu.');
      return;
    }

    if (!namaPerusahaan && !selectedMitraId) {
      setErrorMsg('Pilih atau masukkan Nama Perusahaan / Instansi Mitra.');
      return;
    }

    if (tanggalMulai && tanggalBerakhir && new Date(tanggalBerakhir) <= new Date(tanggalMulai)) {
      setErrorMsg('Tanggal Berakhir harus lebih besar dari Tanggal Mulai.');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalMitraId = selectedMitraId ? parseInt(selectedMitraId) : null;

      // Jika mitra diketik manual dan belum ada ID, buat mitra terlebih dahulu
      if (!finalMitraId && namaPerusahaan) {
        const createMitraRes = await mitraService.createMitra({
          namaPerusahaan,
          alamat,
          kontak: telepon,
          penanggungJawab,
        });

        if (createMitraRes.success && createMitraRes.data) {
          finalMitraId = createMitraRes.data.perusahaanId || createMitraRes.data.mitraId;
        }
      }

      if (!finalMitraId) {
        setErrorMsg('Perusahaan mitra tidak ditemukan. Silakan pilih atau buat data perusahaan mitra.');
        setIsSubmitting(false);
        return;
      }

      const payload = {
        mitraId: finalMitraId,
        bidang,
        jenisPKS: jenisPKS || 'Kerja Sama Operasional',
        ruangLingkup: judulPKS || `PKS ${bidang} - ${namaPerusahaan}`,
        judulPKS: judulPKS || `PKS ${bidang} - ${namaPerusahaan}`,
        tanggalMulai,
        tanggalBerakhir,
        alamatMitra: alamat,
        penanggungJawabMitra: penanggungJawab,
        jabatanMitra: jabatan,
        teleponMitra: telepon,
        emailMitra: email,
      };

      const res = await pksService.createPks(payload);
      if (res.success) {
        if (onSuccess) onSuccess(res.data);
        handleResetAndClose();
      } else {
        setErrorMsg(res.message || 'Gagal menyimpan draft PKS.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isIwActive = bidang === 'IW';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* STICKY HEADER MODAL */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Tambah PKS</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lengkapi informasi PKS untuk membuat draft dokumen secara otomatis.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE FORM BODY */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ================= SECTION 1: INFORMASI PKS ================= */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-4 bg-[#00529C] rounded-full" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Informasi PKS
                </h3>
              </div>

              {/* Grid Input Bidang & Jenis PKS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bidang */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bidang *</label>
                  <select
                    required
                    value={bidang}
                    onChange={(e) => handleBidangChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value="">Pilih Bidang</option>
                    <option value="IW">IW (Iuran Wajib)</option>
                    <option value="Pelayanan">Pelayanan</option>
                    <option value="SW">SW (Sumbangan Wajib)</option>
                  </select>
                </div>

                {/* Jenis PKS (Aktif hanya untuk IW) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis PKS {isIwActive && '*'}
                  </label>
                  {isIwActive ? (
                    <select
                      required
                      value={jenisPKS}
                      onChange={(e) => setJenisPKS(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-blue-300 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="">Pilih Jenis PKS</option>
                      <option value="IWKL Borongan">IWKL Borongan</option>
                      <option value="IWKL Manifest">IWKL Manifest</option>
                      <option value="IWKBU">IWKBU</option>
                    </select>
                  ) : (
                    <select
                      disabled
                      value={jenisPKS}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-400 font-medium cursor-not-allowed outline-none"
                    >
                      <option value="">
                        {bidang ? 'Kerja Sama Operasional' : 'Pilih Jenis PKS'}
                      </option>
                    </select>
                  )}
                </div>
              </div>

              {/* Judul PKS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul PKS
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kerja Sama Layanan Perawatan Korban Laka RS Medika..."
                  value={judulPKS}
                  onChange={(e) => setJudulPKS(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              {/* Grid Tanggal Mulai & Tanggal Berakhir */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Mulai *
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalMulai}
                    onChange={(e) => setTanggalMulai(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Berakhir *
                  </label>
                  <input
                    type="date"
                    required
                    value={tanggalBerakhir}
                    onChange={(e) => setTanggalBerakhir(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ================= SECTION 2: DATA UNTUK DOKUMEN PKS ================= */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-4 bg-[#00529C] rounded-full" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Data Untuk Dokumen PKS
                </h3>
              </div>

              {/* Info Banner Alert */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start space-x-2.5 leading-relaxed">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Informasi pada bagian ini akan digunakan untuk menghasilkan draft dokumen PKS secara otomatis berdasarkan template yang dipilih.
                </span>
              </div>

              {/* Nama Perusahaan / Instansi Search & Button */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Perusahaan / Instansi *
                </label>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={selectedMitraId}
                      onChange={(e) => {
                        setIsManualMitra(false);
                        handleSelectMitra(e.target.value);
                      }}
                      className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="">Cari perusahaan dari database...</option>
                      {mitraList.map((m) => (
                        <option key={m.perusahaanId || m.mitraId} value={m.perusahaanId || m.mitraId}>
                          {m.namaPerusahaan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsManualMitra(true);
                      setSelectedMitraId('');
                      setNamaPerusahaan('');
                      setAlamat('');
                      setPenanggungJawab('');
                      setJabatan('');
                      setTelepon('');
                      setEmail('');
                    }}
                    className="inline-flex items-center justify-center px-4 py-2.5 border border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-semibold rounded-xl transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Tambah Data Perusahaan
                  </button>
                </div>

                {/* Input Manual Nama Perusahaan (jika mode manual aktif atau nama belum terisi) */}
                {(isManualMitra || (!selectedMitraId && namaPerusahaan)) && (
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama perusahaan / instansi..."
                    value={namaPerusahaan}
                    onChange={(e) => setNamaPerusahaan(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                )}
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat</label>
                <textarea
                  rows="2"
                  placeholder="Masukkan alamat lengkap sesuai domisili perusahaan..."
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              {/* Grid Penanggung Jawab & Jabatan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Lengkap"
                    value={penanggungJawab}
                    onChange={(e) => setPenanggungJawab(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Direktur Utama"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>

              {/* Grid Nomor Telepon & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    placeholder="0812xxxx"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="example@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STICKY FOOTER ACTIONS */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0 bg-white z-10">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl shadow-md flex items-center transition-all cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              {isSubmitting ? 'Memproses...' : 'Simpan & Generate Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
