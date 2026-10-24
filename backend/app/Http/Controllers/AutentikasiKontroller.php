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

        // Buat Token Sesi Akses (Bearer Token)
        $idPengguna = $pengguna->pengguna_id ?? $pengguna->penggunaId;
        $tokenSesiAkses = 'sim-pks-token-' . $idPengguna . '-' . time();

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
     * Fungsi Ambil Sesi Saya / Verifikasi Token Ingat Saya (GET /api/autentikasi/sesi-saya)
     */
    public function sesiSaya(Request $permintaan)
    {
        $authHeader = $permintaan->header('Authorization');
        if ($authHeader && preg_match('/sim-pks-token-(\d+)-/', $authHeader, $matches)) {
            $p = Pengguna::find($matches[1]);
            if ($p && $p->status === 'Aktif') {
                $id = $p->pengguna_id ?? $p->penggunaId;
                return response()->json([
                    'status' => 'sukses',
                    'data' => [
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
                    ],
                ]);
            }
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
        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Berhasil keluar dari sistem.',
        ], 200);
    }
}
