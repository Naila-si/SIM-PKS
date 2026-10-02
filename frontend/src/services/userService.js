import authService from './authService';

export const userService = {
  getUsers: async (params = {}) => {
    const res = await authService.getAllUsers();
    let users = res.data;
    if (params.search) {
      const q = params.search.toLowerCase();
      users = users.filter(u => 
        (u.nama || '').toLowerCase().includes(q) || 
        (u.email || '').toLowerCase().includes(q)
      );
    }
    return { status: 'success', data: users };
  },

  getUserById: async (id) => {
    const res = await authService.getAllUsers();
    const user = res.data.find(u => u.penggunaId === Number(id));
    return { status: 'success', data: user };
  },

  createUser: async (data) => {
    const res = await authService.addUserByAdmin(data);
    return { status: 'success', data: res.data };
  },

  updateUser: async (id, data) => {
    const res = await authService.updateUser(Number(id), data);
    return { status: 'success', data: res };
  },

  toggleUserStatus: async (id) => {
    const res = await authService.toggleUserStatus(Number(id));
    return { status: 'success', data: res };
  },

  deleteUser: async (id) => {
    const res = await authService.deleteUser(Number(id));
    return { status: 'success', message: 'Pengguna berhasil dihapus' };
  },

  approveUser: async (id) => {
    const res = await authService.approveUser(Number(id));
    return { status: 'success', data: res };
  },

  rejectUser: async (id) => {
    const res = await authService.rejectUser(Number(id));
    return { status: 'success', data: res };
  },
};


