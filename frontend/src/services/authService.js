// Standalone Auth & User Management Service (Connected directly to Laravel Backend Database 'sim_pks')

// Automatically purge legacy frontend mock users from localStorage to prevent cached data conflicts
if (typeof window !== 'undefined') {
  localStorage.removeItem('pks_app_users');
}

export const API_BASE_URL = 'http://localhost:8000/api';

export const authService = {
  // 1. Login Verification (Connected to Laravel Backend API)
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await fetch(`${API_BASE_URL}/autentikasi/masuk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ingat_saya: rememberMe }),
      });

      const resData = await response.json();

      if (response.ok && resData.status === 'sukses') {
        const { token_akses, token_ingat_saya, pengguna } = resData.data;

        // Save active session in localStorage
        localStorage.setItem('pks_user', JSON.stringify(pengguna));
        localStorage.setItem('pks_auth_token', token_akses);

        // If Remember Me is checked, save remember token & email
        if (rememberMe && token_ingat_saya) {
          localStorage.setItem('pks_remember_token', token_ingat_saya);
          localStorage.setItem('pks_remembered_email', email);
        } else {
          localStorage.removeItem('pks_remember_token');
          localStorage.removeItem('pks_remembered_email');
        }

        return {
          success: true,
          data: {
            token: token_akses,
            pengguna: pengguna,
          },
        };
      } else {
        throw new Error(resData.pesan || 'Email atau password salah.');
      }
    } catch (err) {
      if (err.message) throw err;
      throw new Error('Gagal terhubung ke server backend API Laravel.');
    }
  },

  // 2. Fetch Current Active User Profile
  me: async () => {
    const savedUser = localStorage.getItem('pks_user');
    if (savedUser) {
      try {
        return { success: true, data: JSON.parse(savedUser) };
      } catch (e) {
        // Fallthrough
      }
    }
    return { success: false, message: 'Tidak ada sesi pengguna aktif.' };
  },

  // 3. Logout
  logout: async () => {
    try {
      const token = localStorage.getItem('pks_auth_token');
      if (token) {
        await fetch(`${API_BASE_URL}/autentikasi/keluar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      console.warn('Backend logout warning:', err);
    } finally {
      localStorage.removeItem('pks_user');
      localStorage.removeItem('pks_auth_token');
      localStorage.removeItem('pks_remember_token');
    }
    return { success: true };
  },

  // 4. Get All Users (Administrator Utama View)
  getAllUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pengguna`);
      const resData = await response.json();

      if (response.ok && resData.status === 'sukses') {
        return {
          success: true,
          data: resData.data,
        };
      } else {
        throw new Error(resData.pesan || 'Gagal mengambil daftar pengguna.');
      }
    } catch (err) {
      console.error('Error in getAllUsers:', err);
      return { success: false, data: [], message: err.message };
    }
  },

  // 5. Registrasi Mandiri Pengguna Baru
  registerSelf: async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pengguna/daftar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          namaLengkap: formData.namaLengkap,
          email: formData.email,
          password: formData.password,
          nomorHp: formData.nomorHp || '-',
          jabatan: formData.jabatan,
          role: formData.role,
          wilayah: formData.wilayah || null,
          samsat: formData.samsat || null,
          bidang: formData.bidang || null,
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.status === 'sukses') {
        return {
          success: true,
          data: resData.data,
          pesan: resData.pesan,
        };
      } else {
        throw new Error(resData.pesan || 'Registrasi gagal.');
      }
    } catch (err) {
      throw new Error(err.message || 'Gagal mengirim pendaftaran ke server.');
    }
  },

  // 6. Tambah Pengguna Langsung oleh Admin Utama
  addUserByAdmin: async (formData) => {
    try {
      let token = localStorage.getItem('pks_token');
      const response = await fetch(`${API_BASE_URL}/pengguna/tambah`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nama: formData.nama || formData.namaLengkap,
          email: formData.email,
          password: formData.password,
          nomorHp: formData.nomorHp || '-',
          role: formData.role,
          wilayah: formData.wilayah || null,
          samsat: formData.samsat || null,
          bidang: formData.bidang || null,
          status: formData.status || 'Aktif',
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.status === 'sukses') {
        return {
          success: true,
          data: resData.data,
          pesan: resData.pesan,
        };
      } else {
        throw new Error(resData.pesan || 'Gagal menambah pengguna.');
      }
    } catch (err) {
      throw new Error(err.message || 'Gagal menambah pengguna ke server.');
    }
  },

  // 7. Persetujuan Akun: Setujui
  approveUser: async (penggunaId) => {
    try {
      let token = localStorage.getItem('pks_token');
      const response = await fetch(`${API_BASE_URL}/pengguna/${penggunaId}/setujui`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const resData = await response.json();

      if (response.ok && resData.status === 'sukses') {
        return { success: true, pesan: resData.pesan };
      } else {
        throw new Error(resData.pesan || 'Gagal menyetujui pengguna.');
      }
    } catch (err) {
      throw new Error(err.message || 'Gagal menyetujui pengguna.');
    }
  },

  // 8. Persetujuan Akun: Tolak
  rejectUser: async (penggunaId) => {
    try {
      let token = localStorage.getItem('pks_token');
      const response = await fetch(`${API_BASE_URL}/pengguna/${penggunaId}/tolak`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const resData = await response.json();

      if (response.ok && resData.status === 'sukses') {
        return { success: true, pesan: resData.pesan };
      } else {
        throw new Error(resData.pesan || 'Gagal menolak pengguna.');
      }
    } catch (err) {
      throw new Error(err.message || 'Gagal menolak pengguna.');
    }
  },

  // 9. Ubah Status Pengguna (Aktif / Nonaktif)
  toggleUserStatus: async (penggunaId) => {
    try {
      let token = localStorage.getItem('pks_token');
      const response = await fetch(`${API_BASE_URL}/pengguna/${penggunaId}/ubah-status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const resData = await response.json();

      if (response.ok && resData.status === 'sukses') {
        return { success: true, pesan: resData.pesan };
      } else {
        throw new Error(resData.pesan || 'Gagal mengubah status pengguna.');
      }
    } catch (err) {
      throw new Error(err.message || 'Gagal mengubah status pengguna.');
    }
  },

  // 10. Edit / Perbarui Data Pengguna
  updateUser: async (penggunaId, updatedFields) => {
    try {
      let token = localStorage.getItem('pks_token');
      const response = await fetch(`${API_BASE_URL}/pengguna/${penggunaId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields),
      });

      const resData = await response.json();

      if (response.ok && resData.status === 'sukses') {
        return { success: true, pesan: resData.pesan };
      } else {
        throw new Error(resData.pesan || 'Gagal memperbarui pengguna.');
      }
    } catch (err) {
      throw new Error(err.message || 'Gagal memperbarui pengguna.');
    }
  },

  // 11. Reset Password Pengguna
  resetPassword: async (penggunaId, newPassword) => {
    try {
      let token = localStorage.getItem('pks_token');
      const response = await fetch(`${API_BASE_URL}/pengguna/${penggunaId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword || 'password123' }),
      });

      const resData = await response.json();

      if (response.ok && resData.status === 'sukses') {
        return { success: true, pesan: resData.pesan };
      } else {
        throw new Error(resData.pesan || 'Gagal me-reset password.');
      }
    } catch (err) {
      throw new Error(err.message || 'Gagal me-reset password.');
    }
  },

  // 12. Hapus Pengguna dari Database
  deleteUser: async (penggunaId) => {
    try {
      let token = localStorage.getItem('pks_token');
      const response = await fetch(`${API_BASE_URL}/pengguna/${penggunaId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      const resData = await response.json();

      if (response.ok && resData.status === 'sukses') {
        return { success: true, pesan: resData.pesan };
      } else {
        throw new Error(resData.pesan || 'Gagal menghapus pengguna.');
      }
    } catch (err) {
      throw new Error(err.message || 'Gagal menghapus pengguna.');
    }
  },
};

export default authService;

