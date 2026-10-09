// Adendum Service connecting to Laravel Backend

const BASE_URL = 'http://localhost:8000/api';

const getHeaders = () => {
  const token = localStorage.getItem('pks_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const adendumService = {
  getAdendumListByPks: async (pksId) => {
    try {
      const res = await fetch(`${BASE_URL}/pks/${pksId}/adendums`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal mengambil data' };
    }
  },

  getAdendumById: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/adendums/${id}`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal mengambil data' };
    }
  },

  createAdendum: async (pksId, data) => {
    try {
      const res = await fetch(`${BASE_URL}/pks/${pksId}/adendums`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal menyimpan data' };
    }
  },

  updateAdendum: async (id, data) => {
    try {
      const res = await fetch(`${BASE_URL}/adendums/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal update data' };
    }
  },

  deleteAdendum: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/adendums/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal hapus data' };
    }
  },

  downloadDraft: async (id) => {
    // For now, mockup blob
    const blob = new Blob(['Mock Draft Adendum Document Content'], { type: 'application/pdf' });
    return { success: true, data: blob };
  },

  konfirmasiPenyerahan: async (id) => {
    return await adendumService.updateAdendum(id, { statusPersetujuan: 'Selesai' });
  },
};
