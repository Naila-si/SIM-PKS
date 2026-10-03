import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Save, ArrowLeft, Download, FileText, Plus, X } from 'lucide-react';

export const PksCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mitras, setMitras] = useState([]);
  
  const [formData, setFormData] = useState({
    mitraId: '',
    bidang: 'Pelayanan',
    jenis_pks: 'Pelayanan Kesehatan',
    ringkasan_pks: '',
    tanggal_mulai: '',
    tanggal_berakhir: ''
  });

  const [loading, setLoading] = useState(false);

  // Mitra Modal States
  const [showMitraModal, setShowMitraModal] = useState(false);
  const [newMitra, setNewMitra] = useState({
    nama_mitra: '',
    nama_pengelola: '',
    no_hp_pengelola: '',
    email_pengelola: '',
    alamat_mitra: ''
  });
  const [savingMitra, setSavingMitra] = useState(false);

  const fetchMitras = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/mitra');
      const data = await res.json();
      setMitras(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMitras();
  }, []);

  const handleSaveMitra = async (e) => {
    e.preventDefault();
    setSavingMitra(true);
    try {
      const res = await fetch('http://localhost:8000/api/mitra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMitra)
      });
      if (res.ok) {
        const saved = await res.json();
        await fetchMitras();
        setFormData({ ...formData, mitraId: saved.mitraId });
        setShowMitraModal(false);
        setNewMitra({ nama_mitra: '', nama_pengelola: '', no_hp_pengelola: '', email_pengelola: '', alamat_mitra: '' });
      } else {
        alert('Gagal menyimpan mitra. Pastikan semua data terisi dengan benar.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan saat menyimpan mitra.');
    } finally {
      setSavingMitra(false);
    }
  };

  const jenisOptions = {
    'SW': ['Sumbangan Wajib Dana Kecelakaan Lalu Lintas Jalan (SWDKLLJ)'],
    'IW': ['IWKL Borongan', 'IWKL Manifest', 'IWKBU'],
    'Pelayanan': ['Pelayanan Kesehatan']
  };

  const handleBidangChange = (e) => {
    const bidang = e.target.value;
    setFormData({
      ...formData,
      bidang,
      jenis_pks: jenisOptions[bidang][0]
    });
  };

  const handleSaveAndGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        penggunaId: user?.penggunaId || 1
      };

      const res = await fetch('http://localhost:8000/api/pks-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const pks = await res.json();
      
      if (!res.ok) {
        alert('Gagal menyimpan draf PKS: ' + (pks.message || 'Error'));
        setLoading(false);
        return;
      }

      const dlRes = await fetch(`http://localhost:8000/api/pks-documents/${pks.pksId}/generate-docx`);
      if (dlRes.ok) {
        const blob = await dlRes.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Draft_PKS_${pks.pksId}.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        alert('Berhasil! Draf PKS telah disimpan dan file .docx sedang di-download.');
        navigate('/pks');
      } else {
        const err = await dlRes.json();
        alert('Data PKS tersimpan, tapi gagal generate .docx: ' + (err.message || 'Template tidak ditemukan'));
        navigate('/pks');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Buat Draf PKS Baru</h1>
          <p className="text-xs text-slate-500">Silakan isi formulir di bawah ini untuk meng-generate dokumen kontrak kerja sama.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSaveAndGenerate} className="p-6 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-700">Perusahaan / Instansi Mitra <span className="text-red-500">*</span></label>
                <button type="button" onClick={() => setShowMitraModal(true)} className="text-xs font-bold text-[#00529C] hover:text-blue-700 flex items-center cursor-pointer bg-blue-50 px-2 py-1 rounded-lg">
                  <Plus className="w-3 h-3 mr-1" />
                  Mitra Baru
                </button>
              </div>
              <select required value={formData.mitraId} onChange={e => setFormData({...formData, mitraId: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C]">
                <option value="" disabled>-- Pilih Mitra --</option>
                {mitras.filter(m => m.status_mitra === 'Aktif').map(m => <option key={m.mitraId} value={m.mitraId}>{m.nama_mitra}</option>)}
              </select>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Bidang Kerja Sama <span className="text-red-500">*</span></label>
                <select value={formData.bidang} onChange={handleBidangChange} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C]">
                  <option value="SW">Sumbangan Wajib (SW)</option>
                  <option value="IW">Iuran Wajib (IW)</option>
                  <option value="Pelayanan">Pelayanan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Jenis PKS <span className="text-red-500">*</span></label>
                <select value={formData.jenis_pks} onChange={e => setFormData({...formData, jenis_pks: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C]">
                  {jenisOptions[formData.bidang].map(opsi => (
                    <option key={opsi} value={opsi}>{opsi}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Ringkasan / Subjek PKS <span className="text-red-500">*</span></label>
            <textarea required rows="3" value={formData.ringkasan_pks} onChange={e => setFormData({...formData, ringkasan_pks: e.target.value})} placeholder="Contoh: Perjanjian kerja sama penanganan korban kecelakaan lalu lintas dengan RS Kasih Ibu..." className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C]"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Tanggal Mulai Berlaku <span className="text-red-500">*</span></label>
              <input required type="date" value={formData.tanggal_mulai} onChange={e => setFormData({...formData, tanggal_mulai: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C]" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Tanggal Berakhir Berlaku <span className="text-red-500">*</span></label>
              <input required type="date" value={formData.tanggal_berakhir} onChange={e => setFormData({...formData, tanggal_berakhir: e.target.value})} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00529C]" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className={`inline-flex items-center px-6 py-3 text-sm font-bold text-white rounded-xl shadow-md transition-all ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#00529C] to-blue-600 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'}`}
            >
              {loading ? (
                <>Tunggu Sebentar...</>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Simpan Draf & Generate .docx
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showMitraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-800">Tambah Mitra Baru</h2>
              <button onClick={() => setShowMitraModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMitra} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Instansi / Perusahaan <span className="text-red-500">*</span></label>
                <input required type="text" value={newMitra.nama_mitra} onChange={e => setNewMitra({...newMitra, nama_mitra: e.target.value})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama PIC / Pimpinan <span className="text-red-500">*</span></label>
                  <input required type="text" value={newMitra.nama_pengelola} onChange={e => setNewMitra({...newMitra, nama_pengelola: e.target.value})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">No. HP PIC <span className="text-red-500">*</span></label>
                  <input required type="text" value={newMitra.no_hp_pengelola} onChange={e => setNewMitra({...newMitra, no_hp_pengelola: e.target.value})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email PIC</label>
                <input type="email" value={newMitra.email_pengelola} onChange={e => setNewMitra({...newMitra, email_pengelola: e.target.value})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat Instansi</label>
                <textarea rows="2" value={newMitra.alamat_mitra} onChange={e => setNewMitra({...newMitra, alamat_mitra: e.target.value})} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div className="pt-2">
                <button type="submit" disabled={savingMitra} className={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-md transition-colors ${savingMitra ? 'bg-slate-400' : 'bg-[#00529C] hover:bg-[#003E75] cursor-pointer'}`}>
                  {savingMitra ? 'Menyimpan...' : 'Simpan Mitra & Pilih'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
