import React, { useState, useEffect } from 'react';
import { pksService } from '../services/pksService';
import { StatusBadge } from '../components/StatusBadge';
import { ModalDetailPersetujuanPks } from './ModalDetailPersetujuanPks';
import {
  RotateCcw, Eye, ChevronLeft, ChevronRight, CheckSquare,
  TrendingUp, AlertCircle, FileText
} from 'lucide-react';

export const PersetujuanPksPage = () => {
  const [loading, setLoading] = useState(true);
  const [pksList, setPksList] = useState([]);
  const [selectedPksItem, setSelectedPksItem] = useState(null);

  // Filter States
  const [bidangFilter, setBidangFilter] = useState('Semua Bidang');
  const [statusPersetujuanFilter, setStatusPersetujuanFilter] = useState('Semua Status');
  const [urutan, setUrutan] = useState('Terbaru');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;



  const fetchApprovalData = async () => {
    setLoading(true);
    try {
      const res = await pksService.getPksList({ per_page: 100 });
      if (res.success && res.data) {
        const rawData = Array.isArray(res.data) ? res.data : [];
        if (rawData.length > 0) {
          const mapped = rawData.map((item, idx) => ({
            pksId: item.pksId || item.id,
            nomorPKS: item.nomor_pks || item.nomorPKS || '-',
            jenisTag: item.jenis_pks || item.jenisPKS || '-',
            bidang: item.bidang || '-',
            jenisPKS: item.jenis_pks || item.jenisPKS || '-',
            tanggalMulai: item.tanggal_mulai || item.tanggalMulai || '-',
            tanggalBerakhir: item.tanggal_berakhir || item.tanggalBerakhir || '-',
            perusahaan: item.mitra?.nama_mitra || item.mitra?.namaPerusahaan || '-',
            alamat: item.mitra?.alamat_mitra || item.mitra?.alamat || '-',
            penanggungJawab: item.mitra?.nama_pengelola || item.mitra?.namaPenanggungJawab || '-',
            jabatan: '-',
            nomorTelepon: item.mitra?.no_hp_pengelola || item.mitra?.telepon || '-',
            email: item.mitra?.email_pengelola || item.mitra?.email || '-',
            petugas: item.pengguna?.nama_pengguna || item.pembuat?.nama || '-',
            tglPengajuan: (item.created_at || item.createdAt) ? new Date(item.created_at || item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-',
            statusPks: item.status_pks || item.statusPks || item.status || 'Draf',
            statusPersetujuan: item.status_persetujuan || item.statusPersetujuan || 'Draf',
          }));
          setPksList(mapped);
        } else {
          setPksList([]);
        }
      } else {
        setPksList([]);
      }
    } catch (err) {
      setPksList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalData();
  }, []);

  const handleResetFilter = () => {
    setBidangFilter('Semua Bidang');
    setStatusPersetujuanFilter('Semua Status');
    setUrutan('Terbaru');
  };

  const handleStatusUpdated = async (action, alasan) => {
    if (!selectedPksItem) return;
    const id = selectedPksItem.pksId;
    const status = selectedPksItem.statusPersetujuan;
    
    try {
      setLoading(true);
      if (action === 'Disetujui') {
        if (status.includes('Pengelola')) await pksService.setujuiPengelola(id);
        else if (status.includes('Kabag')) await pksService.setujuiKabag(id);
        else if (status.includes('Pimpinan')) await pksService.setujuiPimpinan(id);
      } else {
        if (status.includes('Pengelola')) await pksService.tolakPengelola(id, alasan);
        else if (status.includes('Kabag')) await pksService.tolakKabag(id, alasan);
        else if (status.includes('Pimpinan')) await pksService.tolakPimpinan(id, alasan);
      }
      
      await fetchApprovalData();
      setSelectedPksItem(null);
    } catch (err) {
      alert('Gagal memproses persetujuan. Silakan coba lagi.');
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredData = pksList.filter(item => {
    if (bidangFilter !== 'Semua Bidang' && item.bidang !== bidangFilter) return false;
    if (statusPersetujuanFilter !== 'Semua Status' && item.statusPersetujuan !== statusPersetujuanFilter) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Header Page */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Persetujuan Dokumen PKS</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Lakukan pemeriksaan dan persetujuan terhadap PKS yang sedang menunggu tindakan Anda.
        </p>
      </div>

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Menunggu Persetujuan Saya */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs relative overflow-hidden flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Menunggu Persetujuan Saya</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">0</p>
            <p className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-2">
              📋 Perlu tindakan segera
            </p>
          </div>
          <FileText className="w-16 h-16 text-slate-100 absolute -right-2 -bottom-2 pointer-events-none" />
        </div>

        {/* Card 2: Disetujui Hari Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Disetujui Hari Ini</p>
            <p className="text-3xl font-extrabold text-blue-600 mt-1">0</p>
            <p className="text-[10px] text-emerald-600 font-bold flex items-center mt-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-extrabold text-[10px] mr-1">✓</span>
              +2 dari kemarin
            </p>
          </div>
        </div>

        {/* Card 3: Ditolak Hari Ini */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400">Ditolak Hari Ini</p>
            <p className="text-3xl font-extrabold text-rose-600 mt-1">0</p>
            <p className="text-[10px] text-rose-600 font-bold flex items-center mt-2">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-extrabold text-[10px] mr-1">✕</span>
              Memerlukan revisi
            </p>
          </div>
        </div>

        {/* Card 4: Total Persetujuan Bulan Ini (Dark Navy Blue) */}
        <div className="bg-[#0F2238] text-white rounded-2xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-slate-300">Total Persetujuan Bulan Ini</p>
            <p className="text-3xl font-extrabold text-white mt-1">0</p>
          </div>
          <p className="text-[10px] text-sky-300 font-semibold flex items-center mt-2">
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-sky-300" />
            85% dari target KPI
          </p>
        </div>
      </div>

      {/* 3. Section Filter Data */}
      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* BIDANG */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">BIDANG</label>
            <select
              value={bidangFilter}
              onChange={(e) => setBidangFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="Semua Bidang">Semua Bidang</option>
              <option value="IW">IW</option>
              <option value="SW">SW</option>
              <option value="Pelayanan">Pelayanan</option>
            </select>
          </div>

          {/* STATUS PERSETUJUAN */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">STATUS PERSETUJUAN</label>
            <select
              value={statusPersetujuanFilter}
              onChange={(e) => setStatusPersetujuanFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Menunggu Persetujuan Kabag">Menunggu Persetujuan Kabag</option>
              <option value="Menunggu Persetujuan Pimpinan">Menunggu Persetujuan Pimpinan</option>
              <option value="Menunggu Pemeriksaan Pengelola">Menunggu Pemeriksaan Pengelola</option>
              <option value="Disetujui">Disetujui</option>
            </select>
          </div>

          {/* URUTKAN */}
          <div>
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">URUTKAN</label>
            <select
              value={urutan}
              onChange={(e) => setUrutan(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="Terbaru">Terbaru</option>
              <option value="Terlama">Terlama</option>
            </select>
          </div>

          {/* Reset Filter Button */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilter}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl transition-all cursor-pointer h-[38px]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* 4. Tabel Persetujuan PKS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Memuat PKS persetujuan...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak Ada PKS Membutuhkan Persetujuan</p>
            <p className="text-xs text-slate-400">Seluruh permohonan persetujuan telah diproses.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-blue-50/60 border-b border-slate-100 text-slate-700 font-extrabold text-[11px]">
                <tr>
                  <th className="px-6 py-4">Nomor PKS</th>
                  <th className="px-4 py-4">Bidang</th>
                  <th className="px-6 py-4">Perusahaan / Instansi</th>
                  <th className="px-4 py-4">Petugas JR</th>
                  <th className="px-4 py-4">Tgl Pengajuan</th>
                  <th className="px-4 py-4">Status PKS</th>
                  <th className="px-4 py-4">Status Persetujuan</th>
                  <th className="px-4 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((item) => (
                  <tr key={item.pksId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Nomor PKS */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-extrabold text-slate-900 text-xs">{item.nomorPKS}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.jenisTag}</p>
                    </td>

                    {/* Bidang Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase ${
                        item.bidang === 'IW'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : item.bidang === 'SW'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {item.bidang}
                      </span>
                    </td>

                    {/* Perusahaan / Instansi */}
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {item.perusahaan}
                    </td>

                    {/* Petugas JR */}
                    <td className="px-4 py-4 font-medium text-slate-700 whitespace-nowrap">
                      {item.petugas}
                    </td>

                    {/* Tgl Pengajuan */}
                    <td className="px-4 py-4 text-slate-600 whitespace-nowrap">
                      {item.tglPengajuan}
                    </td>

                    {/* Status PKS Badge */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={item.statusPks} />
                    </td>

                    {/* Status Persetujuan Indicator */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <span className={`w-1.5 h-3 rounded-full shrink-0 ${
                          item.statusPersetujuan.includes('Disetujui')
                            ? 'bg-emerald-500'
                            : item.statusPersetujuan.includes('Pengelola')
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`} />
                        <span className={`text-xs font-bold ${
                          item.statusPersetujuan.includes('Disetujui')
                            ? 'text-emerald-700'
                            : item.statusPersetujuan.includes('Pengelola')
                            ? 'text-amber-700'
                            : 'text-blue-700'
                        }`}>
                          {item.statusPersetujuan}
                        </span>
                      </div>
                    </td>

                    {/* Aksi Button */}
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setSelectedPksItem(item)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition-all cursor-pointer"
                      >
                        Lihat Detail <Eye className="w-3.5 h-3.5 ml-1" />
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
            Menampilkan <span className="font-bold text-slate-800">1 - {filteredData.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{filteredData.length}</span> PKS yang membutuhkan persetujuan
          </p>

          <div className="flex items-center space-x-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button className="w-7 h-7 rounded-lg text-xs font-bold bg-[#00529C] text-white">1</button>
            <button className="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">2</button>
            <button className="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">3</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="w-7 h-7 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100">4</button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Persetujuan PKS */}
      {selectedPksItem && (
        <ModalDetailPersetujuanPks
          isOpen={!!selectedPksItem}
          pksData={selectedPksItem}
          onClose={() => setSelectedPksItem(null)}
          onStatusUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
};

export default PersetujuanPksPage;


