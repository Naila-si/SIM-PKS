import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pksService } from '../services/pksService';
import { mitraService } from '../services/mitraService';
import { StatusBadge } from '../components/StatusBadge';
import { ModalTambahPks } from './ModalTambahPks';
import { ModalUbahPks } from './ModalUbahPks';
import { ModalDetailPks } from './ModalDetailPks';
import { ModalHapusPks } from './ModalHapusPks';
import {
  Plus, Search, RotateCcw, MoreVertical, Eye, Edit3, Trash2,
  FileText, CheckCircle2, Clock, XCircle, Calendar, Filter, Download, Printer,
  ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';




export const ManajemenPksPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isPetugas = user?.role === 'petugas_jr';

  const [pksList, setPksList] = useState([]);
  const [mitraList, setMitraList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stats Summary State
  const [summary, setSummary] = useState({
    draft: 0,
    aktif: 0,
    segeraBerakhir: 0,
    berakhir: 0,
  });

  // Modal States
  const [editingPksId, setEditingPksId] = useState(null);
  const [viewingPksId, setViewingPksId] = useState(null);
  const [deletingPksData, setDeletingPksData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeActionId, setActiveActionId] = useState(null);

  // Filter States
  const [urutan, setUrutan] = useState('Terbaru');
  const [bidang, setBidang] = useState('Semua');
  const [statusDokumen, setStatusDokumen] = useState('Semua');
  const [statusPks, setStatusPks] = useState('Semua');
  const [persetujuan, setPersetujuan] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const pksRes = await pksService.getPksList({ per_page: 100 });
      if (pksRes.success && pksRes.data) {
        setPksList(pksRes.data);
        
        let draft = 0, aktif = 0, segeraBerakhir = 0, berakhir = 0;
        pksRes.data.forEach(item => {
           const st = (item.status_pks || item.statusPks || 'draft').toLowerCase();
           if (st === 'draft' || st === 'draf') draft++;
           else if (st === 'aktif') aktif++;
           else if (st === 'segera berakhir') segeraBerakhir++;
           else if (st === 'berakhir') berakhir++;
        });
        setSummary({ draft, aktif, segeraBerakhir, berakhir });
      } else {
        setPksList([]);
      }
    } catch (err) {
      console.error(err);
      setPksList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleResetFilter = () => {
    setUrutan('Terbaru');
    setBidang('Semua');
    setStatusDokumen('Semua');
    setStatusPks('Semua');
    setPersetujuan('Semua');
    setSearchQuery('');
  };

  const filteredData = pksList.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nomor = (item.nomorPKS || '').toLowerCase();
      const judul = (item.judulPKS || '').toLowerCase();
      const pihak = (item.pihakKedua || item.mitra?.namaPerusahaan || '').toLowerCase();
      if (!nomor.includes(q) && !judul.includes(q) && !pihak.includes(q)) return false;
    }

    if (bidang !== 'Semua' && item.bidang !== bidang) return false;
    
    const pksStat = item.status_pks || item.statusPks;
    if (statusPks !== 'Semua' && pksStat !== statusPks) return false;
    
    const persStat = item.status_persetujuan || item.statusPersetujuan;
    if (persetujuan !== 'Semua' && persStat !== persetujuan) return false;
    
    const hasDoc = item.statusDokumen === 'Sudah Diunggah' || !!item.url_dokumen_final || !!item.dokumen_final;
    if (statusDokumen === 'Sudah Diunggah' && !hasDoc) return false;
    if (statusDokumen === 'Belum Diunggah' && hasDoc) return false;

    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Page */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Manajemen PKS</h1>
          <p className="text-xs text-slate-500 mt-0.5">Kelola seluruh data Perjanjian Kerja Sama (PKS) Bidang Operasional</p>
        </div>

        {/* Tombol Buat Draf PKS Baru Khusus Petugas JR */}
        {isPetugas && (
          <button
            type="button"
            onClick={() => navigate('/pks/buat')}
            className="px-5 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-xs flex items-center transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Buat Draf PKS Baru
          </button>
        )}
      </div>

      {/* 2. Top 4 Stat Cards (Image 2 Mockup) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* PKS Draft */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-l-[#00529C] border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">PKS Draft</p>
            <p className="text-3xl font-extrabold text-[#00529C] mt-1">{summary.draft}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#00529C] flex items-center justify-center font-bold">
            <Edit3 className="w-5 h-5" />
          </div>
        </div>

        {/* PKS Aktif */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-l-emerald-500 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">PKS Aktif</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{summary.aktif}</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Segera Berakhir */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-l-amber-500 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Segera Berakhir</p>
            <p className="text-3xl font-extrabold text-amber-500 mt-1">{summary.segeraBerakhir}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* PKS Berakhir */}
        <div className="bg-white rounded-2xl p-5 border-l-4 border-l-rose-500 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">PKS Berakhir</p>
            <p className="text-3xl font-extrabold text-rose-600 mt-1">{summary.berakhir}</p>
          </div>
          <div className="w-11 h-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-200">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Section Filter Data PKS (Image 2 Mockup) */}
      <div className="bg-blue-50/40 rounded-2xl p-4 border border-blue-100 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#00529C]">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter Data PKS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Urutan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Urutan</label>
            <select
              value={urutan}
              onChange={(e) => setUrutan(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="Terbaru">Terbaru</option>
              <option value="Terlama">Terlama</option>
            </select>
          </div>

          {/* Bidang */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Bidang</label>
            <select
              value={bidang}
              onChange={(e) => setBidang(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="Semua">Semua Bidang</option>
              <option value="Pelayanan">Pelayanan</option>
              <option value="SW">SW</option>
              <option value="IW">IW</option>
            </select>
          </div>

          {/* Status Dokumen */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status Dokumen</label>
            <select
              value={statusDokumen}
              onChange={(e) => setStatusDokumen(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="Sudah Diunggah">Sudah Diunggah</option>
              <option value="Belum Diunggah">Belum Diunggah</option>
            </select>
          </div>

          {/* Status PKS */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status PKS</label>
            <select
              value={statusPks}
              onChange={(e) => setStatusPks(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="Draft">Draft</option>
              <option value="Aktif">Aktif</option>
              <option value="Segera Berakhir">Segera Berakhir</option>
              <option value="Berakhir">Berakhir</option>
            </select>
          </div>

          {/* Persetujuan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Persetujuan</label>
            <select
              value={persetujuan}
              onChange={(e) => setPersetujuan(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="Semua">Semua</option>
              <option value="Draft">Draft</option>
              <option value="Menunggu Penyerahan">Menunggu Penyerahan</option>
              <option value="Pemeriksaan Pengelola">Pemeriksaan Pengelola</option>
              <option value="Disetujui Pengelola">Disetujui Pengelola</option>
              <option value="Revisi Pengelola">Revisi Pengelola</option>
              <option value="Pemeriksaan Kabag">Pemeriksaan Kabag</option>
              <option value="Disetujui Kabag">Disetujui Kabag</option>
              <option value="Revisi Kabag">Revisi Kabag</option>
              <option value="Pemeriksaan Pimpinan">Pemeriksaan Pimpinan</option>
              <option value="Disetujui Pimpinan">Disetujui Pimpinan</option>
              <option value="Revisi Pimpinan">Revisi Pimpinan</option>
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

      {/* 4. Tabel Daftar Seluruh PKS (Image 2 Mockup) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Bar Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900">Daftar Seluruh PKS</h2>

          <div className="flex items-center space-x-2">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer" title="Download">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 cursor-pointer" title="Print">
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat data PKS...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Belum Ada Data PKS</p>
            <p className="text-xs text-slate-400">Silakan ubah kriteria filter Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-blue-50/50 border-b border-slate-100 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">NOMOR PKS</th>
                  <th className="px-6 py-4">JUDUL PKS</th>
                  <th className="px-4 py-4">BIDANG</th>
                  <th className="px-6 py-4">PIHAK KEDUA</th>
                  <th className="px-4 py-4">TGL MULAI/AKHIR</th>
                  <th className="px-4 py-4">STATUS</th>
                  <th className="px-4 py-4">PERSETUJUAN</th>
                  <th className="px-4 py-4">DOKUMEN</th>
                  <th className="px-4 py-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((item) => {
                  const hasDokumen = item.statusDokumen === 'Sudah Diunggah';

                  return (
                    <tr key={item.pksId} className="hover:bg-slate-50/70 transition-colors">
                      {/* NOMOR PKS */}
                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {item.nomor_pks || '-'}
                      </td>

                      {/* JUDUL / RINGKASAN PKS */}
                      <td className="px-6 py-4 font-extrabold text-slate-900 max-w-xs leading-snug">
                        {item.ringkasan_pks || item.judulPKS || '-'}
                      </td>

                      {/* BIDANG Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                          item.bidang === 'IW'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : item.bidang === 'SW'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}>
                          {item.bidang}
                        </span>
                      </td>

                      {/* PIHAK KEDUA */}
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {item.mitra?.nama_mitra || item.mitra?.namaPerusahaan || '-'}
                      </td>

                      {/* TGL MULAI/AKHIR */}
                      <td className="px-4 py-4 whitespace-nowrap text-[11px]">
                        <p className="font-bold text-slate-800">{item.tanggal_mulai || item.tglMulai || '-'}</p>
                        <p className="text-slate-400 text-[10px] font-medium">{item.tanggal_berakhir || item.tglAkhir || '-'}</p>
                      </td>

                      {/* STATUS Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          (item.status_pks || item.statusPks) === 'Aktif'
                            ? 'bg-emerald-100 text-emerald-700'
                            : ((item.status_pks || item.statusPks) === 'Draft' || (item.status_pks || item.statusPks) === 'Draf')
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            (item.status_pks || item.statusPks) === 'Aktif'
                              ? 'bg-emerald-500'
                              : ((item.status_pks || item.statusPks) === 'Draft' || (item.status_pks || item.statusPks) === 'Draf')
                              ? 'bg-emerald-500'
                              : 'bg-rose-500'
                          }`} />
                          {item.status_pks || item.statusPks || 'Draf'}
                        </span>
                      </td>

                      {/* PERSETUJUAN Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          (item.status_persetujuan || item.statusPersetujuan) === 'Disetujui'
                            ? 'bg-emerald-100 text-emerald-700'
                            : (item.status_persetujuan || item.statusPersetujuan || '').includes('Kabag')
                            ? 'bg-purple-100 text-purple-700'
                            : ((item.status_persetujuan || item.statusPersetujuan || '') === 'Menunggu Penyerahan')
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            (item.status_persetujuan || item.statusPersetujuan) === 'Disetujui'
                              ? 'bg-emerald-500'
                              : (item.status_persetujuan || item.statusPersetujuan || '').includes('Kabag')
                              ? 'bg-purple-500'
                              : ((item.status_persetujuan || item.statusPersetujuan || '') === 'Menunggu Penyerahan')
                              ? 'bg-blue-500'
                              : 'bg-emerald-500'
                          }`} />
                          {item.status_persetujuan || item.statusPersetujuan || 'Draf'}
                        </span>
                      </td>

                      {/* DOKUMEN Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {hasDokumen ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                            Sudah Diunggah
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                            Belum Diunggah
                          </span>
                        )}
                      </td>

                      {/* AKSI Three Dots Menu */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setActiveActionId(activeActionId === item.pksId ? null : item.pksId)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeActionId === item.pksId && (
                            <div
                              className="origin-top-right absolute right-0 top-8 w-36 rounded-xl shadow-lg bg-white border border-slate-200 ring-1 ring-black/5 z-30 py-1 text-left"
                              onMouseLeave={() => setActiveActionId(null)}
                            >
                              <button
                                onClick={() => {
                                  setActiveActionId(null);
                                  setViewingPksId(item.pksId);
                                }}
                                className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                              >
                                Detail
                              </button>

                              {/* LOGIKA RBAC EDIT */}
                              {(() => {
                                const creatorId = item.pengguna?.penggunaId || item.penggunaId;
                                const isCreator = user?.penggunaId === creatorId;
                                const statusPers = (item.status_persetujuan || item.statusPersetujuan || 'Draf').toLowerCase();
                                const isDraft = ['draft', 'draf'].includes(statusPers);
                                const isMenunggu = statusPers === 'menunggu penyerahan';
                                
                                const role = user?.role;
                                const isPetugas = ['petugas', 'petugas_jr'].includes(role);
                                const isPengelolaOrAdmin = ['pengelola_pks', 'admin_utama', 'admin', 'pengelola'].includes(role);
                                
                                // Petugas hanya bisa edit draf miliknya
                                // Pengelola/Admin bisa edit kecuali saat statusnya "Menunggu Penyerahan" atau "Draft"
                                const canEdit = (isPetugas && isCreator && isDraft) || (isPengelolaOrAdmin && !isMenunggu && !isDraft);

                                if (!canEdit) return null;
                                return (
                                  <button
                                    onClick={() => {
                                      setActiveActionId(null);
                                      setEditingPksId(item.pksId);
                                    }}
                                    className="flex items-center w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                );
                              })()}
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
            Menampilkan <span className="font-bold text-slate-800">1 - {Math.min(10, filteredData.length)}</span> dari{' '}
            <span className="font-bold text-slate-800">{filteredData.length}</span> data
          </p>

          <div className="flex items-center space-x-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button className="w-7 h-7 rounded-lg text-xs font-bold bg-[#00529C] text-white">1</button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <ModalTambahPks
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}

      {editingPksId && (
        <ModalUbahPks
          isOpen={!!editingPksId}
          pksId={editingPksId}
          onClose={() => setEditingPksId(null)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}

      {viewingPksId && (
        <ModalDetailPks
          isOpen={!!viewingPksId}
          pksId={viewingPksId}
          onClose={() => setViewingPksId(null)}
        />
      )}

      {deletingPksData && (
        <ModalHapusPks
          isOpen={!!deletingPksData}
          pksData={deletingPksData}
          onClose={() => setDeletingPksData(null)}
          onSuccess={() => {
            fetchData();
          }}
        />
      )}
    </div>
  );
};

