import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { pksService } from '../services/pksService';
import { adendumService } from '../services/adendumService';
import { Clock, AlertTriangle, XCircle, FileText } from 'lucide-react';

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
      const userBidang = user?.bidang || '';

      // 1. Process PKS Documents: Fokus 100% pada Status Masa Berlaku (Segera Berakhir H-30 & Telah Berakhir)
      pksList.forEach(pks => {
        const id = pks.pksId || pks.id;
        const nomor = pks.nomorPKS || pks.nomor_pks || 'Draf PKS';
        const mitraNama = pks.perusahaan || pks.mitra?.nama_perusahaan || pks.mitra?.nama_mitra || 'Mitra Rekanan';
        const bidang = pks.bidang || '';
        const status = pks.statusPersetujuan || pks.status_persetujuan || '';
        const statusPks = pks.statusPks || pks.status_pks || '';
        const tglBerakhir = pks.tanggalBerakhir || pks.tanggal_berakhir;

        // Filter bidang untuk Pengelola (jika memiliki bidang khusus). Admin, Pimpinan, Kabag melihat semua.
        const matchBidang = !userBidang || userRole === 'admin_utama' || userRole === 'kabag' || userRole === 'pimpinan' || userBidang === bidang;
        if (!matchBidang) return;

        // Hanya dokumen yang aktif atau disetujui yang diperiksa masa berlakunya
        const isDocActive = status === 'Disetujui' || statusPks === 'Aktif' || statusPks === 'Segera Berakhir' || statusPks === 'Telah Berakhir' || statusPks === 'Berakhir';

        if (tglBerakhir && isDocActive) {
          const endDate = new Date(tglBerakhir);
          const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

          if (diffDays <= 30 && diffDays > 0) {
            notifs.push({
              id: `pks-expiring-${id}`,
              targetId: id,
              tipeDokumen: 'PKS',
              title: `PKS Segera Berakhir: ${nomor}`,
              description: `Masa berlaku PKS bersama ${mitraNama} tersisa ${diffDays} hari lagi (berakhir pada ${endDate.toLocaleDateString('id-ID')}). Harap persiapkan perpanjangan atau pembuatan Adendum.`,
              type: 'Masa Berlaku',
              category: 'Segera Berakhir',
              status: `${diffDays} hari lagi`,
              timestamp: pks.updatedAt || pks.updated_at || pks.created_at || new Date().toISOString(),
              color: 'amber',
              icon: AlertTriangle,
              actionUrl: `/notifications`
            });
          } else if (diffDays <= 0) {
            notifs.push({
              id: `pks-expired-${id}`,
              targetId: id,
              tipeDokumen: 'PKS',
              title: `PKS Telah Berakhir: ${nomor}`,
              description: `Masa berlaku PKS bersama ${mitraNama} telah berakhir sejak ${Math.abs(diffDays)} hari yang lalu (${endDate.toLocaleDateString('id-ID')}).`,
              type: 'Masa Berlaku',
              category: 'Telah Berakhir',
              status: 'Telah Berakhir',
              timestamp: pks.updatedAt || pks.updated_at || pks.created_at || new Date().toISOString(),
              color: 'rose',
              icon: XCircle,
              actionUrl: `/notifications`
            });
          }
        }
      });

      // 2. Process Adendum Documents: Fokus 100% pada Status Masa Berlaku
      adendumList.forEach(ad => {
        const id = ad.adendumId || ad.id;
        const nomor = ad.nomorAdendum || ad.nomor_adendum || `Adendum #${id}`;
        const mitraNama = ad.pksDocument?.mitra?.nama_perusahaan || ad.pks?.mitra?.nama_perusahaan || ad.pksDocument?.mitra?.nama_mitra || 'Mitra Rekanan';
        const docBidang = ad.pksDocument?.bidang || ad.pks?.bidang || '';
        const tglBerakhir = ad.tanggal_berakhir_baru || ad.tanggalBerakhirBaru || ad.tanggalBerakhir || ad.tanggal_berakhir;
        const status = ad.statusPersetujuan || ad.status_persetujuan || '';

        const matchBidang = !userBidang || userRole === 'admin_utama' || userRole === 'kabag' || userRole === 'pimpinan' || userBidang === docBidang;
        if (!matchBidang) return;

        const isApproved = status === 'Disetujui' || status === 'Selesai' || status === 'Draf Adendum Disetujui';

        if (tglBerakhir && isApproved) {
          const endDate = new Date(tglBerakhir);
          const diffDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

          if (diffDays <= 30 && diffDays > 0) {
            notifs.push({
              id: `ad-expiring-${id}`,
              targetId: id,
              tipeDokumen: 'Adendum',
              title: `Adendum Segera Berakhir: ${nomor}`,
              description: `Masa berlaku Adendum untuk ${mitraNama} tersisa ${diffDays} hari lagi (hingga ${endDate.toLocaleDateString('id-ID')}).`,
              type: 'Masa Berlaku',
              category: 'Segera Berakhir',
              status: `${diffDays} hari lagi`,
              timestamp: ad.updatedAt || ad.updated_at || ad.created_at || new Date().toISOString(),
              color: 'amber',
              icon: AlertTriangle,
              actionUrl: `/notifications`
            });
          } else if (diffDays <= 0) {
            notifs.push({
              id: `ad-expired-${id}`,
              targetId: id,
              tipeDokumen: 'Adendum',
              title: `Adendum Telah Berakhir: ${nomor}`,
              description: `Masa berlaku Adendum untuk ${mitraNama} telah berakhir sejak ${Math.abs(diffDays)} hari yang lalu (${endDate.toLocaleDateString('id-ID')}).`,
              type: 'Masa Berlaku',
              category: 'Telah Berakhir',
              status: 'Telah Berakhir',
              timestamp: ad.updatedAt || ad.updated_at || ad.created_at || new Date().toISOString(),
              color: 'rose',
              icon: XCircle,
              actionUrl: `/notifications`
            });
          }
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
    const unreadNotifications = notifications.filter(n => !readNotifIds.includes(n.id));
    setNotifications(unreadNotifications);
  };

  const unreadCount = notifications.filter(n => !readNotifIds.includes(n.id)).length;
  const segeraBerakhirCount = notifications.filter(n => n.category === 'Segera Berakhir' || (n.type === 'Masa Berlaku' && n.status?.includes('hari'))).length;
  const berakhirCount = notifications.filter(n => n.category === 'Telah Berakhir' || (n.type === 'Masa Berlaku' && n.status === 'Telah Berakhir')).length;

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
