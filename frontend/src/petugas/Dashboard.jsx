import React, { useState, useEffect } from 'react';
import { pksService } from '../services/pksService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  FileText, CheckCircle2, AlertTriangle, Calendar,
  RefreshCw, ArrowRight, Target
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalTahunIni: 0,
    disetujui: 0,
    dalamProses: 0,
    revisi: 0,
    semester1: 0,
    semester2: 0,
  });

  const TARGET_TAHUNAN = 12;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await pksService.getPksList({ per_page: 500 });
        if (res.success && res.data) {
          const list = res.data;
          
          let tahunIniCount = 0;
          let disetujuiCount = 0;
          let prosesCount = 0;
          let revisiCount = 0;
          let s1Count = 0;
          let s2Count = 0;
          
          const currentYear = new Date().getFullYear();

          list.forEach(pks => {
            const createdDate = new Date(pks.created_at || new Date());
            const year = createdDate.getFullYear();
            const month = createdDate.getMonth();
            const status = pks.status_persetujuan || pks.statusPersetujuan || '';
            const statusPks = pks.status_pks || pks.statusPks || '';

            if (year === currentYear) {
              // 1. Semester stats (count all created)
              if (month < 6) s1Count++;
              else s2Count++;

              // 2. Status Document logic
              if (status === 'Disetujui' || statusPks === 'Aktif') {
                disetujuiCount++;
                tahunIniCount++; // ONLY count as KPI Target if it's Final/Disetujui
              } 
              else if (status.includes('Ditolak') || status.includes('Revisi')) {
                revisiCount++;
              } 
              else if (status.includes('Menunggu') || status.includes('Pemeriksaan')) {
                prosesCount++;
              }
              // Note: 'Draf' is intentionally excluded from the target and the 3 cards
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
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-[#00529C] animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Memuat data dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 text-slate-800 font-sans mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Dashboard Petugas</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Ringkasan informasi pengajuan dan status dokumen PKS.
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs text-[#00529C] font-semibold shadow-2xs">
          <Calendar className="w-4 h-4 text-[#00529C] mr-1" />
          <span>{formattedToday}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Target KPI Section */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col items-center text-center">
          <h2 className="text-sm font-extrabold text-slate-900 mb-6 w-full text-left">Pencapaian Target PKS {new Date().getFullYear()}</h2>
          
          <div className="relative w-40 h-40 mb-6">
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
          
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Anda telah menyelesaikan <span className="font-bold text-slate-900">{stats.totalTahunIni} dokumen</span> dari target tahunan ({TARGET_TAHUNAN} PKS).
          </p>
        </div>

        {/* 2. Status Dokumen PKS */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-extrabold text-slate-900">Status Dokumen PKS (Tahun Ini)</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
            {/* Disetujui */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 border-l-4 border-l-emerald-500 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">
                  Final
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-slate-900">{stats.disetujui}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">Berhasil Disetujui</p>
              </div>
            </div>

            {/* Diproses */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 border-l-4 border-l-[#00529C] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#00529C]" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase">
                  Proses
                </span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-slate-900">{stats.dalamProses}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">Sedang Diverifikasi</p>
              </div>
            </div>

            {/* Revisi */}
            <div className={`rounded-xl p-5 border-l-4 shadow-2xs flex flex-col justify-between ${stats.revisi > 0 ? 'bg-[#FFF5F5] border-rose-200 border-l-rose-500' : 'bg-white border-slate-200 border-l-slate-300'}`}>
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${stats.revisi > 0 ? 'bg-rose-100' : 'bg-slate-50'}`}>
                  <AlertTriangle className={`w-4 h-4 ${stats.revisi > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${stats.revisi > 0 ? 'text-rose-700 bg-rose-50 border-rose-100' : 'text-slate-500 bg-slate-50 border-slate-200'}`}>
                  Revisi
                </span>
              </div>
              <div className="mt-4">
                <p className={`text-2xl font-extrabold ${stats.revisi > 0 ? 'text-rose-700' : 'text-slate-900'}`}>{stats.revisi}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">Butuh Perbaikan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Grafik Pengajuan PKS per Semester */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs mt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-extrabold text-slate-900">Rekapitulasi Pengajuan PKS per Semester</h2>
          <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-600">
            <span className="w-3 h-3 rounded bg-[#00529C] inline-block"></span>
            <span>Jumlah Dokumen</span>
          </div>
        </div>
        
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={semesterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip 
                cursor={{ fill: '#F8FAFC' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(val) => [`${val} Dokumen`, 'Total Diajukan']}
              />
              <Bar dataKey="diajukan" radius={[4, 4, 0, 0]} barSize={50}>
                {semesterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#94A3B8' : '#00529C'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
