import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell, Mail, Clock, Calendar, CheckCheck, Trash2,
  AlertTriangle, XCircle, CheckCircle2, Upload, ChevronLeft, ChevronRight, CheckSquare, Layers
} from 'lucide-react';
import { ModalMarkAllNotificationsRead } from './ModalMarkAllNotificationsRead';
import { ModalClearReadNotifications } from './ModalClearReadNotifications';
import { ModalDetailPks } from '../../petugas/ModalDetailPks';
import { ModalDetailAdendum } from '../../petugas/ModalDetailAdendum';
import { ModalUbahPks } from '../../petugas/ModalUbahPks';
import { ModalUbahAdendum } from '../../petugas/ModalUbahAdendum';

export const NotificationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    notifications,
    readNotifIds,
    unreadCount,
    segeraBerakhirCount,
    berakhirCount,
    loading,
    markAsRead,
    markAllAsRead,
    clearRead,
    refreshNotifications
  } = useNotifications();

  // Filters State
  const [statusFilter, setStatusFilter] = useState('Semua'); // Semua, Belum Dibaca, Sudah Dibaca
  const [kategoriFilter, setKategoriFilter] = useState('Semua'); // Semua, Persetujuan, Masa Berlaku, Disetujui, Ditolak

  // Modal States
  const [isMarkAllModalOpen, setIsMarkAllModalOpen] = useState(false);
  const [isClearReadModalOpen, setIsClearReadModalOpen] = useState(false);

  // Document Detail Modal States (Modal Detail PKS & Adendum)
  const [selectedPksId, setSelectedPksId] = useState(null);
  const [selectedAdendumId, setSelectedAdendumId] = useState(null);
  const [editingPksId, setEditingPksId] = useState(null);
  const [editingAdendum, setEditingAdendum] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleActionClick = (n) => {
    markAsRead(n.id);
    if (n.type === 'Persetujuan' || n.type === 'Ditolak') {
      navigate('/approval');
    } else {
      // Tombol "Lihat Berkas" -> Membuka Modal Detail langsung tanpa pindah halaman
      if (n.tipeDokumen === 'Adendum') {
        setSelectedAdendumId(n.targetId);
      } else {
        setSelectedPksId(n.targetId);
      }
    }
  };

  // Filter Data (Opsi A: Fokus Masa Berlaku)
  const filteredList = notifications.filter(item => {
    const isRead = readNotifIds.includes(item.id);
    if (statusFilter === 'Belum Dibaca' && isRead) return false;
    if (statusFilter === 'Sudah Dibaca' && !isRead) return false;

    if (kategoriFilter === 'Segera Berakhir') {
      const isSegeraBerakhir = item.type === 'Masa Berlaku' && item.status?.includes('hari');
      if (!isSegeraBerakhir) return false;
    } else if (kategoriFilter === 'Telah Berakhir') {
      const isTelahBerakhir = item.type === 'Masa Berlaku' && item.status === 'Telah Berakhir';
      if (!isTelahBerakhir) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const paginatedList = filteredList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Halaman */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Notifikasi Masa Berlaku PKS</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Pusat peringatan dini status masa berlaku dokumen PKS & Adendum rekanan (Segera Berakhir dan Telah Berakhir).
        </p>
      </div>

      {/* 2. 4 Stat Cards (Dapat Diklik sebagai Shortcut Filter) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Belum Dibaca */}
        <div 
          onClick={() => {
            setStatusFilter('Belum Dibaca');
            setKategoriFilter('Semua');
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 border shadow-2xs flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
            statusFilter === 'Belum Dibaca' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'
          }`}
          title="Klik untuk filter notifikasi Belum Dibaca"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Belum Dibaca</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{unreadCount}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Notifikasi */}
        <div 
          onClick={() => {
            setStatusFilter('Semua');
            setKategoriFilter('Semua');
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 border shadow-2xs flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
            statusFilter === 'Semua' && kategoriFilter === 'Semua' ? 'border-[#00529C] ring-2 ring-blue-100' : 'border-slate-200'
          }`}
          title="Klik untuk menampilkan Semua Notifikasi"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Notifikasi</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{notifications.length}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: PKS Segera Berakhir */}
        <div 
          onClick={() => {
            setKategoriFilter('Segera Berakhir');
            setStatusFilter('Semua');
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 border shadow-2xs flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
            kategoriFilter === 'Segera Berakhir' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-slate-200'
          }`}
          title="Klik untuk filter PKS Segera Berakhir"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PKS Segera Berakhir</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{segeraBerakhirCount}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: PKS Berakhir */}
        <div 
          onClick={() => {
            setKategoriFilter('Telah Berakhir');
            setStatusFilter('Semua');
            setCurrentPage(1);
          }}
          className={`bg-white rounded-2xl p-4 border shadow-2xs flex items-center justify-between cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
            kategoriFilter === 'Telah Berakhir' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-slate-200'
          }`}
          title="Klik untuk filter PKS Telah Berakhir"
        >
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PKS Berakhir</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{berakhirCount}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. Action Buttons & Filter Row */}
      <div className="space-y-4">
        
        {/* Bulk Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMarkAllModalOpen(true)}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-2xs flex items-center cursor-pointer transition-all"
          >
            <CheckCheck className="w-4 h-4 mr-2 text-blue-600" />
            Tandai Semua Sudah Dibaca
          </button>

          <button
            onClick={() => setIsClearReadModalOpen(true)}
            className="px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-xl shadow-2xs flex items-center cursor-pointer transition-all"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Bersihkan Notifikasi Dibaca
          </button>
        </div>

        {/* Status Filter & Kategori Pill Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-500">Status:</span>
            <div className="p-1 bg-slate-100 rounded-xl flex items-center space-x-1">
              {['Semua', 'Belum Dibaca', 'Sudah Dibaca'].map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori Filter (Opsi A: Fokus Masa Berlaku) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            <span className="font-semibold text-slate-500 shrink-0">Kategori:</span>
            <div className="flex items-center space-x-1.5">
              {['Semua', 'Segera Berakhir', 'Telah Berakhir'].map(kat => (
                <button
                  key={kat}
                  onClick={() => {
                    setKategoriFilter(kat);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                    kategoriFilter === kat
                      ? 'bg-[#001D38] text-white border-[#001D38] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 4. Daftar Kartu Notifikasi */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            Menghubungkan notifikasi dokumen sistem...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            Tidak ada notifikasi untuk kategori ini.
          </div>
        ) : (
          paginatedList.map((n) => {
            const IconComp = n.icon || Bell;
            const isRead = readNotifIds.includes(n.id);

            return (
              <div
                key={n.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                  !isRead ? 'ring-1 ring-blue-100 bg-blue-50/10' : ''
                } ${
                  n.color === 'blue'
                    ? 'border-l-4 border-l-blue-600 border-slate-200'
                    : n.color === 'amber'
                    ? 'border-l-4 border-l-amber-500 border-slate-200'
                    : n.color === 'rose'
                    ? 'border-l-4 border-l-rose-500 border-slate-200'
                    : n.color === 'emerald'
                    ? 'border-l-4 border-l-emerald-500 border-slate-200'
                    : 'border-l-4 border-l-purple-600 border-slate-200'
                }`}
              >
                <div className="flex items-start space-x-4 flex-1">
                  {/* Left Icon Box */}
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                    n.color === 'blue'
                      ? 'bg-blue-100 text-blue-600'
                      : n.color === 'amber'
                      ? 'bg-amber-100 text-amber-600'
                      : n.color === 'rose'
                      ? 'bg-rose-100 text-rose-600'
                      : n.color === 'emerald'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>

                  {/* Content Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md tracking-wider ${
                        n.color === 'blue'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : n.color === 'amber'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : n.color === 'rose'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : n.color === 'emerald'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {n.type === 'Masa Berlaku' ? (n.status === 'Telah Berakhir' ? 'Telah Berakhir' : 'Segera Berakhir') : n.type}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {n.tipeDokumen}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(n.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" title="Belum dibaca" />
                      )}
                    </div>

                    <h3
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.tipeDokumen === 'Adendum') {
                          setSelectedAdendumId(n.targetId);
                        } else {
                          setSelectedPksId(n.targetId);
                        }
                      }}
                      className="text-sm font-extrabold text-slate-900 hover:text-[#00529C] transition-colors cursor-pointer"
                      title="Klik untuk membuka detail berkas"
                    >
                      {n.title}
                    </h3>
                    {n.description && (
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.description}</p>
                    )}

                    {/* Catatan Revisi / Alasan jika ada */}
                    {n.reasonText && (
                      <div className="mt-2.5 p-3 rounded-xl bg-rose-50/70 border-l-4 border-l-rose-500 border border-rose-200 text-xs space-y-1 max-w-2xl">
                        <p className="font-bold text-rose-700">Catatan Revisi:</p>
                        <p className="text-slate-700 italic font-medium">"{n.reasonText}"</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="shrink-0 pt-2 md:pt-0">
                  <button
                    onClick={() => handleActionClick(n)}
                    className="px-4 py-2 bg-[#00529C] hover:bg-[#003E75] text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center"
                  >
                    {n.type === 'Persetujuan' ? 'Tinjau Persetujuan' : n.type === 'Ditolak' ? 'Perbaiki Berkas' : 'Lihat Berkas'}
                  </button>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* 5. Pagination Footer */}
      {filteredList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium shadow-2xs">
          <p>
            Menampilkan <span className="font-bold text-slate-800">{paginatedList.length}</span> dari{' '}
            <span className="font-bold text-slate-800">{filteredList.length}</span> notifikasi
          </p>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border border-slate-200 ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-700">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border border-slate-200 ${currentPage === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals Notifikasi */}
      <ModalMarkAllNotificationsRead
        isOpen={isMarkAllModalOpen}
        onClose={() => setIsMarkAllModalOpen(false)}
        onConfirm={markAllAsRead}
      />

      <ModalClearReadNotifications
        isOpen={isClearReadModalOpen}
        onClose={() => setIsClearReadModalOpen(false)}
        onConfirm={clearRead}
      />

      {/* Modal Detail PKS (Muncul langsung saat klik Lihat Berkas) */}
      {selectedPksId && (
        <ModalDetailPks
          isOpen={!!selectedPksId}
          pksId={selectedPksId}
          onClose={() => setSelectedPksId(null)}
          onEditClick={(pks) => {
            setSelectedPksId(null);
            setEditingPksId(pks.pksId || pks.id || selectedPksId);
          }}
          onSuccess={() => {
            refreshNotifications();
            setSelectedPksId(null);
          }}
        />
      )}

      {/* Modal Detail Adendum (Muncul langsung saat klik Lihat Berkas Adendum) */}
      {selectedAdendumId && (
        <ModalDetailAdendum
          isOpen={!!selectedAdendumId}
          adendumId={selectedAdendumId}
          onClose={() => setSelectedAdendumId(null)}
          onEditClick={(adData) => {
            setSelectedAdendumId(null);
            setEditingAdendum(adData);
          }}
          onSuccess={() => {
            refreshNotifications();
            setSelectedAdendumId(null);
          }}
        />
      )}

      {/* Modal Ubah PKS (jika Petugas memilih ubah data dari modal detail) */}
      {editingPksId && (
        <ModalUbahPks
          isOpen={!!editingPksId}
          pksId={editingPksId}
          onClose={() => setEditingPksId(null)}
          onSuccess={() => {
            setEditingPksId(null);
            refreshNotifications();
          }}
        />
      )}

      {/* Modal Ubah Adendum (jika Petugas memilih ubah adendum) */}
      {editingAdendum && (
        <ModalUbahAdendum
          isOpen={!!editingAdendum}
          adendumId={editingAdendum?.adendumId || editingAdendum?.id}
          adendumData={editingAdendum}
          pksData={editingAdendum?.pksDocument}
          onClose={() => setEditingAdendum(null)}
          onSuccess={() => {
            setEditingAdendum(null);
            refreshNotifications();
          }}
        />
      )}
    </div>
  );
};
