// Standalone Mock Notification Service (Pure Frontend Focus)

export const notificationService = {
  getNotifications: async () => {
    return {
      success: true,
      data: {
        unreadCount: 12,
        notifications: [
          {
            notifikasiId: 1,
            pesan: 'PKS No. 124/JR-MKS/2023 memerlukan tinjauan administratif.',
            statusBaca: 'Belum Dibaca',
            tanggal: new Date().toISOString(),
            pksId: 1,
          },
          {
            notifikasiId: 2,
            pesan: 'Kerjasama dengan PT Logistik Maju Sejahtera dijadwalkan berakhir pada 30 Desember 2023.',
            statusBaca: 'Belum Dibaca',
            tanggal: new Date().toISOString(),
            pksId: 2,
          },
        ],
      },
    };
  },

  markAsRead: async () => {
    return { success: true };
  },

  markAllAsRead: async () => {
    return { success: true };
  },
};
