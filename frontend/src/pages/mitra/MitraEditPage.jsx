import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { mitraService } from '../../services/mitraService';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const MitraEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [namaPerusahaan, setNamaPerusahaan] = useState('');
  const [alamat, setAlamat] = useState('');
  const [kontak, setKontak] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMitra = async () => {
      setLoading(true);
      try {
        const res = await mitraService.getMitraById(id);
        if (res.success) {
          setNamaPerusahaan(res.data.namaPerusahaan);
          setAlamat(res.data.alamat || '');
          setKontak(res.data.kontak || '');
          setPenanggungJawab(res.data.penanggungJawab || '');
        }
      } catch (err) {
        setError('Gagal memuat data mitra.');
      } finally {
        setLoading(false);
      }
    };

    fetchMitra();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await mitraService.updateMitra(id, {
        namaPerusahaan,
        alamat,
        kontak,
        penanggungJawab,
      });

      if (res.success) {
        navigate('/mitra');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui mitra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Memuat data mitra...</div>;
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/mitra" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Edit Data Mitra</h1>
          <p className="text-xs text-slate-500">Perbarui informasi perusahaan mitra</p>
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
          <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Perusahaan / Instansi *</label>
          <input
            type="text"
            value={namaPerusahaan}
            onChange={(e) => setNamaPerusahaan(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
          <textarea
            rows="3"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Kontak / Telepon</label>
          <input
            type="text"
            value={kontak}
            onChange={(e) => setKontak(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Penanggung Jawab</label>
          <input
            type="text"
            value={penanggungJawab}
            onChange={(e) => setPenanggungJawab(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C]"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Link to="/mitra" className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl shadow-md flex items-center cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSubmitting ? 'Memproses...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
};
