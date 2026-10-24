import React, { useState, useEffect } from 'react';
import { pksService } from '../services/pksService';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle2, AlertTriangle, Calendar,
  RefreshCw, ArrowRight, Target, PlusCircle, Building2,
  Eye, Clock, Sparkles, FolderKanban, TrendingUp, ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, PieChart, Pie, Legend
} from 'recharts';
import { ModalDetailPks } from './ModalDetailPks';
import logoEmblem from '../assets/logo-jr-emblem.png';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pksList, setPksList] = useState([]);
  const [viewingPksId, setViewingPksId] = useState(null);

  const [stats, setStats] = useState({
    totalTahunIni: 0,
    disetujui: 0,
    dalamProses: 0,
    revisi: 0,
    semester1: 0,
    semester2: 0,
  });

  const [bidangDistribution, setBidangDistribution] = useState([
    { name: 'Pelayanan', value: 0, color: '#0284C7' },
    { name: 'SW (Sumbangan Wajib)', value: 0, color: '#00529C' },
    { name: 'IW (Iuran Wajib)', value: 0, color: '#0D9488' },
  ]);

  const TARGET_TAHUNAN = 12;

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await pksService.getPksList({ per_page: 500 });
      if (res.success && res.data) {
        const rawList = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        
        // Filter dokumen khusus yang dibuat oleh Petugas yang sedang login
        const currentUserId = user?.penggunaId || user?.id;
        const list = currentUserId
          ? rawList.filter(pks => {
              const creatorId = pks.penggunaId || pks.pengguna_id || pks.pengguna?.penggunaId || pks.pengguna?.id;
              return String(creatorId) === String(currentUserId);
            })
          : rawList;

        setPksList(list);

        let tahunIniCount = 0;
        let disetujuiCount = 0;
        let prosesCount = 0;
        let revisiCount = 0;
        let s1Count = 0;
        let s2Count = 0;

        let pelCount = 0;
        let swCount = 0;
        let iwCount = 0;

        const currentYear = new Date().getFullYear();

        list.forEach(pks => {
          const createdDate = new Date(pks.created_at || pks.createdAt || new Date());
          const year = createdDate.getFullYear();
          const month = createdDate.getMonth();
          const status = pks.status_persetujuan || pks.statusPersetujuan || '';
          const statusPks = pks.status_pks || pks.statusPks || '';
          const bidang = (pks.bidang || '').toUpperCase();

          // Hitung distribusi bidang (semua dokumen aktif/diajukan)
          if (bidang.includes('PELAYANAN')) {
            pelCount++;
          } else if (bidang.includes('SW') || bidang.includes('SUMBANGAN')) {
            swCount++;
          } else if (bidang.includes('IW') || bidang.includes('IURAN')) {
            iwCount++;
          } else {
            // Default ke Pelayanan jika belum ditentukan
            pelCount++;
          }

          if (year === currentYear) {
            // Semester stats
            if (month < 6) s1Count++;
            else s2Count++;

            // Status Document logic
            if (status === 'Disetujui' || statusPks === 'Aktif') {
              disetujuiCount++;
              tahunIniCount++; // ONLY count as KPI Target if it's Final/Disetujui
            } else if (status.includes('Ditolak') || status.includes('Revisi')) {
              revisiCount++;
            } else if (status.includes('Menunggu') || status.includes('Pemeriksaan') || status.includes('Verifikasi')) {
              prosesCount++;
            }
          }
        });

        setStats({
          totalTahunIni: tahunIniCount,
          disetujui: disetujuiCount,
          dalamProses: prosesCount,
          revisi: revisiCount,
          semester1: s1Count,
          semester2: s2Count,
        });

        setBidangDistribution([
          { name: 'Pelayanan', value: pelCount, color: '#0284C7' },
          { name: 'SW (Sumbangan Wajib)', value: swCount, color: '#00529C' },
          { name: 'IW (Iuran Wajib)', value: iwCount, color: '#0D9488' },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const formattedToday = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // Calculate Progress
  const progressPercent = Math.min(100, Math.round((stats.totalTahunIni / TARGET_TAHUNAN) * 100));

  const semesterData = [
    { name: 'Semester 1 (Jan-Jun)', diajukan: stats.semester1 },
    { name: 'Semester 2 (Jul-Des)', diajukan: stats.semester2 }
  ];

  // Urgent Revision list
  const urgentRevisions = pksList.filter(pks => {
    const status = pks.status_persetujuan || pks.statusPersetujuan || '';
    return status.includes('Revisi') || status.includes('Ditolak');
  });

  // Recent 5 documents
  const recentDocs = [...pksList].sort((a, b) => {
    const dateA = new Date(a.created_at || a.createdAt || 0);
    const dateB = new Date(b.created_at || b.createdAt || 0);
    return dateB - dateA;
  }).slice(0, 5);

  const getStatusBadge = (statusPersetujuan, statusPks) => {
    const st = statusPersetujuan || statusPks || 'Draf';
    if (st === 'Disetujui' || st === 'Aktif') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Disetujui
        </span>
      );
    }
    if (st.includes('Revisi') || st.includes('Ditolak')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Perlu Revisi
        </span>
      );
    }
    if (st.includes('Menunggu') || st.includes('Pemeriksaan') || st.includes('Verifikasi')) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          Verifikasi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
        Draf
      </span>
    );
  };

  const getBidangBadge = (bidang) => {
    const b = (bidang || '').toUpperCase();
    if (b.includes('PELAYANAN')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
          Pelayanan
        </span>
      );
    }
    if (b.includes('SW') || b.includes('SUMBANGAN')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
          SW
        </span>
      );
    }
    if (b.includes('IW') || b.includes('IURAN')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
          IW
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
        {bidang || '-'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-[#00529C] animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Memuat data beranda petugas...</p>
      </div>
    );
  }

  const totalBidangCount = bidangDistribution.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 pb-12 text-slate-800 font-sans mx-auto">
      
      {/* 1. Motivational Hero Header */}
      <div className="bg-gradient-to-r from-[#001D38] via-[#00386C] to-[#00529C] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative watermark and glow */}
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-12 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        <img src={logoEmblem} alt="" className="absolute -right-6 -bottom-6 w-52 h-52 object-contain opacity-10 pointer-events-none select-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-sky-200">
              <img src={logoEmblem} alt="JR" className="w-4 h-4 object-contain drop-shadow-xs" />
              <span>Ruang Kerja Petugas Jasa Raharja</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Semangat Bertugas, {user?.nama || 'Petugas JR'} 👋
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
              Kelola dokumen kemitraan, monitor target capaian PKS tahun ini, dan perbaiki berkas revisi dengan cepat dan terstruktur.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <Link
                to="/pks/buat"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-[#00386C] font-bold text-xs hover:bg-sky-50 shadow-sm transition-all duration-200 active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-[#00529C]" />
                <span>+ Buat Draf PKS Baru</span>
              </Link>
              <Link
                to="/pks"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all duration-200"
              >
                <FolderKanban className="w-4 h-4 text-sky-200" />
                <span>Daftar Dokumen PKS</span>
              </Link>
              <Link
                to="/perusahaan"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all duration-200"
              >
                <Building2 className="w-4 h-4 text-sky-200" />
                <span>Kelola Mitra Rekanan</span>
              </Link>
            </div>
          </div>

          {/* Quick Target Milestone Pill */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex flex-col justify-between min-w-[220px]">
            <div className="flex items-center justify-between text-xs text-sky-200 font-medium mb-3">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 text-sky-300 mr-1.5" />
                {formattedToday}
              </span>
            </div>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-3xl font-black text-white">{stats.totalTahunIni}</span>
                <span className="text-xs font-semibold text-slate-300">/ {TARGET_TAHUNAN} PKS Selesai</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2 mt-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-sky-200 mt-2 font-medium">
                {progressPercent >= 100 
                  ? '🎉 Target Tahunan Terpenuhi!' 
                  : `${Math.max(0, TARGET_TAHUNAN - stats.totalTahunIni)} PKS lagi menuju target 100%`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Urgent Revision Alert Card (Conditional) */}
      {urgentRevisions.length > 0 && (
        <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-rose-950">
                  Perhatian: Terdapat {urgentRevisions.length} Dokumen Memerlukan Revisi
                </h3>
                <span className="text-[10px] bg-rose-200/80 text-rose-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Tindakan Diperlukan
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                Pengajuan untuk mitra <strong className="font-semibold text-rose-950">{urgentRevisions[0]?.mitra?.nama_mitra || urgentRevisions[0]?.mitra?.namaPerusahaan || 'Mitra'}</strong> ({urgentRevisions[0]?.nomor_pks || urgentRevisions[0]?.nomorPKS || 'PKS'}) dikembalikan verifikator dengan catatan:
              </p>
              {urgentRevisions[0]?.catatan_revisi && (
                <div className="text-xs bg-white/80 border border-rose-200 rounded-lg px-3 py-1.5 mt-2 text-rose-900 font-medium italic">
                  "{urgentRevisions[0].catatan_revisi}"
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => setViewingPksId(urgentRevisions[0]?.id || urgentRevisions[0]?.pksId)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-2xs transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Buka & Perbaiki</span>
            </button>
            <Link
              to="/persetujuan"
              className="inline-flex items-center space-x-1 px-3 py-2 bg-white hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold transition"
            >
              <span>Alur Persetujuan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. KPI & Status Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gauge Card: Pencapaian Target PKS */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col items-center text-center justify-between">
          <div className="w-full flex items-center justify-between mb-4">
            <h2 className="text-sm font-extrabold text-slate-900">Target PKS {new Date().getFullYear()}</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#00529C] border border-blue-100">
              {progressPercent}% Capaian
            </span>
          </div>
          
          <div className="relative w-36 h-36 my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#F1F5F9" strokeWidth="12" fill="none" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke="#00529C" 
                strokeWidth="12" 
                fill="none" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * progressPercent) / 100}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900">{stats.totalTahunIni}</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">/ {TARGET_TAHUNAN} PKS</span>
            </div>
          </div>
          
          <div className="w-full pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600 font-medium">
              Dokumen disetujui: <strong className="font-bold text-slate-900">{stats.totalTahunIni} PKS</strong>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Target tahunan ditetapkan {TARGET_TAHUNAN} dokumen final
            </p>
          </div>
        </div>

        {/* 3 Status Cards (Disetujui, Dalam Proses, Revisi) */}
        <div className="lg:col-span-2 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">Status Pengajuan PKS (Tahun {new Date().getFullYear()})</h2>
            <Link to="/pks" className="text-xs text-[#00529C] font-semibold hover:underline flex items-center">
              Semua Dokumen <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
            {/* Disetujui */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                  Final
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-slate-900">{stats.disetujui}</p>
                <p className="text-xs font-semibold text-slate-600 mt-1">Disetujui & Aktif</p>
                <p className="text-[11px] text-slate-400 mt-0.5">PKS berkekuatan hukum</p>
              </div>
            </div>

            {/* Diproses */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 border-l-4 border-l-[#00529C] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#00529C]" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                  Proses
                </span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-black text-slate-900">{stats.dalamProses}</p>
                <p className="text-xs font-semibold text-slate-600 mt-1">Dalam Verifikasi</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Menunggu persetujuan</p>
              </div>
            </div>

            {/* Revisi */}
            <div className={`rounded-2xl p-5 border-l-4 shadow-2xs flex flex-col justify-between ${stats.revisi > 0 ? 'bg-[#FFF5F5] border-rose-200 border-l-rose-500' : 'bg-white border-slate-200 border-l-slate-300'}`}>
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stats.revisi > 0 ? 'bg-rose-100' : 'bg-slate-50'}`}>
                  <AlertTriangle className={`w-4 h-4 ${stats.revisi > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${stats.revisi > 0 ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                  {stats.revisi > 0 ? 'Revisi' : 'Nihil'}
                </span>
              </div>
              <div className="mt-4">
                <p className={`text-3xl font-black ${stats.revisi > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{stats.revisi}</p>
                <p className="text-xs font-semibold text-slate-600 mt-1">Butuh Perbaikan</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{stats.revisi > 0 ? 'Harus ditindaklanjuti' : 'Tidak ada revisi pending'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dual Analytics Row: Semester Recaps & Bidang Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Bar Chart Semester */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Rekapitulasi Pengajuan Semester</h2>
              <p className="text-[11px] text-slate-500">Perbandingan semester 1 dan semester 2 tahun berjalan</p>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00529C]"></span>
              <span>Diajukan</span>
            </div>
          </div>
          
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semesterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  formatter={(val) => [`${val} Dokumen`, 'Total Diajukan']}
                />
                <Bar dataKey="diajukan" radius={[6, 6, 0, 0]} barSize={52}>
                  {semesterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#38BDF8' : '#00529C'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Donut Chart Bidang Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Distribusi PKS Menurut Bidang</h2>
              <p className="text-[11px] text-slate-500">Proporsi dokumen: Pelayanan, Sumbangan Wajib & Iuran Wajib</p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {totalBidangCount} Total
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {totalBidangCount === 0 ? (
              <div className="text-center text-slate-400 py-10">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Belum ada data dokumen untuk distribusi bidang</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    formatter={(val, name) => [`${val} Dokumen (${Math.round((val / totalBidangCount) * 100)}%)`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(val) => <span className="text-[11px] font-semibold text-slate-700">{val}</span>}
                  />
                  <Pie
                    data={bidangDistribution}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {bidangDistribution.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 5. Recent Submissions Table ("Pengajuan Dokumen Terakhir") */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Pengajuan Dokumen Terakhir</h2>
            <p className="text-xs text-slate-500 mt-0.5">Daftar dokumen terbaru yang telah diajukan ke sistem</p>
          </div>
          <Link
            to="/pks"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#00529C] hover:text-[#00386C] transition"
          >
            <span>Lihat Semua Dokumen ({pksList.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentDocs.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Belum ada pengajuan PKS</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Mulai buat draf dokumen kerja sama pertama Anda untuk memulai proses persetujuan.
            </p>
            <Link
              to="/pks/buat"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#00529C] hover:bg-[#00386C] text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Buat Draf PKS Baru</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-5">Dokumen & Nomor</th>
                  <th className="py-3 px-5">Mitra / Rekanan</th>
                  <th className="py-3 px-4">Bidang</th>
                  <th className="py-3 px-4">Tanggal Pengajuan</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDocs.map((item) => {
                  const docId = item.id || item.pksId;
                  const docNomor = item.nomor_pks || item.nomorPKS || item.judul || 'Draf Dokumen';
                  const docMitra = item.mitra?.nama_mitra || item.mitra?.namaPerusahaan || item.nama_mitra || 'Mitra Belum Dipilih';
                  const docJenis = item.jenis_pks || item.jenisPKS || 'Perjanjian Kerja Sama';
                  const docCreated = item.created_at || item.createdAt
                    ? new Date(item.created_at || item.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })
                    : '-';

                  return (
                    <tr key={docId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900">{docNomor}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{docJenis}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center space-x-1.5 font-medium text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{docMitra}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {getBidangBadge(item.bidang)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {docCreated}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(item.status_persetujuan || item.statusPersetujuan, item.status_pks || item.statusPks)}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setViewingPksId(docId)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#00529C] hover:text-white text-slate-700 font-semibold text-xs transition duration-150"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail PKS Terpadu */}
      {viewingPksId && (
        <ModalDetailPks
          isOpen={!!viewingPksId}
          pksId={viewingPksId}
          onClose={() => setViewingPksId(null)}
          onEditClick={(id) => {
            setViewingPksId(null);
            navigate(`/pks/${id}/edit`);
          }}
          onSuccess={() => {
            fetchDashboardData();
          }}
        />
      )}

    </div>
  );
};
