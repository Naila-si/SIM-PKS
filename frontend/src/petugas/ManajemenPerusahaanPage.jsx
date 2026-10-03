import React, { useState, useEffect } from 'react';
import { mitraService } from '../services/mitraService';
import { DrawerDetailPerusahaan } from './DrawerDetailPerusahaan';
import { ModalUbahPerusahaan } from './ModalUbahPerusahaan';
import {
  Building2, CheckCircle2, AlertTriangle, XCircle, Search, RotateCcw,
  Download, RefreshCw, Eye, Edit3, MoreVertical, ChevronLeft, ChevronRight, FileText
} from 'lucide-react';

export const ManajemenPerusahaanPage = () => {
  const [loading, setLoading] = useState(true);
  const [mitraList, setMitraList] = useState([]);
  
  const [summary, setSummary] = useState({
    total: 0,
    aktif: 0,
    segeraBerakhir: 0,
    berakhir: 0,
  });

  // Filter States
  const [statusPksFilter, setStatusPksFilter] = useState('Semua');
  const [jenisMitraFilter, setJenisMitraFilter] = useState('Semua');
  const [bidangFilter, setBidangFilter] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Active Dropdown & Modal States
  const [activeActionId, setActiveActionId] = useState(null);
  const [viewingMitra, setViewingMitra] = useState(null);
  const [editingMitra, setEditingMitra] = useState(null);


  const fetchMitraData = async () => {
    setLoading(true);
    try {
      const res = await mitraService.getMitraList({ per_page: 100 });
      if (res.success && res.data) {
        const rawData = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        if (rawData.length > 0) {
          setMitraList(rawData);
          setSummary({
            total: rawData.length,
            aktif: rawData.filter(m => (m.statusPks || m.status) === 'Aktif').length,
            segeraBerakhir: rawData.filter(m => (m.statusPks || m.status) === 'Segera Berakhir').length,
            berakhir: rawData.filter(m => (m.statusPks || m.status) === 'Berakhir').length,
          });
        } else {
          setMitraList([]);
        }
      } else {
        setMitraList([]);
      }
    } catch (err) {
      setMitraList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMitraData();
  }, []);

  const handleResetFilter = () => {
    setStatusPksFilter('Semua');
    setJenisMitraFilter('Semua');
    setBidangFilter('Semua');
    setSearchQuery('');
  };

  const handleExportExcel = async () => {
    try {
      const res = await mitraService.exportMitra({});
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Daftar_Mitra_Perusahaan_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Mengunduh data ekspor Excel...');
    }
  };

  // Logika Filtering
  const filteredData = mitraList.filter((item) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const nama = (item.namaPerusahaan || item.nama || '').toLowerCase();
      const idStr = (item.mitraId || '').toLowerCase();
      const pj = (item.penanggungJawab || '').toLowerCase();
      if (!nama.includes(query) && !idStr.includes(query) && !pj.includes(query)) return false;
    }

    if (statusPksFilter !== 'Semua') {
      const status = item.statusPks || item.status || 'Aktif';
      if (status !== statusPksFilter) return false;
    }

    if (jenisMitraFilter !== 'Semua') {
      if (item.jenisMitra !== jenisMitraFilter) return false;
    }

    if (bidangFilter !== 'Semua') {
      if (item.bidang !== bidangFilter) return false;
    }

    return true;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Halaman */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen Perusahaan</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola data perusahaan, instansi, dan mitra yang menjadi pihak kedua dalam Perjanjian Kerja Sama (PKS).
        </p>
      </div>

      {/* 2. Ringkasan 4 Kartu Statistik (Matching Gambar 1 Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Perusahaan Mitra */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Perusahaan Mitra</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{summary.total}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Seluruh mitra terdaftar</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Memiliki PKS Aktif */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Memiliki PKS Aktif</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{summary.aktif}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Sesuai masa berlaku</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: PKS Segera Berakhir */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PKS Segera Berakhir</p>
            <p className="text-2xl font-extrabold text-amber-500 mt-0.5">{summary.segeraBerakhir}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">H-30 masa berakhir</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: PKS Berakhir */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PKS Berakhir</p>
            <p className="text-2xl font-extrabold text-rose-600 mt-0.5">{summary.berakhir}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Kontrak telah habis</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. Section Filter Data Perusahaan */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Dropdown 1: Status PKS */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status PKS</label>
            <select
              value={statusPksFilter}
              onChange={(e) => setStatusPksFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="Semua">Semua</option>
              <option value="Aktif">Aktif</option>
              <option value="Segera Berakhir">Segera Berakhir</option>
              <option value="Berakhir">Berakhir</option>
            </select>
          </div>

          {/* Dropdown 2: Jenis Mitra */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Jenis Mitra</label>
            <select
              value={jenisMitraFilter}
              onChange={(e) => setJenisMitraFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="Semua">Semua</option>
              <option value="Perusahaan Angkutan Umum">Perusahaan Angkutan Umum (PO)</option>
              <option value="Instansi Pemerintah">Instansi Pemerintah</option>
              <option value="Rumah Sakit">Rumah Sakit</option>
              <option value="BUMN / Korporasi">BUMN / Korporasi</option>
            </select>
          </div>

          {/* Dropdown 3: Bidang */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Bidang</label>
            <select
              value={bidangFilter}
              onChange={(e) => setBidangFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="Semua">Semua</option>
              <option value="IW">IW (Iuran Wajib)</option>
              <option value="SW">SW (Sumbangan Wajib)</option>
              <option value="PELAYANAN">Pelayanan</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilter}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer h-[38px]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Filter
            </button>
          </div>

        </div>
      </div>

      {/* 4. Tabel Daftar Perusahaan Mitra */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Table Bar Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-extrabold text-slate-900">Daftar Perusahaan Mitra</h2>
            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {filteredData.length} Total
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-48 sm:w-64 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari perusahaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>

            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center shadow-2xs transition-all cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Export Excel
            </button>

            <button
              onClick={fetchMitraData}
              className="p-2 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl shadow-2xs transition-all cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Memuat data perusahaan...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center space-y-2 py-16">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Tidak Ada Data Perusahaan Mitra</p>
            <p className="text-xs text-slate-400">Silakan atur ulang kriteria pencarian atau filter Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Nama Perusahaan / Instansi</th>
                  <th className="px-4 py-3.5">Penanggung Jawab</th>
                  <th className="px-4 py-3.5">Kontak</th>
                  <th className="px-4 py-3.5">Status PKS</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((item) => {
                  const statusPks = item.statusPks || item.status_mitra || item.status || 'Aktif';

                  return (
                    <tr key={item.perusahaanId || item.mitraId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Nama Perusahaan / Instansi + ID */}
                      <td className="px-5 py-4">
                        <p className="font-extrabold text-slate-900 text-xs">{item.namaPerusahaan || item.nama_mitra || item.nama}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          ID: {item.mitraId || `MITRA-${item.mitraId}`}
                        </p>
                      </td>



                      {/* Penanggung Jawab */}
                      <td className="px-4 py-4 font-semibold text-slate-800">
                        {item.penanggungJawab || item.nama_pengelola || '-'}
                      </td>

                      {/* Kontak */}
                      <td className="px-4 py-4 text-[11px] leading-tight">
                        <p className="font-semibold text-slate-700">{item.kontak || item.no_hp_pengelola || item.telepon || '-'}</p>
                        <p className="text-slate-400 font-medium">{item.email || item.email_pengelola || '-'}</p>
                      </td>

                      {/* Status PKS Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          statusPks === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : statusPks === 'Segera Berakhir'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            statusPks === 'Aktif' ? 'bg-emerald-500' : statusPks === 'Segera Berakhir' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {statusPks}
                        </span>
                      </td>

                      {/* Aksi Icons */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-1 relative">
                          <button
                            type="button"
                            title="Detail Perusahaan"
                            onClick={() => setViewingMitra(item)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            title="Ubah Perusahaan"
                            onClick={() => setEditingMitra(item)}
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveActionId(activeActionId === item.perusahaanId ? null : item.perusahaanId)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Popover Menu */}
                          {activeActionId === item.perusahaanId && (
                            <div
                              className="origin-top-right absolute right-0 top-8 w-36 rounded-xl shadow-lg bg-white border border-slate-200 ring-1 ring-black/5 z-30 py-1 text-left"
                              onMouseLeave={() => setActiveActionId(null)}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveActionId(null);
                                  setViewingMitra(item);
                                }}
                                className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5 mr-2 text-blue-600" />
                                Detail
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveActionId(null);
                                  setEditingMitra(item);
                                }}
                                className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 mr-2 text-amber-600" />
                                Edit
                              </button>
                            </div>
                          )}
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
            Menampilkan <span className="font-bold text-slate-800">1-{Math.min(itemsPerPage, filteredData.length)}</span> dari{' '}
            <span className="font-bold text-slate-800">{filteredData.length}</span> mitra
          </p>

          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === i + 1
                    ? 'bg-[#00529C] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
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
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Slide-over Drawer Detail Perusahaan (Right Side, Gambar 3) */}
      {viewingMitra && (
        <DrawerDetailPerusahaan
          isOpen={!!viewingMitra}
          mitraData={viewingMitra}
          onClose={() => setViewingMitra(null)}
          onEditClick={(data) => setEditingMitra(data)}
        />
      )}

      {/* Modal Ubah Perusahaan (Gambar 4) */}
      {editingMitra && (
        <ModalUbahPerusahaan
          isOpen={!!editingMitra}
          mitraData={editingMitra}
          onClose={() => setEditingMitra(null)}
          onSuccess={(updatedMitra) => {
            setMitraList((prev) =>
              prev.map((m) =>
                (m.perusahaanId === updatedMitra.perusahaanId || m.mitraId === updatedMitra.mitraId)
                  ? { ...m, ...updatedMitra }
                  : m
              )
            );
          }}
        />
      )}

    </div>
  );
};
