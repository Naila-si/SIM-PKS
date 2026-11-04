import ExcelJS from 'exceljs';
import logoJrPanjang from '../assets/logo-jr-panjang.png';

/**
 * Helper to fetch image and convert to ArrayBuffer
 */
const getImageBuffer = async (url) => {
  try {
    const res = await fetch(url);
    return await res.arrayBuffer();
  } catch (err) {
    console.error('Failed to load logo image for Excel:', err);
    return null;
  }
};

/**
 * Format date helper to Indonesian locale
 */
const formatTglIndo = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

const thinBorder = {
  top: { style: 'thin', color: { argb: 'FF000000' } },
  left: { style: 'thin', color: { argb: 'FF000000' } },
  bottom: { style: 'thin', color: { argb: 'FF000000' } },
  right: { style: 'thin', color: { argb: 'FF000000' } }
};

/**
 * 1. Export Data PKS to Excel
 */
export const exportPksToExcel = async ({ data = [], filters = {}, user = null }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SIM-PKS Jasa Raharja';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Rekap PKS', {
    views: [{ showGridLines: true }]
  });

  // Setup Column Widths
  worksheet.columns = [
    { key: 'no', width: 6 },
    { key: 'nomor_pks', width: 22 },
    { key: 'nama_mitra', width: 36 },
    { key: 'bidang', width: 14 },
    { key: 'jenis_pks', width: 24 },
    { key: 'tanggal_mulai', width: 18 },
    { key: 'tanggal_berakhir', width: 18 },
    { key: 'status', width: 16 }
  ];

  // 1. Add Logo
  const logoBuffer = await getImageBuffer(logoJrPanjang);
  if (logoBuffer) {
    const imageId = workbook.addImage({
      buffer: logoBuffer,
      extension: 'png',
    });
    worksheet.addImage(imageId, {
      tl: { col: 0.1, row: 0.3 },
      ext: { width: 160, height: 42 }
    });
  }

  // Row 1 to 3 spacer for logo
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);

  // 2. Official Header
  const title1 = worksheet.addRow(['PT JASA RAHARJA KANTOR WILAYAH RIAU']);
  title1.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FF000000' } };
  title1.alignment = { vertical: 'middle' };

  const title2 = worksheet.addRow(['LAPORAN REKAPITULASI PERJANJIAN KERJA SAMA (PKS)']);
  title2.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } };
  title2.alignment = { vertical: 'middle' };

  const tglCetak = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const filterInfo = [];
  if (filters.bidang && filters.bidang !== 'Semua' && filters.bidang !== 'Semua Bidang') filterInfo.push(`Bidang: ${filters.bidang}`);
  if (filters.status && filters.status !== 'Semua' && filters.status !== 'Semua Status') filterInfo.push(`Status: ${filters.status}`);
  if (filters.search) filterInfo.push(`Kata Kunci: "${filters.search}"`);
  const filterText = filterInfo.length > 0 ? filterInfo.join(' | ') : 'Semua Data';

  const subtitle = worksheet.addRow([`Kriteria: ${filterText}  |  Tanggal Cetak: ${tglCetak}  |  Total: ${data.length} Dokumen`]);
  subtitle.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF444444' } };
  subtitle.alignment = { vertical: 'middle' };

  worksheet.addRow([]); // Spacer

  // 3. Table Header (Clean Black & White, No Color Fills)
  const headerRow = worksheet.addRow([
    'NO',
    'NOMOR PKS',
    'NAMA MITRA',
    'BIDANG',
    'JENIS PKS',
    'TANGGAL MULAI',
    'TANGGAL BERAKHIR',
    'STATUS'
  ]);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000000' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });

  // 4. Data Rows (Clean White, Standard Borders)
  data.forEach((item, index) => {
    const nomorPks = item.nomor_pks || item.nomorPKS || item.nomorDokumen || '-';
    const namaMitra = item.mitra?.nama_mitra || item.perusahaan || item.namaPerusahaan || '-';
    const bidang = item.bidang || '-';
    const jenisPks = item.jenis_pks || item.jenisPKS || item.jenisTag || '-';
    const tglMulai = formatTglIndo(item.tanggal_mulai || item.tanggalMulai);
    const tglBerakhir = formatTglIndo(item.tanggal_berakhir || item.tanggalBerakhir);
    const status = item.status_pks || item.statusPks || item.status || 'Draf';

    const row = worksheet.addRow([
      index + 1,
      nomorPks,
      namaMitra,
      bidang,
      jenisPks,
      tglMulai,
      tglBerakhir,
      status
    ]);
    row.height = 20;

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF000000' } };
      cell.border = thinBorder;
      if (colNumber === 1 || colNumber === 4 || colNumber === 6 || colNumber === 7 || colNumber === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  // Spacer before signatures
  worksheet.addRow([]);
  worksheet.addRow([]);

  // 5. Signature Footer Block (2 Columns: Left = Kepala Kantor Wilayah, Right = Pengelola / Admin)
  const roleName = (user?.role === 'admin_utama' || user?.role === 'admin') ? 'Administrator' : 'Pengelola PKS';
  const userName = user?.nama || user?.nama_pengguna || 'Pengelola PKS';
  const userId = user?.pengguna_id || user?.penggunaId || user?.id || '';

  const sigRow1 = worksheet.addRow(['', 'Mengetahui,', '', '', '', `Pekanbaru, ${tglCetak}`, '']);
  sigRow1.font = { name: 'Calibri', size: 10, bold: false };

  const sigRow2 = worksheet.addRow(['', 'Kepala Kantor Wilayah,', '', '', '', `${roleName},`, '']);
  sigRow2.font = { name: 'Calibri', size: 10, bold: false };

  // Space for physical signature (3 empty rows)
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);

  const sigRow3 = worksheet.addRow([
    '',
    '( .................................................... )',
    '',
    '',
    '',
    `( ${userName} )`,
    ''
  ]);
  sigRow3.font = { name: 'Calibri', size: 10, bold: true };

  const sigRow4 = worksheet.addRow([
    '',
    'NIP. .................................................',
    '',
    '',
    '',
    userId ? `NIP/ID. ${userId}` : 'NIP/ID. .................................................',
    ''
  ]);
  sigRow4.font = { name: 'Calibri', size: 9 };

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Laporan_PKS_JR_Riau_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * 2. Export Data Perusahaan (Mitra) to Excel
 */
export const exportMitraToExcel = async ({ data = [], filters = {}, user = null }) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SIM-PKS Jasa Raharja';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Rekap Mitra', {
    views: [{ showGridLines: true }]
  });

  // Setup Column Widths
  worksheet.columns = [
    { key: 'no', width: 6 },
    { key: 'nama_mitra', width: 36 },
    { key: 'bidang', width: 14 },
    { key: 'penanggung_jawab', width: 26 },
    { key: 'jabatan', width: 22 },
    { key: 'telepon', width: 18 },
    { key: 'email', width: 26 },
    { key: 'status', width: 14 }
  ];

  // 1. Add Logo
  const logoBuffer = await getImageBuffer(logoJrPanjang);
  if (logoBuffer) {
    const imageId = workbook.addImage({
      buffer: logoBuffer,
      extension: 'png',
    });
    worksheet.addImage(imageId, {
      tl: { col: 0.1, row: 0.3 },
      ext: { width: 160, height: 42 }
    });
  }

  // Row 1 to 3 spacer for logo
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);

  // 2. Official Header
  const title1 = worksheet.addRow(['PT JASA RAHARJA KANTOR WILAYAH RIAU']);
  title1.font = { name: 'Calibri', size: 13, bold: true, color: { argb: 'FF000000' } };
  title1.alignment = { vertical: 'middle' };

  const title2 = worksheet.addRow(['LAPORAN DATA MITRA']);
  title2.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF000000' } };
  title2.alignment = { vertical: 'middle' };

  const tglCetak = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const filterInfo = [];
  if (filters.bidang && filters.bidang !== 'Semua') filterInfo.push(`Bidang: ${filters.bidang}`);
  if (filters.status && filters.status !== 'Semua') filterInfo.push(`Status: ${filters.status}`);
  if (filters.search) filterInfo.push(`Kata Kunci: "${filters.search}"`);
  const filterText = filterInfo.length > 0 ? filterInfo.join(' | ') : 'Semua Data';

  const subtitle = worksheet.addRow([`Kriteria: ${filterText}  |  Tanggal Cetak: ${tglCetak}  |  Total: ${data.length} Mitra`]);
  subtitle.font = { name: 'Calibri', size: 9, italic: true, color: { argb: 'FF444444' } };
  subtitle.alignment = { vertical: 'middle' };

  worksheet.addRow([]); // Spacer

  // 3. Table Header (Clean Black & White, No Color Fills)
  const headerRow = worksheet.addRow([
    'NO',
    'NAMA MITRA',
    'BIDANG',
    'PENANGGUNG JAWAB',
    'JABATAN',
    'KONTAK / NO HP',
    'EMAIL',
    'STATUS'
  ]);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000000' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = thinBorder;
  });

  // 4. Data Rows (Clean White, Standard Borders)
  data.forEach((item, index) => {
    const namaMitra = item.nama_mitra || item.namaPerusahaan || item.nama || '-';
    const bidang = item.bidang || '-';
    const pj = item.nama_pengelola || item.penanggungJawab || '-';
    const jabatan = item.jabatan_pengelola || item.jabatan || '-';
    const kontak = item.kontak_pengelola || item.no_hp_pengelola || item.kontak || item.telepon || '-';
    const email = item.email_pengelola || item.email || '-';
    const status = item.status_mitra || item.status || 'Aktif';

    const row = worksheet.addRow([
      index + 1,
      namaMitra,
      bidang,
      pj,
      jabatan,
      kontak,
      email,
      status
    ]);
    row.height = 20;

    row.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF000000' } };
      cell.border = thinBorder;
      if (colNumber === 1 || colNumber === 3 || colNumber === 6 || colNumber === 8) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      }
    });
  });

  // Spacer before signatures
  worksheet.addRow([]);
  worksheet.addRow([]);

  // 5. Signature Footer Block (2 Columns: Left = Kepala Kantor Wilayah, Right = Pengelola / Admin)
  const roleName = (user?.role === 'admin_utama' || user?.role === 'admin') ? 'Administrator' : 'Pengelola PKS';
  const userName = user?.nama || user?.nama_pengguna || 'Pengelola PKS';
  const userId = user?.pengguna_id || user?.penggunaId || user?.id || '';

  const sigRow1 = worksheet.addRow(['', 'Mengetahui,', '', '', '', `Pekanbaru, ${tglCetak}`, '']);
  sigRow1.font = { name: 'Calibri', size: 10, bold: false };

  const sigRow2 = worksheet.addRow(['', 'Kepala Kantor Wilayah,', '', '', '', `${roleName},`, '']);
  sigRow2.font = { name: 'Calibri', size: 10, bold: false };

  // Space for physical signature (3 empty rows)
  worksheet.addRow([]);
  worksheet.addRow([]);
  worksheet.addRow([]);

  const sigRow3 = worksheet.addRow([
    '',
    '( .................................................... )',
    '',
    '',
    '',
    `( ${userName} )`,
    ''
  ]);
  sigRow3.font = { name: 'Calibri', size: 10, bold: true };

  const sigRow4 = worksheet.addRow([
    '',
    'NIP. .................................................',
    '',
    '',
    '',
    userId ? `NIP/ID. ${userId}` : 'NIP/ID. .................................................',
    ''
  ]);
  sigRow4.font = { name: 'Calibri', size: 9 };

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `Laporan_Mitra_JR_Riau_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};
