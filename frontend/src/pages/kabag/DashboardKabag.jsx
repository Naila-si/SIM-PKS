import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { pksService } from '../../services/pksService';
import { adendumService } from '../../services/adendumService';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, CheckCircle2, Clock, Calendar, AlertTriangle,
  ArrowRight, Eye, ShieldCheck, TrendingUp, Sparkles, RefreshCw,
  FolderKanban, CheckSquare, Layers, FileCheck, Layers3
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, PieChart, Pie, Legend
} from 'recharts';
import { ModalDetailPks } from '../../petugas/ModalDetailPks';
import { ModalDetailAdendum } from '../../petugas/ModalDetailAdendum';
import logoEmblem from '../../assets/logo-jr-emblem.png';

export const DashboardKabag = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [pksList, setPksList] = useState([]);
  const [adendumList, setAdendumList] = useState([]);

  // Modal State
  const [selectedPksId, setSelectedPksId] = useState(null);
  const [selectedAdendumId, setSelectedAdendumId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pksRes, adendumRes] = await Promise.all([
        pksService.getPksList({ per_page: 1000 }),
        adendumService.getAllAdendums()
      ]);

      const allPks = (pksRes?.success && Array.isArray(pksRes.data)) ? pksRes.data : [];
      const allAdendum = (adendumRes?.success && Array.isArray(adendumRes.data)) ? adendumRes.data : [];

      setPksList(allPks);
      setAdendumList(allAdendum);
    } catch (err) {
      console.error('Error fetching kabag dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formattedToday = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const currentYear = new Date().getFullYear();

  // Metrics by Bidang
  const bidangMetrics = {
    Pelayanan: { aktif: 0, pendingKabag: 0, revisi: 0, total: 0 },
    SW: { aktif: 0, pendingKabag: 0, revisi: 0, total: 0 },
    IW: { aktif: 0, pendingKabag: 0, revisi: 0, total: 0 }
  };

  const pendingKabagTasks = [];
  let totalDisetujui = 0;
  let totalProses = 0;
  let totalRevisi = 0;

  let s1Count = 0;
  let s2Count = 0;

  // Analisis PKS
  pksList.forEach(pks => {
    const id = pks.id || pks.pksId;
    const status = pks.status_persetujuan || pks.statusPersetujuan || '';
    const statusPks = pks.status_pks || pks.statusPks || '';
    const rawBidang = (pks.bidang || '').toUpperCase();
    const createdDate = new Date(pks.created_at || pks.createdAt || new Date());

    let targetKey = 'Pelayanan';
    if (rawBidang.includes('SW') || rawBidang.includes('SUMBANGAN')) targetKey = 'SW';
    else if (rawBidang.includes('IW') || rawBidang.includes('IURAN')) targetKey = 'IW';

    bidangMetrics[targetKey].total++;

    if (createdDate.getFullYear() === currentYear) {
      if (createdDate.getMonth() < 6) s1Count++;
      else s2Count++;
    }

    if (status === 'Disetujui' || statusPks === 'Aktif') {
      totalDisetujui++;
      bidangMetrics[targetKey].aktif++;
    } else if (status.includes('Revisi') || status.includes('Ditolak')) {
      totalRevisi++;
      bidangMetrics[targetKey].revisi++;
    } else {
      totalProses++;
    }

    // Dokumen menunggu persetujuan / pemeriksaan Kabag
    if (status === 'Disetujui Pengelola' || status === 'Pemeriksaan Kabag') {
      bidangMetrics[targetKey].pendingKabag++;
      pendingKabagTasks.push({
        id: id,
        tipe: 'PKS',
        nomor: pks.nomor_pks || pks.nomorPKS || 'Draf PKS',
        mitra: pks.mitra?.nama_mitra || pks.mitra?.namaPerusahaan || pks.nama_mitra || 'Mitra Rekanan',
        bidang: targetKey,
        pembuat: pks.pengguna?.nama || pks.pembuat?.nama || 'Petugas JR',
        tanggal: createdDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: status
      });
    }
  });

  // Analisis Adendum
  adendumList.forEach(ad => {
    const id = ad.id || ad.adendumId;
    const status = ad.status_persetujuan || ad.statusPersetujuan || '';
    const pksDoc = ad.pks_document || ad.pksDocument;
    const rawBidang = (pksDoc?.bidang || ad.bidang || '').toUpperCase();

    let targetKey = 'Pelayanan';
    if (rawBidang.includes('SW') || rawBidang.includes('SUMBANGAN')) targetKey = 'SW';
    else if (rawBidang.includes('IW') || rawBidang.includes('IURAN')) targetKey = 'IW';

    if (status === 'Disetujui Pengelola' || status === 'Pemeriksaan Kabag') {
      bidangMetrics[targetKey].pendingKabag++;
      pendingKabagTasks.push({
        id: id,
        tipe: 'Adendum',
        nomor: ad.nomor_adendum || ad.nomorAdendum || `Adendum #${id}`,
        mitra: pksDoc?.mitra?.nama_mitra || pksDoc?.mitra?.namaPerusahaan || 'Mitra Rekanan',
        bidang: targetKey,
        pembuat: ad.pembuat?.nama || 'Pengelola PKS',
        tanggal: new Date(ad.created_at || ad.createdAt || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: status
      });
    }
  });

  const statusChartData = [
    { name: 'Disetujui Final', count: totalDisetujui, fill: '#10B981' },
    { name: 'Dalam Pemeriksaan', count: totalProses, fill: '#00529C' },
    { name: 'Butuh Revisi', count: totalRevisi, fill: '#EF4444' }
  ];

  const semesterData = [
    { name: 'Semester 1 (Jan-Jun)', volume: s1Count },
    { name: 'Semester 2 (Jul-Des)', volume: s2Count },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-[#00529C] animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Memuat ruang kerja supervisi Kabag...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      
      {/* 1. Supervisory Hero Header */}
      <div className="bg-gradient-to-r from-[#001D38] via-[#00386C] to-[#00529C] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative watermark and glow */}
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-56 h-56 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        <img src={logoEmblem} alt="" className="absolute -right-8 -bottom-8 w-56 h-56 object-contain opacity-10 pointer-events-none select-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-sky-200">
              <img src={logoEmblem} alt="JR" className="w-4 h-4 object-contain drop-shadow-xs" />
              <span>Ruang Supervisi Kepala Bagian (Kabag)</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Selamat Bertugas, Kepala Bagian 👋
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
              Awasi kualitas berkas kerja sama antar-bidang (Pelayanan, SW, IW) dan berikan tinjauan verifikasi sebelum pengajuan naik ke meja Pimpinan Kanwil.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <Link
                to="/approval"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-[#00386C] font-bold text-xs hover:bg-sky-50 shadow-sm transition-all duration-200 active:scale-95"
              >
                <CheckSquare className="w-4 h-4 text-[#00529C]" />
                <span>Buka Alur Persetujuan ({pendingKabagTasks.length} Antrean)</span>
              </Link>
              <Link
                to="/pks"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all duration-200"
              >
                <FolderKanban className="w-4 h-4 text-sky-200" />
                <span>Monitoring Semua PKS</span>
              </Link>
            </div>
          </div>

          {/* Antrean Status Kabag Milestone */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex flex-col justify-between min-w-[240px]">
            <div className="flex items-center justify-between text-xs text-sky-200 font-medium mb-3">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 text-sky-300 mr-1.5" />
                {formattedToday}
              </span>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-white">{pendingKabagTasks.length}</span>
                <span className="text-xs font-semibold text-slate-300">Berkas Perlu Tinjauan</span>
              </div>
              <p className="text-[11px] text-sky-200 mt-2 font-medium">
                {pendingKabagTasks.length > 0 
                  ? '⚠️ Membutuhkan verifikasi Kabag' 
                  : '✅ Tidak ada antrean pending saat ini'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Supervisory Review Alert Card */}
      {pendingKabagTasks.length > 0 && (
        <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-5 h-5 text-[#00529C]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-blue-950">
                  Antrean Masuk: Terdapat {pendingKabagTasks.length} Dokumen Telah Diverifikasi Pengelola
                </h3>
                <span className="text-[10px] bg-blue-200/80 text-blue-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Verifikasi Kabag
                </span>
              </div>
              <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                Pengelola bidang telah menyelesaikan pemeriksaan draf. Tinjau kesesuaian berkas untuk diteruskan ke Pimpinan atau kembalikan dengan catatan revisi.
              </p>
            </div>
          </div>
          <div className="shrink-0 self-end md:self-center">
            <Link
              to="/approval"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#00529C] hover:bg-[#003E75] text-white rounded-xl text-xs font-bold shadow-2xs transition"
            >
              <span>Periksa Antrean Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* 3. Komparasi 3 Bidang Operasional (Pelayanan, SW, IW) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-extrabold text-slate-900">Monitoring Kinerja Antar-Bidang</h2>
          <span className="text-xs text-slate-500 font-medium">Rekapitulasi status operasional Kanwil</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Bidang Pelayanan */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 border-t-4 border-t-sky-500 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                  PL
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Pelayanan</h3>
                  <p className="text-[10px] text-slate-400">RSUD & Fasilitas Kesehatan</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                {bidangMetrics.Pelayanan.total} Dokumen
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Aktif</p>
                <p className="text-base font-extrabold text-emerald-600 mt-0.5">{bidangMetrics.Pelayanan.aktif}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Antrean</p>
                <p className="text-base font-extrabold text-blue-600 mt-0.5">{bidangMetrics.Pelayanan.pendingKabag}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Revisi</p>
                <p className="text-base font-extrabold text-rose-600 mt-0.5">{bidangMetrics.Pelayanan.revisi}</p>
              </div>
            </div>
          </div>

          {/* Bidang Sumbangan Wajib (SW) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 border-t-4 border-t-[#00529C] shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#00529C] flex items-center justify-center font-bold text-xs">
                  SW
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Sumbangan Wajib</h3>
                  <p className="text-[10px] text-slate-400">Samsat & Mitra Pembayaran</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
                {bidangMetrics.SW.total} Dokumen
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Aktif</p>
                <p className="text-base font-extrabold text-emerald-600 mt-0.5">{bidangMetrics.SW.aktif}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Antrean</p>
                <p className="text-base font-extrabold text-blue-600 mt-0.5">{bidangMetrics.SW.pendingKabag}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Revisi</p>
                <p className="text-base font-extrabold text-rose-600 mt-0.5">{bidangMetrics.SW.revisi}</p>
              </div>
            </div>
          </div>

          {/* Bidang Iuran Wajib (IW) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 border-t-4 border-t-teal-600 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                  IW
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Iuran Wajib</h3>
                  <p className="text-[10px] text-slate-400">Organda, Kapal & Transportasi</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-100">
                {bidangMetrics.IW.total} Dokumen
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Aktif</p>
                <p className="text-base font-extrabold text-emerald-600 mt-0.5">{bidangMetrics.IW.aktif}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Antrean</p>
                <p className="text-base font-extrabold text-blue-600 mt-0.5">{bidangMetrics.IW.pendingKabag}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Revisi</p>
                <p className="text-base font-extrabold text-rose-600 mt-0.5">{bidangMetrics.IW.revisi}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Dual Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status Dokumen Keseluruhan */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Status Alur Dokumen PKS</h2>
              <p className="text-[11px] text-slate-500">Perbandingan dokumen disetujui, diproses, dan butuh revisi</p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {pksList.length} Total PKS
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  formatter={(val) => [`${val} Dokumen`, 'Jumlah']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={52}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`bar-kabag-status-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tren Pengajuan per Semester */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Distribusi Pengajuan Semester {currentYear}</h2>
              <p className="text-[11px] text-slate-500">Volume pengajuan masuk Semester 1 vs Semester 2</p>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00529C]"></span>
              <span>Dokumen</span>
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
                  formatter={(val) => [`${val} Dokumen`, 'Volume Masuk']}
                />
                <Bar dataKey="volume" radius={[6, 6, 0, 0]} barSize={52}>
                  {semesterData.map((entry, index) => (
                    <Cell key={`bar-kabag-semester-${index}`} fill={index === 0 ? '#38BDF8' : '#00529C'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 5. Tabel Dokumen Menunggu Tinjauan Kabag */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Daftar Dokumen Menunggu Tinjauan Kabag</h2>
            <p className="text-xs text-slate-500 mt-0.5">Draf yang telah diverifikasi Pengelola dan membutuhkan pemeriksaan Kabag</p>
          </div>
          <Link
            to="/approval"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#00529C] hover:text-[#00386C] transition"
          >
            <span>Buka Alur Persetujuan ({pendingKabagTasks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingKabagTasks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Tidak ada berkas menunggu peninjauan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Seluruh berkas yang telah diverifikasi Pengelola sudah ditindaklanjuti. Antrean baru akan muncul setelah Pengelola menyelesaikan verifikasi.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-5">Tipe & Nomor Dokumen</th>
                  <th className="py-3 px-5">Mitra / Rekanan</th>
                  <th className="py-3 px-4">Bidang</th>
                  <th className="py-3 px-4">Pembuat Dokumen</th>
                  <th className="py-3 px-4">Tanggal Masuk</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingKabagTasks.map((item) => (
                  <tr key={`${item.tipe}_${item.id}`} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900">{item.nomor}</div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.tipe}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-1.5 font-medium text-slate-800">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{item.mitra}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {item.bidang}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.pembuat}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                      {item.tanggal}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pemeriksaan Kabag
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (item.tipe === 'Adendum') {
                            setSelectedAdendumId(item.id);
                          } else {
                            setSelectedPksId(item.id);
                          }
                        }}
                        className="inline-flex items-center space-x-1 px-3.5 py-1.5 rounded-xl bg-[#00529C] hover:bg-[#00386C] text-white font-bold text-xs transition duration-150 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        <span>Tinjau Berkas</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail PKS Terpadu */}
      {selectedPksId && (
        <ModalDetailPks
          isOpen={!!selectedPksId}
          pksId={selectedPksId}
          onClose={() => setSelectedPksId(null)}
          onSuccess={() => fetchData()}
        />
      )}

      {/* Modal Detail Adendum Terpadu */}
      {selectedAdendumId && (
        <ModalDetailAdendum
          isOpen={!!selectedAdendumId}
          adendumId={selectedAdendumId}
          onClose={() => setSelectedAdendumId(null)}
          onSuccess={() => fetchData()}
        />
      )}

    </div>
  );
};
