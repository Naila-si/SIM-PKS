const MOCK_USERS = [
  { id: 1, name: 'Budi Petugas Jr', email: 'petugas@pks.com', role: 'petugas_jr', unit: 'Teknologi Informasi', is_active: true },
  { id: 2, name: 'Ahmad Pengelola PKS', email: 'pengelola@pks.com', role: 'pengelola_pks', unit: 'Hukum & Kerjasama', is_active: true },
  { id: 3, name: 'Drs. Hendra Kabag', email: 'kabag@pks.com', role: 'kabag', unit: 'Bagian Hukum', is_active: true },
  { id: 4, name: 'Dr. Retno Pimpinan', email: 'pimpinan@pks.com', role: 'pimpinan', unit: 'Direksi', is_active: true },
  { id: 5, name: 'Admin System', email: 'admin@pks.com', role: 'admin_utama', unit: 'Sistem Informasi', is_active: true },
];

const getStoredUsers = () => {
  const saved = localStorage.getItem('pks_users_mock');
  return saved ? JSON.parse(saved) : MOCK_USERS;
};

const saveStoredUsers = (users) => {
  localStorage.setItem('pks_users_mock', JSON.stringify(users));
};

export const userService = {
  getUsers: async (params = {}) => {
    let users = getStoredUsers();
    if (params.search) {
      const q = params.search.toLowerCase();
      users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return { status: 'success', data: users };
  },

  getUserById: async (id) => {
    const users = getStoredUsers();
    const user = users.find(u => u.id === Number(id));
    return { status: 'success', data: user };
  },

  createUser: async (data) => {
    const users = getStoredUsers();
    const newUser = { id: Date.now(), ...data, is_active: true };
    users.push(newUser);
    saveStoredUsers(users);
    return { status: 'success', data: newUser };
  },

  updateUser: async (id, data) => {
    const users = getStoredUsers();
    const idx = users.findIndex(u => u.id === Number(id));
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data };
      saveStoredUsers(users);
    }
    return { status: 'success', data: users[idx] };
  },

  toggleUserStatus: async (id, isActive) => {
    const users = getStoredUsers();
    const user = users.find(u => u.id === Number(id));
    if (user) {
      user.is_active = isActive;
      saveStoredUsers(users);
    }
    return { status: 'success', data: user };
  },

  deleteUser: async (id) => {
    let users = getStoredUsers();
    users = users.filter(u => u.id !== Number(id));
    saveStoredUsers(users);
    return { status: 'success', message: 'Pengguna berhasil dihapus' };
  },
};

