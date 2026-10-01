import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adendumService } from '../services/adendumService';
import { pksService } from '../services/pksService';
import { StatusBadge } from '../components/StatusBadge';
import { ArrowLeft, Plus, Download, Check, FileText } from 'lucide-react';

export const AdendumListPage = () => {
  const { id } = useParams(); // pksId
  const [pks, setPks] = useState(null);
  const [adendumList, setAdendumList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdendum = async () => {
    setLoading(true);
    try {
      const [pksRes, adendumRes] = await Promise.all([
        pksService.getPksById(id),
        adendumService.getAdendumListByPks(id),
      ]);

      if (pksRes.success) setPks(pksRes.data);
      if (adendumRes.success) setAdendumList(adendumRes.data || []);
    } catch (err) {
      console.error('Error loading adendum list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdendum();
  }, [id]);

  const handleDownloadDraft = async (adendumId, nomor) => {
    try {
      const res = await adendumService.downloadDraft(adendumId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${nomor ? nomor.replace(/\//g, '_') : 'Draft_Adendum'}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      fetchAdendum();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunduh draft adendum.');
    }
  };

  const handleKonfirmasiPenyerahan = async (adendumId) => {
    if (window.confirm('Konfirmasi penyerahan fisik dokumen adendum ini?')) {
      try {
        const res = await adendumService.konfirmasiPenyerahan(adendumId);
        if (res.success) fetchAdendum();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal konfirmasi penyerahan adendum.');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Memuat daftar Adendum...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to={`/pks/${id}`} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Daftar Adendum</h1>
            <p className="text-xs text-slate-500">PKS Induk: {pks?.nomorPKS || '-'}</p>
          </div>
        </div>

        {pks?.statusPersetujuan === 'Disetujui' && (
          <Link
            to={`/pks/${id}/adendum/new`}
            className="inline-flex items-center px-4 py-2 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl shadow-xs"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Buat Adendum Baru
          </Link>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {adendumList.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada Adendum</p>
            <p className="text-xs text-slate-400">PKS ini belum memiliki riwayat perubahan adendum.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {adendumList.map((item) => (
              <div key={item.adendumId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-[#00529C]">{item.nomorAdendum}</span>
                    <StatusBadge status={item.statusPersetujuan} />
                  </div>
                  <p className="text-xs text-slate-700">{item.ruangLingkupPerubahan}</p>
                  <p className="text-[11px] text-slate-400">
                    Masa Berlaku: {new Date(item.tanggalMulai).toLocaleDateString('id-ID')} s/d {new Date(item.tanggalBerakhir).toLocaleDateString('id-ID')}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {['Draft', 'Revisi Pengelola', 'Revisi Kabag', 'Revisi Pimpinan'].includes(item.statusPersetujuan) && (
                    <button
                      onClick={() => handleDownloadDraft(item.adendumId, item.nomorAdendum)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Unduh Draft
                    </button>
                  )}

                  {item.statusPersetujuan === 'Menunggu Penyerahan' && (
                    <button
                      onClick={() => handleKonfirmasiPenyerahan(item.adendumId)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Serahkan Fisik
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
