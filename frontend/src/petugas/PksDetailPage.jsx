import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { pksService } from '../services/pksService';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { StatusPipeline } from '../components/StatusPipeline';
import { RevisionBanner } from '../components/RevisionBanner';
import { PartialDataCard } from '../components/PartialDataCard';
import { ApprovalActionModal } from '../components/ApprovalActionModal';
import { DocumentUploadModal } from '../components/DocumentUploadModal';
import {
  ArrowLeft, Download, CheckCircle, Edit3, Trash2, FilePlus, Building2, Calendar, User, History, FileText, Check, XCircle, Upload, AlertCircle
} from 'lucide-react';

export const PksDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pks, setPks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await pksService.getPksById(id);
      if (res.success) {
        setPks(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail PKS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleDownloadDraft = async () => {
    setIsActionLoading(true);
    try {
      const res = await pksService.downloadDraft(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${pks.nomorPKS ? pks.nomorPKS.replace(/\//g, '_') : 'Draft_PKS'}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      fetchDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunduh dokumen draft. Pastikan template telah dipilih.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleKonfirmasiPenyerahan = async () => {
    if (!window.confirm('Apakah Anda yakin telah menyerahkan dokumen fisik PKS ke Pengelola PKS?')) {
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await pksService.konfirmasiPenyerahan(id);
      if (res.success) {
        fetchDetail();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengonfirmasi penyerahan.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSetujuiPengelola = async () => {
    if (!window.confirm('Setujui dokumen fisik PKS dan teruskan ke pemeriksaan Kabag?')) {
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await pksService.setujuiPengelola(id);
      if (res.success) {
        fetchDetail();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyetujui PKS.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTolakPengelolaSubmit = async (catatanRevisi) => {
    const res = await pksService.tolakPengelola(id, catatanRevisi);
    if (res.success) {
      fetchDetail();
    }
  };

  const handleSetujuiKabag = async () => {
    if (!window.confirm('Setujui dokumen PKS ini dan teruskan ke pemeriksaan Pimpinan?')) {
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await pksService.setujuiKabag(id);
      if (res.success) {
        fetchDetail();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyetujui PKS pada tahap Kabag.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTolakKabagSubmit = async (catatanRevisi) => {
    const res = await pksService.tolakKabag(id, catatanRevisi);
    if (res.success) {
      fetchDetail();
    }
  };

  const handleSetujuiPimpinan = async () => {
    if (!window.confirm('Setujui persetujuan digital PKS ini pada tahap Pimpinan? Status akan menjadi Disetujui Pimpinan dan menunggu pengunggahan dokumen final oleh Pengelola PKS.')) {
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await pksService.setujuiPimpinan(id);
      if (res.success) {
        alert('PKS berhasil disetujui pada tahap Pimpinan. Pengelola PKS akan mengambil dokumen fisik untuk di-scan dan diunggah.');
        fetchDetail();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyetujui PKS pada tahap Pimpinan.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTolakPimpinanSubmit = async (catatanRevisi) => {
    const res = await pksService.tolakPimpinan(id, catatanRevisi);
    if (res.success) {
      fetchDetail();
    }
  };

  const handleUploadFinalSubmit = async (file) => {
    const res = await pksService.uploadDokumenFinal(id, file);
    if (res.success) {
      fetchDetail();
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Hapus draft PKS ini secara permanen?')) {
      try {
        const res = await pksService.deletePks(id);
        if (res.success) {
          navigate('/pks');
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus draft PKS.');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Memuat detail PKS...</div>;
  }

  if (error || !pks) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm font-semibold text-rose-600">{error || 'Data PKS tidak ditemukan.'}</p>
        <Link to="/pks" className="text-xs text-[#00529C] hover:underline">Kembali ke Daftar PKS</Link>
      </div>
    );
  }

  const isPetugas = user?.role === 'petugas_jr';
  const isPengelola = ['pengelola_pks', 'admin_utama'].includes(user?.role);
  const isKabag = ['kabag', 'admin_utama'].includes(user?.role);
  const isPimpinan = ['pimpinan', 'admin_utama'].includes(user?.role);

  const isEditable = isPetugas && ['Draft', 'Revisi Pengelola', 'Revisi Kabag', 'Revisi Pimpinan'].includes(pks.statusPersetujuan);
  const isDownloadable = isPetugas && isEditable;
  const isConfirmable = isPetugas && pks.statusPersetujuan === 'Menunggu Penyerahan';

  const isPengelolaReviewable = isPengelola && pks.statusPersetujuan === 'Pemeriksaan Pengelola';
  const isKabagReviewable = isKabag && pks.statusPersetujuan === 'Pemeriksaan Kabag';
  const isPimpinanReviewable = isPimpinan && pks.statusPersetujuan === 'Pemeriksaan Pimpinan';
  const isUploadableFinal = isPengelola && pks.statusPersetujuan === 'Disetujui Pimpinan';
  const isApproved = pks.statusPersetujuan === 'Disetujui';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/pks" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900">{pks.nomorPKS || 'Draft PKS'}</h1>
              <StatusBadge status={pks.statusPersetujuan} />
              {pks.statusPKS && <StatusBadge status={pks.statusPKS} type="pks" />}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Dibuat oleh {pks.pembuat?.nama || 'Petugas JR'} • Bidang {pks.bidang}</p>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Level 1 Pengelola Review Actions */}
          {isPengelolaReviewable && (
            <>
              <button
                onClick={handleSetujuiPengelola}
                disabled={isActionLoading}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Setujui (Lanjut Kabag)
              </button>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isActionLoading}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Tolak (Minta Revisi)
              </button>
            </>
          )}

          {/* Level 2 Kabag Review Actions */}
          {isKabagReviewable && (
            <>
              <button
                onClick={handleSetujuiKabag}
                disabled={isActionLoading}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Setujui (Lanjut Pimpinan)
              </button>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isActionLoading}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Tolak (Minta Revisi)
              </button>
            </>
          )}

          {/* Level 3 Pimpinan Review Actions */}
          {isPimpinanReviewable && (
            <>
              <button
                onClick={handleSetujuiPimpinan}
                disabled={isActionLoading}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Setujui (Final Digital)
              </button>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isActionLoading}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
                Tolak (Minta Revisi)
              </button>
            </>
          )}

          {/* Final Scanned Document Upload Action */}
          {isUploadableFinal && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              disabled={isActionLoading}
              className="px-3.5 py-2 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl shadow-md flex items-center cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Unggah Dokumen Final (PDF)
            </button>
          )}

          {/* Petugas Actions */}
          {isDownloadable && (
            <button
              onClick={handleDownloadDraft}
              disabled={isActionLoading}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Unduh Draft (.docx)
            </button>
          )}

          {isConfirmable && (
            <button
              onClick={handleKonfirmasiPenyerahan}
              disabled={isActionLoading}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Konfirmasi Penyerahan Fisik
            </button>
          )}

          {isEditable && (
            <Link
              to={`/pks/${pks.pksId}/edit`}
              className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl flex items-center"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Edit Data
            </Link>
          )}

          {isPetugas && pks.statusPersetujuan === 'Draft' && (
            <button
              onClick={handleDelete}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center border border-rose-200 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Hapus
            </button>
          )}

          {isApproved && (
            <Link
              to={`/pks/${pks.pksId}/adendum/new`}
              className="px-3.5 py-2 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center"
            >
              <FilePlus className="w-3.5 h-3.5 mr-1.5" />
              Buat Adendum
            </Link>
          )}

          <Link
            to={`/pks/${pks.pksId}/riwayat`}
            className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-xl flex items-center"
          >
            <History className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Riwayat
          </Link>
        </div>
      </div>

      {/* 12-Stage Visual Status Pipeline */}
      <StatusPipeline statusPersetujuan={pks.statusPersetujuan} />

      {/* Partial Data Card View for Pengelola PKS during Menunggu Penyerahan */}
      {pks.isPartialView ? (
        <PartialDataCard pks={pks} />
      ) : (
        <>
          {/* Revision Banner if applicable */}
          <RevisionBanner
            statusPersetujuan={pks.statusPersetujuan}
            catatanRevisi={pks.catatanRevisi}
            pksId={isPetugas ? pks.pksId : null}
          />

          {/* Main Content Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Ruang Lingkup & Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-[#00529C]" />
                  Detail Ruang Lingkup Kerjasama
                </h2>
                <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  {pks.ruangLingkup}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Tanggal Mulai</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center mt-0.5">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {pks.tanggalMulai ? new Date(pks.tanggalMulai).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Tanggal Berakhir</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center mt-0.5">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
                      {pks.tanggalBerakhir ? new Date(pks.tanggalBerakhir).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                    </span>
                  </div>
                </div>

                {/* Final PDF Scan Document Download if uploaded */}
                {pks.fileScan && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-emerald-900">Dokumen Hasil Scan PDF Bertanda Tangan</p>
                        <p className="text-[11px] text-emerald-700">Telah resmi diunggah dan diverifikasi</p>
                      </div>
                    </div>
                    <a
                      href={`http://127.0.0.1:8000/storage/${pks.fileScan}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 flex items-center shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Unduh PDF Final
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Mitra Information & Metadata */}
            <div className="space-y-6">
              {/* Mitra Info Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  <Building2 className="w-4 h-4 mr-1.5 text-[#00529C]" />
                  Perusahaan Mitra
                </h3>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-slate-900">{pks.mitra?.namaPerusahaan || '-'}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{pks.mitra?.alamat || 'Alamat tidak diisi.'}</p>
                  <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                    <p className="text-slate-500"><span className="font-semibold text-slate-700">Kontak:</span> {pks.mitra?.kontak || '-'}</p>
                    <p className="text-slate-500"><span className="font-semibold text-slate-700">Penanggung Jawab:</span> {pks.mitra?.penanggungJawab || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Template Info Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Template Dokumen</h3>
                <p className="text-xs font-semibold text-slate-800">{pks.template?.namaTemplate || 'Template Standar Kerjasama'}</p>
                <p className="text-[11px] text-slate-500">Jenis: {pks.template?.jenisTemplate || 'Dokumen Standar'}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Rejection Notes */}
      <ApprovalActionModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={isPimpinanReviewable ? handleTolakPimpinanSubmit : isKabagReviewable ? handleTolakKabagSubmit : handleTolakPengelolaSubmit}
        title={isPimpinanReviewable ? "Tolak PKS (Tahap Pimpinan)" : isKabagReviewable ? "Tolak PKS (Tahap Kabag)" : "Tolak PKS (Tahap Pengelola)"}
        label="Catatan Revisi untuk Petugas JR * (Minimal 10 karakter)"
      />

      {/* Modal Upload Final PDF */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadFinalSubmit}
        title="Unggah Dokumen Final PKS (PDF)"
        description="Unggah dokumen hasil scan bertanda-tangan basah (PDF maks. 10MB) untuk mengaktifkan PKS secara resmi."
        accept=".pdf"
        maxMB={10}
      />
    </div>
  );
};
