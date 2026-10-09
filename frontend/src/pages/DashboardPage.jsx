import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Dashboard } from '../petugas/Dashboard';
import { dashboardService } from '../services/dashboardService';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, XCircle, Building2, Calendar, ArrowRight,
  Eye, MoreVertical, FileText, CheckSquare, Clock, Users, Ban
} from 'lucide-react';
import { pksService } from '../services/pksService';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    total_pks: 0,
    pks_aktif: 0,
    pks_segera_berakhir: 0,
    pks_berakhir: 0,
    total_mitra: 0,
    draft_pks: 0,
    pks_disetujui: 0,
    pks_ditolak: 0,
    persetujuan_bulan_ini: 0,
    belum_diperiksa: 0,
    ditolak: 0,
    menunggu_kabag: 0,
    diverifikasi_bulan_ini: 0,
    rata_rata_waktu: '-',
    total_pks_selesai: 0,
  });

  const [chartData, setChartData] = useState({
    bidangData: [],
    statusData: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await pksService.getPksList({ per_page: 1000 });
        if (res.success && res.data) {
          const list = res.data;
          
          let aktif = 0;
          let segera = 0;
          let berakhir = 0;
          let menunggu = 0;
          let disetujui = 0;
          let ditolak = 0;
          let bulanIni = 0;
          
          const bidangMap = { IW: 0, SW: 0, Pelayanan: 0 };
          const now = new Date();
          const thisMonth = now.getMonth();

          list.forEach(pks => {
            const end = pks.tanggalBerakhir ? new Date(pks.tanggalBerakhir) : null;
            const statusPers = pks.statusPersetujuan || '';
            
            // Approval Stats
            if (statusPers.includes('Menunggu')) menunggu++;
            if (statusPers === 'Disetujui') disetujui++;
            if (statusPers.includes('Ditolak')) ditolak++;
            
            // Persetujuan Bulan Ini (Approximated based on created_at for now)
            if (new Date(pks.created_at).getMonth() === thisMonth) bulanIni++;

            // PKS Status
            if (pks.statusPks === 'Aktif' && end) {
              const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
              if (diffDays <= 0) berakhir++;
              else if (diffDays <= 30) segera++;
              else aktif++;
            }

            // Bidang Stats
            if (pks.bidang && bidangMap[pks.bidang] !== undefined) {
              bidangMap[pks.bidang]++;
            }
          });

          setSummary(prev => ({
            ...prev,
            pks_aktif: aktif,
            pks_segera_berakhir: segera,
            pks_berakhir: berakhir,
            menunggu_persetujuan: menunggu,
            pks_disetujui: disetujui,
            pks_ditolak: ditolak,
            persetujuan_bulan_ini: bulanIni,
            total_pks_bulan_ini: aktif + segera + berakhir,
          }));

          setChartData({
            bidangData: [
              { name: 'Sumbangan Wajib', value: bidangMap['SW'], fill: '#F59E0B' },
              { name: 'Iuran Wajib', value: bidangMap['IW'], fill: '#0F2238' },
              { name: 'Pelayanan', value: bidangMap['Pelayanan'], fill: '#3B82F6' },
            ],
            statusData: [
              { name: 'Aktif', value: aktif || 1, color: '#0F2238' }, // OR 1 for visual when empty
              { name: 'Segera Berakhir', value: segera, color: '#F59E0B' },
              { name: 'Berakhir', value: berakhir, color: '#E11D48' },
            ]
          });
        }
        
        // Also fetch mitra for total_mitra
        // Using summary endpoint just to get total mitra if needed, but we can fake it or use real data
      } catch (err) {
        console.error(err);
      }
    };
    fetchDashboardData();
  }, []);

  if (user?.role === 'petugas_jr') {
    return <Dashboard />;
  }

  const sampleActivities = [];

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ringkasan informasi pengelolaan Perjanjian Kerja Sama (PKS).
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-blue-700 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* 2. Top Stat Cards (4 Cards, Image 1 Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PKS Aktif */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-l-slate-800 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
              ✓
            </div>
            <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">AKTIF</span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-3">PKS Aktif</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{summary.pks_aktif}</p>
          <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">PKS yang masih berlaku</p>
        </div>

        {/* Segera Berakhir */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-l-amber-500 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-extrabold text-xs">
              !
            </div>
            <span className="text-[10px] font-extrabold bg-amber-50 text-amber-700 px-2 py-0.5 rounded uppercase">URGENT</span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-3">Segera Berakhir</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{summary.pks_segera_berakhir}</p>
          <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">Berakhir dalam 30 hari</p>
        </div>

        {/* PKS Berakhir */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-l-rose-600 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-extrabold text-xs">
              ✕
            </div>
            <span className="text-[10px] font-extrabold bg-rose-50 text-rose-700 px-2 py-0.5 rounded uppercase">EXPIRED</span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-3">PKS Berakhir</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{summary.pks_berakhir}</p>
          <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">Masa berlaku telah habis</p>
        </div>

        {/* Perusahaan Mitra */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-l-blue-600 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold text-xs">
              🏢
            </div>
            <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase">MITRA</span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-3">Perusahaan Mitra</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{summary.total_mitra}</p>
          <p className="text-[10px] text-slate-400 font-medium italic mt-0.5">Mitra aktif terdaftar</p>
        </div>
      </div>

      {/* 3. Row 2: 4 Soft Stat Cards (Image 1 Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Menunggu Persetujuan Saya */}
        <div className="bg-[#EEF4FF] rounded-2xl p-4 border border-blue-100 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 leading-tight">Menunggu<br />Persetujuan Saya</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{summary.menunggu_persetujuan || '0'}</p>
          </div>
        </div>

        {/* PKS Disetujui */}
        <div className="bg-[#EEF4FF] rounded-2xl p-4 border border-blue-100 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">PKS Disetujui</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{summary.pks_disetujui}</p>
          </div>
        </div>

        {/* PKS Ditolak */}
        <div className="bg-[#EEF4FF] rounded-2xl p-4 border border-blue-100 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold border border-rose-200 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500">PKS Ditolak</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{summary.pks_ditolak}</p>
          </div>
        </div>

        {/* Persetujuan Bulan Ini */}
        <div className="bg-[#EEF4FF] rounded-2xl p-4 border border-blue-100 flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-500 leading-tight">Persetujuan<br />Bulan Ini</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{summary.persetujuan_bulan_ini}</p>
          </div>
        </div>
      </div>

      {/* 4. Middle Charts Row (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bar Chart: Jumlah PKS per Bidang */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
          <h2 className="text-sm font-extrabold text-slate-900 mb-6">Distribusi PKS per Bidang</h2>
          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.bidangData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.bidangData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Status PKS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
          <h2 className="text-sm font-extrabold text-slate-900 mb-2">Status Portofolio PKS</h2>
          <div className="flex-1 w-full flex items-center justify-between min-h-[220px]">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.statusData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="w-1/2 space-y-4 text-xs font-semibold pl-4">
              {chartData.statusData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                    {item.name === 'Aktif' && item.value === 1 && summary.pks_aktif === 0 ? 0 : item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Metrics Section (Image 1 Mockup) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">DIVERIFIKASI</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.diverifikasi_bulan_ini}</p>
            <p className="text-[10px] text-emerald-600 font-bold">Bulan ini</p>
          </div>

          <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">RATA-RATA WAKTU</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.rata_rata_waktu}</p>
            <p className="text-[10px] text-slate-400 font-medium">Pemeriksaan</p>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">TOTAL PKS SELESAI</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{summary.total_pks_selesai}</p>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        </div>
      </div>

      {/* 6. Bottom Row: Aktivitas Terbaru & Ringkasan Persetujuan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aktivitas Terbaru (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900">Aktivitas Terbaru</h2>
            <Link to="/riwayat" className="text-xs font-bold text-blue-600 hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {sampleActivities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">{act.title}</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Oleh: {act.user} • {act.time}
                    </p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold border shrink-0 ${act.badgeStyle}`}>
                  {act.badge}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ringkasan Persetujuan (1 col) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900">Ringkasan Persetujuan</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Draft PKS */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
              <FileText className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-xl font-extrabold text-slate-900">{summary.draft_pks}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">DRAFT PKS</p>
            </div>

            {/* Belum Diperiksa */}
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-center">
              <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-extrabold text-amber-600">{summary.belum_diperiksa}</p>
              <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider mt-0.5">BELUM DIPERIKSA</p>
            </div>

            {/* Ditolak */}
            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 text-center">
              <XCircle className="w-5 h-5 text-rose-500 mx-auto mb-1" />
              <p className="text-xl font-extrabold text-rose-600">{summary.ditolak}</p>
              <p className="text-[9px] font-bold text-rose-600 uppercase tracking-wider mt-0.5">DITOLAK</p>
            </div>

            {/* Menunggu Kabag */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center">
              <CheckSquare className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xl font-extrabold text-blue-600">{summary.menunggu_kabag}</p>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mt-0.5">MENUNGGU KABAG</p>
            </div>
          </div>

          <Link
            to="/approval"
            className="w-full py-2.5 bg-[#0F2238] hover:bg-[#0A1828] text-white text-xs font-bold rounded-xl text-center shadow-xs transition-all block cursor-pointer"
          >
            Kelola Semua Persetujuan
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


