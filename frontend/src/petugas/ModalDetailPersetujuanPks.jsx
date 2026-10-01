import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X, FileText, Folder, Eye, Download, Clock, Ban, CheckCircle2, Info
} from 'lucide-react';
import { ModalTolakPks } from './ModalTolakPks';
import { ModalSetujuiPks } from './ModalSetujuiPks';

export const ModalDetailPersetujuanPks = ({ isOpen, pksData, onClose, onStatusUpdated }) => {
  const [catatan, setCatatan] = useState('');
  const [isTolakOpen, setIsTolakOpen] = useState(false);
  const [isSetujuiOpen, setIsSetujuiOpen] = useState(false);

  if (!isOpen) return null;

  const data = pksData || {
    pksId: 101,
    nomorPKS: 'PKS/2023/XI/0892',
    bidang: 'Teknologi Informasi',
    jenisPKS: 'Kerjasama Strategis',
    tanggalMulai: '01 Januari 2024',
    tanggalBerakhir: '31 Desember 2026',
    perusahaan: 'PT Integritas Nusantara Jaya',
    alamat: 'Jl. Rasuna Said Kav. 10-11, Kuningan, Jakarta Selatan, 12950',
    penanggungJawab: 'Budi Santoso, S.Kom',
    jabatan: 'Direktur Operasional',
    nomorTelepon: '+62 812 3456 7890',
    email: 'budi.santoso@integritas.id',
    statusPks: 'Draft',
    statusPersetujuan: 'Menunggu Persetujuan Kepala Bagian',
  };

  const handleTolakSuccess = (alasan) => {
    if (onStatusUpdated) onStatusUpdated('Ditolak', alasan);
    onClose();
  };

  const handleSetujuiSuccess = () => {
    if (onStatusUpdated) onStatusUpdated('Disetujui');
    onClose();
  };

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
                {data.statusPersetujuan || 'Menunggu Persetujuan Kepala Bagian'}
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
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.nomorPKS}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">Bidang</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.bidang}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">Jenis PKS</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.jenisPKS}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">Tanggal Mulai</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.tanggalMulai}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-[10px] font-medium text-slate-400">Tanggal Berakhir</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.tanggalBerakhir}</p>
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
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.perusahaan}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium text-slate-400">Alamat</p>
                    <p className="font-bold text-slate-800 text-xs mt-0.5 leading-relaxed">{data.alamat}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-4 pt-1">
                    <div>
                      <p className="text-[10px] font-medium text-slate-400">Nama Penanggung Jawab</p>
                      <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.penanggungJawab}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-slate-400">Jabatan</p>
                      <p className="font-extrabold text-slate-900 text-xs mt-0.5">{data.jabatan}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-slate-400">Nomor Telepon</p>
                      <p className="font-bold text-slate-800 text-xs mt-0.5">{data.nomorTelepon}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-slate-400">Email</p>
                      <p className="font-bold text-slate-800 text-xs mt-0.5">{data.email}</p>
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
                    <p className="font-extrabold text-slate-900 text-xs">Draft_PKS_2023.docx</p>
                    <p className="text-[10px] text-slate-400 font-medium">v1.0 • 24 Oct 2023</p>
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
                  
                  {/* Timeline Item 1 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    </span>
                    <p className="text-[10px] font-bold text-slate-400">05 Agustus 2026</p>
                    <p className="font-extrabold text-slate-900 text-xs mt-0.5">Disetujui oleh Pengelola PKS</p>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">"Data sudah sesuai dengan lampiran fisik."</p>
                  </div>

                  {/* Timeline Item 2 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white border-2 border-slate-300" />
                    <p className="text-[10px] font-bold text-slate-400">04 Agustus 2026</p>
                    <p className="font-bold text-slate-600 text-xs mt-0.5">Menunggu Pemeriksaan Pengelola PKS</p>
                  </div>

                  {/* Timeline Item 3 */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white border-2 border-slate-300" />
                    <p className="text-[10px] font-bold text-slate-400">03 Agustus 2026</p>
                    <p className="font-bold text-slate-600 text-xs mt-0.5">PKS berhasil dibuat</p>
                  </div>

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
