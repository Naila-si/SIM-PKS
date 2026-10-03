export const templateService = {
  getTemplates: async () => {
    return { status: 'success', data: [] };
  },

  getTemplateById: async (id) => {
    return { status: 'success', data: null };
  },

  createTemplate: async (formData) => {
    return { status: 'success', message: 'Template berhasil ditambahkan' };
  },

  updateTemplate: async (id, formData) => {
    return { status: 'success', message: 'Template berhasil diperbarui' };
  },

  updateStatus: async (id, status) => {
    return { status: 'success', message: `Status template diubah ke ${status}` };
  },
};

