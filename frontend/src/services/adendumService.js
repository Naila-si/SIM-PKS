// Standalone Mock Adendum Service (Pure Frontend Focus)

export const adendumService = {
  getAdendumListByPks: async (pksId) => {
    return {
      success: true,
      data: [
        {
          adendumId: 1,
          nomorAdendum: 'AD/2024/0045/JR/X',
          nomorPKS: 'PKS/2022/JR/1102',
          jenisPerubahan: 'Perpanjangan Jangka Waktu',
          ruangLingkupPerubahan: 'Para Pihak sepakat untuk memperpanjang jangka waktu perjanjian selama 12 bulan.',
          tanggalMulai: '2025-01-01',
          tanggalBerakhir: '2025-12-31',
          status: 'Draft',
          statusPersetujuan: 'Draft',
          createdAt: new Date().toISOString(),
        }
      ],
    };
  },

  getAdendumById: async (id) => {
    return {
      success: true,
      data: {
        adendumId: id,
        nomorAdendum: 'AD/2024/0045/JR/X',
        nomorPKS: 'PKS/2022/JR/1102',
        jenisPerubahan: 'Perpanjangan Jangka Waktu',
        ruangLingkupPerubahan: 'Para Pihak sepakat untuk memperpanjang jangka waktu perjanjian selama 12 bulan.',
        tanggalMulai: '2025-01-01',
        tanggalBerakhir: '2025-12-31',
        status: 'Draft',
        statusPersetujuan: 'Draft',
        createdAt: new Date().toISOString(),
      },
    };
  },

  createAdendum: async (pksId, data) => {
    return {
      success: true,
      data: {
        adendumId: Date.now(),
        nomorAdendum: `ADD/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
        ...data,
        createdAt: new Date().toISOString(),
      },
    };
  },

  updateAdendum: async (id, data) => {
    return {
      success: true,
      data: {
        adendumId: id,
        ...data,
        updatedAt: new Date().toISOString(),
      },
    };
  },

  deleteAdendum: async (id) => {
    return { success: true };
  },

  downloadDraft: async () => {
    const blob = new Blob(['Mock Draft Adendum Document Content'], { type: 'application/pdf' });
    return { data: blob };
  },

  konfirmasiPenyerahan: async () => {
    return { success: true };
  },
};
