import React, { useState, useEffect } from 'react';
import { pksService } from '../services/pksService';
import { StatusBadge } from '../components/StatusBadge';
import { ModalRiwayatPks } from './ModalRiwayatPks';
import {
  Folder, History as HistoryIcon, Clock, CheckCircle2, Search,
  RotateCcw, ChevronLeft, ChevronRight, ChevronRight as ArrowRight, FileText, Filter
} from 'lucide-react';

export const PksRiwayatPage = () => {
  const [loading, setLoading] = useState(true);
  const [riwayatList, setRiwayatList] = useState([]);
  const [viewingPksData, setViewingPksData] = useState(null);

  // Stats State
  const [summary, setSummary] = useState({
    totalPks: '1,284',
    totalAktivitas: '8,422',
    aktivitasHariIni: 42,
    pksAktif: 912,
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [urutan, setUrutan] = useState('Terbaru');
  const [bidang, setBidang] = useState('Semua Bidang');
  const [statusPks, setStatusPks] = useState('Semua');
  const [statusPersetujuan, setStatusPersetujuan] = useState('Semua Status Persetujuan');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sample data fallback matching Screenshot 1 mockup
  const sampleRiwayatData = [
    {
      id: 1,
      pksId: 101,
      nomorPKS: 'PKS/2024/001',
      namaPerusahaan: 'RSUD Dr. Soetomo',
      mitraCategory: 'Provider Kesehatan',
      bidang: 'Pelayanan',
      statusPks: 'Aktif',
      statusPersetujuan: 'Disetujui',
      aktivitasTerakhir: 'Pembaruan Berkas',
      tanggal: '24 Okt 2024',
    },
    {
      id: 2,
      pksId: 102,
      nomorPKS: 'PKS/2024/052',
      namaPerusahaan: 'PT Astra International',
      mitraCategory: 'Partner Logistik',
      bidang: 'IW',
      statusPks: 'Draft',
      statusPersetujuan: 'Menunggu Pimpinan',
      aktivitasTerakhir: 'Pengajuan Draft',
      tanggal: '23 Okt 2024',
    },
    {
      id: 3,
      pksId: 103,
      nomorPKS: 'PKS/2023/118',
      namaPerusahaan: 'Bank Mandiri (Persero)',
      mitraCategory: 'Fasilitas Perbankan',
      bidang: 'SW',
      statusPks: 'Segera Berakhir',
      statusPersetujuan: 'Disetujui',
      aktivitasTerakhir: 'Notifikasi Kadaluarsa',
      tanggal: '22 Okt 2024',
    },
    {
      id: 4,
      pksId: 104,
      nomorPKS: 'PKS/2022/902',
      namaPerusahaan: 'RS Siloam Karawaci',
      mitraCategory: 'Provider Kesehatan',
      bidang: 'Pelayanan',
      statusPks: 'Berakhir',
      statusPersetujuan: 'Ditolak',
      aktivitasTerakhir: 'Penolakan Perpanjangan',
      tanggal: '20 Okt 2024',
    },
  ];

  const fetchRiwayatData = async () => {
    setLoading(true);
    try {
      const res = await pksService.getPksList({ per_page: 100 });
      if (res.success && res.data) {
        const rawData = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
        if (rawData.length > 0) {
          const mapped = rawData.map((item, idx) => ({
            id: item.pksId || idx + 1,
            pksId: item.pksId,
            nomorPKS: item.nomorPKS || `PKS/2024/${String(idx + 1).padStart(3, '0')}`,
            namaPerusahaan: item.mitra?.namaPerusahaan || item.namaMitra || 'Perusahaan Mitra',
            mitraCategory: item.mitra?.jenisMitra || 'Partner Kerjasama',
            bidang: item.bidang || 'Pelayanan',
            statusPks: item.statusPks || item.status || 'Aktif',
            statusPersetujuan: item.statusPersetujuan || 'Disetujui',
            aktivitasTerakhir: item.statusPersetujuan === 'Draft' ? 'Pengajuan Draft' : 'Pembaruan Berkas',
            tanggal: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '24 Okt 2024',
          }));
          setRiwayatList(mapped);
        } else {
          setRiwayatList(sampleRiwayatData);
        }
      } else {
        setRiwayatList(sampleRiwayatData);
      }
    } catch (err) {
      setRiwayatList(sampleRiwayatData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayatData();
  }, []);

  const handleResetFilter = () => {
    setSearchQuery('');
    setUrutan('Terbaru');
    setBidang('Semua Bidang');
    setStatusPks('Semua');
    setStatusPersetujuan('Semua Status Persetujuan');
  };

  // Filter Logic
  const filteredData = riwayatList.filter((item) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nomor = (item.nomorPKS || '').toLowerCase();
      const mitra = (item.namaPerusahaan || '').toLowerCase();
      if (!nomor.includes(q) && !mitra.includes(q)) return false;
    }

    if (bidang !== 'Semua Bidang' && item.bidang !== bidang) return false;
    if (statusPks !== 'Semua' && item.statusPks !== statusPks) return false;
    if (statusPersetujuan !== 'Semua Status Persetujuan' && item.statusPersetujuan !== statusPersetujuan) return false;

    return true;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Halaman */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Riwayat Perubahan / Persetujuan PKS</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Lihat seluruh riwayat aktivitas, perubahan, dan proses persetujuan PKS sebagai jejak audit sistem.
        </p>
      </div>

      {/* 2. Ringkasan 4 Kartu Statistik (Matching Screenshot 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total PKS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2238] text-white flex items-center justify-center font-bold shrink-0">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total PKS</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{summary.totalPks}</p>
          </div>
        </div>

        {/* Card 2: Total Aktivitas */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3B82F6] text-white flex items-center justify-center font-bold shrink-0">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Aktivitas</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{summary.totalAktivitas}</p>
          </div>
        </div>

        {/* Card 3: Aktivitas Hari Ini */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aktivitas Hari Ini</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{summary.aktivitasHariIni}</p>
          </div>
        </div>

        {/* Card 4: PKS Aktif */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PKS Aktif</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{summary.pksAktif}</p>
          </div>
        </div>

      </div>

      {/* 3. Section Filter Data Riwayat (Matching Screenshot 1) */}
      <div className="bg-[#F4F7FA] rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        
        {/* Row 1: Search Input + Button Terapkan Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari nomor PKS atau nama perusahaan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-slate-700"
            />
          </div>

          <button
            type="button"
            onClick={fetchRiwayatData}
            className="px-6 py-2.5 bg-[#0F2238] hover:bg-[#0A1828] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer shrink-0 w-full sm:w-auto flex items-center justify-center"
          >
            <Filter className="w-3.5 h-3.5 mr-2" />
            Terapkan Filter
          </button>
        </div>

        {/* Row 2: 4 Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Urutkan</label>
            <select
              value={urutan}
              onChange={(e) => setUrutan(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Terbaru">Terbaru</option>
              <option value="Terlama">Terlama</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Bidang</label>
            <select
              value={bidang}
              onChange={(e) => setBidang(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Semua Bidang">Semua Bidang</option>
              <option value="Pelayanan">Pelayanan</option>
              <option value="IW">IW</option>
              <option value="SW">SW</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Status PKS</label>
            <select
              value={statusPks}
              onChange={(e) => setStatusPks(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Semua">Semua</option>
              <option value="Draft">Draft</option>
              <option value="Aktif">Aktif</option>
              <option value="Segera Berakhir">Segera Berakhir</option>
              <option value="Berakhir">Berakhir</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Status Persetujuan</label>
            <select
              value={statusPersetujuan}
              onChange={(e) => setStatusPersetujuan(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Semua Status Persetujuan">Semua Status Persetujuan</option>
              <option value="Menunggu Penyerahan">Menunggu Penyerahan</option>
              <option value="Pemeriksaan Pengelola">Pemeriksaan Pengelola</option>
              <option value="Pemeriksaan Kabag">Pemeriksaan Kabag</option>
              <option value="Menunggu Pimpinan">Menunggu Pimpinan</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>

      </div>

      {/* 4. Tabel Daftar Riwayat PKS (Matching Screenshot 1) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">Memuat riwayat PKS...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center space-y-2 py-16">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Tidak Ada Riwayat Ditemukan</p>
            <p className="text-xs text-slate-400">Silakan ubah kata kunci atau kriteria filter Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#EEF4FF] border-b border-slate-200 text-slate-700 font-extrabold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Nomor PKS</th>
                  <th className="px-5 py-3.5">Perusahaan / Instansi</th>
                  <th className="px-4 py-3.5">Bidang</th>
                  <th className="px-4 py-3.5">Status Persetujuan</th>
                  <th className="px-4 py-3.5">Aktivitas Terakhir</th>
                  <th className="px-4 py-3.5">Tanggal</th>
                  <th className="px-4 py-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Nomor PKS */}
                    <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                      {item.nomorPKS}
                    </td>

                    {/* Perusahaan / Instansi */}
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-slate-900 text-xs">{item.namaPerusahaan}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{item.mitraCategory}</p>
                    </td>

                    {/* Bidang */}
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {item.bidang}
                    </td>

                    {/* Status Persetujuan Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold inline-block ${
                        item.statusPersetujuan === 'Disetujui'
                          ? 'bg-blue-100 text-blue-700'
                          : item.statusPersetujuan.includes('Pimpinan') || item.statusPersetujuan.includes('Kabag')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {item.statusPersetujuan}
                      </span>
                    </td>

                    {/* Aktivitas Terakhir */}
                    <td className="px-4 py-4 font-semibold text-slate-800">
                      {item.aktivitasTerakhir}
                    </td>

                    {/* Tanggal */}
                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                      {item.tanggal}
                    </td>

                    {/* Aksi Link */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => setViewingPksData(item)}
                        className="inline-flex items-center text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        Lihat Riwayat <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <p>
            Menampilkan <span className="font-bold text-slate-800">1-10</span> dari{' '}
            <span className="font-bold text-slate-800">1,284</span> entri
          </p>

          <div className="flex items-center space-x-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button className="w-7 h-7 rounded-lg text-xs font-bold bg-[#00529C] text-white shadow-xs">1</button>
            <button className="w-7 h-7 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">2</button>
            <button className="w-7 h-7 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">3</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="w-8 h-7 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">129</button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Modal Riwayat PKS */}
      {viewingPksData && (
        <ModalRiwayatPks
          isOpen={!!viewingPksData}
          pksData={viewingPksData}
          onClose={() => setViewingPksData(null)}
        />
      )}

    </div>
  );
};

export default PksRiwayatPage;

