import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { templateService } from '../../services/templateService';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, Upload, AlertCircle } from 'lucide-react';

export const TemplateFormPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [namaTemplate, setNamaTemplate] = useState('');
  const [jenisTemplate, setJenisTemplate] = useState('');
  const [bidang, setBidang] = useState(user?.bidang || 'Bidang A');
  const [fileTemplate, setFileTemplate] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!fileTemplate) {
      setError('Silakan pilih file template .docx untuk diunggah.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('namaTemplate', namaTemplate);
      formData.append('jenisTemplate', jenisTemplate);
      formData.append('bidang', bidang);
      formData.append('fileTemplate', fileTemplate);

      const res = await templateService.createTemplate(formData);
      if (res.success) {
        navigate('/templates');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengunggah template.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/templates" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Upload Template Dokumen</h1>
          <p className="text-xs text-slate-500">Unggah file template (.docx) baru untuk bidang Anda</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Bidang *</label>
          <input
            type="text"
            value={bidang}
            onChange={(e) => setBidang(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Template Dokumen *</label>
          <input
            type="text"
            value={namaTemplate}
            onChange={(e) => setNamaTemplate(e.target.value)}
            placeholder="Contoh: Template PKS Standar Transportasi Laut 2026"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis / Kategori Template</label>
          <input
            type="text"
            value={jenisTemplate}
            onChange={(e) => setJenisTemplate(e.target.value)}
            placeholder="Contoh: Kerjasama Layanan Kesehatan"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">File Template (.docx) *</label>
          <input
            type="file"
            accept=".docx"
            onChange={(e) => setFileTemplate(e.target.files[0])}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#00529C]"
            required
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Link to="/templates" className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl shadow-md flex items-center cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            {isSubmitting ? 'Mengunggah...' : 'Upload Template'}
          </button>
        </div>
      </form>
    </div>
  );
};
