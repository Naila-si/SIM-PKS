import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mitraService } from '../../services/mitraService';
import { useAuth } from '../../context/AuthContext';
import { DocumentUploadModal } from '../../components/DocumentUploadModal';
import { Building2, Plus, Search, Edit3, Phone, UserCheck, Power, FileText, CheckCircle2 } from 'lucide-react';

export const MitraListPage = () => {
  const { user } = useAuth();
  const [mitraList, setMitraList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [selectedMitraId, setSelectedMitraId] = useState(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

  const isPengelolaOrAdmin = ['pengelola_pks', 'admin_utama'].includes(user?.role);

  const fetchMitra = async () => {
    setLoading(true);
    try {
      const res = await mitraService.getMitraList({ search });
      if (res.success) setMitraList(res.data || []);
    } catch (err) {
      console.error('Error fetching mitra:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMitra();
  }, [search]);

  const handleToggleStatus = async (mitra) => {
    if (mitra.status === 'Aktif') {
      setSelectedMitraId(mitra.mitraId);
      setIsDeactivateModalOpen(true);
    } else {
      if (window.confirm(`Aktifkan kembali perusahaan mitra ${mitra.namaPerusahaan}?`)) {
        try {
          const res = await mitraService.updateStatus(mitra.mitraId, 'Aktif');
          if (res.success) fetchMitra();
        } catch (err) {
          alert(err.response?.data?.message || 'Gagal mengaktifkan kembali mitra.');
        }
      }
    }
  };

  const handleDeactivateSubmit = async (fileProof) => {
    const res = await mitraService.updateStatus(selectedMitraId, 'Tidak Aktif', fileProof);
    if (res.success) {
      fetchMitra();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Perusahaan & Instansi Mitra</h1>
          <p className="text-xs text-slate-500">Master data mitra Perjanjian Kerja Sama Jasa Raharja</p>
        </div>
        <Link
          to="/mitra/new"
          className="inline-flex items-center px-4 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl shadow-md shrink-0"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Tambah Mitra Baru
        </Link>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama perusahaan atau penanggung jawab..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00529C]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 p-8 text-center text-xs text-slate-500">Memuat data mitra...</div>
        ) : mitraList.length === 0 ? (
          <div className="col-span-3 p-12 text-center text-xs text-slate-400">Tidak ada perusahaan mitra ditemukan.</div>
        ) : (
          mitraList.map((m) => (
            <div key={m.mitraId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00529C] flex items-center justify-center font-bold shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${m.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-rose-50 text-rose-700 border-rose-300'}`}>
                    {m.status}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{m.namaPerusahaan}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{m.alamat || 'Alamat belum diisi'}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                  <p className="flex items-center">
                    <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                    {m.kontak || '-'}
                  </p>
                  <p className="flex items-center">
                    <UserCheck className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                    PJ: {m.penanggungJawab || '-'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/mitra/${m.mitraId}/edit`}
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  <Edit3 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Edit
                </Link>

                {isPengelolaOrAdmin && (
                  <button
                    onClick={() => handleToggleStatus(m)}
                    className={`inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                      m.status === 'Aktif'
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5 mr-1" />
                    {m.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Proof Document Upload Modal for Partner Deactivation */}
      <DocumentUploadModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onSubmit={handleDeactivateSubmit}
        title="Nonaktifkan Perusahaan Mitra"
        description="Unggah dokumen 'Surat Pernyataan Tidak Lanjut' (PDF/JPG/PNG maks. 10MB) sebagai bukti penonaktifan mitra."
        accept=".pdf,.jpg,.jpeg,.png"
        maxMB={10}
      />
    </div>
  );
};
