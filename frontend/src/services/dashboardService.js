export const dashboardService = {
  getSummary: async () => {
    return {
      status: 'success',
      data: {
        total_pks: 0,
        pks_aktif: 0,
        pks_diproses: 0,
        pks_akan_berakhir: 0,
        pks_kadaluarsa: 0,
        total_mitra: 0,
      }
    };
  },
};

