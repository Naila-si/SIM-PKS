// Standalone Mock Auth Service (Pure Frontend Focus)

const defaultUser = {
  penggunaId: 1,
  nama: 'Budi Santoso',
  email: 'petugas@jasaraharja.co.id',
  role: 'petugas_jr',
  bidang: 'Pelayanan',
  jabatan: 'Officer Wilayah',
};

export const authService = {
  login: async (email, password) => {
    let role = 'petugas_jr';
    let nama = 'Budi Santoso';
    let jabatan = 'Officer Wilayah';

    if (email?.includes('pengelola')) {
      role = 'pengelola_pks';
      nama = 'Andi Wijaya';
      jabatan = 'Pengelola PKS Pusat';
    } else if (email?.includes('kabag')) {
      role = 'kabag';
      nama = 'Siska Wijaya';
      jabatan = 'Kepala Bagian Operasional';
    } else if (email?.includes('pimpinan')) {
      role = 'pimpinan';
      nama = 'Drs. H. M. Yusuf';
      jabatan = 'Kepala Cabang / Pimpinan';
    } else if (email?.includes('admin')) {
      role = 'admin_utama';
      nama = 'Super Administrator';
      jabatan = 'Administrator Utama';
    }

    const pengguna = {
      penggunaId: Date.now(),
      nama,
      email: email || 'petugas@jasaraharja.co.id',
      role,
      jabatan,
    };

    return {
      success: true,
      data: {
        token: 'mock-jwt-token-123456',
        pengguna,
      },
    };
  },

  me: async () => {
    const savedUser = localStorage.getItem('pks_user');
    const userObj = savedUser ? JSON.parse(savedUser) : defaultUser;
    return {
      success: true,
      data: userObj,
    };
  },

  logout: async () => {
    return { success: true };
  },
};
