import React, { useState, useEffect } from 'react';
import { mitraService } from '../services/mitraService';
import { DrawerDetailPerusahaan } from './DrawerDetailPerusahaan';
import { ModalUbahPerusahaan } from './ModalUbahPerusahaan';
import { useAuth } from '../context/AuthContext';
import {
  Building2, CheckCircle2, AlertTriangle, XCircle, Search, RotateCcw,
  Download, RefreshCw, Eye, Edit3, MoreVertical, ChevronLeft, ChevronRight, FileText, Power
} from 'lucide-react';

export const ManajemenPerusahaanPage = () => {
  const { user } = useAuth();
  const role = user?.role || '';
  
  const canEdit = ['petugas_jr', 'petugas', 'pengelola_pks', 'pengelola', 'admin_utama', 'admin'].includes(role);
  const canToggleStatus = ['pengelola_pks', 'pengelola', 'admin_utama', 'admin'].includes(role);

  const [loading, setLoading] = useState(true);
  const [mitraList, setMitraList] = useState([]);
  
  // --- STATE UNTUK CUSTOM DIALOG ---
  const [dialog, setDialog] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null
  });

  const showDialog = (type, title, message, onConfirm = null) => {
    setDialog({ isOpen: true, type, title, message, onConfirm });
  };



  // Filter States
  const [statusMitraFilter, setStatusMitraFilter] = useState('Semua');
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
    setStatusMitraFilter('Semua');
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
      showDialog('info', 'Ekspor Data', 'Mengunduh data ekspor Excel...');
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

    if (statusMitraFilter !== 'Semua') {
      const status = item.status_mitra || item.statusMitra || item.status || 'Aktif';
      if (status !== statusMitraFilter) return false;
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

            <select
              value={statusMitraFilter}
              onChange={(e) => setStatusMitraFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>

            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center shadow-2xs transition-all cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Export Excel
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
                  <th className="px-4 py-3.5">Status Mitra</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((item) => {
                  const statusMitra = item.status_mitra || item.statusMitra || item.status || 'Aktif';

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

                      {/* Status Mitra Badge */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          statusMitra === 'Aktif'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : statusMitra === 'Segera Berakhir'
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            statusMitra === 'Aktif' ? 'bg-emerald-500' : statusMitra === 'Segera Berakhir' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                          {statusMitra}
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

                          {canEdit && (
                            <button
                              type="button"
                              title="Ubah Perusahaan"
                              onClick={() => setEditingMitra(item)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {canToggleStatus && (
                            <button
                              type="button"
                              title={statusMitra === 'Aktif' ? 'Nonaktifkan Mitra' : 'Aktifkan Mitra'}
                              onClick={() => {
                                const newStatus = statusMitra === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
                                showDialog(
                                  'confirm', 
                                  'Konfirmasi Perubahan Status', 
                                  `Yakin ingin mengubah status mitra ini menjadi ${newStatus}?`, 
                                  async () => {
                                    setDialog(prev => ({ ...prev, isOpen: false }));
                                    const res = await mitraService.updateMitra(item.perusahaanId || item.mitraId || item.id, { status_mitra: newStatus });
                                    if (res.success) {
                                      window.location.reload();
                                    } else {
                                      setTimeout(() => showDialog('error', 'Gagal', 'Gagal mengubah status mitra'), 300);
                                    }
                                  }
                                );
                              }}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                statusMitra === 'Aktif'
                                  ? 'hover:bg-rose-50 text-slate-500 hover:text-rose-600'
                                  : 'hover:bg-emerald-50 text-slate-500 hover:text-emerald-600'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>
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

      {/* --- KOMPONEN CUSTOM DIALOG --- */}
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDialog({ ...dialog, isOpen: false })}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                dialog.type === 'info' ? 'bg-blue-100 text-blue-600' :
                dialog.type === 'confirm' ? 'bg-amber-100 text-amber-600' :
                dialog.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                'bg-rose-100 text-rose-600'
              }`}>
                {dialog.type === 'info' && <CheckCircle2 className="w-8 h-8" />}
                {dialog.type === 'confirm' && <AlertTriangle className="w-8 h-8" />}
                {dialog.type === 'success' && <CheckCircle2 className="w-8 h-8" />}
                {dialog.type === 'error' && <XCircle className="w-8 h-8" />}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">{dialog.title}</h3>
              <p className="text-sm text-slate-500 mb-6">{dialog.message}</p>
              
              {dialog.type === 'confirm' ? (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setDialog({ ...dialog, isOpen: false })}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={dialog.onConfirm}
                    className="flex-1 px-4 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    Ya, Lanjutkan
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDialog({ ...dialog, isOpen: false })}
                  className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                >
                  Tutup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
