import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { pksService } from '../../services/pksService';
import { adendumService } from '../../services/adendumService';
import { mitraService } from '../../services/mitraService';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Building2, Layers, FileText, Shield, UserCheck,
  CheckCircle2, Clock, Calendar, ArrowRight, Eye, RefreshCw,
  PlusCircle, FolderKanban, ShieldCheck, Database, Server
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, Cell, PieChart, Pie, Legend
} from 'recharts';
import logoEmblem from '../../assets/logo-jr-emblem.png';

export const DashboardAdmin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pksList, setPksList] = useState([]);
  const [adendumList, setAdendumList] = useState([]);
  const [mitraList, setMitraList] = useState([]);
  const [templates, setTemplates] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, pksRes, adendumRes, mitraRes, templateRes] = await Promise.all([
        authService.getAllUsers().catch(() => ({ success: false, data: [] })),
        pksService.getPksList({ per_page: 1000 }).catch(() => ({ success: false, data: [] })),
        adendumService.getAllAdendums().catch(() => ({ success: false, data: [] })),
        mitraService.getMitraList().catch(() => ({ success: false, data: [] })),
        fetch('http://localhost:8000/api/pks-templates').then(r => r.json()).catch(() => [])
      ]);

      setUsers(Array.isArray(userRes?.data) ? userRes.data : []);
      setPksList(Array.isArray(pksRes?.data) ? pksRes.data : []);
      setAdendumList(Array.isArray(adendumRes?.data) ? adendumRes.data : []);
      setMitraList(Array.isArray(mitraRes?.data) ? mitraRes.data : []);
      setTemplates(Array.isArray(templateRes) ? templateRes : []);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
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

  // Role distribution for Chart
  const roleCounts = {
    petugas_jr: 0,
    pengelola_pks: 0,
    kabag: 0,
    pimpinan: 0,
    admin_utama: 0,
  };

  users.forEach(u => {
    const r = (u.role || '').toLowerCase();
    if (roleCounts[r] !== undefined) {
      roleCounts[r]++;
    } else if (r.includes('pengelola')) {
      roleCounts.pengelola_pks++;
    } else {
      roleCounts.petugas_jr++;
    }
  });

  const roleChartData = [
    { name: 'Petugas JR', count: roleCounts.petugas_jr, fill: '#0284C7' },
    { name: 'Pengelola PKS', count: roleCounts.pengelola_pks, fill: '#6366F1' },
    { name: 'Kabag', count: roleCounts.kabag, fill: '#F59E0B' },
    { name: 'Pimpinan', count: roleCounts.pimpinan, fill: '#10B981' },
    { name: 'Admin', count: roleCounts.admin_utama, fill: '#00529C' },
  ];

  // Bidang distribution for PKS
  let pelCount = 0;
  let swCount = 0;
  let iwCount = 0;

  pksList.forEach(pks => {
    const b = (pks.bidang || '').toUpperCase();
    if (b.includes('PELAYANAN')) pelCount++;
    else if (b.includes('SW') || b.includes('SUMBANGAN')) swCount++;
    else if (b.includes('IW') || b.includes('IURAN')) iwCount++;
    else pelCount++;
  });

  const bidangData = [
    { name: 'Pelayanan', value: pelCount, color: '#0284C7' },
    { name: 'Sumbangan Wajib (SW)', value: swCount, color: '#00529C' },
    { name: 'Iuran Wajib (IW)', value: iwCount, color: '#0D9488' },
  ];

  const totalDocuments = pksList.length + adendumList.length;

  const recentUsers = [...users].slice(0, 5);

  const getRoleBadge = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin_utama' || r === 'admin') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">Admin Utama</span>;
    }
    if (r === 'pimpinan') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Pimpinan</span>;
    }
    if (r === 'kabag') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Kabag</span>;
    }
    if (r === 'pengelola_pks' || r === 'pengelola') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Pengelola</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">Petugas JR</span>;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-[#00529C] animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Memuat pusat kendali administrator...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      
      {/* 1. Admin Command Center Hero Header */}
      <div className="bg-gradient-to-r from-[#001D38] via-[#00386C] to-[#00529C] rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative watermark and glow */}
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-56 h-56 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        <img src={logoEmblem} alt="" className="absolute -right-8 -bottom-8 w-56 h-56 object-contain opacity-10 pointer-events-none select-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-sky-200">
              <img src={logoEmblem} alt="JR" className="w-4 h-4 object-contain drop-shadow-xs" />
              <span>Pusat Kendali Administrator Utama</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Administrator Utama SIM-PKS 👋
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
              Kelola master data mitra, hak akses akun pengguna, master template dokumen, serta pantau integritas seluruh database sistem PKS Kanwil.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              <Link
                to="/pengguna"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-[#00386C] font-bold text-xs hover:bg-sky-50 shadow-sm transition-all duration-200 active:scale-95"
              >
                <Users className="w-4 h-4 text-[#00529C]" />
                <span>Kelola Pengguna ({users.length})</span>
              </Link>
              <Link
                to="/mitra"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all duration-200"
              >
                <Building2 className="w-4 h-4 text-sky-200" />
                <span>Master Mitra ({mitraList.length})</span>
              </Link>
              <Link
                to="/templates"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all duration-200"
              >
                <Layers className="w-4 h-4 text-sky-200" />
                <span>Template PKS ({templates.length})</span>
              </Link>
            </div>
          </div>

          {/* System Health Milestone */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex flex-col justify-between min-w-[240px]">
            <div className="flex items-center justify-between text-xs text-sky-200 font-medium mb-3">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 text-sky-300 mr-1.5" />
                {formattedToday}
              </span>
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-white">{totalDocuments}</span>
                <span className="text-xs font-semibold text-slate-300">Total Berkas Sistem</span>
              </div>
              <p className="text-[11px] text-emerald-300 mt-2 font-medium flex items-center">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 inline-block animate-pulse"></span>
                Integritas Database Terhubung Normal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Empat (4) Kartu Sentral Master Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Pengguna */}
        <Link 
          to="/pengguna"
          className="bg-white rounded-2xl p-5 border-l-4 border-l-blue-600 border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full uppercase border border-blue-200">
              Pengguna
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-3">Akun Pengguna Terdaftar</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-0.5 group-hover:text-blue-600 transition-colors">{users.length}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Petugas, Pengelola, Kabag, Pimpinan</p>
        </Link>

        {/* Master Mitra Rekanan */}
        <Link 
          to="/mitra"
          className="bg-white rounded-2xl p-5 border-l-4 border-l-sky-500 border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold bg-sky-50 text-sky-800 px-2.5 py-0.5 rounded-full uppercase border border-sky-200">
              Mitra Rekanan
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-3">Master Perusahaan Mitra</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-0.5 group-hover:text-sky-600 transition-colors">{mitraList.length}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Instansi & Korporasi mitra JR</p>
        </Link>

        {/* Dokumen PKS & Adendum */}
        <Link 
          to="/pks"
          className="bg-white rounded-2xl p-5 border-l-4 border-l-[#00529C] border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#00529C] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded-full uppercase border border-blue-200">
              Arsip Dokumen
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-3">Total Dokumen PKS & Adendum</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-0.5 group-hover:text-[#00529C] transition-colors">{totalDocuments}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">{pksList.length} PKS & {adendumList.length} Adendum</p>
        </Link>

        {/* Template Resmi */}
        <Link 
          to="/templates"
          className="bg-white rounded-2xl p-5 border-l-4 border-l-indigo-600 border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded-full uppercase border border-indigo-200">
              Master Template
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-3">Template PKS Resmi</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-0.5 group-hover:text-indigo-600 transition-colors">{templates.length}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Format baku dokumen kemitraan</p>
        </Link>

      </div>

      {/* 3. Dual Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Distribusi Role Pengguna */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Distribusi Role Pengguna</h2>
              <p className="text-[11px] text-slate-500">Sebaran wewenang akun aktif di sistem</p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {users.length} Akun
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  formatter={(val) => [`${val} Pengguna`, 'Total Akun']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={42}>
                  {roleChartData.map((entry, index) => (
                    <Cell key={`bar-admin-role-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Distribusi Dokumen per Bidang */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">Distribusi Dokumen per Bidang</h2>
              <p className="text-[11px] text-slate-500">Proporsi dokumen: Pelayanan, Sumbangan Wajib & Iuran Wajib</p>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
              {pksList.length} PKS
            </span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {pksList.length === 0 ? (
              <div className="text-center text-slate-400 py-10">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Belum ada data dokumen untuk distribusi bidang</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    formatter={(val, name) => [`${val} Dokumen (${Math.round((val / pksList.length) * 100)}%)`, name]}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(val) => <span className="text-[11px] font-semibold text-slate-700">{val}</span>}
                  />
                  <Pie
                    data={bidangData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {bidangData.map((entry, index) => (
                      <Cell key={`pie-admin-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* 4. Tabel Daftar Pengguna Terdaftar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Pengguna Sistem Terbaru</h2>
            <p className="text-xs text-slate-500 mt-0.5">Daftar akun pengguna yang aktif di sistem SIM-PKS</p>
          </div>
          <Link
            to="/pengguna"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#00529C] hover:text-[#00386C] transition"
          >
            <span>Buka Manajemen Pengguna ({users.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentUsers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Belum ada pengguna terdaftar</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-5">Nama Lengkap</th>
                  <th className="py-3 px-5">Email & Username</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Bidang</th>
                  <th className="py-3 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentUsers.map((u) => (
                  <tr key={u.penggunaId || u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">
                      {u.nama || u.nama_pengguna || 'Pengguna'}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                      {u.email || '-'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getRoleBadge(u.role)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {u.bidang || 'Semua Bidang'}
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <Link
                        to="/pengguna"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#00529C] hover:text-white text-slate-700 font-semibold text-xs transition duration-150"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
