import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Building2, FileText, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DrawerDetailPerusahaan = ({ isOpen, mitraData, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen || !mitraData) return null;

  const { user } = useAuth();
  const isPengelolaOrAdmin = ['pengelola_pks', 'admin_utama', 'admin', 'pengelola'].includes(user?.role);

  const storageKey = `survey_mitra_${mitraData.perusahaanId || mitraData.id}`;
  
  // State for survey
  const [surveyRatings, setSurveyRatings] = React.useState(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved);
    return { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };
  });

  React.useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setSurveyRatings(JSON.parse(saved));
      } else {
        setSurveyRatings({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 });
      }
    }
  }, [isOpen, storageKey]);

  const surveyQuestions = [
    { id: 'q1', text: 'Mitra responsif dan kooperatif dalam berkomunikasi.' },
    { id: 'q2', text: 'Mitra memenuhi komitmen tepat waktu sesuai kesepakatan.' },
    { id: 'q3', text: 'Kualitas layanan/data mitra sangat akurat dan andal.' },
    { id: 'q4', text: 'Teknologi dan integrasi sistem mitra berjalan stabil.' },
    { id: 'q5', text: 'Kerja sama ini memberi nilai tambah bagi Jasa Raharja.' },
  ];

  const handleRating = (qId, val) => {
    setSurveyRatings(prev => {
      const newRatings = { ...prev, [qId]: val };
      localStorage.setItem(storageKey, JSON.stringify(newRatings));
      return newRatings;
    });
  };
  const totalScore = Object.values(surveyRatings).reduce((a, b) => a + b, 0);
  const isComplete = Object.values(surveyRatings).every(r => r > 0);
  
  let recommendation = { text: '', color: '' };
  if (isComplete) {
    if (totalScore >= 20) {
      recommendation = { text: 'Sangat Baik - Perusahaan Jasa Raharja tetap harus bekerja sama dengan mitra ini.', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    } else if (totalScore >= 15) {
      recommendation = { text: 'Cukup Baik - Perlu evaluasi bersama untuk peningkatan kinerja.', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    } else {
      recommendation = { text: 'Buruk - Disarankan untuk meninjau ulang kelayakan kerja sama.', color: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
  }

  // Inisial avatar penanggung jawab
  const getInitials = (name) => {
    if (!name) return 'PIC';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const statusPks = mitraData.status_mitra || mitraData.status || 'Aktif';

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden z-[101] animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Dark Navy Header (Matching Image 1) */}
        <div className="bg-[#001D38] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center font-bold border border-white/10 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-white">Detail Perusahaan</h2>
              <p className="text-xs text-blue-200/80 mt-0.5">Informasi lengkap mitra strategis</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* SECTION 1: INFORMASI UMUM */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                INFORMASI UMUM
              </span>
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                Status: {statusPks}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Perusahaan / Instansi</p>
                <h3 className="text-base font-extrabold text-[#001D38] mt-0.5 leading-snug">
                  {mitraData.nama_mitra || mitraData.namaPerusahaan || '-'}
                </h3>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alamat Lengkap</p>
                <p className="text-xs font-medium text-slate-700 mt-0.5 leading-relaxed">
                  {mitraData.alamat_mitra || mitraData.alamat || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* SECTION 2: PENANGGUNG JAWAB (PIC) */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              PENANGGUNG JAWAB (PIC)
            </span>

            <div className="bg-[#EEF4FF] rounded-2xl p-4.5 space-y-3.5 border border-blue-100/80">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-full bg-[#3B82F6] text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
                  {getInitials(mitraData.nama_pengelola || mitraData.penanggungJawab || '')}
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    {mitraData.nama_pengelola || mitraData.penanggungJawab || '-'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    {mitraData.jabatan || '-'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Nomor Telepon</p>
                  <p className="font-extrabold text-slate-900 mt-0.5 truncate">
                    {mitraData.no_hp_pengelola || mitraData.kontak || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Alamat Email</p>
                  <p className="font-extrabold text-slate-900 mt-0.5 truncate">
                    {mitraData.email_pengelola || mitraData.email || '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100" />

          {/* SECTION 3: STATISTIK KERJASAMA (Matching Image 1) */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              STATISTIK KERJASAMA
            </span>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
                <p className="text-xl font-extrabold text-slate-900">{mitraData.totalPks || 0}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Total PKS</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
                <p className="text-xl font-extrabold text-emerald-600">{mitraData.pksAktif || 0}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Aktif</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
                <p className="text-xl font-extrabold text-rose-600">{mitraData.pksBerakhir || 0}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Berakhir</p>
              </div>
            </div>
          </div>

          {/* SECTION 4: SURVEI KUALITAS KERJA SAMA (KHUSUS PENGELOLA) */}
          {isPengelolaOrAdmin && (
            <>
              <div className="border-t border-slate-100" />
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  EVALUASI KUALITAS KERJA SAMA
                </span>
                
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
                  <p className="text-[11px] text-slate-500 font-medium">
                    Berikan rating 1-5 untuk menilai kualitas mitra. Penilaian ini bersifat internal.
                  </p>

                  <div className="space-y-3">
                    {surveyQuestions.map((q, idx) => (
                      <div key={q.id} className="flex flex-col space-y-1.5">
                        <p className="text-[11px] font-semibold text-slate-800">{idx + 1}. {q.text}</p>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map(val => (
                            <button
                              key={val}
                              onClick={() => handleRating(q.id, val)}
                              className="p-1 focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-5 h-5 transition-colors ${
                                  surveyRatings[q.id] >= val
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'fill-slate-200 text-slate-200 hover:text-amber-200'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isComplete && (
                    <div className="pt-3 border-t border-slate-200 mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-600">Total Skor:</span>
                        <span className="text-lg font-extrabold text-[#00529C]">{totalScore} / 25</span>
                      </div>
                      <div className={`p-3 rounded-xl border text-[11px] font-bold leading-relaxed ${recommendation.color}`}>
                        {recommendation.text}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>

        {/* Modal Footer Action (Full-width button matching Image 1) */}
        <div className="p-5 border-t border-slate-100 bg-white shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/pks');
            }}
            className="w-full py-3 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-2" />
            Lihat Daftar PKS
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default DrawerDetailPerusahaan;
