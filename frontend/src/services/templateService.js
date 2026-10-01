const MOCK_TEMPLATES = [
  { id: 1, nama_template: 'Template Kerjasama Penelitian & Pengembangan', versi: '1.2', status: 'aktif', updated_at: '2026-03-10' },
  { id: 2, nama_template: 'Template MOU Pendampingan Sertifikasi Halal', versi: '2.0', status: 'aktif', updated_at: '2026-03-15' },
  { id: 3, nama_template: 'Template Adendum Perpanjangan Waktu PKS', versi: '1.0', status: 'nonaktif', updated_at: '2026-02-01' },
];

export const templateService = {
  getTemplates: async () => {
    return { status: 'success', data: MOCK_TEMPLATES };
  },

  getTemplateById: async (id) => {
    const tpl = MOCK_TEMPLATES.find(t => t.id === Number(id));
    return { status: 'success', data: tpl };
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

