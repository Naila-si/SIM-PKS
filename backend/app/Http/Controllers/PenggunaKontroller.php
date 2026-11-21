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

        // Dukungan Pagination jika diminta (PERF-01)
        if ($permintaan->filled('per_page') || $permintaan->filled('page')) {
            $perPage = max(1, min((int) $permintaan->input('per_page', 20), 100));
            $paginated = $query->orderBy('created_at', 'desc')->paginate($perPage);
            $items = collect($paginated->items())->map(function ($p) {
                $id = $p->pengguna_id ?? $p->penggunaId;
                return [
                    'pengguna_id' => $id,
                    'penggunaId' => $id,
                    'nama' => $p->nama,
                    'email' => $p->email,
                    'nomor_hp' => $p->nomor_hp,
                    'nomorHp' => $p->nomor_hp,
                    'jabatan' => $p->jabatan,
                    'role' => $p->role,
                    'wilayah' => $p->wilayah,
                    'samsat' => $p->samsat,
                    'bidang' => $p->bidang,
                    'status' => $p->status,
                    'createdAt' => $p->created_at->toIso8601String(),
                    'created_at' => $p->created_at->toIso8601String(),
                ];
            });

            return response()->json([
                'status' => 'sukses',
                'data' => $items,
                'meta' => [
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                    'per_page' => $paginated->perPage(),
                    'total' => $paginated->total(),
                ]
            ], 200);
        }

        $daftarPengguna = $query->orderBy('created_at', 'desc')->get()->map(function ($p) {
            $id = $p->pengguna_id ?? $p->penggunaId;
            return [
                'pengguna_id' => $id,
                'penggunaId' => $id,
                'nama' => $p->nama,
                'email' => $p->email,
                'nomor_hp' => $p->nomor_hp,
                'nomorHp' => $p->nomor_hp,
                'jabatan' => $p->jabatan,
                'role' => $p->role,
                'wilayah' => $p->wilayah,
                'samsat' => $p->samsat,
                'bidang' => $p->bidang,
                'status' => $p->status,
                'createdAt' => $p->created_at->toIso8601String(),
                'created_at' => $p->created_at->toIso8601String(),
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

        $idPengguna = $p->pengguna_id ?? $p->penggunaId;

        return response()->json([
            'status' => 'sukses',
            'data' => [
                'pengguna_id' => $idPengguna,
                'penggunaId' => $idPengguna,
                'nama' => $p->nama,
                'email' => $p->email,
                'nomor_hp' => $p->nomor_hp,
                'nomorHp' => $p->nomor_hp,
                'jabatan' => $p->jabatan,
                'role' => $p->role,
                'wilayah' => $p->wilayah,
                'samsat' => $p->samsat,
                'bidang' => $p->bidang,
                'status' => $p->status,
                'createdAt' => $p->created_at->toIso8601String(),
                'created_at' => $p->created_at->toIso8601String(),
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
            'role' => 'nullable|string|in:petugas_jr,pengelola_pks',
            'wilayah' => 'nullable|string',
            'samsat' => 'nullable|string',
            'bidang' => 'nullable|string',
        ], [
            'namaLengkap.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.unique' => 'Email tersebut sudah terdaftar di sistem. Gunakan email lain.',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal harus 8 karakter.',
            'role.in' => 'Role tidak valid untuk pendaftaran mandiri. Hanya Petugas JR dan Pengelola PKS yang diizinkan.',
        ]);

        // 2. Menentukan Role Sesuai Pilihan Jabatan / Peran (Strict: Hanya petugas_jr atau pengelola_pks)
        $role = 'petugas_jr';
        $requestedRole = strtolower(trim((string)($permintaan->role ?? '')));
        $requestedJabatan = trim((string)($permintaan->jabatan ?? ''));

        if ($requestedRole === 'pengelola_pks' || $requestedJabatan === 'Pengelola PKS') {
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
                'pengguna_id' => $penggunaBaru->pengguna_id ?? $penggunaBaru->penggunaId,
                'penggunaId' => $penggunaBaru->pengguna_id ?? $penggunaBaru->penggunaId,
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
        $admin = $permintaan->user();
        if (!$admin || !in_array($admin->role, ['admin_utama', 'admin'])) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Akses ditolak. Fitur ini khusus untuk Administrator Utama.'
            ], 403);
        }

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
    public function setujuiPengguna(Request $permintaan, $id)
    {
        $admin = $permintaan->user();
        if (!$admin || !in_array($admin->role, ['admin_utama', 'admin'])) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Akses ditolak. Fitur ini khusus untuk Administrator Utama.'
            ], 403);
        }

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
    public function tolakPengguna(Request $permintaan, $id)
    {
        $admin = $permintaan->user();
        if (!$admin || !in_array($admin->role, ['admin_utama', 'admin'])) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Akses ditolak. Fitur ini khusus untuk Administrator Utama.'
            ], 403);
        }

        $pengguna = Pengguna::find($id);
        if (!$pengguna) {
            return response()->json(['status' => 'gagal', 'pesan' => 'Pengguna tidak ditemukan.'], 404);
        }

        $pengguna->status = 'Ditolak';
        $pengguna->save();

        // Cabut seluruh sesi aktif jika ada
        \App\Models\TokenAksesPengguna::cabutSemuaToken($pengguna->pengguna_id);

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Pengajuan akun pengguna telah ditolak.',
        ], 200);
    }

    /**
     * Ubah Status Aktif / Nonaktif (PUT /api/pengguna/{id}/ubah-status)
     */
    public function ubahStatus(Request $permintaan, $id)
    {
        $admin = $permintaan->user();
        if (!$admin || !in_array($admin->role, ['admin_utama', 'admin'])) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Akses ditolak. Fitur ini khusus untuk Administrator Utama.'
            ], 403);
        }

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

        $statusBaru = ($pengguna->status === 'Aktif') ? 'Nonaktif' : 'Aktif';
        $pengguna->status = $statusBaru;
        $pengguna->save();

        if ($statusBaru === 'Nonaktif') {
            // Cabut seluruh sesi aktif seketika
            \App\Models\TokenAksesPengguna::cabutSemuaToken($pengguna->pengguna_id);
        }

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Status pengguna berhasil diperbarui.',
            'data' => ['status' => $pengguna->status],
        ], 200);
    }

    /**
     * Reset Password oleh Administrator Utama (Mekanisme A Bantuan Admin)
     * PUT /api/pengguna/{id}/reset-password
     */
    public function resetPasswordOlehAdmin(Request $permintaan, $id)
    {
        $admin = $permintaan->user();
        if (!$admin || !in_array($admin->role, ['admin_utama', 'admin'])) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Akses ditolak. Hanya Administrator Utama yang dapat mereset kata sandi pengguna.'
            ], 403);
        }

        $permintaan->validate([
            'password_baru' => 'required|string|min:8',
        ], [
            'password_baru.required' => 'Password baru wajib diisi.',
            'password_baru.min' => 'Password baru minimal 8 karakter.',
        ]);

        $pengguna = Pengguna::find($id);
        if (!$pengguna) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Pengguna tidak ditemukan.'
            ], 404);
        }

        $pengguna->password = Hash::make($permintaan->password_baru);
        $pengguna->save();

        // Cabut seluruh token akses lama pengguna agar wajib login ulang dengan password baru
        \App\Models\TokenAksesPengguna::cabutSemuaToken($pengguna->pengguna_id);

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Kata sandi pengguna ' . $pengguna->nama . ' berhasil direset.',
        ], 200);
    }

    /**
     * Perbarui Data Pengguna (PUT /api/pengguna/{id})
     */
    public function perbaruiPengguna(Request $permintaan, $id)
    {
        $currentUser = $permintaan->user();
        $isAdmin = $currentUser && in_array($currentUser->role, ['admin_utama', 'admin']);
        $isSelf = $currentUser && ($currentUser->pengguna_id == $id || $currentUser->penggunaId == $id);

        if (!$isAdmin && !$isSelf) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Anda tidak memiliki hak untuk mengubah data pengguna ini.'
            ], 403);
        }

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
        if ($isAdmin && $permintaan->filled('status')) $pengguna->status = $permintaan->status;
        if ($isAdmin && $permintaan->filled('role')) $pengguna->role = $permintaan->role;

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
    public function hapusPengguna(Request $permintaan, $id)
    {
        $admin = $permintaan->user();
        if (!$admin || !in_array($admin->role, ['admin_utama', 'admin'])) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Akses ditolak. Fitur ini khusus untuk Administrator Utama.'
            ], 403);
        }

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

        \App\Models\TokenAksesPengguna::cabutSemuaToken($pengguna->pengguna_id);
        $pengguna->delete();

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Pengguna berhasil dihapus dari database.',
        ], 200);
    }
}
