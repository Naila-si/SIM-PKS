import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, Upload, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ModalPerbaruiTemplate = ({ isOpen, templateData, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const data = templateData || {
    nama_template: 'Template PKS',
    versi_template: 1,
    created_at: new Date().toISOString(),
    pengguna: { nama: 'Admin' }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert('Silakan pilih file .docx yang baru');
    setSubmitting(true);
    
    try {
      const form = new FormData();
      form.append('_method', 'PUT');
      form.append('file_template', file);
      if (user?.penggunaId) {
        form.append('penggunaId', user.penggunaId);
      }
      
      const res = await fetch(`http://localhost:8000/api/pks-templates/${data.templateId}`, {
        method: 'POST',
        body: form
      });
      
      if (res.ok) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        alert('Gagal memperbarui template');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Perbarui Template PKS</h2>
            <p className="text-xs text-slate-500 mt-0.5">Unggah versi terbaru template dokumen PKS.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="form-perbarui-template" onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* Card 1: Informational Current Details */}
          <div className="bg-[#EEF4FF] rounded-2xl p-4.5 border border-blue-100/90 grid grid-cols-2 gap-y-4 gap-x-3.5 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NAMA TEMPLATE</p>
              <p className="font-extrabold text-[#001D38] text-xs mt-0.5">{data.nama_template}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">VERSI SAAT INI</p>
              <p className="font-extrabold text-[#001D38] text-xs mt-0.5">v{data.versi_template || 1}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TANGGAL UPLOAD AWAL</p>
              <p className="font-bold text-slate-800 mt-0.5">{data.created_at ? new Date(data.created_at).toLocaleDateString('id-ID') : '-'}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PEMBUAT AWAL</p>
              <p className="font-bold text-slate-800 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis" title={data.pengguna ? `${data.pengguna.nama} (${(data.pengguna.role || '').replace('_', ' ').toUpperCase()})` : '-'}>
                {data.pengguna ? `${data.pengguna.nama} (${(data.pengguna.role || '').replace('_', ' ').toUpperCase()})` : '-'}
              </p>
            </div>

            {data.pengubah && (
              <div className="col-span-2 pt-2 border-t border-blue-200/60 mt-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TERAKHIR DIPERBARUI OLEH</p>
                <p className="font-bold text-emerald-700 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis" title={`${data.pengubah.nama} (${(data.pengubah.role || '').replace('_', ' ').toUpperCase()}) - ${new Date(data.updated_at).toLocaleDateString('id-ID')}`}>
                  {data.pengubah.nama} ({(data.pengubah.role || '').replace('_', ' ').toUpperCase()}) pada {new Date(data.updated_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            )}
          </div>

          {/* Section Upload Template Baru */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Upload Template Baru</label>
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer relative flex flex-col items-center justify-center min-h-[140px]">
              <input
                type="file"
                accept=".docx"
                required
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-900 text-xs">
                {file ? file.name : (
                  <>
                    Seret file ke sini atau <span className="text-blue-600 underline">klik untuk memilih file.</span>
                  </>
                )}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">.docx (Max 10 MB)</p>
            </div>
          </div>

          {/* Card 2: Automatic Version Upgrade */}
          <div className="p-4 rounded-2xl bg-[#EEF4FF] border border-blue-100 flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-full bg-[#0F2238] text-white flex items-center justify-center font-bold shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-[#001D38] text-xs">Versi Baru: v{(data.versi_template || 1) + 1}</p>
              <p className="text-[11px] text-slate-500 font-medium">Otomatis ditingkatkan dari versi sebelumnya</p>
            </div>
          </div>

          {/* Notice Callout */}
          <div className="p-3.5 rounded-xl bg-[#EEF4FF] border border-blue-200 text-blue-900 text-xs flex items-start space-x-2 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Pastikan placeholder seperti <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold text-blue-700">{"{{nomor_pks}}"}</span>, <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold text-blue-700">{"{{nama_perusahaan}}"}</span>, dan <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold text-blue-700">{"{{alamat}}"}</span> sudah sesuai dalam dokumen baru.
            </span>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0 bg-white z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Batal
          </button>
          <button
            type="submit"
            form="form-perbarui-template"
            disabled={submitting}
            className="px-5 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-md flex items-center transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Memproses...' : 'Perbarui Template'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
