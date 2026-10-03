// Standalone Mock Adendum Service (Pure Frontend Focus)

export const adendumService = {
  getAdendumListByPks: async (pksId) => {
    return {
      success: true,
      data: [],
    };
  },

  getAdendumById: async (id) => {
    return {
      success: true,
      data: null,
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
