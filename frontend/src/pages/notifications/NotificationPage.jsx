import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { pksService } from '../../services/pksService';
import {
  Bell, Mail, Clock, Calendar, CheckCheck, Trash2, UserCheck,
  AlertTriangle, XCircle, CheckCircle2, Upload, ChevronLeft, ChevronRight
} from 'lucide-react';
import { ModalMarkAllNotificationsRead } from './ModalMarkAllNotificationsRead';
import { ModalClearReadNotifications } from './ModalClearReadNotifications';

export const NotificationPage = () => {
  const navigate = useNavigate();

  const { user } = useAuth();
  
  // State Stats
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [segeraBerakhirCount, setSegeraBerakhirCount] = useState(0);
  const [berakhirCount, setBerakhirCount] = useState(0);

  // Filters State
  const [statusFilter, setStatusFilter] = useState('Semua'); // Semua, Belum Dibaca, Sudah Dibaca
  const [kategoriFilter, setKategoriFilter] = useState('Semua'); // Semua, Persetujuan, Masa Berlaku, Disetujui, Ditolak, Dokumen Final

  // Modal States
  const [isMarkAllModalOpen, setIsMarkAllModalOpen] = useState(false);
  const [isClearReadModalOpen, setIsClearReadModalOpen] = useState(false);

  const [notificationList, setNotificationList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDataAndGenerateNotifications();
  }, [user]);

  const fetchDataAndGenerateNotifications = async () => {
    setLoading(true);
    try {
      const res = await pksService.getPksList({ per_page: 500 });
      if (res.success && Array.isArray(res.data)) {
        generateNotifications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = (pksList) => {
    const notifs = [];
    let idCounter = 1;
    const now = new Date();
    
    let uCount = 0;
    let sCount = 0;
    let bCount = 0;

    pksList.forEach(pks => {
      const status = pks.statusPersetujuan || '';
      const tglBerakhir = pks.tanggalBerakhir || pks.tanggal_berakhir;
      
      // 1. Approval Notifications
      if (
         (status === 'Menunggu Pemeriksaan Pengelola' && (user?.role === 'pengelola_pks' || user?.role === 'pengelola')) ||
         (status === 'Menunggu Persetujuan Kabag' && user?.role === 'kabag') ||
         (status === 'Menunggu Persetujuan Pimpinan' && user?.role === 'pimpinan') ||
         (status.includes('Menunggu') && user?.role === 'admin_utama')
      ) {
        notifs.push({
          id: idCounter++,
          pksId: pks.pksId || pks.id,
          title: `Persetujuan Dibutuhkan: ${pks.nomorPKS || pks.nomor_pks}`,
          description: `PKS dengan mitra ${pks.perusahaan || pks.mitra?.nama_mitra} sedang ${status}. Harap segera ditinjau.`,
          type: 'Persetujuan',
          timestamp: new Date().toLocaleDateString('id-ID'),
          statusBaca: 'Belum Dibaca',
          color: 'blue',
          icon: Clock,
          actionText: 'Tinjau Persetujuan',
          actionType: 'solid'
        });
        uCount++;
      }

      // 2. Petugas JR Notifications
      if (user?.role === 'petugas_jr' || user?.role === 'admin_utama') {
        if (status === 'Disetujui') {
          notifs.push({
            id: idCounter++,
            pksId: pks.pksId || pks.id,
            title: `PKS Disetujui: ${pks.nomorPKS || pks.nomor_pks}`,
            description: `Dokumen PKS Anda telah disetujui sepenuhnya oleh Pimpinan.`,
            type: 'Disetujui',
            timestamp: new Date().toLocaleDateString('id-ID'),
            statusBaca: 'Sudah Dibaca', 
            color: 'emerald',
            icon: CheckCircle2,
            actionText: 'Lihat Detail PKS',
            actionType: 'outline'
          });
        }
        if (status.includes('Ditolak') || status.includes('Revisi')) {
          notifs.push({
            id: idCounter++,
            pksId: pks.pksId || pks.id,
            title: `PKS Dikembalikan: ${pks.nomorPKS || pks.nomor_pks}`,
            description: `PKS Anda memerlukan revisi.`,
            reasonText: pks.catatan_revisi || 'Ada perbaikan yang harus dilakukan.',
            type: 'Ditolak',
            timestamp: new Date().toLocaleDateString('id-ID'),
            statusBaca: 'Belum Dibaca', 
            color: 'rose',
            icon: AlertTriangle,
            actionText: 'Revisi PKS',
            actionType: 'solid'
          });
          uCount++;
        }
      }

      // 3. Masa Berlaku
      if (tglBerakhir && pks.statusPks === 'Aktif') {
        const endDate = new Date(tglBerakhir);
        const diffTime = endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 30 && diffDays > 0) {
          sCount++;
          notifs.push({
            id: idCounter++,
            pksId: pks.pksId || pks.id,
            title: `PKS Segera Berakhir: ${pks.nomorPKS || pks.nomor_pks}`,
            description: `Masa berlaku PKS tinggal ${diffDays} hari lagi (Batas: ${endDate.toLocaleDateString('id-ID')}).`,
            type: 'Masa Berlaku',
            timestamp: new Date().toLocaleDateString('id-ID'),
            statusBaca: 'Belum Dibaca',
            color: 'amber',
            icon: AlertTriangle,
            actionText: 'Buat Adendum',
            actionType: 'solid'
          });
          uCount++;
        } else if (diffDays <= 0) {
          bCount++;
          notifs.push({
            id: idCounter++,
            pksId: pks.pksId || pks.id,
            title: `PKS Telah Berakhir: ${pks.nomorPKS || pks.nomor_pks}`,
            description: `Masa berlaku PKS ini sudah habis sejak ${Math.abs(diffDays)} hari yang lalu.`,
            type: 'Masa Berlaku',
            timestamp: new Date().toLocaleDateString('id-ID'),
            statusBaca: 'Belum Dibaca',
            color: 'rose',
            icon: XCircle,
            actionText: 'Evaluasi PKS',
            actionType: 'outline'
          });
          uCount++;
        }
      }
    });
    
    setNotificationList(notifs.sort((a, b) => b.id - a.id));
    setUnreadCount(uCount);
    setTotalNotifications(notifs.length);
    setSegeraBerakhirCount(sCount);
    setBerakhirCount(bCount);
  };

  const handleMarkAllRead = () => {
    setNotificationList(prev => prev.map(item => ({ ...item, statusBaca: 'Sudah Dibaca' })));
    setUnreadCount(0);
  };

  const handleClearRead = () => {
    setNotificationList(prev => prev.filter(item => item.statusBaca === 'Belum Dibaca'));
    setTotalNotifications(unreadCount);
  };

  const handleActionClick = (n) => {
    // Mark read
    setNotificationList(prev => prev.map(item => item.id === n.id ? { ...item, statusBaca: 'Sudah Dibaca' } : item));
    if (n.statusBaca === 'Belum Dibaca') {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    if (n.type === 'Persetujuan') {
      navigate('/approval');
    } else {
      navigate(`/pks/${n.pksId}`);
    }
  };

  // Filter Data
  const filteredList = notificationList.filter(item => {
    if (statusFilter === 'Belum Dibaca' && item.statusBaca !== 'Belum Dibaca') return false;
    if (statusFilter === 'Sudah Dibaca' && item.statusBaca !== 'Sudah Dibaca') return false;

    if (kategoriFilter !== 'Semua' && item.type !== kategoriFilter) return false;

    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Header Halaman */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Notifikasi PKS</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Lihat pemberitahuan terkait proses persetujuan, masa berlaku, dan tindak lanjut PKS.
        </p>
      </div>

      {/* 2. 4 Stat Cards (Matching Image 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Belum Dibaca */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Belum Dibaca</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{unreadCount}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Notifikasi */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Notifikasi</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{totalNotifications}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Bell className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: PKS Segera Berakhir */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PKS Segera Berakhir</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{segeraBerakhirCount}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: PKS Berakhir */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PKS Berakhir</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{berakhirCount}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. Bar Kontrol & Bar Filter Tabs (Matching Image 2) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        
        {/* Row 1: Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsMarkAllModalOpen(true)}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl flex items-center shadow-2xs cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 mr-2 text-slate-500" />
            Tandai Semua Sudah Dibaca
          </button>

          <button
            onClick={() => setIsClearReadModalOpen(true)}
            className="px-4 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl flex items-center shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-4 h-4 mr-2 text-rose-500" />
            Bersihkan Notifikasi Dibaca
          </button>
        </div>

        <div className="border-t border-slate-100" />

        {/* Row 2: Status Filter & Kategori Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-500 shrink-0">Status:</span>
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1">
              {['Semua', 'Belum Dibaca', 'Sudah Dibaca'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
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

          {/* Kategori Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            <span className="font-semibold text-slate-500 shrink-0">Kategori:</span>
            <div className="flex items-center space-x-1">
              {['Semua', 'Persetujuan', 'Masa Berlaku', 'Disetujui', 'Ditolak', 'Dokumen Final'].map(kat => (
                <button
                  key={kat}
                  onClick={() => setKategoriFilter(kat)}
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
          <div className="p-12 text-center text-xs text-slate-500">Menghitung notifikasi cerdas...</div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">Tidak ada notifikasi untuk kategori ini.</div>
        ) : (
          filteredList.map((n) => {
            const IconComp = n.icon || Bell;

          return (
            <div
              key={n.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
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
                {/* Left Icon Box (Circle matching Image 3) */}
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
                  <div className="flex items-center space-x-3">
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
                      {n.type}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{n.timestamp}</span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900">{n.title}</h3>
                  {n.description && (
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{n.description}</p>
                  )}

                  {/* Inner Callout Box for Rejection Notes (If any) */}
                  {n.reasonText && (
                    <div className="mt-3 p-3.5 rounded-xl bg-[#F4F7FB] border-l-4 border-l-rose-500 border border-slate-200 text-xs space-y-1 max-w-2xl">
                      <p className="font-bold text-rose-600">Alasan Penolakan:</p>
                      <p className="text-slate-700 italic font-medium">{n.reasonText}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Action Button */}
              <div className="shrink-0 pt-2 md:pt-0">
                <button
                  onClick={() => handleActionClick(n)}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center ${
                    n.actionType === 'solid'
                      ? 'bg-[#00529C] hover:bg-[#003E75] text-white'
                      : 'bg-white border border-[#00529C] text-[#00529C] hover:bg-blue-50'
                  }`}
                >
                  {n.icon === Upload && <Upload className="w-3.5 h-3.5 mr-1.5" />}
                  {n.actionText}
                </button>
              </div>

            </div>
          );
          })
        )}
      </div>

      {/* 5. Pagination Footer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium shadow-2xs">
        <p>
          Menampilkan <span className="font-bold text-slate-800">6</span> dari{' '}
          <span className="font-bold text-slate-800">{totalNotifications}</span> notifikasi
        </p>

        <div className="flex items-center space-x-1">
          <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 opacity-40 cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 rounded-lg text-xs font-bold bg-[#00529C] text-white shadow-xs">1</button>
          <button className="w-7 h-7 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">2</button>
          <button className="w-7 h-7 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">3</button>
          <span className="px-1 text-slate-400">...</span>
          <button className="w-8 h-7 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">14</button>
          <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Modals Notifikasi */}
      <ModalMarkAllNotificationsRead
        isOpen={isMarkAllModalOpen}
        onClose={() => setIsMarkAllModalOpen(false)}
        onConfirm={handleMarkAllRead}
      />

      <ModalClearReadNotifications
        isOpen={isClearReadModalOpen}
        onClose={() => setIsClearReadModalOpen(false)}
        onConfirm={handleClearRead}
      />
    </div>
  );
};
