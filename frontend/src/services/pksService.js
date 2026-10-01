// Standalone Mock PKS Service (Pure Frontend Focus)

const getInitialMockData = () => [
  {
    pksId: 1,
    nomorPKS: 'PKS/2026/08/001',
    judulPKS: 'Kerjasama Pelayanan Kesehatan & Klaim Rumah Sakit',
    bidang: 'Pelayanan',
    jenisPKS: 'IWKL Borongan',
    tanggalMulai: '2026-08-05',
    tanggalBerakhir: '2029-08-05',
    statusPks: 'Aktif',
    statusPersetujuan: 'Disetujui',
    statusDokumen: 'Sudah Diunggah',
    ruangLingkup: 'Pelayanan kesehatan dan penjaminan korban kecelakaan di rumah sakit.',
    mitra: {
      namaPerusahaan: 'RSUD Dr. Soetomo',
      kontak: '031-5501234',
      alamat: 'Jl. Mayjen Prof. Dr. Moestopo No. 6-8, Surabaya',
      penanggungJawab: 'dr. Ahmad Santoso, Sp.OT',
      jabatan: 'Direktur Operasional',
      email: 'kerjasama@rsud-soetomo.go.id',
    },
    pembuat: { nama: 'Budi Santoso' },
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-08-05T13:25:00Z',
  },
  {
    pksId: 2,
    nomorPKS: 'PKS/2026/08/052',
    judulPKS: 'Digitalisasi Iuran Wajib Pelabuhan Gilimanuk',
    bidang: 'IW',
    jenisPKS: 'IWKL Manifest',
    tanggalMulai: '2026-08-10',
    tanggalBerakhir: '2027-08-10',
    statusPks: 'Draft',
    statusPersetujuan: 'Pemeriksaan Pimpinan',
    statusDokumen: 'Belum Diunggah',
    ruangLingkup: 'Integrasi sistem iuran wajib manifest armada kapal feri.',
    mitra: {
      namaPerusahaan: 'PT ASDP Indonesia Ferry',
      kontak: '021-4208911',
      alamat: 'Jl. Jend. Ahmad Yani No. 52, Jakarta Pusat',
      penanggungJawab: 'Budi Santoso',
      jabatan: 'Head of Partnerships',
      email: 'kerjasama@indonesiaferry.co.id',
    },
    pembuat: { nama: 'Petugas JR' },
    createdAt: '2026-08-10T10:00:00Z',
    updatedAt: '2026-08-10T10:00:00Z',
  },
  {
    pksId: 3,
    nomorPKS: 'PKS/2025/09/118',
    judulPKS: 'Penetapan Fasilitas Pembayaran Sumbangan Wajib',
    bidang: 'SW',
    jenisPKS: 'Kerja Sama Operasional',
    tanggalMulai: '2025-09-01',
    tanggalBerakhir: '2026-10-01',
    statusPks: 'Segera Berakhir',
    statusPersetujuan: 'Disetujui',
    statusDokumen: 'Sudah Diunggah',
    ruangLingkup: 'Fasilitas pembayaran Sumbangan Wajib Dana Kecelakaan Lalu Lintas Jalan.',
    mitra: {
      namaPerusahaan: 'Bank Mandiri (Persero) Tbk.',
      kontak: '021-5265000',
      alamat: 'Jl. Jend. Gatot Subroto Plaza Mandiri, Jakarta',
      penanggungJawab: 'Dedi Kurniawan',
      jabatan: 'AVP Institutional Banking',
      email: 'institutional@bankmandiri.co.id',
    },
    pembuat: { nama: 'Andi Wijaya' },
    createdAt: '2025-09-01T08:30:00Z',
    updatedAt: '2025-09-01T14:00:00Z',
  }
];

const loadStorage = () => {
  const data = localStorage.getItem('mock_pks_list');
  if (data) return JSON.parse(data);
  const initial = getInitialMockData();
  localStorage.setItem('mock_pks_list', JSON.stringify(initial));
  return initial;
};

const saveStorage = (list) => {
  localStorage.setItem('mock_pks_list', JSON.stringify(list));
};

export const pksService = {
  getPksList: async () => {
    const list = loadStorage();
    return { success: true, data: list };
  },

  getPksById: async (id) => {
    const list = loadStorage();
    const item = list.find((p) => String(p.pksId) === String(id)) || list[0];
    return { success: true, data: item };
  },

  createPks: async (data) => {
    const list = loadStorage();
    const newPks = {
      pksId: Date.now(),
      nomorPKS: `PKS/${new Date().getFullYear()}/${String(list.length + 1).padStart(3, '0')}`,
      judulPKS: data.judulPKS || data.ruangLingkup || 'PKS Baru',
      bidang: data.bidang || 'Pelayanan',
      jenisPKS: data.jenisPKS || 'Kerja Sama Operasional',
      tanggalMulai: data.tanggalMulai || new Date().toISOString().split('T')[0],
      tanggalBerakhir: data.tanggalBerakhir || '2028-12-31',
      statusPks: 'Draft',
      statusPersetujuan: 'Draft',
      statusDokumen: 'Belum Diunggah',
      ruangLingkup: data.ruangLingkup || data.judulPKS || 'Ruang lingkup kerjasama.',
      mitra: {
        namaPerusahaan: data.namaPerusahaan || data.namaMitra || 'Perusahaan Mitra Baru',
        kontak: data.teleponMitra || '08123456789',
        alamat: data.alamatMitra || 'Alamat Perusahaan',
        penanggungJawab: data.penanggungJawabMitra || 'Penanggung Jawab',
        email: data.emailMitra || 'mitra@email.com',
      },
      pembuat: { nama: 'Petugas JR' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newPks, ...list];
    saveStorage(updated);
    return { success: true, data: newPks };
  },

  updatePks: async (id, data) => {
    const list = loadStorage();
    let updatedItem = null;
    const updated = list.map((p) => {
      if (String(p.pksId) === String(id)) {
        updatedItem = { ...p, ...data, updatedAt: new Date().toISOString() };
        return updatedItem;
      }
      return p;
    });
    saveStorage(updated);
    return { success: true, data: updatedItem };
  },

  deletePks: async (id) => {
    const list = loadStorage();
    const updated = list.filter((p) => String(p.pksId) !== String(id));
    saveStorage(updated);
    return { success: true };
  },

  pengakhiranPks: async (id, payload) => {
    const list = loadStorage();
    const updated = list.map((p) => {
      if (String(p.pksId) === String(id)) {
        return {
          ...p,
          statusPks: 'Dibatalkan',
          alasanPengakhiran: payload.alasan,
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });
    saveStorage(updated);
    return { success: true };
  },

  downloadDraft: async () => {
    const blob = new Blob(['Mock Draft PKS Document Content'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    return { data: blob };
  },

  konfirmasiPenyerahan: async (id) => {
    return pksService.updatePks(id, { statusPersetujuan: 'Pemeriksaan Pengelola' });
  },

  setujuiPengelola: async (id) => {
    return pksService.updatePks(id, { statusPersetujuan: 'Pemeriksaan Kabag' });
  },

  tolakPengelola: async (id, catatan) => {
    return pksService.updatePks(id, { statusPersetujuan: 'Revisi Pengelola', catatanRevisi: catatan });
  },

  uploadDokumenFinal: async (id) => {
    return pksService.updatePks(id, { statusPersetujuan: 'Disetujui', statusPks: 'Aktif', statusDokumen: 'Sudah Diunggah' });
  },

  setujuiKabag: async (id) => {
    return pksService.updatePks(id, { statusPersetujuan: 'Pemeriksaan Pimpinan' });
  },

  tolakKabag: async (id, catatan) => {
    return pksService.updatePks(id, { statusPersetujuan: 'Revisi Kabag', catatanRevisi: catatan });
  },

  setujuiPimpinan: async (id) => {
    return pksService.updatePks(id, { statusPersetujuan: 'Disetujui Pimpinan' });
  },

  tolakPimpinan: async (id, catatan) => {
    return pksService.updatePks(id, { statusPersetujuan: 'Revisi Pimpinan', catatanRevisi: catatan });
  },

  exportPks: async () => {
    const blob = new Blob(['Mock Excel Content'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return { data: blob };
  },

  getPksRiwayat: async (id) => {
    return {
      success: true,
      data: [
        { riwayatId: 1, aksi: 'Drafting PKS', namaAktor: 'Petugas JR', tanggal: new Date().toISOString(), catatan: 'Draft diajukan.' },
        { riwayatId: 2, aksi: 'Persetujuan Pengelola', namaAktor: 'Pengelola PKS', tanggal: new Date().toISOString(), catatan: 'Memenuhi syarat.' },
      ],
    };
  },
};
