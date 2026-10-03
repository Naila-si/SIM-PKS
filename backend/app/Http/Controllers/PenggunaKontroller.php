<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;

/**
 * Kontroller Pengguna (PenggunaKontroller)
 * Mengatur Registrasi Mandiri, Tambah oleh Admin, Persetujuan (Setujui/Tolak), Edit, & Hapus Pengguna
 */
class PenggunaKontroller extends Controller
{
    /**
     * Tampilkan Semua Pengguna (GET /api/pengguna)
     */
    public function tampilkanSemua(Request $permintaan)
    {
        $query = Pengguna::query();

        // Pencarian Kata Kunci
        if ($permintaan->filled('cari')) {
            $q = strtolower($permintaan->cari);
            $query->where(function ($sub) use ($q) {
                $sub->whereRaw('LOWER(nama) LIKE ?', ["%{$q}%"])
                    ->orWhereRaw('LOWER(email) LIKE ?', ["%{$q}%"]);
            });
        }

        // Filter Peran / Role
        if ($permintaan->filled('role') && $permintaan->role !== 'Semua Peran') {
            $query->where('role', $permintaan->role);
        }

        // Filter Status
        if ($permintaan->filled('status') && $permintaan->status !== 'Semua Status') {
            $query->where('status', $permintaan->status);
        }

        $daftarPengguna = $query->orderBy('created_at', 'desc')->get()->map(function ($p) {
            return [
                'penggunaId' => $p->penggunaId,
                'nama' => $p->nama,
                'email' => $p->email,
                'nomorHp' => $p->nomor_hp,
                'jabatan' => $p->jabatan,
                'role' => $p->role,
                'wilayah' => $p->wilayah,
                'samsat' => $p->samsat,
                'bidang' => $p->bidang,
                'status' => $p->status,
                'createdAt' => $p->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'status' => 'sukses',
            'data' => $daftarPengguna,
        ], 200);
    }

    /**
     * Tampilkan Detail Pengguna Berdasarkan ID (GET /api/pengguna/{id})
     */
    public function tampilkanDetail($id)
    {
        $p = Pengguna::find($id);
        if (!$p) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Pengguna tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'status' => 'sukses',
            'data' => [
                'penggunaId' => $p->penggunaId,
                'nama' => $p->nama,
                'email' => $p->email,
                'nomorHp' => $p->nomor_hp,
                'jabatan' => $p->jabatan,
                'role' => $p->role,
                'wilayah' => $p->wilayah,
                'samsat' => $p->samsat,
                'bidang' => $p->bidang,
                'status' => $p->status,
                'createdAt' => $p->created_at->toIso8601String(),
            ],
        ], 200);
    }

    /**
     * Registrasi Mandiri Pengguna Baru dari Frontend (POST /api/pengguna/daftar)
     * Status otomatis: 'Menunggu Persetujuan'
     */
    public function registrasiMandiri(Request $permintaan)
    {
        // 1. Validasi Input Registrasi
        $permintaan->validate([
            'namaLengkap' => 'required|string|max:100',
            'email' => 'required|email|unique:pengguna,email',
            'password' => 'required|string|min:8',
            'nomorHp' => 'nullable|string',
            'wilayah' => 'nullable|string',
            'samsat' => 'nullable|string',
            'bidang' => 'nullable|string',
        ], [
            'namaLengkap.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.unique' => 'Email tersebut sudah terdaftar di sistem. Gunakan email lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal harus 8 karakter.',
        ]);

        // 2. Menentukan Role Sesuai Pilihan Jabatan / Peran
        $role = $permintaan->role ?? 'petugas_jr';
        if ($permintaan->jabatan === 'Pengelola PKS' || $permintaan->role === 'pengelola_pks') {
            $role = 'pengelola_pks';
        }

        // 3. Simpan Pengguna Baru ke Database
        $penggunaBaru = Pengguna::create([
            'nama' => trim($permintaan->namaLengkap),
            'email' => strtolower(trim($permintaan->email)),
            'password' => Hash::make($permintaan->password),
            'nomor_hp' => $permintaan->nomorHp ?? '-',
            'role' => $role,
            'wilayah' => $permintaan->wilayah ?? null,
            'samsat' => $permintaan->samsat ?? null,
            'bidang' => $permintaan->bidang ?? null,
            'status' => 'Menunggu Persetujuan', // Status awal pengajuan
        ]);

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Registrasi berhasil! Akun Anda sedang Menunggu Persetujuan Administrator Utama.',
            'data' => [
                'penggunaId' => $penggunaBaru->penggunaId,
                'nama' => $penggunaBaru->nama,
                'email' => $penggunaBaru->email,
                'status' => $penggunaBaru->status,
            ],
        ], 201);
    }

    /**
     * Tambah Pengguna Langsung oleh Admin Utama (POST /api/pengguna/tambah)
     * Status otomatis: 'Aktif'
     */
    public function tambahOlehAdmin(Request $permintaan)
    {
        $permintaan->validate([
            'nama' => 'required|string|max:100',
            'email' => 'required|email|unique:pengguna,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string',
        ], [
            'nama.required' => 'Nama pengguna wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $role = $permintaan->role;

        $pengguna = Pengguna::create([
            'nama' => trim($permintaan->nama),
            'email' => strtolower(trim($permintaan->email)),
            'password' => Hash::make($permintaan->password),
            'nomor_hp' => $permintaan->nomorHp ?? '-',
            'role' => $role,
            'wilayah' => $permintaan->wilayah ?? null,
            'samsat' => $permintaan->samsat ?? null,
            'bidang' => $permintaan->bidang ?? null,
            'status' => $permintaan->status ?? 'Aktif', // Langsung Aktif jika ditambah oleh Admin
        ]);

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Pengguna baru berhasil ditambahkan.',
            'data' => $pengguna,
        ], 201);
    }

    /**
     * Setujui Pengguna (PUT /api/pengguna/{id}/setujui)
     */
    public function setujuiPengguna($id)
    {
        $pengguna = Pengguna::find($id);
        if (!$pengguna) {
            return response()->json(['status' => 'gagal', 'pesan' => 'Pengguna tidak ditemukan.'], 404);
        }

        $pengguna->status = 'Aktif';
        $pengguna->save();

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Akun pengguna berhasil disetujui dan diaktifkan.',
        ], 200);
    }

    /**
     * Tolak Pengguna (PUT /api/pengguna/{id}/tolak)
     */
    public function tolakPengguna($id)
    {
        $pengguna = Pengguna::find($id);
        if (!$pengguna) {
            return response()->json(['status' => 'gagal', 'pesan' => 'Pengguna tidak ditemukan.'], 404);
        }

        $pengguna->status = 'Ditolak';
        $pengguna->save();

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Pengajuan akun pengguna telah ditolak.',
        ], 200);
    }

    /**
     * Ubah Status Aktif / Nonaktif (PUT /api/pengguna/{id}/ubah-status)
     */
    public function ubahStatus($id)
    {
        $pengguna = Pengguna::find($id);
        if (!$pengguna) {
            return response()->json(['status' => 'gagal', 'pesan' => 'Pengguna tidak ditemukan.'], 404);
        }

        // Proteksi Akun Inti/Preset (Admin Utama, Kabag, Pimpinan) tidak boleh dinonaktifkan
        if (in_array($pengguna->role, ['admin_utama', 'kabag', 'pimpinan'])) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Akun inti sistem tidak dapat dinonaktifkan.',
            ], 403);
        }

        $pengguna->status = ($pengguna->status === 'Aktif') ? 'Nonaktif' : 'Aktif';
        $pengguna->save();

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Status pengguna berhasil diperbarui.',
            'data' => ['status' => $pengguna->status],
        ], 200);
    }

    /**
     * Perbarui Data Pengguna (PUT /api/pengguna/{id})
     */
    public function perbaruiPengguna(Request $permintaan, $id)
    {
        $pengguna = Pengguna::find($id);
        if (!$pengguna) {
            return response()->json(['status' => 'gagal', 'pesan' => 'Pengguna tidak ditemukan.'], 404);
        }

        if ($permintaan->filled('nama')) $pengguna->nama = trim($permintaan->nama);
        if ($permintaan->filled('email')) $pengguna->email = strtolower(trim($permintaan->email));
        if ($permintaan->filled('nomorHp')) $pengguna->nomor_hp = $permintaan->nomorHp;
        if ($permintaan->filled('wilayah')) $pengguna->wilayah = $permintaan->wilayah;
        if ($permintaan->filled('samsat')) $pengguna->samsat = $permintaan->samsat;
        if ($permintaan->filled('bidang')) $pengguna->bidang = $permintaan->bidang;
        if ($permintaan->filled('status')) $pengguna->status = $permintaan->status;

        // Jika mengisi password baru
        if ($permintaan->filled('password')) {
            $pengguna->password = Hash::make($permintaan->password);
        }

        $pengguna->save();

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Data pengguna berhasil diperbarui.',
        ], 200);
    }

    /**
     * Hapus Pengguna (DELETE /api/pengguna/{id})
     */
    public function hapusPengguna($id)
    {
        $pengguna = Pengguna::find($id);
        if (!$pengguna) {
            return response()->json(['status' => 'gagal', 'pesan' => 'Pengguna tidak ditemukan.'], 404);
        }

        // Proteksi Akun Inti/Preset (Admin Utama, Kabag, Pimpinan) tidak boleh dihapus
        if (in_array($pengguna->role, ['admin_utama', 'kabag', 'pimpinan'])) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Akun inti sistem terlindungi dan tidak dapat dihapus.',
            ], 403);
        }

        $pengguna->delete();

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Pengguna berhasil dihapus dari database.',
        ], 200);
    }
}
