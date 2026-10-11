import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { pksService } from '../services/pksService';
import { adendumService } from '../services/adendumService';
import {
  Clock, CheckCircle2, AlertTriangle, XCircle, FileText, Send
} from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState(() => {
    try {
      const stored = localStorage.getItem('pks_read_notif_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const saveReadIds = (newIds) => {
    setReadNotifIds(newIds);
    try {
      localStorage.setItem('pks_read_notif_ids', JSON.stringify(newIds));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAndGenerateNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [pksRes, adendumRes] = await Promise.all([
        pksService.getPksList(),
        adendumService.getAllAdendums()
      ]);

      const pksList = (pksRes?.success && Array.isArray(pksRes.data)) ? pksRes.data : [];
      const adendumList = (adendumRes?.success && Array.isArray(adendumRes.data)) ? adendumRes.data : [];

      const notifs = [];
      const now = new Date();
      const userRole = user?.role || '';
      const userId = user?.penggunaId || user?.id;
      const userBidang = user?.bidang || '';

      const isPengelola = ['pengelola_pks', 'pengelola', 'admin_utama'].includes(userRole);
      const isKabag = ['kabag', 'admin_utama'].includes(userRole);
      const isPimpinan = ['pimpinan', 'admin_utama'].includes(userRole);
      const isPetugas = ['petugas_jr', 'petugas', 'admin_utama'].includes(userRole);

      // 1. Process PKS Documents
      pksList.forEach(pks => {
        const id = pks.pksId || pks.id;
        const nomor = pks.nomorPKS || pks.nomor_pks || 'Draf PKS';
        const mitraNama = pks.perusahaan || pks.mitra?.nama_perusahaan || pks.mitra?.nama_mitra || 'Mitra';
        const bidang = pks.bidang || '';
        const status = pks.statusPersetujuan || pks.status_persetujuan || 'Draf';
        const statusPks = pks.statusPks || pks.status_pks || 'Draft';
        const tglBerakhir = pks.tanggalBerakhir || pks.tanggal_berakhir;
        const pksCreatorId = pks.penggunaId || pks.pengguna_id;
        const isMyPks = Number(pksCreatorId) === Number(userId);

        // Filter bidang for Pengelola (if user has specific bidang, e.g. Pelayanan or SW or IW)
        const matchBidang = !userBidang || userRole === 'admin_utama' || userBidang === bidang;

        // A. PKS Butuh Verifikasi Pengelola (Menunggu Penyerahan / Pemeriksaan Pengelola)
        if (isPengelola && matchBidang && (status === 'Menunggu Penyerahan' || status === 'Pemeriksaan Pengelola')) {
          notifs.push({
            id: `pks-pengelola-${id}`,
            targetId: id,
            tipeDokumen: 'PKS',
            title: `PKS Memerlukan Pemeriksaan Pengelola: ${nomor}`,
            description: `Draf PKS ${mitraNama} (${bidang}) sedang dalam tahap ${status}. Harap segera diverifikasi.`,
            type: 'Persetujuan',
            status: status,
            timestamp: pks.updatedAt || pks.updated_at || new Date().toISOString(),
            color: 'blue',
            icon: Clock,
            actionUrl: '/approval'
          });
        }

        // B. PKS Butuh Persetujuan Kabag
        if (isKabag && (status === 'Disetujui Pengelola' || status === 'Pemeriksaan Kabag')) {
          notifs.push({
            id: `pks-kabag-${id}`,
            targetId: id,
            tipeDokumen: 'PKS',
            title: `PKS Menunggu Persetujuan Kabag: ${nomor}`,
            description: `Draf PKS ${mitraNama} (${bidang}) telah disetujui Pengelola dan siap ditinjau oleh Kabag.`,
            type: 'Persetujuan',
            status: status,
            timestamp: pks.updatedAt || pks.updated_at || new Date().toISOString(),
            color: 'blue',
            icon: Clock,
            actionUrl: '/approval'
          });
        }

        // C. PKS Butuh Persetujuan Pimpinan
        if (isPimpinan && (status === 'Disetujui Kabag' || status === 'Pemeriksaan Pimpinan')) {
          notifs.push({
            id: `pks-pimpinan-${id}`,
            targetId: id,
            tipeDokumen: 'PKS',
            title: `PKS Menunggu Persetujuan Pimpinan: ${nomor}`,
            description: `Draf PKS ${mitraNama} (${bidang}) telah disetujui Kabag dan menunggu persetujuan akhir Pimpinan.`,
            type: 'Persetujuan',
            status: status,
            timestamp: pks.updatedAt || pks.updated_at || new Date().toISOString(),
            color: 'blue',
            icon: Clock,
            actionUrl: '/approval'
          });
        }

        // D. PKS Revisi (Untuk Petugas Pembuat)
        if (isPetugas && (isMyPks || userRole === 'admin_utama') && status.includes('Revisi')) {
          notifs.push({
            id: `pks-revisi-${id}`,
            targetId: id,
            tipeDokumen: 'PKS',
            title: `PKS Perlu Revisi: ${nomor}`,
            description: `Draf PKS ${mitraNama} dikembalikan untuk diperbaiki (${status}).`,
            reasonText: pks.catatan_revisi || pks.catatanRevisi || 'Silakan cek catatan revisi untuk rincian perbaikan.',
            type: 'Ditolak',
            status: status,
            timestamp: pks.updatedAt || pks.updated_at || new Date().toISOString(),
            color: 'rose',
            icon: AlertTriangle,
            actionUrl: '/approval'
          });
        }

        // E. PKS Disetujui Pimpinan / Disetujui Resmi
        if (isPetugas && (isMyPks || userRole === 'admin_utama') && (status === 'Disetujui' || status === 'Draf PKS Disetujui')) {
          notifs.push({
            id: `pks-setuju-${id}`,
            targetId: id,
            tipeDokumen: 'PKS',
            title: `PKS Disetujui: ${nomor}`,
            description: `Draf PKS dengan mitra ${mitraNama} telah disetujui resmi oleh Pimpinan.`,
            type: 'Disetujui',
            status: status,
            timestamp: pks.updatedAt || pks.updated_at || new Date().toISOString(),
            color: 'emerald',
            icon: CheckCircle2,
            actionUrl: `/pks/${id}`
          });
        }

        // F. Pengingat Masa Berlaku (PKS Aktif)
        if (tglBerakhir && (statusPks === 'Aktif' || status === 'Disetujui')) {
          const endDate = new Date(tglBerakhir);
          const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

          if (diffDays <= 30 && diffDays > 0) {
            notifs.push({
              id: `pks-expiring-${id}`,
              targetId: id,
              tipeDokumen: 'PKS',
              title: `PKS Segera Berakhir: ${nomor}`,
              description: `Masa berlaku PKS ${mitraNama} tersisa ${diffDays} hari lagi (hingga ${endDate.toLocaleDateString('id-ID')}).`,
              type: 'Masa Berlaku',
              status: `${diffDays} hari lagi`,
              timestamp: pks.updatedAt || pks.updated_at || new Date().toISOString(),
              color: 'amber',
              icon: AlertTriangle,
              actionUrl: `/pks/${id}`
            });
          } else if (diffDays <= 0) {
            notifs.push({
              id: `pks-expired-${id}`,
              targetId: id,
              tipeDokumen: 'PKS',
              title: `PKS Telah Berakhir: ${nomor}`,
              description: `Masa berlaku PKS ${mitraNama} telah berakhir sejak ${Math.abs(diffDays)} hari yang lalu (${endDate.toLocaleDateString('id-ID')}).`,
              type: 'Masa Berlaku',
              status: 'Telah Berakhir',
              timestamp: pks.updatedAt || pks.updated_at || new Date().toISOString(),
              color: 'rose',
              icon: XCircle,
              actionUrl: `/pks/${id}`
            });
          }
        }
      });

      // 2. Process Adendum Documents
      adendumList.forEach(ad => {
        const id = ad.adendumId || ad.id;
        const nomor = ad.nomorAdendum || ad.nomor_adendum || `Adendum #${id}`;
        const mitraNama = ad.pksDocument?.mitra?.nama_perusahaan || ad.pks?.mitra?.nama_perusahaan || 'Mitra';
        const status = ad.statusPersetujuan || ad.status_persetujuan || 'Draf';
        const adCreatorId = ad.penggunaId || ad.pengguna_id || ad.user_id;
        const isMyAdendum = Number(adCreatorId) === Number(userId);

        // A. Adendum Butuh Verifikasi Pengelola
        if (isPengelola && (status === 'Menunggu Penyerahan' || status === 'Pemeriksaan Pengelola')) {
          notifs.push({
            id: `ad-pengelola-${id}`,
            targetId: id,
            tipeDokumen: 'Adendum',
            title: `Adendum Memerlukan Pemeriksaan Pengelola: ${nomor}`,
            description: `Draf Adendum untuk PKS ${mitraNama} sedang dalam tahap ${status}. Harap segera diverifikasi.`,
            type: 'Persetujuan',
            status: status,
            timestamp: ad.updatedAt || ad.updated_at || new Date().toISOString(),
            color: 'blue',
            icon: Clock,
            actionUrl: '/approval'
          });
        }

        // B. Adendum Butuh Persetujuan Kabag
        if (isKabag && (status === 'Disetujui Pengelola' || status === 'Pemeriksaan Kabag')) {
          notifs.push({
            id: `ad-kabag-${id}`,
            targetId: id,
            tipeDokumen: 'Adendum',
            title: `Adendum Menunggu Persetujuan Kabag: ${nomor}`,
            description: `Draf Adendum untuk PKS ${mitraNama} siap ditinjau oleh Kabag.`,
            type: 'Persetujuan',
            status: status,
            timestamp: ad.updatedAt || ad.updated_at || new Date().toISOString(),
            color: 'blue',
            icon: Clock,
            actionUrl: '/approval'
          });
        }

        // C. Adendum Butuh Persetujuan Pimpinan
        if (isPimpinan && (status === 'Disetujui Kabag' || status === 'Pemeriksaan Pimpinan')) {
          notifs.push({
            id: `ad-pimpinan-${id}`,
            targetId: id,
            tipeDokumen: 'Adendum',
            title: `Adendum Menunggu Persetujuan Pimpinan: ${nomor}`,
            description: `Draf Adendum untuk PKS ${mitraNama} menunggu persetujuan akhir Pimpinan.`,
            type: 'Persetujuan',
            status: status,
            timestamp: ad.updatedAt || ad.updated_at || new Date().toISOString(),
            color: 'blue',
            icon: Clock,
            actionUrl: '/approval'
          });
        }

        // D. Adendum Revisi (Untuk Petugas Pembuat)
        if (isPetugas && (isMyAdendum || userRole === 'admin_utama') && status.includes('Revisi')) {
          notifs.push({
            id: `ad-revisi-${id}`,
            targetId: id,
            tipeDokumen: 'Adendum',
            title: `Adendum Perlu Revisi: ${nomor}`,
            description: `Draf Adendum dikembalikan untuk diperbaiki (${status}).`,
            reasonText: ad.catatan_revisi || ad.catatanRevisi || 'Silakan cek catatan revisi untuk rincian perbaikan.',
            type: 'Ditolak',
            status: status,
            timestamp: ad.updatedAt || ad.updated_at || new Date().toISOString(),
            color: 'rose',
            icon: AlertTriangle,
            actionUrl: '/approval'
          });
        }

        // E. Adendum Disetujui
        if (isPetugas && (isMyAdendum || userRole === 'admin_utama') && (status === 'Disetujui' || status === 'Draf Adendum Disetujui')) {
          notifs.push({
            id: `ad-setuju-${id}`,
            targetId: id,
            tipeDokumen: 'Adendum',
            title: `Adendum Disetujui: ${nomor}`,
            description: `Dokumen Adendum untuk ${mitraNama} telah disetujui resmi oleh Pimpinan.`,
            type: 'Disetujui',
            status: status,
            timestamp: ad.updatedAt || ad.updated_at || new Date().toISOString(),
            color: 'emerald',
            icon: CheckCircle2,
            actionUrl: '/approval'
          });
        }
      });

      // Sort notifications latest first
      notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setNotifications(notifs);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAndGenerateNotifications();
    const interval = setInterval(fetchAndGenerateNotifications, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, [fetchAndGenerateNotifications]);

  const markAsRead = (id) => {
    if (!readNotifIds.includes(id)) {
      saveReadIds([...readNotifIds, id]);
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    saveReadIds(Array.from(new Set([...readNotifIds, ...allIds])));
  };

  const clearRead = () => {
    // Keep only read markers of notifications that still exist or clear all read
    const unreadNotifications = notifications.filter(n => !readNotifIds.includes(n.id));
    setNotifications(unreadNotifications);
  };

  const unreadCount = notifications.filter(n => !readNotifIds.includes(n.id)).length;
  const segeraBerakhirCount = notifications.filter(n => n.type === 'Masa Berlaku' && n.status.includes('hari')).length;
  const berakhirCount = notifications.filter(n => n.type === 'Masa Berlaku' && n.status === 'Telah Berakhir').length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        readNotifIds,
        unreadCount,
        segeraBerakhirCount,
        berakhirCount,
        loading,
        markAsRead,
        markAllAsRead,
        clearRead,
        refreshNotifications: fetchAndGenerateNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};
