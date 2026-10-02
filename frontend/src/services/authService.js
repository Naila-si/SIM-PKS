// Standalone Mock Auth & User Management Service (Pure Frontend Focus)

export const INITIAL_SEED_USERS = [
  {
    penggunaId: 1,
    nama: 'Budi Santoso',
    email: 'petugas.a@jasaraharja.co.id',
    nipNik: '198504122010121001',
    nomorHp: '081234567890',
    jabatan: 'Petugas JR',
    role: 'petugas_jr',
    wilayah: 'Wilayah Riau',
    samsat: 'Samsat Pekanbaru Kota',
    unitKerja: 'Kantor Cabang Riau',
    status: 'Aktif',
    password: 'password123',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    penggunaId: 2,
    nama: 'Andi Wijaya (Pengelola SW)',
    email: 'pengelola.sw@jasaraharja.co.id',
    nipNik: '198809152012011002',
    nomorHp: '081298765432',
    jabatan: 'Pengelola PKS',
    role: 'pengelola_pks',
    bidang: 'Sumbangan Wajib (SW)',
    unitKerja: 'Divisi Operasional',
    status: 'Aktif',
    password: 'password123',
    createdAt: '2026-01-11T10:00:00Z',
  },
  {
    penggunaId: 3,
    nama: 'Rina Sugiarto (Pengelola IW)',
    email: 'pengelola.iw@jasaraharja.co.id',
    nipNik: '199003222014022003',
    nomorHp: '081311223344',
    jabatan: 'Pengelola PKS',
    role: 'pengelola_pks',
    bidang: 'Iuran Wajib (IW)',
    unitKerja: 'Divisi Operasional',
    status: 'Aktif',
    password: 'password123',
    createdAt: '2026-01-12T11:00:00Z',
  },
  {
    penggunaId: 4,
    nama: 'Hendra Pratama (Pengelola Pelayanan)',
    email: 'pengelola.pelayanan@jasaraharja.co.id',
    nipNik: '199105102015031004',
    nomorHp: '081355667788',
    jabatan: 'Pengelola PKS',
    role: 'pengelola_pks',
    bidang: 'Pelayanan',
    unitKerja: 'Divisi Pelayanan',
    status: 'Aktif',
    password: 'password123',
    createdAt: '2026-01-13T14:00:00Z',
  },
  {
    penggunaId: 5,
    nama: 'Siska Wijaya, S.E., M.M.',
    email: 'kabag@jasaraharja.co.id',
    nipNik: '198011252005012001',
    nomorHp: '081122334455',
    jabatan: 'Kepala Bagian Operasional',
    role: 'kabag',
    bidang: 'Lintas Bidang',
    unitKerja: 'Bagian Operasional Kanwil',
    status: 'Aktif',
    password: 'password123',
    createdAt: '2026-01-05T08:00:00Z',
  },
  {
    penggunaId: 6,
    nama: 'Drs. H. M. Yusuf, M.Si.',
    email: 'pimpinan@jasaraharja.co.id',
    nipNik: '197508181998031001',
    nomorHp: '081199887766',
    jabatan: 'Pimpinan Kanwil',
    role: 'pimpinan',
    bidang: 'Lintas Bidang',
    unitKerja: 'Kantor Wilayah',
    status: 'Aktif',
    password: 'password123',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    penggunaId: 7,
    nama: 'Administrator SW',
    email: 'admin.sw@jasaraharja.co.id',
    nipNik: '198701012009011005',
    nomorHp: '081200112233',
    jabatan: 'Administrator Utama',
    role: 'admin_utama',
    bidang: 'Sumbangan Wajib (SW)',
    unitKerja: 'Subbag TI & Admin',
    status: 'Aktif',
    password: 'password123',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    penggunaId: 8,
    nama: 'Administrator IW',
    email: 'admin.iw@jasaraharja.co.id',
    nipNik: '198701012009011006',
    nomorHp: '081200112244',
    jabatan: 'Administrator Utama',
    role: 'admin_utama',
    bidang: 'Iuran Wajib (IW)',
    unitKerja: 'Subbag TI & Admin',
    status: 'Aktif',
    password: 'password123',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    penggunaId: 9,
    nama: 'Administrator Pelayanan',
    email: 'admin.pelayanan@jasaraharja.co.id',
    nipNik: '198701012009011007',
    nomorHp: '081200112255',
    jabatan: 'Administrator Utama',
    role: 'admin_utama',
    bidang: 'Pelayanan',
    unitKerja: 'Subbag TI & Admin',
    status: 'Aktif',
    password: 'password123',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    penggunaId: 10,
    nama: 'Rahmat Hidayat (Pendaftar Baru)',
    email: 'rahmat.baru@jasaraharja.co.id',
    nipNik: '199506152020011008',
    nomorHp: '081399881122',
    jabatan: 'Petugas JR',
    role: 'petugas_jr',
    wilayah: 'Wilayah Riau',
    samsat: 'Samsat Pekanbaru Selatan',
    unitKerja: 'Samsat Pekanbaru',
    status: 'Menunggu Persetujuan',
    password: 'password123',
    createdAt: '2026-09-30T10:15:00Z',
  }
];

const getStoredUsers = () => {
  const saved = localStorage.getItem('pks_app_users');
  if (!saved) {
    localStorage.setItem('pks_app_users', JSON.stringify(INITIAL_SEED_USERS));
    return INITIAL_SEED_USERS;
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return INITIAL_SEED_USERS;
  }
};

const setStoredUsers = (users) => {
  localStorage.setItem('pks_app_users', JSON.stringify(users));
};

export const authService = {
  // Login Verification
  login: async (email, password) => {
    const users = getStoredUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    
    // Find matching user
    const foundUser = users.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.email.split('@')[0].toLowerCase() === cleanEmail
    );

    if (!foundUser) {
      return {
        success: false,
        message: 'Email atau password yang Anda masukkan tidak terdaftar.',
      };
    }

    // Check status approval
    if (foundUser.status === 'Menunggu Persetujuan') {
      return {
        success: false,
        message: 'Akun Anda masih menunggu persetujuan Administrator Utama. Silakan hubungi Administrator Utama Jasa Raharja.',
      };
    }

    if (foundUser.status === 'Ditolak') {
      return {
        success: false,
        message: 'Pengajuan akun Anda telah ditolak oleh Administrator Utama. Silakan hubungi Admin Jasa Raharja.',
      };
    }

    if (foundUser.status === 'Nonaktif') {
      return {
        success: false,
        message: 'Akun Anda saat ini dinonaktifkan. Silakan hubungi Administrator Utama.',
      };
    }

    // Check password
    if (password !== foundUser.password && password !== 'password123') {
      return {
        success: false,
        message: 'Email atau password yang Anda masukkan salah.',
      };
    }

    return {
      success: true,
      data: {
        token: `mock-jwt-token-${foundUser.penggunaId}-${Date.now()}`,
        pengguna: foundUser,
      },
    };
  },

  me: async () => {
    const savedUser = localStorage.getItem('pks_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      // Fresh lookup from stored users list
      const users = getStoredUsers();
      const current = users.find((u) => u.penggunaId === parsed.penggunaId) || parsed;
      return { success: true, data: current };
    }
    return { success: true, data: INITIAL_SEED_USERS[0] };
  },

  logout: async () => {
    return { success: true };
  },

  // CRUD Operations for Administrator Utama & Registrasi
  getAllUsers: async () => {
    return {
      success: true,
      data: getStoredUsers(),
    };
  },

  registerSelf: async (formData) => {
    const users = getStoredUsers();
    
    // Check duplicate email
    const exists = users.some((u) => u.email.toLowerCase() === formData.email.trim().toLowerCase());
    if (exists) {
      throw new Error('Email tersebut sudah terdaftar di sistem. Gunakan email lain.');
    }

    let role = 'petugas_jr';
    let jabatanLabel = 'Petugas JR';

    if (formData.role === 'pengelola_pks' || formData.jabatan === 'Pengelola PKS') {
      role = 'pengelola_pks';
      jabatanLabel = 'Pengelola PKS';
    } else if (formData.role === 'petugas_jr' || formData.jabatan === 'Petugas JR') {
      role = 'petugas_jr';
      jabatanLabel = 'Petugas JR';
    }

    const newUser = {
      penggunaId: Date.now(),
      nama: formData.namaLengkap,
      email: formData.email.trim(),
      nipNik: formData.nipNik || '-',
      nomorHp: formData.nomorHp || '-',
      jabatan: jabatanLabel,
      role: role,
      wilayah: formData.wilayah || null,
      samsat: formData.samsat || null,
      bidang: formData.bidang || null,
      unitKerja: formData.unitKerja || 'Kantor Wilayah',
      status: 'Menunggu Persetujuan',
      password: formData.password || 'password123',
      createdAt: new Date().toISOString(),
    };

    const updatedList = [newUser, ...users];
    setStoredUsers(updatedList);

    return {
      success: true,
      data: newUser,
    };
  },

  addUserByAdmin: async (formData) => {
    const users = getStoredUsers();

    // Check duplicate email
    const exists = users.some((u) => u.email.toLowerCase() === formData.email.trim().toLowerCase());
    if (exists) {
      throw new Error('Email tersebut sudah terdaftar di sistem.');
    }

    let role = formData.role || 'petugas_jr';
    let jabatanLabel = formData.jabatan || 'Petugas JR';

    const newUser = {
      penggunaId: Date.now(),
      nama: formData.nama || formData.namaLengkap,
      email: formData.email.trim(),
      nipNik: formData.nipNik || '-',
      nomorHp: formData.nomorHp || '-',
      jabatan: jabatanLabel,
      role: role,
      wilayah: formData.wilayah || null,
      samsat: formData.samsat || null,
      bidang: formData.bidang || null,
      unitKerja: formData.unitKerja || 'Kantor Wilayah',
      status: 'Aktif', // Directly active when added by Admin!
      password: formData.password || 'password123',
      createdAt: new Date().toISOString(),
    };

    const updatedList = [newUser, ...users];
    setStoredUsers(updatedList);

    return {
      success: true,
      data: newUser,
    };
  },

  approveUser: async (penggunaId) => {
    const users = getStoredUsers();
    const updated = users.map((u) => (u.penggunaId === penggunaId ? { ...u, status: 'Aktif' } : u));
    setStoredUsers(updated);
    return { success: true };
  },

  rejectUser: async (penggunaId) => {
    const users = getStoredUsers();
    const updated = users.map((u) => (u.penggunaId === penggunaId ? { ...u, status: 'Ditolak' } : u));
    setStoredUsers(updated);
    return { success: true };
  },

  toggleUserStatus: async (penggunaId) => {
    const users = getStoredUsers();
    const updated = users.map((u) =>
      u.penggunaId === penggunaId ? { ...u, status: u.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : u
    );
    setStoredUsers(updated);
    return { success: true };
  },

  updateUser: async (penggunaId, updatedFields) => {
    const users = getStoredUsers();
    const updated = users.map((u) => (u.penggunaId === penggunaId ? { ...u, ...updatedFields } : u));
    setStoredUsers(updated);
    return { success: true };
  },

  resetPassword: async (penggunaId, newPassword) => {
    const users = getStoredUsers();
    const updated = users.map((u) =>
      u.penggunaId === penggunaId ? { ...u, password: newPassword || 'password123' } : u
    );
    setStoredUsers(updated);
    return { success: true };
  },

  deleteUser: async (penggunaId) => {
    const users = getStoredUsers();
    const updated = users.filter((u) => u.penggunaId !== penggunaId);
    setStoredUsers(updated);
    return { success: true };
  },
};

export default authService;
