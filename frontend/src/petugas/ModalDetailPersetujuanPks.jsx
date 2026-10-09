import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, FileText, Folder, Eye, Download, Clock, Ban, CheckCircle2, Info
} from 'lucide-react';
import { ModalTolakPks } from './ModalTolakPks';
import { ModalSetujuiPks } from './ModalSetujuiPks';
import { useAuth } from '../context/AuthContext';
import { pksService } from '../services/pksService';

export const ModalDetailPersetujuanPks = ({ isOpen, pksData, onClose, onStatusUpdated }) => {
  const { user } = useAuth();
  const [catatan, setCatatan] = useState('');
  const [isTolakOpen, setIsTolakOpen] = useState(false);
  const [isSetujuiOpen, setIsSetujuiOpen] = useState(false);
  const [riwayat, setRiwayat] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(true);

  if (!isOpen) return null;

  const data = pksData || {};

  React.useEffect(() => {
    if (data?.pksId) {
      setLoadingRiwayat(true);
      pksService.getPksRiwayat(data.pksId).then(res => {
        if (res.success) setRiwayat(res.data);
        setLoadingRiwayat(false);
      });
    }
  }, [data?.pksId]);

  const handleTolakSuccess = (alasan) => {
    if (onStatusUpdated) onStatusUpdated('Ditolak', alasan);
    onClose();
  };

  const handleSetujuiSuccess = () => {
    if (onStatusUpdated) onStatusUpdated('Disetujui');
    onClose();
  };

  const statusPersetujuan = data.status_persetujuan || data.statusPersetujuan || '';
  const userRole = user?.role || '';
  
  let canApprove = false;
  if (userRole === 'admin_utama') canApprove = true;
  else if (statusPersetujuan.includes('Pengelola') && (userRole === 'pengelola_pks' || userRole === 'pengelola')) canApprove = true;
  else if (statusPersetujuan.includes('Kabag') && userRole === 'kabag') canApprove = true;
  else if (statusPersetujuan.includes('Pimpinan') && userRole === 'pimpinan') canApprove = true;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal (Matching Image 5) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <h2 className="text-sm font-extrabold text-[#001D38] tracking-tight">Detail Persetujuan PKS</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* Top Blue Notice Banner (Matching Image 5) */}
          <div className="p-3.5 rounded-xl bg-[#EEF4FF] border border-blue-100 text-blue-900 text-xs flex items-center space-x-2.5">
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
              i
            </div>
            <span className="font-medium text-slate-700">
              Silakan lakukan pencocokan data PKS pada sistem dengan dokumen fisik yang diajukan sebelum memberikan persetujuan.
            </span>
          </div>

          {/* Status Badges Row (Matching Image 5) */}
          <div className="flex items-center space-x-6">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">STATUS PKS</p>
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 inline-flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mr-1.5" />
                {data.statusPks || 'Draft'}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">STATUS PERSETUJUAN</p>
              <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 inline-flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
                {data.status_persetujuan || data.statusPersetujuan || '-'}
              </span>
            </div>
          </div>

          {/* Main 2-Column Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column: 7 cols */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Box 1: Informasi PKS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-extrabold text-slate-800">Informasi PKS</h3>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400">Nomor PKS</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.nomor_pks || data.nomorPKS || '-'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">Bidang</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.bidang || '-'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">Jenis PKS</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.jenis_pks || data.jenisPKS || '-'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">Tanggal Mulai</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.tanggal_mulai || data.tanggalMulai || '-'}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-[10px] font-medium text-slate-400">Tanggal Berakhir</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.tanggal_berakhir || data.tanggalBerakhir || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Box 2: Data Dokumen PKS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
                  <FileText className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-extrabold text-slate-800">Data Dokumen PKS</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-medium text-slate-400">Nama Perusahaan / Instansi</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.mitra?.nama_mitra || data.perusahaan || '-'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">Alamat</p>
                    <p className="font-bold text-slate-800 text-xs mt-0.5 leading-relaxed">{data.mitra?.alamat_mitra || data.alamat || '-'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-1">
                    <div>
                      <p className="text-[10px] font-medium text-slate-400">Nama Penanggung Jawab</p>
                      <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.mitra?.nama_pengelola || data.penanggungJawab || '-'}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-slate-400">Jabatan</p>
                      <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.mitra?.jabatan || data.jabatan || '-'}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-slate-400">Nomor Telepon</p>
                      <p className="font-bold text-slate-800 text-xs mt-0.5">{data.mitra?.no_hp_pengelola || data.nomorTelepon || '-'}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-slate-400">Email</p>
                      <p className="font-bold text-slate-800 text-xs mt-0.5">{data.mitra?.email_pengelola || data.email || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 3: Catatan Persetujuan */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 shadow-2xs">
                <label className="block font-extrabold text-slate-800 text-xs">Catatan Persetujuan</label>
                <textarea
                  rows={2}
                  placeholder="Tambahkan catatan apabila diperlukan."
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

            </div>

            {/* Right Column: 5 cols */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Box 1: DRAFT DOKUMEN PKS */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
                  <Folder className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">DRAFT DOKUMEN PKS</h3>
                </div>

                <div className="bg-[#EEF4FF] rounded-xl p-3.5 border border-blue-100 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shrink-0">
                    <FileText className="w-5 h-5 fill-rose-500 text-white" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">{data.url_berkas ? data.url_berkas.split('/').pop() : '-'}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{data.updated_at ? new Date(data.updated_at).toLocaleDateString('id-ID') : '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => alert('Membuka pratinjau Draft PKS...')}
                    className="w-full py-2 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Lihat Draft
                  </button>

                  <button
                    type="button"
                    onClick={() => alert('Mengunduh file Draft PKS...')}
                    className="w-full py-2 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Unduh Draft
                  </button>
                </div>
              </div>

              {/* Box 2: RIWAYAT PERSETUJUAN */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2.5">
                  <Clock className="w-4 h-4 text-slate-700" />
                  <h3 className="text-xs font-extrabold text-slate-800 tracking-tight">RIWAYAT PERSETUJUAN</h3>
                </div>

                {/* Vertical Timeline Matching Image 5 */}
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  
                  {loadingRiwayat ? (
                    <p className="text-xs text-slate-400">Memuat riwayat...</p>
                  ) : riwayat.length === 0 ? (
                    <p className="text-xs text-slate-400">Belum ada riwayat persetujuan.</p>
                  ) : (
                    riwayat.map((item, idx) => (
                      <div key={idx} className="relative">
                        <span className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center ${idx === 0 ? 'border-blue-600' : 'border-slate-300'}`}>
                          {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                        </span>
                        <p className="text-[10px] font-bold text-slate-400">
                          {new Date(item.tanggal || item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                        <p className={`text-xs mt-0.5 ${idx === 0 ? 'font-extrabold text-slate-900' : 'font-bold text-slate-600'}`}>
                          {item.aksi} oleh {item.namaAktor || item.user?.nama || '-'}
                        </p>
                        {item.catatan && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">"{item.catatan}"</p>
                        )}
                      </div>
                    ))
                  )}

                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Sticky Light Blue Footer Bar (Matching Image 5) */}
        <div className="px-6 py-4 bg-[#EEF4FF] border-t border-blue-100 flex items-center justify-between shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Tutup
          </button>

          {canApprove ? (
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setIsTolakOpen(true)}
                className="px-5 py-2.5 bg-[#C92A2A] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center transition-all cursor-pointer"
              >
                <Ban className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                Tolak
              </button>

              <button
                type="button"
                onClick={() => setIsSetujuiOpen(true)}
                className="px-5 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-xs flex items-center transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Setujui
              </button>
            </div>
          ) : (
            <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-wide bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100">
              <Info className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
              Anda tidak memiliki akses di tahap ini
            </div>
          )}
        </div>

      </div>

      {/* Sub Modals */}
      <ModalTolakPks
        isOpen={isTolakOpen}
        pksData={data}
        onClose={() => setIsTolakOpen(false)}
        onSuccess={handleTolakSuccess}
      />

      <ModalSetujuiPks
        isOpen={isSetujuiOpen}
        pksData={data}
        onClose={() => setIsSetujuiOpen(false)}
        onSuccess={handleSetujuiSuccess}
      />
    </div>,
    document.body
  );
};

export default ModalDetailPersetujuanPks;
