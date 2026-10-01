import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { Link } from 'react-router-dom';
import {
  FileText, Building2, CheckCircle2, AlertTriangle, Clock, Calendar,
  MoreVertical, XCircle, RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getSummary();
      if (res.success) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Format tanggal hari ini dalam Bahasa Indonesia (contoh: "Senin, 3 Agustus 2024")
  const formattedToday = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Data 12 Bulan (Grafik 1) - Jan s.d. Des
  const monthlyData = summary?.pengajuanBulananPetugas || [
    { bulan: 'Jan', jumlah: 0 },
    { bulan: 'Feb', jumlah: 0 },
    { bulan: 'Mar', jumlah: 0 },
    { bulan: 'Apr', jumlah: 0 },
    { bulan: 'Mei', jumlah: 0 },
    { bulan: 'Jun', jumlah: 0 },
    { bulan: 'Jul', jumlah: 0 },
    { bulan: 'Agt', jumlah: 0 },
    { bulan: 'Sep', jumlah: 0 },
    { bulan: 'Okt', jumlah: 0 },
    { bulan: 'Nov', jumlah: 0, isCurrent: true },
    { bulan: 'Des', jumlah: 0 },
  ];

  // Data Bidang Wave Chart (Grafik 2)
  const bidangWaveData = summary?.pksAktifPerBidangPetugas
    ? Object.entries(summary.pksAktifPerBidangPetugas).map(([bidang, total]) => ({ bidang, total }))
    : [
        { bidang: 'SW', total: 0 },
        { bidang: 'TK', total: 0 },
        { bidang: 'Pelayanan', total: 0 },
      ];

  // Data Pie Status (Grafik 3)
  const statusPieData = [
    { name: 'Aktif', value: summary?.distribusiStatusPetugas?.aktif ?? summary?.pksAktif ?? 0, color: '#002B49' },
    { name: 'Segera Berakhir', value: summary?.distribusiStatusPetugas?.segeraBerakhir ?? summary?.segeraBerakhir ?? 0, color: '#F59E0B' },
    { name: 'Berakhir', value: summary?.distribusiStatusPetugas?.berakhir ?? summary?.berakhir ?? 0, color: '#EF4444' },
  ];

  const totalStatusPie = statusPieData.reduce((acc, curr) => acc + curr.value, 0);

  // Data Aktivitas Terbaru
  const aktivitasList = summary?.aktivitasTerbaru || [];

  // Data Tabel PKS Segera Berakhir
  const tableExpiringList = summary?.pksSegeraBerakhirPetugas || [];

  return (
    <div className="space-y-6 pb-12 text-slate-800 font-sans">
      {/* ========================================================= */}
      {/* Title & Date Bar */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Ringkasan informasi pengelolaan Perjanjian Kerja Sama (PKS)
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs text-blue-600 font-semibold shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-blue-600 mr-1" />
          <span>{formattedToday}</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#00529C]" />
          <p className="font-semibold text-slate-600">Memuat statistik dashboard...</p>
        </div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* Row 1: 4 Stat Cards */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: PKS Aktif */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-[#002B49] shadow-2xs flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xs">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold tracking-wider bg-blue-50 text-[#002B49] px-2 py-0.5 rounded border border-blue-100 uppercase">
                  AKTIF
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {summary?.pksAktifKeseluruhan ?? summary?.pksAktif ?? 0}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">PKS yang sedang berjalan</p>
              </div>
            </div>

            {/* Card 2: Segera Berakhir */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 shadow-2xs flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-2xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold tracking-wider bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 uppercase">
                  URGENT
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {summary?.segeraBerakhirKeseluruhan ?? summary?.segeraBerakhir ?? 0}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Berakhir dalam 30 hari</p>
              </div>
            </div>

            {/* Card 3: PKS Berakhir */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-rose-500 shadow-2xs flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-2xs">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold tracking-wider bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200 uppercase">
                  EXPIRED
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {summary?.berakhirKeseluruhan ?? summary?.berakhir ?? 0}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Masa berlaku telah habis</p>
              </div>
            </div>

            {/* Card 4: Perusahaan Mitra */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 border-l-4 border-l-blue-600 shadow-2xs flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-extrabold tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 uppercase">
                  MITRA
                </span>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {summary?.totalMitra ?? 0}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Mitra aktif terdaftar</p>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Row 2: Aktivitas Terbaru (Left) & Ringkasan Persetujuan (Right) */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Aktivitas Terbaru (2 cols) */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">Aktivitas Terbaru</h2>
                <Link to="/pks" className="text-xs font-semibold text-blue-600 hover:underline">
                  Lihat Semua
                </Link>
              </div>

              {aktivitasList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Belum ada aktivitas terbaru saat ini.
                </div>
              ) : (
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {aktivitasList.map((act) => (
                    <div key={act.id} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className={`absolute -left-[22px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                        act.status === 'Draft' ? 'bg-blue-500' :
                        act.status === 'Disetujui' ? 'bg-emerald-500' :
                        act.status?.includes('Revisi') ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">{act.judul}</h3>
                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">Oleh: {act.aktor} • {act.waktu}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700 self-start sm:self-center shrink-0 uppercase tracking-wider">
                        {act.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ringkasan Persetujuan (1 col) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                  Ringkasan Persetujuan
                </h2>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {/* Card 1: DRAFT */}
                  <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-100 text-center space-y-1">
                    <FileText className="w-4 h-4 mx-auto text-slate-500" />
                    <p className="text-xl font-extrabold text-slate-900">{summary?.draftPetugas ?? summary?.totalDraft ?? 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">DRAFT</p>
                  </div>

                  {/* Card 2: BELUM DIPERIKSA */}
                  <div className="bg-[#FFFBEB] p-3.5 rounded-xl border border-amber-100 text-center space-y-1">
                    <Clock className="w-4 h-4 mx-auto text-amber-600" />
                    <p className="text-xl font-extrabold text-amber-600">{summary?.menungguPengelolaPetugas ?? summary?.dalamPemeriksaan ?? 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">BELUM DIPERIKSA</p>
                  </div>

                  {/* Card 3: DITOLAK */}
                  <div className="bg-[#FEF2F2] p-3.5 rounded-xl border border-rose-100 text-center space-y-1">
                    <XCircle className="w-4 h-4 mx-auto text-rose-600" />
                    <p className="text-xl font-extrabold text-rose-600">{summary?.ditolakCount ?? summary?.revisiCount ?? 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">DITOLAK</p>
                  </div>

                  {/* Card 4: MENUNGGU KABAG */}
                  <div className="bg-[#F0F9FF] p-3.5 rounded-xl border border-sky-100 text-center space-y-1">
                    <CheckCircle2 className="w-4 h-4 mx-auto text-sky-600" />
                    <p className="text-xl font-extrabold text-sky-600">{summary?.menungguKabagPetugas ?? summary?.menungguKabag ?? 0}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">MENUNGGU KABAG</p>
                  </div>
                </div>
              </div>

              <Link
                to="/pks"
                className="w-full py-2.5 bg-[#001E36] hover:bg-[#001526] text-white rounded-xl text-xs font-bold shadow-2xs flex items-center justify-center space-x-2 transition-colors mt-2"
              >
                <span>Kelola Semua Persetujuan</span>
              </Link>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Row 3: Grafik 1 - Jumlah PKS Yang Diajukan (Jan-Des) */}
          {/* ========================================================= */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Jumlah PKS Yang Diajukan (Jan-Des)
              </h2>
              <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#002B49] inline-block"></span>
                <span>Diajukan</span>
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val) => [`${val} PKS`, 'Jumlah Diajukan']}
                  />
                  <Bar dataKey="jumlah" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={entry.isCurrent ? '#002B49' : '#CBD5E1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Row 4: Grafik 2 (Jumlah PKS Aktif per Bidang) & Grafik 3 (Status PKS Bulan Ini) */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grafik 2: Jumlah PKS Aktif per Bidang */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                Jumlah PKS Aktif per Bidang
              </h2>
              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bidangWaveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00529C" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#00529C" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="bidang" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(val) => [`${val} PKS Aktif`, 'Jumlah']}
                    />
                    <Area type="monotone" dataKey="total" stroke="#00529C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWave)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grafik 3: Status PKS Bulan Ini */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                Status PKS Bulan Ini
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                        formatter={(val) => [`${val} PKS`, 'Total']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Total Counter */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-extrabold text-slate-900 leading-none">{totalStatusPie}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">TOTAL</span>
                  </div>
                </div>

                {/* Right Legend List */}
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-[#002B49] inline-block shrink-0" />
                    <span className="text-slate-600 w-24">Aktif</span>
                    <span className="text-slate-900 font-extrabold">{statusPieData[0].value}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shrink-0" />
                    <span className="text-slate-600 w-24">Segera Berakhir</span>
                    <span className="text-slate-900 font-extrabold">{statusPieData[1].value}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shrink-0" />
                    <span className="text-slate-600 w-24">Berakhir</span>
                    <span className="text-slate-900 font-extrabold">{statusPieData[2].value}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* Row 5: Tabel Daftar PKS yang Segera Berakhir */}
          {/* ========================================================= */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Daftar PKS yang Segera Berakhir
              </h2>
              <Link to="/pks" className="text-xs font-semibold text-blue-600 hover:underline">
                Lihat Semua
              </Link>
            </div>

            {tableExpiringList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Belum ada PKS yang segera berakhir saat ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3">NOMOR PKS</th>
                      <th className="px-5 py-3">JUDUL PKS</th>
                      <th className="px-5 py-3">BIDANG</th>
                      <th className="px-5 py-3">PERUSAHAAN MITRA</th>
                      <th className="px-5 py-3">TANGGAL BERAKHIR</th>
                      <th className="px-5 py-3">SISA HARI</th>
                      <th className="px-5 py-3 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tableExpiringList.map((row) => (
                      <tr key={row.pksId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-[#00529C]">
                          {row.nomorPKS}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900 max-w-xs truncate">
                          {row.ruangLingkup}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase">
                            {row.bidang}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-700">
                          {row.namaPerusahaan}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-slate-800">
                          {row.tanggalBerakhir}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${row.sisaHari <= 0 ? 'bg-rose-500' : 'bg-amber-500'}`}
                                style={{ width: `${Math.min(100, Math.max(10, (row.sisaHari / 30) * 100))}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                              row.sisaHari <= 0 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {row.sisaHari} HARI
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to={`/pks/${row.pksId}`}
                            className="p-1 text-slate-400 hover:text-blue-600 inline-block transition-colors"
                            title="Detail PKS"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
