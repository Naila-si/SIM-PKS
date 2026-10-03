// Standalone Mock Mitra Service (Pure Frontend Focus)

const sampleMitraData = [
  {
    perusahaanId: 1,
    mitraId: 'MITRA-00122',
    namaPerusahaan: 'PT Riau Transport',
    jenisMitra: 'Perusahaan Angkutan Umum',
    bidang: 'IW',
    penanggungJawab: 'Andi Saputra',
    jabatan: 'Manager Operasional',
    kontak: '081212345678',
    email: 'transport@email.com',
    statusPks: 'Aktif',
    status: 'Aktif',
    alamat: 'Jl. Jenderal Sudirman No. 123, Kel. Sago, Kec. Senapelan, Kota Pekanbaru, Riau 28155',
    jumlahPksAktif: 5,
  },
  {
    perusahaanId: 2,
    mitraId: 'MITRA-00045',
    namaPerusahaan: 'Bapenda Provinsi Riau',
    jenisMitra: 'Instansi Pemerintah',
    bidang: 'SW',
    penanggungJawab: 'Dedi Kurniawan',
    jabatan: 'Kepala Bidang Pendapatan',
    kontak: '0761123455',
    email: 'bapenda@email.com',
    statusPks: 'Aktif',
    status: 'Aktif',
    alamat: 'Jl. Cut Nyak Dien No. 8, Pekanbaru, Riau',
    jumlahPksAktif: 8,
  },
  {
    perusahaanId: 3,
    mitraId: 'MITRA-00210',
    namaPerusahaan: 'RSUD Arifin Achmad',
    jenisMitra: 'Rumah Sakit',
    bidang: 'PELAYANAN',
    penanggungJawab: 'dr. Ahmad',
    jabatan: 'Direktur Pelayanan',
    kontak: '081398765432',
    email: 'rsud@email.com',
    statusPks: 'Segera Berakhir',
    status: 'Aktif',
    alamat: 'Jl. Diponegoro No. 2, Pekanbaru, Riau',
    jumlahPksAktif: 3,
  },
  {
    perusahaanId: 4,
    mitraId: 'MITRA-00305',
    namaPerusahaan: 'PT ASDP Indonesia Ferry',
    jenisMitra: 'BUMN / Korporasi',
    bidang: 'IW',
    penanggungJawab: 'Budi Santoso',
    jabatan: 'Head of Partnerships',
    kontak: '081234567890',
    email: 'budi.santoso@perusahaan.com',
    statusPks: 'Aktif',
    status: 'Aktif',
    alamat: 'Jl. Sudirman No. 123, Blok M, Jakarta Selatan',
    jumlahPksAktif: 12,
  },
];

const loadMitraStorage = () => {
  const data = localStorage.getItem('mock_mitra_list');
  if (data) return JSON.parse(data);
  localStorage.setItem('mock_mitra_list', JSON.stringify(sampleMitraData));
  return sampleMitraData;
};

const saveMitraStorage = (list) => {
  localStorage.setItem('mock_mitra_list', JSON.stringify(list));
};

export const mitraService = {
  getMitraList: async () => {
    localStorage.removeItem('mock_mitra_list');
    try {
      const res = await fetch('http://localhost:8000/api/mitra');
      const data = await res.json();
      return { success: true, data: data };
    } catch (err) {
      return { success: true, data: [] };
    }
  },

  getMitraById: async (id) => {
    const list = loadMitraStorage();
    const item = list.find((m) => String(m.perusahaanId) === String(id) || String(m.mitraId) === String(id)) || list[0];
    return { success: true, data: item };
  },

  createMitra: async (data) => {
    try {
      const res = await fetch('http://localhost:8000/api/mitra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const newMitra = await res.json();
      return { success: true, data: newMitra };
    } catch (err) {
      return { success: false, message: 'Gagal menambah mitra' };
    }
  },

  updateMitra: async (id, data) => {
    try {
      const res = await fetch(`http://localhost:8000/api/mitra/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const updatedItem = await res.json();
      return { success: true, data: updatedItem };
    } catch (err) {
      return { success: false, message: 'Gagal update' };
    }
  },

  updateStatus: async (id, status) => {
    return mitraService.updateMitra(id, { status, statusPks: status });
  },

  exportMitra: async () => {
    const blob = new Blob(['Mock Excel Mitra Data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return { data: blob };
  },
};
