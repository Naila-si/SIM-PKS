import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { pksService } from '../services/pksService';
import { useAuth } from '../context/AuthContext';
import {
  History as HistoryIcon, Clock, User, Activity, Search,
  ChevronLeft, ChevronRight, FileText
} from 'lucide-react';

// Helper component for formatting JSON nicely
const FormatJsonValues = ({ data, textColor, borderColor, bgColor }) => {
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return <div className={`p-3 rounded-lg border border-dashed ${borderColor} bg-white/50 flex items-center justify-center text-xs italic ${textColor} opacity-70`}>Tidak ada data yang tersedia</div>;
  }
  
  const formatDateString = (val) => {
    if (typeof val === 'string' && (val.includes('T') || val.match(/^\d{4}-\d{2}-\d{2}/))) {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString('id-ID', {
          day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute:'2-digit', second: '2-digit'
        });
      }
    }
    return val;
  };

  return (
    <div className={`space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar`}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className={`flex flex-col p-2.5 rounded-lg border ${borderColor} ${bgColor} transition-all duration-200 hover:shadow-sm`}>
          <span className={`text-[9px] font-extrabold uppercase tracking-wider mb-0.5 ${textColor} opacity-75`}>
            {key.replace(/_/g, ' ')}
          </span>
          <span className={`text-xs font-semibold ${textColor} break-words`}>
            {value === null || value === '' ? <span className="opacity-50 italic">Kosong</span> : String(formatDateString(value))}
          </span>
        </div>
      ))}
    </div>
  );
};

// A modern Modal to show Old vs New Values
const ModalDetailLog = ({ isOpen, onClose, log }) => {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0F2238] to-[#1a365d] text-white flex justify-between items-center shrink-0 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <Activity className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-wide">Detail Perubahan Data</h2>
              <p className="text-[10px] text-blue-200 font-medium">Bandingkan versi sebelum dan sesudah aktivitas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/20 rounded-full text-slate-300 hover:text-white transition-all">
            <span className="sr-only">Tutup</span>
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center text-slate-400 mb-1 space-x-1.5">
                <User className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Aktor / Pengguna</span>
              </div>
              <p className="font-extrabold text-slate-800 text-sm">{log.user?.nama || log.user?.nama_pengguna || 'Sistem (Otomatis)'}</p>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center text-slate-400 mb-1 space-x-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Waktu Aktivitas</span>
              </div>
              <p className="font-extrabold text-slate-800 text-sm">{new Date(log.created_at).toLocaleString('id-ID', {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit'})}</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center text-slate-400 mb-1 space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Aktivitas</span>
              </div>
              <p className="font-extrabold text-blue-600 text-sm">{log.description}</p>
            </div>
          </div>
          
          {/* Comparison Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Old Data */}
            <div className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="px-5 py-3 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <h3 className="font-extrabold text-rose-800 text-xs uppercase tracking-wide">Data Lama</h3>
                </div>
                <span className="text-[9px] font-bold text-rose-600 bg-rose-200/50 px-2 py-0.5 rounded-full">Sebelum</span>
              </div>
              <div className="p-4 flex-1">
                <FormatJsonValues 
                  data={log.old_values} 
                  textColor="text-rose-700" 
                  borderColor="border-rose-100" 
                  bgColor="bg-rose-50/30"
                />
              </div>
            </div>

            {/* New Data */}
            <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <h3 className="font-extrabold text-emerald-800 text-xs uppercase tracking-wide">Data Baru</h3>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-200/50 px-2 py-0.5 rounded-full">Sesudah</span>
              </div>
              <div className="p-4 flex-1">
                <FormatJsonValues 
                  data={log.new_values} 
                  textColor="text-emerald-700" 
                  borderColor="border-emerald-100" 
                  bgColor="bg-emerald-50/30"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end shrink-0">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all duration-200 focus:ring-2 focus:ring-slate-300 focus:outline-none"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export const PksRiwayatPage = () => {
  const { user } = useAuth();
  
  if (user?.role !== 'admin_utama') {
    return <Navigate to="/dashboard" replace />;
  }

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [viewingLog, setViewingLog] = useState(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('Semua Aksi');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Realtime Polling state (just a trigger)
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await pksService.getSystemLogs();
      if (res.success) {
        setLogs(res.data);
      }
    } catch (err) {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      fetchLogs();
      setLastRefreshed(new Date());
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (actionFilter !== 'Semua Aksi' && log.action !== actionFilter) return false;
    
    if (startDate) {
      const logDate = new Date(log.created_at);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (logDate < start) return false;
    }
    
    if (endDate) {
      const logDate = new Date(log.created_at);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (logDate > end) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const desc = (log.description || '').toLowerCase();
      const userName = (log.user?.nama || log.user?.nama_pengguna || '').toLowerCase();
      if (!desc.includes(q) && !userName.includes(q)) return false;
    }
    return true;
  });

  const handleExport = () => {
    if (filteredLogs.length === 0) return alert('Tidak ada data untuk diekspor');
    
    // Convert to CSV
    const headers = ['Waktu', 'Aktor/Pengguna', 'Jabatan/Peran', 'Deskripsi Aktivitas', 'Tipe Aksi'];
    const rows = filteredLogs.map(log => {
      const time = new Date(log.created_at).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }).replace(',', '');
      
      const user = log.user?.nama || log.user?.nama_pengguna || 'Sistem (Otomatis)';
      const role = log.user?.jabatan || '-';
      const desc = `"${(log.description || '').replace(/"/g, '""')}"`;
      const action = log.action ? log.action.toUpperCase() : '-';
      
      return `${time},"${user}","${role}",${desc},"${action}"`;
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Audit_Trail_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Log Aktivitas Sistem (Audit Trail)</h1>
            <span className="flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau seluruh jejak aktivitas pengguna secara real-time. Diperbarui terakhir: {lastRefreshed.toLocaleTimeString('id-ID')}
          </p>
        </div>
        
        <button 
          onClick={handleExport}
          className="inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Laporan (CSV)
        </button>
      </div>

      {/* 2. Filter Area */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col xl:flex-row gap-4 justify-between items-end">
        <div className="flex-1 w-full relative">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Pencarian</label>
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-[28px]" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama pelaku atau deskripsi aktivitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
        
        <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Mulai Tanggal</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-40 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Sampai Tanggal</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-40 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tipe Aksi</label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full sm:w-48 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="Semua Aksi">Semua Tipe Aksi</option>
              <option value="created">Dibuat (Created)</option>
              <option value="updated">Diperbarui (Updated)</option>
              <option value="deleted">Dihapus (Deleted)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Tabel List Riwayat */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center">
             <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
             Memuat data log CCTV...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-2 py-16">
            <HistoryIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Tidak Ada Rekaman Aktivitas</p>
            <p className="text-xs text-slate-400">Belum ada pergerakan atau perubahan data yang tercatat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#EEF4FF] border-b border-slate-200 text-slate-700 font-extrabold text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Waktu</th>
                  <th className="px-5 py-3.5">Aktor / Pengguna</th>
                  <th className="px-4 py-3.5">Jabatan / Peran</th>
                  <th className="px-5 py-3.5">Deskripsi Aktivitas</th>
                  <th className="px-4 py-3.5">Tipe Aksi</th>
                  <th className="px-4 py-3.5 text-center">Detail Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.created_at).toLocaleString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-slate-600" />
                        </div>
                        <span className="font-extrabold text-slate-800">
                          {log.user?.nama || log.user?.nama_pengguna || 'Sistem (Otomatis)'}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-semibold text-[10px]">
                        {log.user?.jabatan || '-'}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {log.description}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-extrabold inline-block ${
                        log.action === 'created' ? 'bg-emerald-100 text-emerald-700' :
                        log.action === 'updated' ? 'bg-blue-100 text-blue-700' :
                        log.action === 'deleted' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {(log.action || '-').toUpperCase()}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button 
                        onClick={() => setViewingLog(log)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#0F2238] hover:bg-[#1a365d] text-white text-[10px] font-bold rounded-lg transition-colors"
                      >
                        <Activity className="w-3 h-3" />
                        <span>Bandingkan</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Pagination */}
      {filteredLogs.length > itemsPerPage && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</strong> - <strong className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</strong> dari <strong className="text-slate-800">{filteredLogs.length}</strong> aktivitas
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ModalDetailLog isOpen={!!viewingLog} onClose={() => setViewingLog(null)} log={viewingLog} />
    </div>
  );
};
