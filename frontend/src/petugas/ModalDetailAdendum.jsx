import React, { useState, useEffect } from 'react';
import { adendumService } from '../services/adendumService';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import { CustomDialog } from '../components/CustomDialog';
import { DocumentUploadModal } from '../components/DocumentUploadModal';
import { X, FileText, AlertTriangle, Download, Eye, Edit3, Trash2, Clock, CheckCircle2, Check, XCircle, Upload } from 'lucide-react';

export const ModalDetailAdendum = ({ isOpen, adendumId, adendumData, onClose, onEditClick, onDeleteClick, onSuccess }) => {
  const { user } = useAuth();
  const [dialogState, setDialogState] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null, promptValue: '' });
  const [promptValue, setPromptValue] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const showDialog = (type, title, message, onConfirm = null) => {
    setDialogState({ isOpen: true, type, title, message, onConfirm });
  };
  const [loading, setLoading] = useState(false);
  const [adendum, setAdendum] = useState(adendumData || null);

  useEffect(() => {
    if (!isOpen) return;

    const targetId = adendumId || adendumData?.adendumId || adendumData?.id;
    if (adendumData) {
      setAdendum(adendumData);
    }

    if (targetId) {
      adendumService.getAdendumById(targetId)
        .then((res) => {
          if (res?.success && res?.data) {
            setAdendum(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, adendumId, adendumData]);

  if (!isOpen) return null;

  const statusPersetujuan = adendum?.statusPersetujuan || adendum?.status || 'Draft';
  const isFinalUploaded = !!(adendum?.urlBerkas || adendum?.fileScanFinal);
  const isDisetujui = ['disetujui', 'selesai', 'draf adendum disetujui', 'aktif'].includes((statusPersetujuan || '').toLowerCase());

  // ROLES
  const role = user?.role?.toLowerCase() || '';
  const isPetugas = role === 'petugas_jr';
  const isPengelola = role === 'pengelola_pks' || role === 'pengelola';
  const isAdmin = role === 'admin_utama' || role === 'admin';
  const isPengelolaOrAdmin = isPengelola || isAdmin;
  const isKabag = role === 'kabag';
  const isPimpinan = role === 'pimpinan';
  
  const canShowUploadFinal = isPengelolaOrAdmin && isDisetujui;
  
  const roleSuffix = isPengelolaOrAdmin ? 'Pengelola' : isKabag ? 'Kabag' : isPimpinan ? 'Pimpinan' : '';
  const creatorName = adendum?.pembuat?.nama || adendum?.pembuat?.nama_pengguna || 'Petugas';
  const isCreator = user?.penggunaId === adendum?.pembuat_id || isPetugas;
  const isDraftPersetujuan = ['draft', 'draf'].includes((statusPersetujuan).toLowerCase());
  const isRevisi = (statusPersetujuan).toLowerCase().includes('revisi');

  // ACTIONS VISIBILITY
  const canShowSiapDiserahkan = isPetugas && isCreator && (isDraftPersetujuan || isRevisi);
  const canEdit = isPetugas && isCreator && (isDraftPersetujuan || isRevisi);
  const canDelete = isPetugas && isCreator && isDraftPersetujuan;
  
  // Accept Document Action
  const isUnlocked = true; // Assuming no lock mechanism for Adendum yet, or you can add locked_by to adendum later
  const isMyTurnToAccept = isUnlocked && (
    (isPengelolaOrAdmin && statusPersetujuan === 'Menunggu Penyerahan') ||
    (isKabag && statusPersetujuan === 'Disetujui Pengelola') ||
    (isPimpinan && statusPersetujuan === 'Disetujui Kabag')
  );

  // Decide Action
  const isMyTurnToDecide = (
    (isPengelolaOrAdmin && statusPersetujuan === 'Pemeriksaan Pengelola') ||
    (isKabag && statusPersetujuan === 'Pemeriksaan Kabag') ||
    (isPimpinan && statusPersetujuan === 'Pemeriksaan Pimpinan')
  );

  const processApprovalAction = async (statusAksi, catatan = null) => {
    try {
      setLoading(true);
      await adendumService.postApproval({
        adendum_id: adendum?.adendumId || adendumId,
        user_id: user?.penggunaId || user?.id || null,
        status_aksi: statusAksi,
        catatan: catatan
      });
      // Optionally reload adendum data
      window.location.reload();
    } catch (error) {
      showDialog('info', 'Gagal', 'Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setLoading(false);
    }
  };

  const handleTandaiSiap = () => {
    showDialog('confirm', 'Konfirmasi Penyerahan', 'Apakah Anda yakin Draf Adendum sudah siap diserahkan?', 
      () => processApprovalAction('Tandai Siap Diserahkan')
    );
  };

  const handleSudahDiterima = () => {
    showDialog('confirm', 'Terima Berkas', 'Apakah Anda yakin ingin mengambil alih pemeriksaan Adendum ini?', 
      () => processApprovalAction('Sudah Diterima')
    );
  };

  const handleSetuju = () => {
    showDialog('confirm', 'Konfirmasi Persetujuan', 'Apakah Anda yakin ingin menyetujui Adendum ini?', 
      () => processApprovalAction(`Disetujui ${roleSuffix}`)
    );
  };

  const handleRevisi = () => {
    setPromptValue('');
    showDialog('prompt', 'Catatan Revisi', 'Masukkan catatan perbaikan Adendum:', 
      (catatan) => {
        if (!catatan || catatan.trim() === '') return;
        processApprovalAction(`Revisi ${roleSuffix}`, catatan);
      }
    );
  };

  const handleDrafDisetujui = () => {
    showDialog('confirm', 'Selesai Persetujuan', 'Tandai dokumen ini sebagai Draf Adendum Disetujui?', 
      () => processApprovalAction('Draf Adendum Disetujui')
    );
  };

  const handleUploadFinalSubmit = async (file) => {
    try {
      setLoading(true);
      const targetId = adendum?.adendumId || adendum?.id || adendumId;
      const res = await adendumService.uploadFinal(targetId, file, user?.penggunaId || user?.id);
      if (res?.success) {
        if (res.data) {
          setAdendum(res.data);
          if (onSuccess) onSuccess(res.data);
        } else {
          const updated = await adendumService.getAdendumById(targetId);
          if (updated?.data) {
            setAdendum(updated.data);
            if (onSuccess) onSuccess(updated.data);
          }
        }
        showDialog('info', 'Berhasil', 'Dokumen final Adendum berhasil diunggah.');
      } else {
        showDialog('info', 'Gagal', res?.message || 'Gagal mengunggah dokumen final.');
      }
    } catch (err) {
      showDialog('info', 'Gagal', err.message || 'Terjadi kesalahan saat mengunggah dokumen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Detail Adendum</h2>
            <div className="h-4 w-px bg-slate-200" />
            <StatusBadge status={(statusPersetujuan === 'Disetujui' || statusPersetujuan === 'Selesai') ? 'Aktif' : 'Draf'} />
            <StatusBadge status={statusPersetujuan} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex-1">Memuat data detail adendum...</div>
        ) : (
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* SECTION I. INFORMASI ADENDUM */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                I. INFORMASI ADENDUM
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor Adendum</p>
                  <p className="font-extrabold text-[#00529C] text-sm mt-0.5">
                    {adendum?.nomorAdendum || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nomor PKS Induk</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">
                    {adendum?.pksDocument?.nomor_pks || adendum?.pks?.nomor_pks || adendum?.pks?.nomorPKS || adendum?.nomorPKS || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Mulai</p>
                  <p className="font-semibold text-slate-700 text-xs mt-0.5">
                    {adendum?.tanggalMulai ? new Date(adendum.tanggalMulai).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Berakhir</p>
                  <p className="font-semibold text-slate-700 text-xs mt-0.5">
                    {adendum?.tanggalBerakhir ? new Date(adendum.tanggalBerakhir).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION II. ISI PERUBAHAN */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                II. ISI PERUBAHAN
              </h3>
              
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100/90 text-xs text-slate-800 leading-relaxed space-y-2">
                <p>
                  {adendum?.ruangLingkupPerubahan || '-'}
                </p>
              </div>
            </div>

            {/* SECTION III. DOKUMEN DRAFT & FINAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  III. DOKUMEN DRAF
                </h3>
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#00529C] flex items-center justify-center font-bold shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 truncate">Draf_Adendum.docx</p>
                      <p className="text-[10px] text-slate-400">Dokumen sistem</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => adendumService.generateWord(adendum?.adendumId || adendum?.id || adendumId)}
                    className="w-full px-3 py-1.5 border border-blue-200 text-blue-700 font-bold rounded-xl hover:bg-blue-50 text-xs flex items-center justify-center cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 mr-1 text-blue-600" /> Unduh Draf (.docx)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  IV. DOKUMEN FINAL
                </h3>

                {isFinalUploaded ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs">
                    <div className="flex items-center space-x-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Dokumen Final Scan Bertanda Tangan</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => adendumService.downloadFinal(adendum?.adendumId || adendum?.id || adendumId)}
                      className="w-full px-3 py-1.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Unduh Dokumen Final
                    </button>
                    {canShowUploadFinal && (
                      <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="w-full px-3 py-1.5 border border-emerald-300 text-emerald-800 font-semibold rounded-xl hover:bg-emerald-100/70 flex items-center justify-center cursor-pointer transition-colors text-[11px]"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1 text-emerald-700" /> Unggah Ulang Berkas Final
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-3">
                    <div className="flex items-start space-x-2.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Dokumen Adendum final belum diunggah.</p>
                        <p className="text-[11px] text-amber-700/90 mt-0.5">
                          {canShowUploadFinal 
                            ? 'Silakan unggah dokumen hasil scan yang telah ditandatangani basah untuk melengkapi berkas Adendum.'
                            : 'Menunggu Pengelola PKS mengunggah scan dokumen final bertanda tangan.'}
                        </p>
                      </div>
                    </div>

                    {canShowUploadFinal && (
                      <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" /> Unggah Dokumen Final
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION V. RIWAYAT PERSETUJUAN */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                V. RIWAYAT PERSETUJUAN
              </h3>

              <div className="relative border-l-2 border-slate-200 ml-3.5 space-y-5 py-1 text-xs max-h-[250px] overflow-y-auto pr-2">
                {/* 1. Draf Dibuat (Always exists) */}
                <div className="ml-5 relative bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full bg-[#00529C] ring-4 ring-blue-100" />
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900">Draf Dibuat</p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {adendum?.created_at ? new Date(adendum.created_at).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}) : (adendum?.createdAt ? new Date(adendum.createdAt).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}) : '-')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">Oleh: {adendum?.pembuat?.nama || adendum?.pembuat?.nama_pengguna || 'Petugas'}</p>
                </div>

                {/* 2. Dynamic Riwayat */}
                {adendum?.riwayat_persetujuan && adendum.riwayat_persetujuan.length > 0 && (
                  adendum.riwayat_persetujuan.map((riwayat, idx) => (
                    <div key={idx} className="ml-5 relative bg-white p-3.5 rounded-xl border border-slate-200">
                      <span className={`absolute -left-[27px] top-4 w-3.5 h-3.5 rounded-full ring-4 ${
                        (riwayat.status_aksi || '').includes('Revisi') ? 'bg-rose-500 ring-rose-100' : 'bg-[#00529C] ring-blue-100'
                      }`} />
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">
                          {riwayat.status_aksi === 'Menunggu Penyerahan' ? 'Dokumen fisik siap diserahkan oleh Petugas' : (riwayat.status_aksi || riwayat.judul || '-')}
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {riwayat.created_at ? new Date(riwayat.created_at).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}) : (riwayat.tanggal || '-')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">Oleh: {riwayat.user?.nama || riwayat.user?.nama_pengguna || riwayat.aktor || '-'}</p>
                      {riwayat.catatan && (
                        <p className="text-[11px] text-slate-500 italic mt-1 font-mono">"{riwayat.catatan}"</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* Sticky Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          
          <div className="flex items-center space-x-2">
            {canShowSiapDiserahkan && (
              <button
                type="button"
                disabled={loading}
                onClick={handleTandaiSiap}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                {loading ? 'Memproses...' : 'Tandai Siap Diserahkan'}
              </button>
            )}

            {isMyTurnToAccept && (
              <button
                type="button"
                disabled={loading}
                onClick={handleSudahDiterima}
                className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center cursor-pointer disabled:opacity-50"
              >
                Sudah Diterima
              </button>
            )}

            {isMyTurnToDecide && (
              <>
                <button
                  type="button"
                  disabled={loading}
                  onClick={isPimpinan ? handleDrafDisetujui : handleSetuju}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" /> Setujui
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRevisi}
                  className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold rounded-xl flex items-center transition-all cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" /> Kembalikan / Revisi
                </button>
              </>
            )}

            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onEditClick) onEditClick(adendum || { adendumId });
                }}
                className="px-4 py-2 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl shadow-xs flex items-center transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Ubah Adendum
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onDeleteClick) onDeleteClick(adendum || { adendumId });
                }}
                className="px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-xl flex items-center transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus Adendum
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>

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

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadFinalSubmit}
        title="Unggah Dokumen Final Adendum (PDF)"
        description="Unggah dokumen scan hasil tanda tangan basah (PDF/DOCX maks. 10MB) untuk melengkapi berkas Adendum."
        accept=".pdf,.docx,.doc"
        maxMB={10}
      />
    </div>
  );
};
