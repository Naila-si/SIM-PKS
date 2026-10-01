import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Info, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('petugas.a@jasaraharja.test');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setTestAccount = (testEmail) => {
    setEmail(testEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-slate-800">
      
      {/* ================= LEFT HERO SECTION (MATCHING SCREENSHOT) ================= */}
      <div className="lg:w-1/2 bg-[#E9F0F8] p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden min-h-[500px] lg:min-h-screen">
        
        {/* Background Decorative Geometric Overlay */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L800 400V800H0V0Z" fill="url(#grad1)" fillOpacity="0.15" />
            <path d="M400 0L800 200V600L400 400V0Z" fill="url(#grad2)" fillOpacity="0.2" />
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="800" y2="800" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00529C" />
                <stop offset="1" stopColor="#001D38" />
              </linearGradient>
              <linearGradient id="grad2" x1="400" y1="0" x2="800" y2="600" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00A3E0" />
                <stop offset="1" stopColor="#00529C" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Top Spacer or Small Brand Badge */}
        <div className="z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-2xs text-xs font-extrabold text-[#00529C]">
            <span className="w-2 h-2 rounded-full bg-[#00529C] animate-pulse" />
            <span>PT Jasa Raharja</span>
          </div>
        </div>

        {/* Middle Hero Main Headline */}
        <div className="z-10 space-y-6 my-auto max-w-xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#001D38] tracking-tight leading-[1.15]">
            Sistem Integrasi<br />
            Monitoring<br />
            Perjanjian Kerja<br />
            Sama
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-lg">
            Melindungi masyarakat Indonesia melalui tata kelola administrasi yang transparan, aman, dan efisien dalam lingkup Jasa Raharja.
          </p>
        </div>

        {/* Bottom Security Card Info Box (Matching Screenshot) */}
        <div className="z-10">
          <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-2xl p-4.5 max-w-md shadow-2xs space-y-1.5">
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

      {/* ================= RIGHT LOGIN FORM SECTION (MATCHING SCREENSHOT) ================= */}
      <div className="lg:w-1/2 bg-white p-6 sm:p-12 lg:p-16 flex flex-col justify-between items-center min-h-screen">
        
        {/* Top Spacer */}
        <div className="w-full" />

        {/* Center Main Login Card Box */}
        <div className="w-full max-w-md space-y-6 my-auto">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
            
            {/* Card Header Title */}
            <div>
              <h2 className="text-lg font-extrabold text-[#001D38] tracking-tight">
                Masuk ke Sistem
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Silakan masuk menggunakan akun yang telah terdaftar.
              </p>
            </div>

            {/* Failure Error Alert */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@jasaraharja.co.id"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
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

              {/* Checkbox Ingat Saya */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#00529C] focus:ring-[#00529C] cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs font-semibold text-slate-600 cursor-pointer">
                  Ingat Saya
                </label>
              </div>

              {/* Submit Dark Navy Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#001D38] hover:bg-[#0A1828] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <span>Memproses...</span>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </button>
            </form>

            {/* Subtext Link Daftar */}
            <div className="text-center text-xs text-slate-500 pt-1 font-medium">
              Belum memiliki akun?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                Daftar Sekarang
              </button>
            </div>

            {/* PRESERVED DEMO ACCOUNTS QUICK SWITCHER BUTTONS */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#00529C]" />
                Pilih Akun Demo (Preset):
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setTestAccount('petugas.a@jasaraharja.test')}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold cursor-pointer transition-colors"
                >
                  Petugas JR
                </button>
                <button
                  type="button"
                  onClick={() => setTestAccount('pengelola.a@jasaraharja.test')}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold cursor-pointer transition-colors"
                >
                  Pengelola PKS
                </button>
                <button
                  type="button"
                  onClick={() => setTestAccount('kabag@jasaraharja.test')}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold cursor-pointer transition-colors"
                >
                  Kabag
                </button>
                <button
                  type="button"
                  onClick={() => setTestAccount('pimpinan@jasaraharja.test')}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold cursor-pointer transition-colors"
                >
                  Pimpinan
                </button>
                <button
                  type="button"
                  onClick={() => setTestAccount('admin@jasaraharja.test')}
                  className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold cursor-pointer transition-colors"
                >
                  Admin Utama
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Footer Copyright at Bottom Right */}
        <div className="w-full text-center text-[11px] text-slate-400 font-medium py-2">
          © 2026 PT Jasa Raharja. Seluruh Hak Cipta Dilindungi.
        </div>

      </div>

    </div>
  );
};

export default LoginPage;
