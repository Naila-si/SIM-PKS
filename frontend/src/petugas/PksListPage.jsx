import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pksService } from '../services/pksService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, Search, FileText, Eye, Edit3, Trash2, Calendar, Building2, Download, Layers } from 'lucide-react';

export const PksListPage = () => {
  const { user } = useAuth();
  const [pksList, setPksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.statusPersetujuan = statusFilter;

      const res = await pksService.getPksList(params);
      if (res.success) {
        setPksList(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching PKS list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPks();
  }, [search, statusFilter]);

  const handleDelete = async (id, nomor) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus draft PKS ${nomor || ''}?`)) {
      try {
        const res = await pksService.deletePks(id);
        if (res.success) {
          fetchPks();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus draft PKS.');
      }
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.statusPersetujuan = statusFilter;

      const res = await pksService.exportPks(params);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Daftar_PKS_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunduh ekspor data PKS.');
    } finally {
      setIsExporting(false);
    }
  };

  const canCreate = ['petugas_jr', 'admin_utama'].includes(user?.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daftar Perjanjian Kerja Sama (PKS)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.role === 'pimpinan'
              ? 'Pantau & periksa persetujuan digital PKS lintas bidang yang telah mencapai tahap Pimpinan'
              : user?.role === 'kabag'
              ? 'Pantau & periksa seluruh PKS lintas bidang yang telah mencapai tahap Kabag'
              : 'Kelola seluruh draft & pengajuan PKS dalam sistem'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 mr-1.5 text-emerald-600" />
            {isExporting ? 'Mengunduh...' : 'Ekspor Excel/CSV'}
          </button>
          {canCreate && (
            <Link
              to="/pks/buat"
              className="inline-flex items-center px-4 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl transition-all shadow-md shrink-0"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Buat Draft PKS Baru
            </Link>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nomor PKS, nama mitra, atau ruang lingkup..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00529C]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-56 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#00529C]"
        >
          <option value="">Semua Status Persetujuan</option>
          <option value="Draft">Draft</option>
          <option value="Menunggu Penyerahan">Menunggu Penyerahan</option>
          <option value="Pemeriksaan Pengelola">Pemeriksaan Pengelola</option>
          <option value="Revisi Pengelola">Revisi Pengelola</option>
          <option value="Pemeriksaan Kabag">Pemeriksaan Kabag</option>
          <option value="Revisi Kabag">Revisi Kabag</option>
          <option value="Pemeriksaan Pimpinan">Pemeriksaan Pimpinan</option>
          <option value="Revisi Pimpinan">Revisi Pimpinan</option>
          <option value="Disetujui">Disetujui (Final)</option>
        </select>
      </div>

      {/* PKS Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Memuat daftar PKS...</div>
        ) : pksList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada PKS ditemukan</p>
            <p className="text-xs text-slate-400">Tidak ada data PKS yang sesuai kriteria pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="px-4 py-3">Nomor PKS</th>
                  <th className="px-4 py-3">Perusahaan Mitra</th>
                  <th className="px-4 py-3">Bidang</th>
                  <th className="px-4 py-3">Ruang Lingkup</th>
                  <th className="px-4 py-3">Status Persetujuan</th>
                  <th className="px-4 py-3">Masa Berlaku</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pksList.map((pks) => (
                  <tr key={pks.pksId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-[#00529C]">
                      {pks.nomorPKS || 'Draft (Auto)'}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center">
                        <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                        <span>{pks.mitra?.namaPerusahaan || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-600">
                      <div className="flex items-center">
                        <Layers className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                        <span>{pks.bidang}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={pks.ruangLingkup}>
                      {pks.ruangLingkup}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={pks.statusPersetujuan} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        <span>
                          {pks.tanggalMulai ? new Date(pks.tanggalMulai).toLocaleDateString('id-ID') : '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        <Link
                          to={`/pks/${pks.pksId}`}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#00529C]"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {user?.role === 'petugas_jr' && ['Draft', 'Revisi Pengelola', 'Revisi Kabag', 'Revisi Pimpinan'].includes(pks.statusPersetujuan) && (
                          <Link
                            to={`/pks/${pks.pksId}/edit`}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-amber-600"
                            title="Edit Data"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                        )}
                        {user?.role === 'petugas_jr' && pks.statusPersetujuan === 'Draft' && (
                          <button
                            onClick={() => handleDelete(pks.pksId, pks.nomorPKS)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            title="Hapus Draft"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
