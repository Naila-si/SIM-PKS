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
  getAllAdendums: async () => {
    try {
      const res = await fetch(`${BASE_URL}/adendums`, { headers: getHeaders() });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, data: [] };
    }
  },

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
      return { success: false, message: 'Gagal menghapus data' };
    }
  },

  generateWord: async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/adendums/${id}/generate-docx`, {
        method: 'GET',
        headers: getHeaders(),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal generate document');
      }

      // Download it as a blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Draft_Adendum_${id}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (err) {
      console.error(err);
      alert(err.message); // Tampilkan alert agar user tahu jika gagal
      return { success: false, message: err.message };
    }
  },

  downloadDraft: async (id) => {
    // For now, mockup blob
    const blob = new Blob(['Mock Draft Adendum Document Content'], { type: 'application/pdf' });
    return { success: true, data: blob };
  },

  postApproval: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/adendum-approvals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal mengirim aksi persetujuan' };
    }
  },

  konfirmasiPenyerahan: async (id) => {
    return await adendumService.updateAdendum(id, { statusPersetujuan: 'Selesai' });
  },

  uploadFinal: async (id, file, userId) => {
    try {
      const token = localStorage.getItem('pks_token');
      const formData = new FormData();
      formData.append('file', file);
      if (userId) {
        formData.append('user_id', userId);
      }

      const res = await fetch(`${BASE_URL}/adendums/${id}/upload-final`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData,
      });
      return await res.json();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Gagal mengunggah dokumen final' };
    }
  },

  downloadFinal: async (id, fileName = 'Dokumen_Final_Adendum.pdf') => {
    try {
      const res = await fetch(`${BASE_URL}/adendums/${id}/download-final`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal mengunduh dokumen final');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return { success: true };
    } catch (err) {
      console.error(err);
      alert(err.message);
      return { success: false, message: err.message };
    }
  },
};
