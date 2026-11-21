<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * Kontroller Autentikasi (AutentikasiKontroller)
 * Mengatur alur Login, Verifikasi Status Persetujuan, Fitur "Ingat Saya" ke Database, & Logout
 */
class AutentikasiKontroller extends Controller
{
    /**
     * Fungsi Masuk / Login Pengguna (POST /api/autentikasi/masuk)
     * Pengecekan email, password, status approval, dan token "Ingat Saya"
     */
    public function masuk(Request $permintaan)
    {
        // 1. Validasi Input Formulir Login
        $permintaan->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'ingat_saya' => 'nullable|boolean', // Checkbox Ingat Saya dari Frontend
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $emailBersih = strtolower(trim($permintaan->email));

        // 2. Cari Pengguna Berdasarkan Email
        $pengguna = Pengguna::where('email', $emailBersih)->first();

        // Jika email tidak terdaftar
        if (!$pengguna) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Email atau password yang Anda masukkan tidak terdaftar.',
            ], 401);
        }

        // 3. Pengecekan Status Persetujuan Akun
        if ($pengguna->status === 'Menunggu Persetujuan') {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Akun Anda masih menunggu persetujuan Administrator Utama. Silakan hubungi Administrator Utama Jasa Raharja.',
            ], 403);
        }

        if ($pengguna->status === 'Ditolak') {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Pengajuan akun Anda telah ditolak oleh Administrator Utama. Silakan hubungi Admin Jasa Raharja.',
            ], 403);
        }

        if ($pengguna->status === 'Nonaktif') {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Akun Anda saat ini dinonaktifkan. Silakan hubungi Administrator Utama.',
            ], 403);
        }

        // 4. Verifikasi Password (Hash Bcrypt)
        if (!Hash::check($permintaan->password, $pengguna->password)) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Email atau password yang Anda masukkan salah.',
            ], 401);
        }

        // 5. Penanganan Fitur "Ingat Saya" (Remember Me)
        $tokenIngatSaya = null;
        if ($permintaan->ingat_saya) {
            $tokenIngatSaya = Str::random(60);
        }

        // Buat Token Sesi Akses Kriptografis (SHA-256 Personal Access Token)
        $idPengguna = $pengguna->pengguna_id ?? $pengguna->penggunaId;
        $durasiHari = $permintaan->ingat_saya ? 90 : 30;
        $tokenSesiAkses = \App\Models\TokenAksesPengguna::buatToken($pengguna, 'web-auth', $durasiHari);

        // 6. Kembalikan Respon Sukses Login
        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Login berhasil. Selamat datang kembali!',
            'data' => [
                'token_akses' => $tokenSesiAkses,
                'token_ingat_saya' => $tokenIngatSaya,
                'pengguna' => [
                    'pengguna_id' => $idPengguna,
                    'penggunaId' => $idPengguna,
                    'nama' => $pengguna->nama,
                    'email' => $pengguna->email,
                    'nomor_hp' => $pengguna->nomor_hp,
                    'nomorHp' => $pengguna->nomor_hp,
                    'jabatan' => $pengguna->jabatan,
                    'role' => $pengguna->role,
                    'wilayah' => $pengguna->wilayah,
                    'samsat' => $pengguna->samsat,
                    'bidang' => $pengguna->bidang,
                    'status' => $pengguna->status,
                ],
            ],
        ], 200);
    }

    /**
     * Ganti Kata Sandi Mandiri oleh Pengguna yang Sedang Login (PUT /api/autentikasi/ganti-kata-sandi)
     */
    public function gantiKataSandi(Request $permintaan)
    {
        $permintaan->validate([
            'kata_sandi_lama' => 'required|string',
            'kata_sandi_baru' => 'required|string|min:8',
            'konfirmasi_kata_sandi' => 'required|string|same:kata_sandi_baru',
        ], [
            'kata_sandi_lama.required' => 'Kata sandi lama wajib diisi.',
            'kata_sandi_baru.required' => 'Kata sandi baru wajib diisi.',
            'kata_sandi_baru.min' => 'Kata sandi baru minimal 8 karakter.',
            'konfirmasi_kata_sandi.required' => 'Konfirmasi kata sandi baru wajib diisi.',
            'konfirmasi_kata_sandi.same' => 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru.',
        ]);

        $pengguna = $permintaan->user();
        if (!$pengguna) {
            $token = $permintaan->bearerToken() ?: $permintaan->query('token');
            $pengguna = \App\Models\TokenAksesPengguna::verifikasiToken($token);
        }

        if (!$pengguna) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Sesi tidak sah. Silakan login kembali.',
            ], 401);
        }

        // Cek kecocokan password lama
        if (!Hash::check($permintaan->kata_sandi_lama, $pengguna->password)) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Kata sandi lama / saat ini yang Anda masukkan salah.',
            ], 422);
        }

        // Simpan password baru terenkripsi
        $pengguna->password = Hash::make($permintaan->kata_sandi_baru);
        $pengguna->save();

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Kata sandi berhasil diperbarui secara permanen.',
        ], 200);
    }

    /**
     * Perbarui Profil Mandiri (Nama & Nomor HP) (PUT /api/autentikasi/profil)
     */
    public function perbaruiProfil(Request $permintaan)
    {
        $permintaan->validate([
            'nama' => 'required|string|max:255',
            'nomor_hp' => 'nullable|string|max:50',
        ]);

        $pengguna = $permintaan->user();
        if (!$pengguna) {
            $token = $permintaan->bearerToken() ?: $permintaan->query('token');
            $pengguna = \App\Models\TokenAksesPengguna::verifikasiToken($token);
        }

        if (!$pengguna) {
            return response()->json([
                'status' => 'gagal',
                'pesan' => 'Sesi tidak sah. Silakan login kembali.',
            ], 401);
        }

        $pengguna->nama = trim($permintaan->nama);
        if ($permintaan->has('nomor_hp')) {
            $pengguna->nomor_hp = trim($permintaan->nomor_hp);
        }
        $pengguna->save();

        $id = $pengguna->pengguna_id ?? $pengguna->penggunaId;
        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Profil berhasil diperbarui.',
            'data' => [
                'pengguna_id' => $id,
                'penggunaId' => $id,
                'nama' => $pengguna->nama,
                'email' => $pengguna->email,
                'nomor_hp' => $pengguna->nomor_hp,
                'nomorHp' => $pengguna->nomor_hp,
                'jabatan' => $pengguna->jabatan,
                'role' => $pengguna->role,
                'wilayah' => $pengguna->wilayah,
                'samsat' => $pengguna->samsat,
                'bidang' => $pengguna->bidang,
                'status' => $pengguna->status,
            ]
        ], 200);
    }

    /**
     * Fungsi Ambil Sesi Saya / Verifikasi Token Ingat Saya (GET /api/autentikasi/sesi-saya)
     */
    public function sesiSaya(Request $permintaan)
    {
        $pengguna = $permintaan->user();
        if (!$pengguna) {
            $token = $permintaan->bearerToken() ?: $permintaan->query('token');
            $pengguna = \App\Models\TokenAksesPengguna::verifikasiToken($token);
        }

        if ($pengguna && $pengguna->status === 'Aktif') {
            $id = $pengguna->pengguna_id ?? $pengguna->penggunaId;
            return response()->json([
                'status' => 'sukses',
                'data' => [
                    'pengguna_id' => $id,
                    'penggunaId' => $id,
                    'nama' => $pengguna->nama,
                    'email' => $pengguna->email,
                    'nomor_hp' => $pengguna->nomor_hp,
                    'nomorHp' => $pengguna->nomor_hp,
                    'jabatan' => $pengguna->jabatan,
                    'role' => $pengguna->role,
                    'wilayah' => $pengguna->wilayah,
                    'samsat' => $pengguna->samsat,
                    'bidang' => $pengguna->bidang,
                    'status' => $pengguna->status,
                ],
            ]);
        }

        return response()->json([
            'status' => 'gagal',
            'pesan' => 'Sesi login tidak valid atau telah berakhir.',
        ], 401);
    }

    /**
     * Fungsi Keluar / Logout (POST /api/autentikasi/keluar)
     */
    public function keluar(Request $permintaan)
    {
        $token = $permintaan->bearerToken();
        if (!$token && $permintaan->filled('token')) {
            $token = $permintaan->query('token');
        }

        if ($token) {
            \App\Models\TokenAksesPengguna::cabutToken($token);
        }

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Berhasil keluar dari sistem.',
        ], 200);
    }
}
