import React from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Eye, Download, Code2, Clock, RotateCcw } from 'lucide-react';

const TAG_TABLE_DATA = [
  { tag: '{{nomor_pks}}', ket: 'Nomor PKS' },
  { tag: '{{nama_perusahaan}}', ket: 'Nama Perusahaan' },
  { tag: '{{alamat}}', ket: 'Alamat' },
  { tag: '{{tanggal_mulai}}', ket: 'Tanggal Mulai PKS' },
  { tag: '{{tanggal_berakhir}}', ket: 'Tanggal Berakhir PKS' },
];

const VERSION_HISTORY_DATA = [
  { versi: 'v3.0', tgl: '15 Okt 2023', oleh: 'Admin Pusat', status: 'AKTIF', isAktif: true },
  { versi: 'v2.0', tgl: '05 Jul 2023', oleh: 'Siti Aminah', status: 'NONAKTIF', isAktif: false },
  { versi: 'v1.0', tgl: '12 Jan 2023', oleh: 'Budi Rahardjo', status: 'NONAKTIF', isAktif: false },
];

export const ModalDetailTemplate = ({ isOpen, templateData, onClose, onPerbaruiClick }) => {
  if (!isOpen) return null;

  const data = templateData || {
    namaTemplate: 'Template PKS Penjaminan RS',
    bidang: 'PELAYANAN',
    jenisPks: 'Kerjasama Layanan Kesehatan',
    versi: 'v3.0',
    ukuranFile: '1.2 MB',
    tanggalUpload: '12 Sep 2023',
    terakhirDiperbarui: '15 Okt 2023',
    diunggahOleh: 'Admin Pusat',
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Detail Template PKS</h2>
            <span className="px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-700 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
              Aktif
            </span>
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
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* Top Row: Grid 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: INFORMASI TEMPLATE & DOKUMEN TEMPLATE */}
            <div className="space-y-6">
              
              {/* Box 1: INFORMASI TEMPLATE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">i</span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    INFORMASI TEMPLATE
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Template</p>
                    <p className="font-extrabold text-slate-900 text-sm mt-0.5">{data.namaTemplate}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bidang</p>
                    <p className="font-extrabold text-slate-900 uppercase mt-0.5">{data.bidang}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis PKS</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{data.jenisPks}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Versi</p>
                    <p className="font-extrabold text-slate-900 mt-0.5">{data.versi}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ukuran File</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{data.ukuranFile || '1.2 MB'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Upload</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{data.tanggalUpload || '12 Sep 2023'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terakhir Diperbarui</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{data.terakhirDiperbarui || '15 Okt 2023'}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diunggah Oleh</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-5 h-5 rounded-full bg-blue-700 text-white font-bold text-[9px] flex items-center justify-center">
                        AP
                      </div>
                      <span className="font-semibold text-slate-800">{data.diunggahOleh || 'Admin Pusat'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Box 2: DOKUMEN TEMPLATE */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <FileText className="w-4 h-4 text-[#00529C]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    DOKUMEN TEMPLATE
                  </h3>
                </div>

                <div className="bg-[#EEF4FF] rounded-xl p-4 border border-blue-100 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">Template_PKS_RS_v3.docx</p>
                      <p className="text-[10px] text-slate-400">Microsoft Word Document</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => alert('Pratinjau Template Dokumen')}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" /> Lihat Template
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Unduh Template Dokumen')}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center"
                    >
                      <Download className="w-3.5 h-3.5 mr-1 text-slate-600" /> Unduh Template
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: PLACEHOLDER YANG DIGUNAKAN */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <Code2 className="w-4 h-4 text-[#00529C]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    PLACEHOLDER YANG DIGUNAKAN
                  </h3>
                </div>

                <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-[#EEF4FF] border-b border-slate-200 text-slate-700 font-extrabold text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Tag Placeholder</th>
                        <th className="px-4 py-3">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {TAG_TABLE_DATA.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-mono font-bold text-blue-600">{row.tag}</td>
                          <td className="px-4 py-3 text-slate-700">{row.ket}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium flex items-center space-x-1.5">
                <span>ℹ️ Total 5 placeholder terdeteksi dalam dokumen.</span>
              </div>
            </div>

          </div>

          {/* Bottom Full Width: RIWAYAT VERSI */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-[#00529C]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                RIWAYAT VERSI
              </h3>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-[#EEF4FF] border-b border-slate-200 text-slate-700 font-extrabold text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Versi</th>
                    <th className="px-5 py-3">Tanggal Upload</th>
                    <th className="px-5 py-3">Diunggah Oleh</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {VERSION_HISTORY_DATA.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3 font-extrabold text-slate-900">{r.versi}</td>
                      <td className="px-5 py-3 text-slate-600">{r.tgl}</td>
                      <td className="px-5 py-3 text-slate-800">{r.oleh}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          r.isAktif
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => alert(`Detail Versi ${r.versi}`)}
                          className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#EEF4FF] hover:bg-blue-100 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onPerbaruiClick) onPerbaruiClick(data);
            }}
            className="px-5 py-2.5 bg-[#0F2238] hover:bg-[#0A1828] text-white text-xs font-bold rounded-xl shadow-md flex items-center transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Perbarui Template
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
