import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adendumService } from '../services/adendumService';
import { pksService } from '../services/pksService';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const AdendumCreatePage = () => {
  const { id } = useParams(); // pksId
  const navigate = useNavigate();

  const [pks, setPks] = useState(null);
  const [ruangLingkupPerubahan, setRuangLingkupPerubahan] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalBerakhir, setTanggalBerakhir] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPks = async () => {
      setLoading(true);
      try {
        const res = await pksService.getPksById(id);
        if (res.success) {
          setPks(res.data);
          setTanggalMulai(res.data.tanggalMulai ? res.data.tanggalMulai.split('T')[0] : '');
          setTanggalBerakhir(res.data.tanggalBerakhir ? res.data.tanggalBerakhir.split('T')[0] : '');
        }
      } catch (err) {
        setError('Gagal memuat PKS induk.');
      } finally {
        setLoading(false);
      }
    };

    fetchPks();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (new Date(tanggalBerakhir) <= new Date(tanggalMulai)) {
      setError('Tanggal berakhir harus lebih besar dari tanggal mulai.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await adendumService.createAdendum(id, {
        ruangLingkupPerubahan,
        tanggalMulai,
        tanggalBerakhir,
      });

      if (res.success) {
        navigate(`/pks/${id}/adendum`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat adendum.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Memuat data PKS induk...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <Link to={`/pks/${id}/adendum`} className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Buat Draft Adendum Baru</h1>
          <p className="text-xs text-slate-500">PKS Induk: {pks?.nomorPKS}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ruang Lingkup Perubahan Adendum *
          </label>
          <textarea
            rows="4"
            value={ruangLingkupPerubahan}
            onChange={(e) => setRuangLingkupPerubahan(e.target.value)}
            placeholder="Jelaskan secara rinci perubahan atau pasal tambahan dalam Adendum ini..."
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C]"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai Adendum *</label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Berakhir Adendum *</label>
            <input
              type="date"
              value={tanggalBerakhir}
              onChange={(e) => setTanggalBerakhir(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#00529C]"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
          <Link to={`/pks/${id}/adendum`} className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-semibold rounded-xl shadow-md flex items-center cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {isSubmitting ? 'Memproses...' : 'Simpan Draft Adendum'}
          </button>
        </div>
      </form>
    </div>
  );
};
