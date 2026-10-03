import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Upload, FileText, Plus, Trash2, CheckCircle2, Clock } from 'lucide-react';

export const TemplateListPage = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nama_template: '',
    bidang: 'Pelayanan',
    jenis_pks: 'Pelayanan Kesehatan',
    file: null
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/pks-templates');
      const data = await res.json();
      setTemplates(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) return alert('Silakan pilih file .docx');

    const form = new FormData();
    form.append('nama_template', formData.nama_template);
    form.append('bidang', formData.bidang);
    form.append('jenis_pks', formData.jenis_pks);
    form.append('file_template', formData.file);
    if (user?.penggunaId) form.append('penggunaId', user.penggunaId);

    try {
      const res = await fetch('http://localhost:8000/api/pks-templates', {
        method: 'POST',
        body: form
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ nama_template: '', bidang: 'Pelayanan', file: null });
        fetchTemplates();
      } else {
        alert('Gagal mengupload template');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus template ini?')) return;
    try {
      await fetch(`http://localhost:8000/api/pks-templates/${id}`, { method: 'DELETE' });
      fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Master Template PKS</h1>
          <p className="text-xs text-slate-500">Kelola format dokumen .docx standar untuk pembuatan draf PKS otomatis.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl"
        >
          <Upload className="w-4 h-4 mr-1.5" />
          Upload Template Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-xs text-slate-500 p-8 col-span-full text-center">Memuat template...</p>
        ) : templates.length === 0 ? (
          <p className="text-xs text-slate-400 p-8 col-span-full text-center">Belum ada template yang diunggah.</p>
        ) : (
          templates.map(t => (
            <div key={t.templateId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#00529C] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${t.status_template === 'Aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {t.status_template}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{t.nama_template}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bidang: <strong>{t.bidang}</strong> • Jenis: <strong>{t.jenis_pks}</strong><br />
                  Versi: {t.versi_template}
                </p>
                <div className="flex items-center text-[10px] text-slate-400 mt-2">
                  <Clock className="w-3 h-3 mr-1" />
                  Diperbarui: {new Date(t.updated_at).toLocaleDateString('id-ID')}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button onClick={() => handleDelete(t.templateId)} className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800">Upload Template PKS</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-medium leading-none cursor-pointer">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Template</label>
                <input required type="text" value={formData.nama_template} onChange={e => setFormData({...formData, nama_template: e.target.value})} placeholder="Contoh: Template PKS Pelayanan RS v2" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bidang PKS</label>
                  <select value={formData.bidang} onChange={e => setFormData({...formData, bidang: e.target.value, jenis_pks: e.target.value === 'SW' ? 'Sumbangan Wajib Dana Kecelakaan Lalu Lintas Jalan (SWDKLLJ)' : e.target.value === 'IW' ? 'IWKL Borongan' : 'Pelayanan Kesehatan'})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="Pelayanan">Pelayanan</option>
                    <option value="SW">Sumbangan Wajib (SW)</option>
                    <option value="IW">Iuran Wajib (IW)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis PKS</label>
                  <select value={formData.jenis_pks} onChange={e => setFormData({...formData, jenis_pks: e.target.value})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {formData.bidang === 'SW' && (
                      <option value="Sumbangan Wajib Dana Kecelakaan Lalu Lintas Jalan (SWDKLLJ)">Sumbangan Wajib Dana Kecelakaan Lalu Lintas Jalan (SWDKLLJ)</option>
                    )}
                    {formData.bidang === 'IW' && (
                      <>
                        <option value="IWKL Borongan">IWKL Borongan</option>
                        <option value="IWKL Manifest">IWKL Manifest</option>
                        <option value="IWKBU">IWKBU</option>
                      </>
                    )}
                    {formData.bidang === 'Pelayanan' && (
                      <option value="Pelayanan Kesehatan">Pelayanan Kesehatan</option>
                    )}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">File Template (.docx)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-blue-500 bg-slate-50 transition-colors">
                  <div className="space-y-1 text-center">
                    <FileText className="mx-auto h-8 w-8 text-slate-400" />
                    <div className="flex text-xs text-slate-600 mt-2">
                      <label className="relative cursor-pointer rounded-md font-medium text-[#00529C] hover:text-blue-700 focus-within:outline-none">
                        <span>Pilih file .docx</span>
                        <input required type="file" className="sr-only" accept=".docx,.doc" onChange={e => setFormData({...formData, file: e.target.files[0]})} />
                      </label>
                    </div>
                    {formData.file && <p className="text-[10px] text-emerald-600 font-medium">{formData.file.name}</p>}
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full py-2.5 bg-[#00529C] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#003E75] transition-colors cursor-pointer">
                  Upload & Aktifkan Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
