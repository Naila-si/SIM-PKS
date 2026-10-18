import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CustomDialog } from '../components/CustomDialog';
import { 
  Save, ArrowLeft, Building2, Search, Check, ChevronDown, 
  Plus, X, AlertCircle, Calendar, Layers, ShieldCheck 
} from 'lucide-react';

export const PksCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [mitras, setMitras] = useState([]);
  const [loading, setLoading] = useState(false);

  // Professional Dialog State
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    confirmText: '',
  });

  const showDialog = (type, title, message, onConfirm = null, confirmText = '') => {
    setDialogState({ isOpen: true, type, title, message, onConfirm, confirmText });
  };

  // Official Jenis PKS Options by Bidang (Permintaan Klien)
  const jenisOptions = {
    'Pelayanan': ['Pelayanan Kesehatan'],
    'SW': ['SWDKLLJ'],
    'IW': ['IWKBU', 'IWKL Borongan', 'IWKL Manifest']
  };

  // Main PKS Form State (Default Bidang Pelayanan & Jenis PKS pertamanya)
  const [formData, setFormData] = useState({
    bidang: 'Pelayanan',
    jenis_pks: 'Pelayanan Kesehatan',
    mitraId: '',
    ringkasan_pks: '',
    tanggal_mulai: '',
    tanggal_berakhir: ''
  });

  // Searchable Mitra Autocomplete State
  const [mitraSearchQuery, setMitraSearchQuery] = useState('');
  const [isMitraDropdownOpen, setIsMitraDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mitra Modal States
  const [showMitraModal, setShowMitraModal] = useState(false);
  const [newMitra, setNewMitra] = useState({
    nama_mitra: '',
    nama_pengelola: '',
    jabatan: '',
    no_hp_pengelola: '',
    email_pengelola: '',
    alamat_mitra: ''
  });
  const [savingMitra, setSavingMitra] = useState(false);

  // Fetch all active mitras
  const fetchMitras = async () => {
    try {
      const res = await fetch('/api/mitra');
      const data = await res.json();
      if (Array.isArray(data)) {
        setMitras(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMitras();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMitraDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper: Hitung tanggal minimal berakhir (minimal 30 hari dari tanggal mulai)
  const calculateMinEndDate = (startDateStr) => {
    if (!startDateStr) return '';
    const date = new Date(startDateStr);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  // Handle Bidang Change: Reset Jenis PKS & reset Mitra terpilih
  const handleBidangChange = (e) => {
    const newBidang = e.target.value;
    const defaultJenis = jenisOptions[newBidang] ? jenisOptions[newBidang][0] : '';

    setFormData(prev => ({
      ...prev,
      bidang: newBidang,
      jenis_pks: defaultJenis,
      mitraId: '' // Reset mitra karena bidang telah berubah
    }));

    setMitraSearchQuery('');
    setIsMitraDropdownOpen(false);
  };

  // Filter mitras by selected bidang and search query
  const mitrasInBidang = mitras.filter(m => {
    const isAktif = m.status_mitra === 'Aktif' || !m.status_mitra;
    // Cocokkan bidang mitra dengan bidang yang dipilih di form
    const isMatchingBidang = !m.bidang || m.bidang.toLowerCase() === formData.bidang.toLowerCase();
    return isAktif && isMatchingBidang;
  });

  const filteredMitras = mitrasInBidang.filter(m =>
    (m.nama_mitra || '').toLowerCase().includes(mitraSearchQuery.toLowerCase())
  );

  const selectedMitraObj = mitras.find(m => String(m.mitraId) === String(formData.mitraId));

  // Handle Save New Mitra from Modal
  const handleSaveMitra = async (e) => {
    e.preventDefault();
    setSavingMitra(true);

    try {
      const payload = {
        ...newMitra,
        bidang: formData.bidang, // Otomatis terikat ke bidang yang dipilih
        status_mitra: 'Aktif'
      };

      const res = await fetch('/api/mitra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        await fetchMitras();

        // Otomatis pilih mitra yang baru dibuat
        setFormData(prev => ({ ...prev, mitraId: saved.mitraId }));
        setMitraSearchQuery(saved.nama_mitra);
        setShowMitraModal(false);
        setNewMitra({ nama_mitra: '', nama_pengelola: '', jabatan: '', no_hp_pengelola: '', email_pengelola: '', alamat_mitra: '' });
        showToast('success', `Perusahaan mitra "${saved.nama_mitra}" berhasil ditambahkan ke bidang ${formData.bidang} dan langsung terpilih.`);
      } else {
        const errData = await res.json().catch(() => ({}));
        showDialog('error', 'Gagal Menyimpan Mitra', errData.message || 'Pastikan semua kolom wajib telah terisi dengan benar.');
      }
    } catch (err) {
      console.error(err);
      showDialog('error', 'Gangguan Jaringan', 'Terjadi kesalahan saat menyimpan data mitra.');
    } finally {
      setSavingMitra(false);
    }
  };

  // Submit Main PKS Form
  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.mitraId) {
      showDialog('error', 'Perusahaan Mitra Wajib Dipilih', 'Silakan pilih perusahaan/instansi mitra yang sesuai dengan bidang kerja sama terlebih dahulu.');
      return;
    }

    // Validasi Tanggal: Selisih minimal 30 hari (1 bulan)
    if (formData.tanggal_mulai && formData.tanggal_berakhir) {
      const start = new Date(formData.tanggal_mulai);
      const end = new Date(formData.tanggal_berakhir);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 30) {
        showDialog(
          'error',
          'Validasi Masa Berlaku PKS',
          `Tanggal berakhir tidak diperbolehkan kurang dari 30 hari (1 bulan) dari tanggal mulai. Selisih saat ini: ${diffDays > 0 ? diffDays : 0} hari.`
        );
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        penggunaId: user?.penggunaId || user?.id || 1
      };

      const res = await fetch('/api/pks-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const pks = await res.json();
      
      if (!res.ok) {
        showDialog('error', 'Gagal Menyimpan Draf PKS', pks.message || 'Pastikan semua formulir terisi dengan lengkap.');
        setLoading(false);
        return;
      }

      showDialog(
        'success',
        'Draf PKS Berhasil Disimpan!',
        'Dokumen draf PKS telah berhasil dibuat dan disimpan ke dalam sistem.',
        () => navigate('/pks'),
        'Lihat Daftar PKS'
      );
      
    } catch (err) {
      console.error(err);
      showDialog('error', 'Gangguan Jaringan', 'Terjadi kesalahan saat menyimpan draf PKS.');
    } finally {
      setLoading(false);
    }
  };

  // Hitung selisih hari untuk validasi visual live
  const calculateDaysDiff = () => {
    if (!formData.tanggal_mulai || !formData.tanggal_berakhir) return null;
    const start = new Date(formData.tanggal_mulai);
    const end = new Date(formData.tanggal_berakhir);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysDiff = calculateDaysDiff();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Buat Draf PKS Baru</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ikuti tahapan: pilih bidang, jenis PKS, dan rekanan mitra yang sesuai.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          
          {/* ================= LANGKAH 1 & 2: BIDANG & JENIS PKS ================= */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#00529C] uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Tahap 1 & 2: Klasifikasi Bidang & Jenis PKS</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Bidang Kerja Sama */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  1. Bidang Kerja Sama <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={formData.bidang} 
                  onChange={handleBidangChange} 
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C] text-slate-800 shadow-2xs"
                >
                  <option value="Pelayanan">Pelayanan</option>
                  <option value="SW">Sumbangan Wajib (SW)</option>
                  <option value="IW">Iuran Wajib (IW)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pilihan bidang menentukan jenis PKS dan daftar mitra yang tersedia.
                </p>
              </div>

              {/* 2. Jenis PKS */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  2. Jenis PKS <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={formData.jenis_pks} 
                  onChange={e => setFormData({ ...formData, jenis_pks: e.target.value })} 
                  className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C] text-slate-800 shadow-2xs"
                >
                  {(jenisOptions[formData.bidang] || []).map(opsi => (
                    <option key={opsi} value={opsi}>{opsi}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Khusus bidang <span className="font-bold text-[#00529C]">{formData.bidang}</span>.
                </p>
              </div>
            </div>
          </div>

          {/* ================= LANGKAH 3: PEMILIHAN PERUSAHAAN MITRA ================= */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-800">
                3. Perusahaan / Instansi Mitra ({formData.bidang}) <span className="text-rose-500">*</span>
              </label>
              
              <button 
                type="button" 
                onClick={() => {
                  setNewMitra({
                    nama_mitra: mitraSearchQuery || '',
                    nama_pengelola: '',
                    no_hp_pengelola: '',
                    email_pengelola: '',
                    alamat_mitra: ''
                  });
                  setShowMitraModal(true);
                  setIsMitraDropdownOpen(false);
                }} 
                className="text-xs font-bold text-[#00529C] hover:text-blue-800 flex items-center cursor-pointer bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>+ Buat Mitra Baru</span>
              </button>
            </div>

            {/* Selected Mitra Card (jika sudah terpilih) */}
            {selectedMitraObj ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xs font-bold text-slate-900">{selectedMitraObj.nama_mitra}</h4>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                        Terpilih ({formData.bidang})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      PIC: {selectedMitraObj.nama_pengelola || '-'} ({selectedMitraObj.no_hp_pengelola || '-'})
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-lg mt-0.5">
                      {selectedMitraObj.alamat_mitra || 'Alamat belum diatur'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, mitraId: '' }));
                    setMitraSearchQuery('');
                    setIsMitraDropdownOpen(true);
                  }}
                  className="px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-200 rounded-xl transition cursor-pointer shrink-0 shadow-2xs"
                >
                  Ganti Perusahaan
                </button>
              </div>
            ) : (
              /* Searchable Autocomplete Dropdown Input */
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <input
                    type="text"
                    value={mitraSearchQuery}
                    onChange={(e) => {
                      setMitraSearchQuery(e.target.value);
                      setIsMitraDropdownOpen(true);
                    }}
                    onFocus={() => setIsMitraDropdownOpen(true)}
                    placeholder={`Ketik untuk mencari nama perusahaan di bidang ${formData.bidang}...`}
                    className="w-full pl-10 pr-10 py-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C] bg-white shadow-2xs"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setIsMitraDropdownOpen(!isMitraDropdownOpen)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Dropdown Menu Results */}
                {isMitraDropdownOpen && (
                  <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {filteredMitras.length > 0 ? (
                      filteredMitras.map((mitra) => (
                        <div
                          key={mitra.mitraId}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, mitraId: mitra.mitraId }));
                            setMitraSearchQuery(mitra.nama_mitra);
                            setIsMitraDropdownOpen(false);
                          }}
                          className="p-3 hover:bg-sky-50/70 cursor-pointer transition flex items-center justify-between group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-[#00529C] rounded-lg transition">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900 group-hover:text-[#00529C]">
                                {mitra.nama_mitra}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                PIC: {mitra.nama_pengelola || '-'} • {mitra.no_hp_pengelola || '-'}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-700">
                            Pilih
                          </span>
                        </div>
                      ))
                    ) : (
                      /* KONDISI TIDAK DITEMUKAN: Sesuai Permintaan Klien */
                      <div className="p-5 text-center space-y-2">
                        <div className="w-9 h-9 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">
                          Tidak ada nama perusahaan yang Anda cari
                        </h4>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          {mitraSearchQuery 
                            ? `Perusahaan "${mitraSearchQuery}" belum terdaftar pada bidang ${formData.bidang}.` 
                            : `Belum ada mitra terdaftar pada bidang ${formData.bidang}.`}
                        </p>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setNewMitra({
                                nama_mitra: mitraSearchQuery || '',
                                nama_pengelola: '',
                                no_hp_pengelola: '',
                                email_pengelola: '',
                                alamat_mitra: ''
                              });
                              setShowMitraModal(true);
                              setIsMitraDropdownOpen(false);
                            }}
                            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#00529C] hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Buat Mitra Baru Sekarang</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ================= LANGKAH 4: RINGKASAN PKS ================= */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              4. Ringkasan / Subjek PKS <span className="text-rose-500">*</span>
            </label>
            <textarea 
              required 
              rows="3" 
              value={formData.ringkasan_pks} 
              onChange={e => setFormData({ ...formData, ringkasan_pks: e.target.value })} 
              placeholder="Contoh: Perjanjian kerja sama penanganan korban kecelakaan lalu lintas jalan dengan fasilitas kesehatan..." 
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C] shadow-2xs"
            ></textarea>
          </div>

          {/* ================= LANGKAH 5: TANGGAL & VALIDASI MINIMAL 30 HARI ================= */}
          <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-[#00529C]" />
              <span>5. Periode Masa Berlaku (Minimal 30 Hari / 1 Bulan)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Tanggal Mulai Berlaku <span className="text-rose-500">*</span>
                </label>
                <input 
                  required 
                  type="date" 
                  value={formData.tanggal_mulai} 
                  onChange={e => {
                    const newStart = e.target.value;
                    const minEnd = calculateMinEndDate(newStart);
                    setFormData(prev => ({
                      ...prev,
                      tanggal_mulai: newStart,
                      // Jika tanggal berakhir sudah diisi tapi kurang dari minEnd, reset atau sesuaikan
                      tanggal_berakhir: prev.tanggal_berakhir && prev.tanggal_berakhir < minEnd ? minEnd : prev.tanggal_berakhir
                    }));
                  }} 
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C] shadow-2xs font-medium" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Tanggal Berakhir Berlaku <span className="text-rose-500">*</span>
                </label>
                <input 
                  required 
                  type="date" 
                  min={calculateMinEndDate(formData.tanggal_mulai) || undefined}
                  value={formData.tanggal_berakhir} 
                  onChange={e => setFormData({ ...formData, tanggal_berakhir: e.target.value })} 
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C] shadow-2xs font-medium" 
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Minimal berjarak 30 hari dari tanggal mulai berlaku.
                </p>
              </div>
            </div>

            {/* Peringatan Live jika selisih < 30 hari */}
            {daysDiff !== null && daysDiff < 30 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">
                  Masa berlaku PKS tidak boleh kurang dari 30 hari (1 bulan). Selisih saat ini: {daysDiff > 0 ? `${daysDiff} hari` : 'tanggal berakhir tidak valid'}.
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button 
              type="submit" 
              disabled={loading || (daysDiff !== null && daysDiff < 30)}
              className={`inline-flex items-center px-6 py-3 text-xs font-bold text-white rounded-xl shadow-md transition-all ${
                loading || (daysDiff !== null && daysDiff < 30)
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#00529C] to-blue-600 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              {loading ? (
                <>Tunggu Sebentar...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Draf PKS
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ================= MODAL TAMBAH MITRA BARU ================= */}
      {showMitraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Tambah Mitra Baru</h2>
                <p className="text-[11px] text-slate-500">Mendaftarkan rekanan mitra baru untuk bidang {formData.bidang}</p>
              </div>
              <button 
                onClick={() => setShowMitraModal(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMitra} className="p-6 space-y-4">
              {/* Kolom Bidang Otomatis Terkunci */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Bidang Mitra (Terkunci Otomatis)
                </label>
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-[#00529C]">
                  <span>{formData.bidang}</span>
                  <span className="text-[10px] font-semibold text-slate-500 flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Sesuai Pilihan Tahap 1
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Instansi / Perusahaan <span className="text-rose-500">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  value={newMitra.nama_mitra} 
                  onChange={e => setNewMitra({ ...newMitra, nama_mitra: e.target.value })} 
                  placeholder="Contoh: RS Permata Hati / PO Harapan Jaya"
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C]" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nama PIC / Pimpinan <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={newMitra.nama_pengelola} 
                    onChange={e => setNewMitra({ ...newMitra, nama_pengelola: e.target.value })} 
                    placeholder="Nama PIC"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Jabatan PIC
                  </label>
                  <input 
                    type="text" 
                    value={newMitra.jabatan} 
                    onChange={e => setNewMitra({ ...newMitra, jabatan: e.target.value })} 
                    placeholder="Contoh: Direktur / Kepala Cabang"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C]" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    No. HP PIC <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    required 
                    type="text" 
                    value={newMitra.no_hp_pengelola} 
                    onChange={e => setNewMitra({ ...newMitra, no_hp_pengelola: e.target.value })} 
                    placeholder="0812xxxxxxxx"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email PIC</label>
                  <input 
                    type="email" 
                    value={newMitra.email_pengelola} 
                    onChange={e => setNewMitra({ ...newMitra, email_pengelola: e.target.value })} 
                    placeholder="pic@instansi.com"
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Instansi</label>
                <textarea 
                  rows="2" 
                  value={newMitra.alamat_mitra} 
                  onChange={e => setNewMitra({ ...newMitra, alamat_mitra: e.target.value })} 
                  placeholder="Alamat lengkap instansi/perusahaan..."
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C]"
                ></textarea>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={savingMitra} 
                  className={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer ${
                    savingMitra ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#00529C] hover:bg-[#003E75]'
                  }`}
                >
                  {savingMitra ? 'Menyimpan...' : 'Simpan Mitra & Pilih Otomatis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Professional Alert / Confirmation Dialog */}
      <CustomDialog
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        onConfirm={() => {
          if (dialogState.onConfirm) dialogState.onConfirm();
          setDialogState(prev => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setDialogState(prev => ({ ...prev, isOpen: false }))}
        confirmText={dialogState.confirmText}
      />
    </div>
  );
};
