export const dashboardService = {
  getSummary: async () => {
    return {
      status: 'success',
      data: {
        total_pks: 24,
        pks_aktif: 14,
        pks_diproses: 6,
        pks_akan_berakhir: 3,
        pks_kadaluarsa: 1,
        total_mitra: 18,
      }
    };
  },
};

