import React, { useState, useEffect } from 'react';
import { pksService } from '../services/pksService';
import { adendumService } from '../services/adendumService';
import { StatusBadge } from '../components/StatusBadge';
import { CustomDialog } from '../components/CustomDialog';
import { ModalDetailPks } from './ModalDetailPks';
import { ModalDetailAdendum } from './ModalDetailAdendum';
import { ModalUbahPks } from './ModalUbahPks';
import { ModalUbahAdendum } from './ModalUbahAdendum';
import { useAuth } from '../context/AuthContext';
import {
  RotateCcw, Eye, ChevronLeft, ChevronRight, CheckSquare,
  TrendingUp, AlertCircle, FileText, Check, XCircle, Edit3, Send,
  Layers, Clock, Filter
} from 'lucide-react';

export const PersetujuanPksPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pksList, setPksList] = useState([]);

  // Modals state
  const [selectedPksItem, setSelectedPksItem] = useState(null);
  const [selectedAdendumItem, setSelectedAdendumItem] = useState(null);
  const [editingPksId, setEditingPksId] = useState(null);
  const [editingAdendum, setEditingAdendum] = useState(null);

  // Dialog State
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
  });
  const [promptValue, setPromptValue] = useState('');

  const showDialog = (type, title, message, onConfirm = null) => {
    setDialogState({ isOpen: true, type, title, message, onConfirm });
  };

  // Filter States
  const [activeTab, setActiveTab] = useState('semua'); // 'semua' | 'tugas_saya' | 'pks' | 'adendum'
  const [jenisFilter, setJenisFilter] = useState('Semua Jenis'); // 'Semua Jenis' | 'PKS' | 'Adendum'
  const [bidangFilter, setBidangFilter] = useState('Semua Bidang');
  const [statusPersetujuanFilter, setStatusPersetujuanFilter] = useState('Semua Status');
  const [urutan, setUrutan] = useState('Terbaru');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Role Checks
  const role = user?.role?.toLowerCase() || '';
  const isPetugas = role === 'petugas_jr';
  const isPengelola = role === 'pengelola_pks' || role === 'pengelola';
  const isAdmin = role === 'admin_utama' || role === 'admin';
  const isPengelolaOrAdmin = isPengelola || isAdmin;
  const isKabag = role === 'kabag';
  const isPimpinan = role === 'pimpinan';

  const fetchApprovalData = async () => {
    setLoading(true);
    try {
      const [resPks, resAdendum] = await Promise.all([
        pksService.getPksList({ per_page: 100 }),
        adendumService.getAllAdendums()
      ]);

      const items = [];

      // 1. Map PKS Induk
      if (resPks?.success && resPks?.data) {
        const rawPks = Array.isArray(resPks.data) ? resPks.data : (Array.isArray(resPks.data?.data) ? resPks.data.data : []);
        rawPks.forEach(item => {
          items.push({
            id: `pks_${item.pksId || item.id}`,
            pksId: item.pksId || item.id,
            tipe: 'PKS',
            nomorDokumen: item.nomor_pks || item.nomorPKS || '-',
            jenisTag: item.jenis_pks || item.jenisPKS || 'PKS Standar',
            bidang: item.bidang || '-',
            perusahaan: item.mitra?.nama_mitra || item.mitra?.namaPerusahaan || '-',
            petugas: item.pengguna?.nama || item.pengguna?.nama_pengguna || item.pembuat?.nama || item.pembuat?.nama_pengguna || '-',
            pembuat_id: item.penggunaId || item.pembuat_id,
            tglPengajuan: (item.created_at || item.createdAt)
              ? new Date(item.created_at || item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
              : '-',
            rawDate: item.created_at || item.createdAt || '',
            statusPks: item.status_pks || item.statusPks || 'Draf',
            statusPersetujuan: item.status_persetujuan || item.statusPersetujuan || 'Draf',
            catatanRevisi: item.catatan_revisi,
            raw: item,
          });
        });
      }

      // 2. Map Adendum
      if (resAdendum?.success && resAdendum?.data) {
        const rawAdendums = Array.isArray(resAdendum.data) ? resAdendum.data : [];
        rawAdendums.forEach(item => {
          const pksDoc = item.pks_document || item.pksDocument;
          items.push({
            id: `adendum_${item.adendumId || item.id}`,
            adendumId: item.adendumId || item.id,
            pksId: item.pks_document_id || pksDoc?.pksId,
            tipe: 'Adendum',
            nomorDokumen: item.nomorAdendum || pksDoc?.nomor_pks || '-',
            jenisTag: 'Adendum PKS',
            bidang: pksDoc?.bidang || item.bidang || '-',
            perusahaan: pksDoc?.mitra?.nama_mitra || pksDoc?.mitra?.namaPerusahaan || '-',
            petugas: item.pembuat?.nama || item.pembuat?.nama_pengguna || pksDoc?.pengguna?.nama || pksDoc?.pengguna?.nama_pengguna || pksDoc?.pembuat?.nama || '-',
            pembuat_id: item.pembuat_id || pksDoc?.penggunaId,
            tglPengajuan: (item.created_at || item.createdAt)
              ? new Date(item.created_at || item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
              : '-',
            rawDate: item.created_at || item.createdAt || '',
            statusPks: (item.statusPersetujuan === 'Disetujui' || item.statusPersetujuan === 'Selesai') ? 'Aktif' : 'Draft',
            statusPersetujuan: item.statusPersetujuan || 'Draft',
            catatanRevisi: item.catatanRevisi,
            raw: item,
          });
        });
      }

      setPksList(items);
    } catch (err) {
      console.error(err);
      setPksList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalData();
  }, []);

  const handleResetFilter = () => {
    setActiveTab('semua');
    setJenisFilter('Semua Jenis');
    setBidangFilter('Semua Bidang');
    setStatusPersetujuanFilter('Semua Status');
    setUrutan('Terbaru');
    setSearchQuery('');
  };

  // Helper untuk mengecek apakah item butuh aksi dari user yang sedang login
  const isItemNeedingMyAction = (item) => {
    const status = item.statusPersetujuan || '';
    if (isPetugas) {
      return status.includes('Revisi') || ['draft', 'draf'].includes(status.toLowerCase());
    }
    if (isPengelolaOrAdmin) {
      return status === 'Menunggu Penyerahan' || status === 'Pemeriksaan Pengelola';
    }
    if (isKabag) {
      return status === 'Disetujui Pengelola' || status === 'Pemeriksaan Kabag';
    }
    if (isPimpinan) {
      return status === 'Disetujui Kabag' || status === 'Pemeriksaan Pimpinan';
    }
    return false;
  };

  // Quick Action Handler
  const handleQuickAction = async (item, actionType, catatan = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('pks_token');
      const uId = user?.penggunaId || user?.id;

      if (item.tipe === 'PKS') {
        const res = await fetch('http://localhost:8000/api/pks-approvals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            pks_id: item.pksId,
            user_id: uId,
            status_aksi: actionType,
            catatan: catatan
          })
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Gagal memproses persetujuan PKS.');
        }
      } else {
        const res = await adendumService.postApproval({
          adendum_id: item.adendumId,
          user_id: uId,
          status_aksi: actionType,
          catatan: catatan
        });
        if (!res.success) {
          throw new Error(res.message || 'Gagal memproses persetujuan Adendum.');
        }
      }

      showDialog('info', 'Berhasil', `Aksi "${actionType}" berhasil diproses.`);
      await fetchApprovalData();
    } catch (err) {
      showDialog('info', 'Gagal', err.message || 'Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setLoading(false);
    }
  };

  // Prompt Revisi Handler
  const triggerRevisiPrompt = (item) => {
    setPromptValue('');
    const targetRoleSuffix = isPengelolaOrAdmin ? 'Pengelola' : isKabag ? 'Kabag' : isPimpinan ? 'Pimpinan' : '';
    showDialog(
      'prompt',
      `Kembalikan / Revisi ${item.tipe}`,
      `Masukkan catatan revisi untuk perbaikan ${item.tipe}:`,
      (alasan) => {
        if (!alasan || alasan.trim() === '') return;
        handleQuickAction(item, `Revisi ${targetRoleSuffix}`, alasan);
      }
    );
  };

  // KPI Calculations
  const countTugasSaya = pksList.filter(isItemNeedingMyAction).length;
  const countDisetujui = pksList.filter(i => (i.statusPersetujuan || '').includes('Disetujui') || i.statusPersetujuan === 'Aktif' || i.statusPersetujuan === 'Selesai').length;
  const countRevisi = pksList.filter(i => (i.statusPersetujuan || '').includes('Revisi')).length;
  const countTotal = pksList.length;

  // Filter Logic
  const filteredData = pksList.filter(item => {
    if (activeTab === 'tugas_saya' && !isItemNeedingMyAction(item)) return false;
    if (activeTab === 'pks' && item.tipe !== 'PKS') return false;
    if (activeTab === 'adendum' && item.tipe !== 'Adendum') return false;

    if (jenisFilter !== 'Semua Jenis' && item.tipe !== jenisFilter) return false;
    if (bidangFilter !== 'Semua Bidang' && item.bidang !== bidangFilter) return false;
    if (statusPersetujuanFilter !== 'Semua Status' && item.statusPersetujuan !== statusPersetujuanFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNomor = (item.nomorDokumen || '').toLowerCase().includes(q);
      const matchMitra = (item.perusahaan || '').toLowerCase().includes(q);
      const matchPetugas = (item.petugas || '').toLowerCase().includes(q);
      if (!matchNomor && !matchMitra && !matchPetugas) return false;
    }

    return true;
  }).sort((a, b) => {
    if (urutan === 'Terbaru') {
      return new Date(b.rawDate) - new Date(a.rawDate);
    } else {
      return new Date(a.rawDate) - new Date(b.rawDate);
    }
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Persetujuan Dokumen PKS & Adendum</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lakukan pemeriksaan dan persetujuan terhadap PKS dan Adendum yang sedang menunggu tindakan Anda.
          </p>
        </div>

        {/* Tab Filter Button */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
          <button
            onClick={() => { setActiveTab('semua'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'semua' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Semua ({pksList.length})
          </button>
          <button
            onClick={() => { setActiveTab('tugas_saya'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center ${
              activeTab === 'tugas_saya' ? 'bg-[#00529C] text-white shadow-xs' : 'text-blue-700 hover:text-blue-900'
            }`}
          >
            Perlu Tindakan Saya
            {countTugasSaya > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'tugas_saya' ? 'bg-white text-[#00529C]' : 'bg-blue-600 text-white'
              }`}>
                {countTugasSaya}
              </span>
            )}
          </button>
          <button
            onClick={() => { setActiveTab('pks'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'pks' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            PKS
          </button>
          <button
            onClick={() => { setActiveTab('adendum'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'adendum' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            Adendum
          </button>
        </div>
      </div>

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Menunggu Tindakan Saya */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs relative overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">
              {isPetugas ? 'Revisi Milik Saya' : 'Menunggu Tindakan Saya'}
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{countTugasSaya}</p>
            <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-2 ${
              countTugasSaya > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
            }`}>
              {countTugasSaya > 0 ? '⚠️ Perlu tindakan segera' : '✓ Tidak ada antrean'}
            </p>
          </div>
          <FileText className="w-16 h-16 text-slate-100 absolute -right-2 -bottom-2 pointer-events-none" />
        </div>

        {/* Card 2: Disetujui */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Disetujui / Selesai</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{countDisetujui}</p>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center mt-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-extrabold text-[10px] mr-1">✓</span>
              Telah disetujui resmi
            </p>
          </div>
        </div>

        {/* Card 3: Perlu Revisi */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Perlu Revisi</p>
            <p className="text-3xl font-extrabold text-rose-600 mt-1">{countRevisi}</p>
            <p className="text-[10px] text-rose-600 font-bold flex items-center mt-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-extrabold text-[10px] mr-1">✕</span>
              Menunggu perbaikan Petugas
            </p>
          </div>
        </div>

        {/* Card 4: Total Semua Berkas (Opsi A) */}
        <div className="bg-[#0F2238] text-white rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-300">Total Semua Berkas</p>
            <p className="text-3xl font-extrabold text-white mt-1">{countTotal}</p>
          </div>
          <p className="text-[10px] text-sky-300 font-semibold flex items-center mt-2">
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-sky-300" />
            PKS Induk & Adendum Terdaftar
          </p>
        </div>
      </div>

      {/* 3. Section Filter Data */}
      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* SEARCH */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">CARI NOMOR / INSTANSI</label>
            <input
              type="text"
              placeholder="Cari nomor atau nama mitra..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            />
          </div>

          {/* JENIS DOKUMEN */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">JENIS DOKUMEN</label>
            <select
              value={jenisFilter}
              onChange={(e) => {
                setJenisFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="Semua Jenis">Semua Jenis</option>
              <option value="PKS">PKS</option>
              <option value="Adendum">Adendum</option>
            </select>
          </div>

          {/* BIDANG */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">BIDANG</label>
            <select
              value={bidangFilter}
              onChange={(e) => {
                setBidangFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="Semua Bidang">Semua Bidang</option>
              <option value="IW">IW</option>
              <option value="SW">SW</option>
              <option value="Pelayanan">Pelayanan</option>
            </select>
          </div>

          {/* STATUS PERSETUJUAN */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">STATUS PERSETUJUAN</label>
            <select
              value={statusPersetujuanFilter}
              onChange={(e) => {
                setStatusPersetujuanFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Menunggu Penyerahan">Menunggu Penyerahan</option>
              <option value="Pemeriksaan Pengelola">Pemeriksaan Pengelola</option>
              <option value="Disetujui Pengelola">Disetujui Pengelola</option>
              <option value="Pemeriksaan Kabag">Pemeriksaan Kabag</option>
              <option value="Disetujui Kabag">Disetujui Kabag</option>
              <option value="Pemeriksaan Pimpinan">Pemeriksaan Pimpinan</option>
              <option value="Disetujui">Disetujui</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilter}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl transition-all cursor-pointer h-[38px]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* 4. Tabel Persetujuan PKS & Adendum */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat berkas persetujuan...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak Ada Berkas Membutuhkan Persetujuan</p>
            <p className="text-xs text-slate-400">Seluruh permohonan persetujuan telah diproses atau tidak ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-blue-50/60 border-b border-slate-100 text-slate-700 font-extrabold text-[11px]">
                <tr>
                  <th className="px-5 py-4">Tipe & Nomor</th>
                  <th className="px-4 py-4">Bidang</th>
                  <th className="px-5 py-4">Perusahaan / Instansi</th>
                  <th className="px-4 py-4">Petugas Pembuat</th>
                  <th className="px-4 py-4">Tgl Pengajuan</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-5 py-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((item) => {
                  const status = item.statusPersetujuan || '';

                  // Action Rights per Role
                  const canAcceptPengelola = isPengelolaOrAdmin && status === 'Menunggu Penyerahan';
                  const canDecidePengelola = isPengelolaOrAdmin && status === 'Pemeriksaan Pengelola';

                  const canAcceptKabag = isKabag && status === 'Disetujui Pengelola';
                  const canDecideKabag = isKabag && status === 'Pemeriksaan Kabag';

                  const canAcceptPimpinan = isPimpinan && status === 'Disetujui Kabag';
                  const canDecidePimpinan = isPimpinan && status === 'Pemeriksaan Pimpinan';

                  const canEditRevisi = isPetugas && status.includes('Revisi');
                  const canTandaiSiap = isPetugas && ['draft', 'draf'].includes(status.toLowerCase());

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Tipe & Nomor Dokumen */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider ${
                            item.tipe === 'Adendum'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}>
                            {item.tipe}
                          </span>
                          <span className="font-extrabold text-slate-900 text-xs">{item.nomorDokumen}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{item.jenisTag}</p>
                      </td>

                      {/* Bidang Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                          item.bidang === 'IW'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : item.bidang === 'SW'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {item.bidang}
                        </span>
                      </td>

                      {/* Perusahaan / Instansi */}
                      <td className="px-5 py-4 font-bold text-slate-800 max-w-xs truncate">
                        {item.perusahaan}
                      </td>

                      {/* Petugas JR */}
                      <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                        {item.petugas}
                      </td>

                      {/* Tgl Pengajuan */}
                      <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                        {item.tglPengajuan}
                      </td>

                      {/* Status Persetujuan + Catatan Revisi */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            status.includes('Disetujui') || status === 'Aktif' || status === 'Selesai'
                              ? 'bg-emerald-500'
                              : status.includes('Revisi')
                              ? 'bg-rose-500'
                              : status.includes('Pengelola')
                              ? 'bg-amber-500'
                              : 'bg-blue-600'
                          }`} />
                          <span className={`text-xs font-bold ${
                            status.includes('Disetujui') || status === 'Aktif' || status === 'Selesai'
                              ? 'text-emerald-700'
                              : status.includes('Revisi')
                              ? 'text-rose-700'
                              : status.includes('Pengelola')
                              ? 'text-amber-700'
                              : 'text-blue-700'
                          }`}>
                            {status}
                          </span>
                        </div>

                        {item.catatanRevisi && (
                          <p className="text-[10px] text-rose-600 mt-1 italic max-w-xs truncate font-mono">
                            "{item.catatanRevisi}"
                          </p>
                        )}
                      </td>

                      {/* Aksi Cepat / Tombol Langsung di Tabel */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          {/* 1. Pengelola/Admin - Sudah Diterima */}
                          {canAcceptPengelola && (
                            <button
                              type="button"
                              onClick={() => {
                                showDialog('confirm', 'Terima Berkas Fisik', `Konfirmasi penerimaan dokumen fisik ${item.tipe} dari Petugas?`, () => {
                                  handleQuickAction(item, 'Sudah Diterima');
                                });
                              }}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center shadow-2xs"
                            >
                              <CheckSquare className="w-3.5 h-3.5 mr-1 text-blue-600" />
                              Sudah Diterima
                            </button>
                          )}

                          {/* 2. Pengelola/Admin - Setuju / Revisi */}
                          {canDecidePengelola && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  showDialog('confirm', `Setujui ${item.tipe}`, `Setujui draf ${item.tipe} ini pada tahap Pengelola?`, () => {
                                    handleQuickAction(item, 'Disetujui Pengelola');
                                  });
                                }}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> Setujui
                              </button>
                              <button
                                type="button"
                                onClick={() => triggerRevisiPrompt(item)}
                                className="px-2.5 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center shadow-2xs"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Revisi
                              </button>
                            </>
                          )}

                          {/* 3. Kabag - Sudah Diterima */}
                          {canAcceptKabag && (
                            <button
                              type="button"
                              onClick={() => {
                                showDialog('confirm', 'Terima Berkas Fisik', `Konfirmasi serah terima dokumen fisik ${item.tipe} ke tahap Kabag?`, () => {
                                  handleQuickAction(item, 'Sudah Diterima');
                                });
                              }}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center shadow-2xs"
                            >
                              <CheckSquare className="w-3.5 h-3.5 mr-1 text-blue-600" />
                              Sudah Diterima
                            </button>
                          )}

                          {/* 4. Kabag - Setuju / Revisi */}
                          {canDecideKabag && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  showDialog('confirm', `Setujui ${item.tipe}`, `Setujui draf ${item.tipe} ini pada tahap Kabag?`, () => {
                                    handleQuickAction(item, 'Disetujui Kabag');
                                  });
                                }}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> Setujui
                              </button>
                              <button
                                type="button"
                                onClick={() => triggerRevisiPrompt(item)}
                                className="px-2.5 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center shadow-2xs"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Revisi
                              </button>
                            </>
                          )}

                          {/* 5. Pimpinan - Sudah Diterima */}
                          {canAcceptPimpinan && (
                            <button
                              type="button"
                              onClick={() => {
                                showDialog('confirm', 'Terima Berkas Fisik', `Konfirmasi serah terima dokumen fisik ${item.tipe} ke meja Pimpinan?`, () => {
                                  handleQuickAction(item, 'Sudah Diterima');
                                });
                              }}
                              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center shadow-2xs"
                            >
                              <CheckSquare className="w-3.5 h-3.5 mr-1 text-blue-600" />
                              Sudah Diterima
                            </button>
                          )}

                          {/* 6. Pimpinan - Draf Disetujui / Revisi */}
                          {canDecidePimpinan && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  showDialog('confirm', `Selesai Persetujuan ${item.tipe}`, `Tandai berkas ${item.tipe} ini sebagai Draf Disetujui?`, () => {
                                    handleQuickAction(item, item.tipe === 'Adendum' ? 'Draf Adendum Disetujui' : 'Draf PKS Disetujui');
                                  });
                                }}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center shadow-2xs"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" /> Draf Disetujui
                              </button>
                              <button
                                type="button"
                                onClick={() => triggerRevisiPrompt(item)}
                                className="px-2.5 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center shadow-2xs"
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" /> Revisi
                              </button>
                            </>
                          )}

                          {/* 7. Petugas JR - Perbaiki Revisi (Buka Modal Detail untuk melihat catatan, ubah data, dan tandai siap diserahkan) */}
                          {canEditRevisi && (
                            <button
                              type="button"
                              onClick={() => {
                                if (item.tipe === 'PKS') {
                                  setSelectedPksItem(item.raw);
                                } else {
                                  setSelectedAdendumItem(item.raw);
                                }
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center shadow-2xs"
                            >
                              <Edit3 className="w-3.5 h-3.5 mr-1" /> Perbaiki Revisi
                            </button>
                          )}

                          {/* 8. Petugas JR - Tandai Siap Diserahkan */}
                          {canTandaiSiap && (
                            <button
                              type="button"
                              onClick={() => {
                                showDialog('confirm', 'Tandai Siap', `Tandai dokumen fisik ${item.tipe} sudah siap diserahkan ke Pengelola?`, () => {
                                  handleQuickAction(item, 'Tandai Siap Diserahkan');
                                });
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center shadow-2xs"
                            >
                              <Send className="w-3.5 h-3.5 mr-1" /> Siap Diserahkan
                            </button>
                          )}

                          {/* 9. Tombol Ikon Mata / Detail (Selalu Ada) */}
                          <button
                            type="button"
                            title={`Lihat Detail ${item.tipe}`}
                            onClick={() => {
                              if (item.tipe === 'PKS') {
                                setSelectedPksItem(item.raw);
                              } else {
                                setSelectedAdendumItem(item.raw);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>
            Menampilkan <span className="font-bold text-slate-800">1 - {filteredData.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{filteredData.length}</span> berkas persetujuan
          </p>

          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-bold cursor-pointer ${
                  currentPage === i + 1 ? 'bg-[#00529C] text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail PKS (Modal Lama yang Lengkap) */}
      {selectedPksItem && (
        <ModalDetailPks
          isOpen={!!selectedPksItem}
          pksId={selectedPksItem.pksId || selectedPksItem.id}
          onClose={() => setSelectedPksItem(null)}
          onEditClick={(pks) => {
            setSelectedPksItem(null);
            setEditingPksId(pks.pksId || pks.id || selectedPksItem.pksId);
          }}
          onSuccess={() => {
            fetchApprovalData();
            setSelectedPksItem(null);
          }}
        />
      )}

      {/* Modal Detail Adendum */}
      {selectedAdendumItem && (
        <ModalDetailAdendum
          isOpen={!!selectedAdendumItem}
          adendumData={selectedAdendumItem}
          onClose={() => setSelectedAdendumItem(null)}
          onEditClick={(adData) => {
            setSelectedAdendumItem(null);
            setEditingAdendum(adData);
          }}
          onSuccess={() => {
            fetchApprovalData();
            setSelectedAdendumItem(null);
          }}
        />
      )}

      {/* Modal Ubah PKS (untuk Petugas saat perbaiki revisi) */}
      {editingPksId && (
        <ModalUbahPks
          isOpen={!!editingPksId}
          pksId={editingPksId}
          onClose={() => setEditingPksId(null)}
          onSuccess={() => {
            setEditingPksId(null);
            fetchApprovalData();
          }}
        />
      )}

      {/* Modal Ubah Adendum (untuk Petugas saat perbaiki revisi) */}
      {editingAdendum && (
        <ModalUbahAdendum
          isOpen={!!editingAdendum}
          adendumId={editingAdendum?.adendumId || editingAdendum?.id}
          adendumData={editingAdendum}
          pksData={editingAdendum?.pksDocument}
          onClose={() => setEditingAdendum(null)}
          onSuccess={() => {
            setEditingAdendum(null);
            fetchApprovalData();
          }}
        />
      )}

      {/* Custom Confirmation / Prompt Dialog */}
      <CustomDialog
        isOpen={dialogState.isOpen}
        type={dialogState.type}
        title={dialogState.title}
        message={dialogState.message}
        onClose={() => setDialogState(prev => ({ ...prev, isOpen: false }))}
        onCancel={() => setDialogState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={(val) => {
          if (dialogState.onConfirm) dialogState.onConfirm(val);
          setDialogState(prev => ({ ...prev, isOpen: false }));
        }}
        promptValue={promptValue}
        setPromptValue={setPromptValue}
      />
    </div>
  );
};

export default PersetujuanPksPage;
