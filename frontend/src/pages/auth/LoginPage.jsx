import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Building2, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('petugas.a@jasaraharja.test');
  const [password, setPassword] = useState('password123');
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00529C]/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#00A3E0]/20 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10">
        {/* Header Header Brand */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#00529C] to-[#002B49] rounded-2xl mx-auto flex items-center justify-center shadow-lg border border-sky-400/30 mb-4">
            <span className="text-white text-2xl font-black tracking-widest">JR</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sistem Informasi Manajemen PKS
          </h1>
          <p className="text-sm text-sky-200 mt-1 flex items-center justify-center font-medium">
            <Building2 className="w-4 h-4 mr-1 text-sky-400" />
            PT Jasa Raharja Kantor Wilayah Riau
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-1">Masuk ke Akun</h2>
          <p className="text-xs text-slate-500 mb-6">
            Gunakan NIP/Email pegawai yang telah terdaftar
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Pegawai
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00529C] focus:border-transparent transition-all"
                  placeholder="email@jasaraharja.test"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00529C] focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#00529C] hover:bg-[#003E75] text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center cursor-pointer disabled:opacity-50 mt-6"
            >
              {isSubmitting ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#00529C]" />
              Akun Uji Coba (Seeders):
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setTestAccount('petugas.a@jasaraharja.test')}
                className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                Petugas JR (Bid. A)
              </button>
              <button
                type="button"
                onClick={() => setTestAccount('pengelola.a@jasaraharja.test')}
                className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                Pengelola PKS (Bid. A)
              </button>
              <button
                type="button"
                onClick={() => setTestAccount('kabag@jasaraharja.test')}
                className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                Kabag (Lintas Bidang)
              </button>
              <button
                type="button"
                onClick={() => setTestAccount('pimpinan@jasaraharja.test')}
                className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                Pimpinan (Lintas)
              </button>
              <button
                type="button"
                onClick={() => setTestAccount('admin@jasaraharja.test')}
                className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
              >
                Admin Utama
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 PT Jasa Raharja Kanwil Riau — Foundation v1.0
        </p>
      </div>
    </div>
  );
};
