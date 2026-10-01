import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Copy, Check, Info, FileText } from 'lucide-react';

const PLACEHOLDERS = [
  '{{nomor_pks}}',
  '{{nama_perusahaan}}',
  '{{alamat}}',
  '{{nama_penanggung_jawab}}',
  '{{jabatan}}',
  '{{nomor_telepon}}',
  '{{email}}',
  '{{tanggal_mulai}}',
  '{{tanggal_berakhir}}',
];

export const ModalUploadTemplate = ({ isOpen, onClose, onSuccess }) => {
  const [bidang, setBidang] = useState('IW');
  const [jenisPks, setJenisPks] = useState('');
  const [namaTemplate, setNamaTemplate] = useState('');
  const [file, setFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCopyPlaceholders = () => {
    const text = PLACEHOLDERS.join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 600);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Upload Template PKS</h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
              Unggah template dokumen Microsoft Word yang akan digunakan sistem untuk menghasilkan draft PKS secara otomatis.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="form-upload-template" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Column: INFORMASI TEMPLATE */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-4 bg-[#00529C] rounded-full" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  INFORMASI TEMPLATE
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bidang</label>
                  <select
                    value={bidang}
                    onChange={(e) => setBidang(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="IW">IW</option>
                    <option value="SW">SW</option>
                    <option value="PELAYANAN">PELAYANAN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis PKS</label>
                  <select
                    value={jenisPks}
                    onChange={(e) => setJenisPks(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Pilih Jenis PKS</option>
                    <option value="Kerjasama Penjaminan Biaya">Kerjasama Penjaminan Biaya</option>
                    <option value="MoU Pertukaran Data">MoU Pertukaran Data</option>
                    <option value="Kerjasama Sumbangan Wajib">Kerjasama Sumbangan Wajib</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Template</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama template..."
                    value={namaTemplate}
                    onChange={(e) => setNamaTemplate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Versi</label>
                  <input
                    type="text"
                    disabled
                    value="v1"
                    className="w-full px-3.5 py-2.5 bg-[#EEF4FF] border border-blue-100 rounded-xl text-xs font-bold text-slate-700 text-center outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-[#EEF4FF] rounded-2xl p-4 border border-blue-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pengelola PKS</p>
                  <p className="font-extrabold text-slate-900 mt-0.5">Bambang Susanto (Admin IT)</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Upload</p>
                  <p className="font-extrabold text-slate-900 mt-0.5">2 Agustus 2026</p>
                </div>
              </div>
            </div>

            {/* Right Column: UPLOAD DOKUMEN */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-4 bg-[#00529C] rounded-full" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  UPLOAD DOKUMEN
                </h3>
              </div>

              <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer relative flex flex-col items-center justify-center min-h-[170px]">
                <input
                  type="file"
                  accept=".docx"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-900 text-xs">
                  {file ? file.name : 'Seret file ke sini atau klik untuk memilih file.'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">.docx (Max 10 MB)</p>
              </div>
            </div>

          </div>

          {/* Bottom Section: PLACEHOLDER YANG DAPAT DIGUNAKAN */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-4 bg-[#00529C] rounded-full" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                  PLACEHOLDER YANG DAPAT DIGUNAKAN
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCopyPlaceholders}
                className="px-3.5 py-1.5 bg-[#EEF4FF] hover:bg-blue-100 text-[#00529C] font-bold text-xs rounded-xl inline-flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin Placeholder'}</span>
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex flex-wrap gap-2">
                {PLACEHOLDERS.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-[#EEF4FF] border border-blue-200 text-[#00529C] rounded-full font-mono font-semibold text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Callout Info Box */}
              <div className="p-3.5 rounded-xl bg-[#FFFDF0] border-l-4 border-l-amber-400 border border-amber-200/80 text-xs flex items-start space-x-2 text-amber-900">
                <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">!</span>
                <span className="font-semibold leading-relaxed">
                  Pastikan placeholder di atas dituliskan tepat sama (termasuk kurung kurawal ganda) di dalam dokumen Word Anda agar data dapat terisi secara otomatis.
                </span>
              </div>
            </div>
          </div>

        </form>

        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="form-upload-template"
            disabled={submitting}
            className="px-5 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-md flex items-center transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            {submitting ? 'Memproses...' : 'Upload Template'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
