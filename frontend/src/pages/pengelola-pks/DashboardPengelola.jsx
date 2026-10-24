import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { pksService } from '../../services/pksService';
import { adendumService } from '../../services/adendumService';
import { ModalDetailPks } from '../../petugas/ModalDetailPks';
import { ModalDetailAdendum } from '../../petugas/ModalDetailAdendum';
import {
  FileText, Clock, Upload, CheckCircle2, AlertTriangle,
  Building2, Calendar, ArrowRight, CheckSquare, Layers,
  ChevronRight, Shield, Sparkles, FolderKanban, Download, RefreshCw
} from 'lucide-react';
import logoEmblem from '../../assets/logo-jr-emblem.png';

export const DashboardPengelola = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userBidang = user?.bidang || 'Pelayanan';

  const [loading, setLoading] = useState(true);
  const [pksList, setPksList] = useState([]);
  const [adendumList, setAdendumList] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Filter tab meja kerja
  const [activeTab, setActiveTab] = useState('semua_antrean'); // 'semua_antrean', 'pks', 'adendum', 'upload_final'

  // Modal Detail state
  const [selectedPksId, setSelectedPksId] = useState(null);
  const [selectedAdendumId, setSelectedAdendumId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pksRes, adendumRes, templateRes] = await Promise.all([
        pksService.getPksList({ per_page: 500 }),
        adendumService.getAllAdendums(),
        fetch('/api/pks-templates').then(r => r.json()).catch(() => [])
      ]);

      const allPks = (pksRes?.success && Array.isArray(pksRes.data)) ? pksRes.data : [];
      const allAdendum = (adendumRes?.success && Array.isArray(adendumRes.data)) ? adendumRes.data : [];
      const allTemplates = Array.isArray(templateRes) ? templateRes : [];

      // Filter khusus bidang pengelola ini
      const filteredPks = allPks.filter(p => {
        const b = (p.bidang || '').toLowerCase();
        return b === userBidang.toLowerCase();
      });

      const filteredAdendum = allAdendum.filter(ad => {
        const docBidang = (ad.pksDocument?.bidang || ad.pks?.bidang || '').toLowerCase();
        return docBidang === userBidang.toLowerCase();
      });

      const filteredTemplates = allTemplates.filter(t => {
        const tBidang = (t.bidang || '').toLowerCase();
        return tBidang === userBidang.toLowerCase();
      });

      setPksList(filteredPks);
      setAdendumList(filteredAdendum);
      setTemplates(filteredTemplates);
    } catch (err) {
      console.error('Error fetching pengelola dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Bidang theme helper (Konsisten menggunakan Biru Resmi Jasa Raharja)
  const getBidangTheme = (bidang) => {
    const b = (bidang || '').toLowerCase();
    if (b.includes('pelayanan')) {
      return {
        label: 'Bidang Pelayanan (Kesehatan & RS)',
        gradient: 'from-[#001D38] via-[#00386C] to-[#00529C]',
        accent: 'text-blue-200',
        ring: 'ring-blue-100',
      };
    }
    if (b.includes('sw')) {
      return {
        label: 'Bidang Sumbangan Wajib (SWDKLLJ)',
        gradient: 'from-[#001D38] via-[#00386C] to-[#00529C]',
        accent: 'text-blue-200',
        ring: 'ring-blue-100',
      };
    }
    return {
      label: 'Bidang Iuran Wajib (IWKL / IWKBU)',
      gradient: 'from-[#001D38] via-[#00386C] to-[#00529C]',
      accent: 'text-blue-200',
      ring: 'ring-blue-100',
    };
  };

  const bidangTheme = getBidangTheme(userBidang);

  // Perhitungan KPI
  const now = new Date();

  // 1. Antrean butuh verifikasi Pengelola (Menunggu Penyerahan atau Pemeriksaan Pengelola)
  const pksPendingVerification = pksList.filter(p => {
    const st = p.statusPersetujuan || p.status_persetujuan || '';
    return st === 'Menunggu Penyerahan' || st === 'Pemeriksaan Pengelola';
  });

  const adendumPendingVerification = adendumList.filter(ad => {
    const st = ad.statusPersetujuan || ad.status_persetujuan || '';
    return st === 'Menunggu Penyerahan' || st === 'Pemeriksaan Pengelola';
  });

  const totalAntreanVerifikasi = pksPendingVerification.length + adendumPendingVerification.length;

  // 2. Berkas disetujui Pimpinan, menunggu scan & upload PDF final oleh Pengelola
  const pksWaitingFinalUpload = pksList.filter(p => {
    const st = p.statusPersetujuan || p.status_persetujuan || '';
    return st === 'Disetujui Pimpinan' || (st === 'Disetujui' && (!p.file_scan && !p.statusDokumen));
  });

  const totalWaitingUpload = pksWaitingFinalUpload.length;

  // 3. PKS Aktif di bidang ini
  const pksAktifList = pksList.filter(p => {
    const stPks = p.statusPks || p.status_pks || '';
    const stPers = p.statusPersetujuan || p.status_persetujuan || '';
    return stPks === 'Aktif' || stPers === 'Disetujui';
  });

  // 4. PKS Mendekati Jatuh Tempo (<= 30 hari)
  const expiringPksList = pksList.filter(p => {
    const tgl = p.tanggalBerakhir || p.tanggal_berakhir;
    if (!tgl) return false;
    const end = new Date(tgl);
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  });

  // List gabungan meja kerja operasional
  const unifiedTasks = [];

  pksPendingVerification.forEach(p => {
    unifiedTasks.push({
      id: p.pksId || p.id,
      tipe: 'PKS',
      nomor: p.nomorPKS || p.nomor_pks || 'Draf PKS',
      mitra: p.perusahaan || p.mitra?.nama_perusahaan || p.mitra?.nama_mitra || 'Mitra',
      petugas: p.pembuat?.nama || p.user?.nama || 'Petugas JR',
      tanggal: p.created_at || p.createdAt || new Date().toISOString(),
      status: p.statusPersetujuan || p.status_persetujuan,
      actionType: 'verifikasi'
    });
  });

  adendumPendingVerification.forEach(ad => {
    unifiedTasks.push({
      id: ad.adendumId || ad.id,
      tipe: 'Adendum',
      nomor: ad.nomorAdendum || ad.nomor_adendum || `Adendum #${ad.id || ad.adendumId}`,
      mitra: ad.pksDocument?.mitra?.nama_perusahaan || ad.pks?.mitra?.nama_perusahaan || 'Mitra PKS',
      petugas: ad.user?.nama || 'Petugas JR',
      tanggal: ad.created_at || ad.createdAt || new Date().toISOString(),
      status: ad.statusPersetujuan || ad.status_persetujuan,
      actionType: 'verifikasi'
    });
  });

  pksWaitingFinalUpload.forEach(p => {
    unifiedTasks.push({
      id: p.pksId || p.id,
      tipe: 'PKS',
      nomor: p.nomorPKS || p.nomor_pks || 'Draf PKS',
      mitra: p.perusahaan || p.mitra?.nama_perusahaan || p.mitra?.nama_mitra || 'Mitra',
      petugas: p.pembuat?.nama || 'Petugas JR',
      tanggal: p.updated_at || p.updatedAt || new Date().toISOString(),
      status: p.statusPersetujuan || p.status_persetujuan || 'Disetujui Pimpinan',
      actionType: 'upload_final'
    });
  });

  // Filter tasks based on activeTab
  const filteredTasks = unifiedTasks.filter(item => {
    if (activeTab === 'pks') return item.tipe === 'PKS' && item.actionType === 'verifikasi';
    if (activeTab === 'adendum') return item.tipe === 'Adendum';
    if (activeTab === 'upload_final') return item.actionType === 'upload_final';
    return true; // 'semua_antrean'
  });

  // Radar Jatuh Tempo (sorted by urgency, <= 60 days)
  const radarExpiringList = pksList
    .map(p => {
      const tgl = p.tanggalBerakhir || p.tanggal_berakhir;
      if (!tgl) return null;
      const end = new Date(tgl);
      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return {
        ...p,
        diffDays,
        endDate: end
      };
    })
    .filter(p => p !== null && p.diffDays <= 60)
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 5);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Dedicated Header Banner for Pengelola Bidang */}
      <div className={`rounded-3xl p-6 sm:p-7 text-white bg-gradient-to-r ${bidangTheme.gradient} shadow-md relative overflow-hidden`}>
        {/* Decorative Circles and Watermark */}
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute right-32 bottom-0 translate-y-10 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />
        <img src={logoEmblem} alt="" className="absolute -right-6 -bottom-6 w-52 h-52 object-contain opacity-10 pointer-events-none select-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-white/15 backdrop-blur-md border border-white/20 text-white inline-flex items-center">
                <img src={logoEmblem} alt="JR" className="w-3.5 h-3.5 mr-1.5 object-contain drop-shadow-xs" />
                Meja Kerja Pengelola PKS
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-white text-[#00529C] border border-white/20 shadow-xs">
                {bidangTheme.label}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Selamat Bertugas, {user?.nama || 'Pengelola PKS'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
              Pantau antrean verifikasi draf dokumen, kelola template klausul, dan tindak lanjuti siklus kemitraan khusus <strong className="text-white">Bidang {userBidang}</strong>.
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0">
            <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-xs font-semibold text-white shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-blue-200" />
              <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>

            <button
              onClick={fetchData}
              className="inline-flex items-center px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
              title="Perbarui Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Segarkan
            </button>
          </div>
        </div>
      </div>

      {/* 2. Empat (4) Kartu Metrik Operasional Pengelola Bidang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Antrean Verifikasi Draf */}
        <div 
          onClick={() => navigate('/approval')}
          className="bg-white rounded-2xl p-5 border-l-4 border-l-blue-600 border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full uppercase border border-blue-200">
              Perlu Tindakan
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-3">Antrean Verifikasi Draf</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-0.5 group-hover:text-blue-600 transition-colors">
            {totalAntreanVerifikasi}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Draf PKS & Adendum {userBidang}
          </p>
        </div>

        {/* Card 2: Menunggu Unggah Final */}
        <div 
          onClick={() => navigate('/pks')}
          className="bg-white rounded-2xl p-5 border-l-4 border-l-emerald-600 border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full uppercase border border-emerald-200">
              Tahap Akhir
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-3">Menunggu Unggah Dokumen Final</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-0.5 group-hover:text-emerald-600 transition-colors">
            {totalWaitingUpload}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Sudah disetujui, siap scan basah
          </p>
        </div>

        {/* Card 3: PKS Aktif di Bidang Ini */}
        <div 
          onClick={() => navigate('/pks')}
          className="bg-white rounded-2xl p-5 border-l-4 border-l-slate-800 border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full uppercase">
              Aktif Berjalan
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-3">PKS Aktif ({userBidang})</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-0.5 group-hover:text-slate-800 transition-colors">
            {pksAktifList.length}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Mitra resmi terdaftar aktif
          </p>
        </div>

        {/* Card 4: PKS Mendekati Jatuh Tempo */}
        <div 
          onClick={() => navigate('/notifications')}
          className="bg-white rounded-2xl p-5 border-l-4 border-l-amber-500 border border-slate-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-extrabold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full uppercase border border-amber-200">
              Perlu Adendum
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-3">Segera Berakhir (≤ 30 Hari)</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-0.5 group-hover:text-amber-600 transition-colors">
            {expiringPksList.length}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Butuh tindak lanjut perpanjangan
          </p>
        </div>

      </div>

      {/* 3. Meja Kerja Operasional: Antrean Berkas Masuk Hari Ini */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Header Meja Kerja */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <FolderKanban className="w-5 h-5 text-[#00529C]" />
              <h2 className="text-sm font-extrabold text-slate-900">
                Meja Kerja Operasional: Antrean Berkas Bidang {userBidang}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dokumen yang sedang menunggu tindakan pemeriksaan, verifikasi, atau unggah dokumen final dari Anda.
            </p>
          </div>

          {/* Tab Filter Antrean */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('semua_antrean')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'semua_antrean' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({unifiedTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('pks')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'pks' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Draf PKS ({pksPendingVerification.length})
            </button>
            <button
              onClick={() => setActiveTab('adendum')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'adendum' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Draf Adendum ({adendumPendingVerification.length})
            </button>
            <button
              onClick={() => setActiveTab('upload_final')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'upload_final' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unggah Final ({totalWaitingUpload})
            </button>
          </div>
        </div>

        {/* Tabel Antrean Dokumen */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-400">Memuat data berkas kerja pengelola...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-16 text-center space-y-2">
              <CheckSquare className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-800">Meja Kerja Anda Bersih! 🎉</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Semua berkas PKS dan Adendum di bidang {userBidang} telah selesai diverifikasi atau tidak ada yang menunggu tindakan saat ini.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-blue-50/50 border-b border-slate-100 text-slate-700 font-extrabold text-[11px]">
                <tr>
                  <th className="px-5 py-4">Tipe & Nomor</th>
                  <th className="px-5 py-4">Perusahaan / Instansi Mitra</th>
                  <th className="px-4 py-4">Petugas Pembuat</th>
                  <th className="px-4 py-4">Tanggal Pengajuan</th>
                  <th className="px-4 py-4">Status Saat Ini</th>
                  <th className="px-5 py-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredTasks.slice(0, 7).map((item, idx) => (
                  <tr key={`${item.tipe}-${item.id}-${idx}`} className="hover:bg-blue-50/30 transition-colors">
                    
                    {/* Tipe & Nomor */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          item.tipe === 'Adendum' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {item.tipe}
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {item.nomor}
                        </span>
                      </div>
                    </td>

                    {/* Mitra */}
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {item.mitra}
                    </td>

                    {/* Petugas */}
                    <td className="px-4 py-4 text-slate-600">
                      {item.petugas}
                    </td>

                    {/* Tanggal */}
                    <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.status === 'Disetujui Pimpinan'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'Pemeriksaan Pengelola'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          item.status === 'Disetujui Pimpinan' ? 'bg-emerald-500' : item.status === 'Pemeriksaan Pengelola' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        {item.status}
                      </span>
                    </td>

                    {/* Aksi Cepat */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.tipe === 'Adendum') {
                              setSelectedAdendumId(item.id);
                            } else {
                              setSelectedPksId(item.id);
                            }
                          }}
                          className="px-3.5 py-1.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center shadow-2xs"
                        >
                          Periksa Draf
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer Meja Kerja */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Menampilkan antrean kerja aktif khusus bidang {userBidang}</span>
          <Link
            to="/approval"
            className="font-bold text-[#00529C] hover:text-blue-800 inline-flex items-center"
          >
            Buka Alur Persetujuan Lengkap <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

      </div>

      {/* 4. Dua Kolom Pendukung di Bawah */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kolom Kiri: Radar Jatuh Tempo Mitra (Bidang Ini) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                Radar Masa Berlaku Mitra ({userBidang})
              </h3>
            </div>
            <Link to="/notifications" className="text-[11px] font-bold text-blue-600 hover:text-blue-800">
              Lihat Notifikasi
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            Daftar mitra kerja sama yang masa berlakunya paling mendesak untuk ditinjau kelanjutannya (Adendum).
          </p>

          <div className="space-y-2.5">
            {radarExpiringList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Tidak ada mitra yang mendekati jatuh tempo dalam 60 hari ke depan.
              </div>
            ) : (
              radarExpiringList.map((p, idx) => {
                const diff = p.diffDays;
                const isExpired = diff <= 0;
                const isUrgent = diff <= 30 && !isExpired;

                return (
                  <div
                    key={p.pksId || idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                      isExpired
                        ? 'bg-rose-50/40 border-rose-200'
                        : isUrgent
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-900 text-xs">
                        {p.perusahaan || p.mitra?.nama_perusahaan || 'Mitra PKS'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {p.nomorPKS || p.nomor_pks || 'Draf'} • Selesai: {p.endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        isExpired
                          ? 'bg-rose-100 text-rose-700'
                          : isUrgent
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {isExpired ? 'Telah Berakhir' : `${diff} Hari Lagi`}
                      </span>

                      <button
                        type="button"
                        onClick={() => setSelectedPksId(p.pksId || p.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-white transition-colors cursor-pointer"
                        title="Buka Detail"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Kolom Kanan: Template Dokumen Bidang Ini */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#00529C]" />
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                Template Klausul Dokumen ({userBidang})
              </h3>
            </div>
            <Link to="/pengelola-pks/templates" className="text-[11px] font-bold text-blue-600 hover:text-blue-800">
              Kelola Template
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            Format template resmi (.docx) yang digunakan Petugas JR saat menyusun draf dokumen bidang ini.
          </p>

          <div className="space-y-2.5">
            {templates.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Belum ada template aktif yang diunggah untuk bidang {userBidang}.
              </div>
            ) : (
              templates.slice(0, 4).map((t, idx) => (
                <div
                  key={t.id || t.templateId || idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between hover:bg-blue-50/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-slate-900 text-xs">
                      {t.nama_template || t.namaTemplate || 'Template Dokumen'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {t.jenis_pks || t.jenisPks || userBidang} • Versi {t.versi || '1.0'}
                    </p>
                  </div>

                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Aktif
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="pt-2">
            <Link
              to="/pengelola-pks/templates"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 text-[#00529C] text-xs font-bold rounded-xl transition-all"
            >
              Unggah / Perbarui Template {userBidang} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Modal Detail PKS (Muncul langsung saat klik periksa dari dashboard) */}
      {selectedPksId && (
        <ModalDetailPks
          isOpen={!!selectedPksId}
          pksId={selectedPksId}
          onClose={() => setSelectedPksId(null)}
          onSuccess={() => {
            fetchData();
            setSelectedPksId(null);
          }}
        />
      )}

      {/* Modal Detail Adendum */}
      {selectedAdendumId && (
        <ModalDetailAdendum
          isOpen={!!selectedAdendumId}
          adendumId={selectedAdendumId}
          onClose={() => setSelectedAdendumId(null)}
          onSuccess={() => {
            fetchData();
            setSelectedAdendumId(null);
          }}
        />
      )}

    </div>
  );
};
