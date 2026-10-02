import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ShieldCheck, Eye, EyeOff, UserCheck, ArrowLeft, CheckCircle2, AlertCircle, X } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();

  // Form States
  const [formData, setFormData] = useState({
    namaLengkap: '',
    nipNik: '',
    email: '',
    nomorHp: '',
    jabatan: '',
    wilayah: '',
    samsat: '',
    bidang: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Cascading Samsat Options Data Dictionary
  const SAMSAT_OPTIONS = {
    'Wilayah Riau': [
      'Samsat Pekanbaru Kota',
      'Samsat Pekanbaru Selatan',
      'Samsat Dumai',
      'Samsat Duri',
      'Samsat Bangkinang',
      'Samsat Rengat',
    ],
    'Wilayah Kepulauan Riau': [
      'Samsat Batam Kota',
      'Samsat Tanjungpinang',
      'Samsat Bintan',
      'Samsat Karimun',
    ],
    'Wilayah Sumatera Barat': [
      'Samsat Padang',
      'Samsat Bukittinggi',
      'Samsat Payakumbuh',
      'Samsat Solok',
    ],
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Reset Samsat if Wilayah changes
      if (name === 'wilayah') {
        updated.samsat = '';
      }

      // Reset Wilayah/Samsat/Bidang if Jabatan changes
      if (name === 'jabatan') {
        if (value === 'Petugas JR') {
          updated.bidang = '';
        } else if (value === 'Pengelola PKS') {
          updated.wilayah = '';
          updated.samsat = '';
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.namaLengkap || !formData.email || !formData.password || !formData.jabatan) {
      setError('Harap lengkapi seluruh kolom wajib.');
      return;
    }

    if (formData.jabatan === 'Petugas JR' && (!formData.wilayah || !formData.samsat)) {
      setError('Petugas JR wajib memilih Wilayah dan Samsat.');
      return;
    }

    if (formData.jabatan === 'Pengelola PKS' && !formData.bidang) {
      setError('Pengelola PKS wajib memilih Bidang.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password minimal harus 8 karakter.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi password tidak cocok dengan password.');
      return;
    }

    if (!formData.agreed) {
      setError('Anda harus menyetujui pernyataan keabsahan data terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.registerSelf(formData);
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || 'Gagal mengirim pendaftaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableSamsatList = formData.wilayah ? SAMSAT_OPTIONS[formData.wilayah] || [] : [];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-slate-800">
      
      {/* ================= LEFT HERO SECTION ================= */}
      <div className="lg:w-5/12 bg-[#E9F0F8] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden min-h-[450px] lg:min-h-screen shrink-0">
        
        {/* Decorative Graphic Overlay */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L800 400V800H0V0Z" fill="url(#grad1_reg)" fillOpacity="0.15" />
            <path d="M400 0L800 200V600L400 400V0Z" fill="url(#grad2_reg)" fillOpacity="0.2" />
            <defs>
              <linearGradient id="grad1_reg" x1="0" y1="0" x2="800" y2="800" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00529C" />
                <stop offset="1" stopColor="#001D38" />
              </linearGradient>
              <linearGradient id="grad2_reg" x1="400" y1="0" x2="800" y2="600" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00A3E0" />
                <stop offset="1" stopColor="#00529C" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Top Brand Badge */}
        <div className="z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-2xs text-xs font-extrabold text-[#00529C]">
            <span className="w-2 h-2 rounded-full bg-[#00529C] animate-pulse" />
            <span>PT Jasa Raharja</span>
          </div>
        </div>

        {/* Middle Hero Main Headline */}
        <div className="z-10 space-y-6 my-auto max-w-lg">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#001D38] tracking-tight leading-[1.15]">
            Sistem Integrasi<br />
            Monitoring<br />
            Perjanjian Kerja<br />
            Sama
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md">
            Melindungi masyarakat Indonesia melalui tata kelola administrasi yang transparan, aman, dan efisien dalam lingkup Jasa Raharja.
          </p>
        </div>

        {/* Bottom Security Card Info Box */}
        <div className="z-10">
          <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4 max-w-md shadow-2xs space-y-1.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-[#00529C] flex items-center justify-center font-bold text-[10px] shrink-0">
                i
              </div>
              <span>Standar Keamanan Data</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed pl-7">
              Seluruh data yang Anda masukkan dilindungi oleh sistem enkripsi tingkat lanjut untuk menjamin privasi dan integritas informasi institusi.
            </p>
          </div>
        </div>

      </div>

      {/* ================= RIGHT FORM SECTION ================= */}
      <div className="lg:w-7/12 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between items-center overflow-y-auto min-h-screen">
        
        <div className="w-full" />

        {/* Center Main Registration Form Content */}
        <div className="w-full max-w-2xl space-y-5 my-auto">
          
          {/* Header Title */}
          <div>
            <h2 className="text-xl font-extrabold text-[#001D38] tracking-tight">
              Registrasi Akun Baru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lengkapi formulir di bawah ini untuk mengajukan akses ke sistem.
            </p>
          </div>

          {/* Top Blue Alert Banner */}
          <div className="p-4 rounded-2xl bg-[#EEF4FF] border border-blue-200 border-l-4 border-l-[#00529C] text-xs text-blue-900 flex items-start space-x-3 shadow-2xs">
            <ShieldCheck className="w-5 h-5 text-[#00529C] shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <h4 className="font-extrabold text-xs text-[#001D38]">Informasi Registrasi</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Setiap pengajuan akun baru memerlukan proses verifikasi manual Administrator Utama. Harap pastikan email dan nomor HP Anda aktif untuk menerima notifikasi status persetujuan akun dalam 1x24 jam hari kerja.
              </p>
            </div>
          </div>

          {/* Failure Error Alert Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {/* Registration Form Card Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Row 1: Nama Lengkap */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-800">Nama Lengkap *</label>
                <input
                  type="text"
                  name="namaLengkap"
                  required
                  value={formData.namaLengkap}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Row 2: Email & Nomor HP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contoh@jasaraharja.co.id"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Nomor HP / WhatsApp</label>
                  <input
                    type="text"
                    name="nomorHp"
                    value={formData.nomorHp}
                    onChange={handleChange}
                    placeholder="08xx xxxx xxxx"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Row 3: Jabatan */}
              <div>
                <label className="block font-bold text-slate-800">Jabatan (Role) *</label>
                <select
                  name="jabatan"
                  required
                  value={formData.jabatan}
                  onChange={handleChange}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  <option value="">Pilih Jabatan Anda</option>
                  <option value="Petugas JR">Petugas JR</option>
                  <option value="Pengelola PKS">Pengelola PKS</option>
                </select>
              </div>

              {/* DYNAMIC FIELDS CONDITIONAL ON JABATAN */}
              
              {/* IF PETUGAS JR: Show Wilayah & Samsat (Cascading Dropdowns) */}
              {formData.jabatan === 'Petugas JR' && (
                <div className="p-4 rounded-2xl bg-[#EEF4FF] border border-blue-100 space-y-3 animate-in fade-in">
                  <p className="text-[11px] font-extrabold text-[#00529C] uppercase tracking-wider">
                    Lokasi Penugasan (Khusus Petugas JR) *
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Wilayah Dropdown */}
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">Wilayah *</label>
                      <select
                        name="wilayah"
                        required
                        value={formData.wilayah}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">Pilih Wilayah</option>
                        <option value="Wilayah Riau">Wilayah Riau</option>
                        <option value="Wilayah Kepulauan Riau">Wilayah Kepulauan Riau</option>
                        <option value="Wilayah Sumatera Barat">Wilayah Sumatera Barat</option>
                      </select>
                    </div>

                    {/* Samsat Dropdown (Cascading) */}
                    <div className="space-y-1">
                      <label className="block font-bold text-slate-800">Samsat *</label>
                      <select
                        name="samsat"
                        required
                        disabled={!formData.wilayah}
                        value={formData.samsat}
                        onChange={handleChange}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100 disabled:text-slate-400"
                      >
                        <option value="">
                          {formData.wilayah ? 'Pilih Samsat' : 'Pilih Wilayah Terlebih Dahulu'}
                        </option>
                        {availableSamsatList.map((samsatItem) => (
                          <option key={samsatItem} value={samsatItem}>
                            {samsatItem}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>
                </div>
              )}

              {/* IF PENGELOLA PKS: Show Bidang Selection */}
              {formData.jabatan === 'Pengelola PKS' && (
                <div className="p-4 rounded-2xl bg-[#EEF4FF] border border-blue-100 space-y-3 animate-in fade-in">
                  <p className="text-[11px] font-extrabold text-[#00529C] uppercase tracking-wider">
                    Spesialisasi Bidang (Khusus Pengelola PKS) *
                  </p>
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-800">Bidang PKS *</label>
                    <select
                      name="bidang"
                      required
                      value={formData.bidang}
                      onChange={handleChange}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Pilih Bidang PKS</option>
                      <option value="Sumbangan Wajib (SW)">Sumbangan Wajib (SW)</option>
                      <option value="Iuran Wajib (IW)">Iuran Wajib (IW)</option>
                      <option value="Pelayanan">Pelayanan</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Row 5: Password & Konfirmasi Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 karakter"
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-800">Konfirmasi Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Ulangi password"
                      className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkbox Statement */}
              <div className="flex items-start space-x-2.5 pt-2">
                <input
                  type="checkbox"
                  id="agreed"
                  name="agreed"
                  checked={formData.agreed}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-[#00529C] focus:ring-[#00529C] cursor-pointer mt-0.5"
                />
                <label htmlFor="agreed" className="text-[11px] font-medium text-slate-600 leading-relaxed cursor-pointer">
                  Saya menyatakan bahwa data yang saya isi benar dan bertanggung jawab atas validitas informasi yang diberikan untuk kepentingan operasional PT Jasa Raharja.
                </label>
              </div>

              {/* Submit Buttons Stack */}
              <div className="space-y-3 pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#001D38] hover:bg-[#0A1828] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Memproses Registrasi...' : 'Ajukan Registrasi'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 text-slate-600" />
                  Kembali ke Login
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* Footer Copyright */}
        <div className="w-full text-center text-[11px] text-slate-400 font-medium py-3">
          © 2026 PT Jasa Raharja. Seluruh Hak Cipta Dilindungi.
        </div>

      </div>

      {/* POPUP MODAL SUKSES REGISTRASI (MATCHING USER WORKFLOW REQUIREMENT) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 text-center">
            
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-[#001D38] tracking-tight">
                Registrasi Berhasil!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Pengajuan akun Anda telah diterima. Akun Anda sedang <span className="font-extrabold text-amber-600">Menunggu Persetujuan</span> dari Administrator Utama Jasa Raharja.
              </p>
              <div className="p-3 bg-[#EEF4FF] rounded-xl text-[11px] text-slate-700 font-medium border border-blue-100 mt-2">
                Harap hubungi Administrator Utama penanggung jawab jika Anda membutuhkan aktivasi cepat.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/login');
              }}
              className="w-full py-3 bg-[#001D38] hover:bg-[#0A1828] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Mengerti & Kembali ke Login
            </button>

          </div>
        </div>
      )}

    </div>
  );
};

export default RegisterPage;
