<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengguna;
use App\Models\SesiPengguna;
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

        // 5. Penanganan Fitur "Ingat Saya" (Remember Me ke Database)
        $tokenIngatSaya = null;
        if ($permintaan->ingat_saya) {
            // Buat token unik 60 karakter
            $tokenIngatSaya = Str::random(60);

            // Simpan token pengingat sesi ke Tabel 'sesi_pengguna' di Database (Kadaluarsa 30 Hari)
            SesiPengguna::create([
                'penggunaId' => $pengguna->penggunaId,
                'token_ingat_saya' => $tokenIngatSaya,
                'ip_address' => $permintaan->ip(),
                'user_agent' => substr($permintaan->userAgent(), 0, 255),
                'kadaluarsa_pada' => Carbon::now()->addDays(30),
            ]);
        }

        // Buat Token Sesi Akses (Bearer Token)
        $tokenSesiAkses = 'sim-pks-token-' . $pengguna->penggunaId . '-' . time();

        // 6. Kembalikan Respon Sukses Login
        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Login berhasil. Selamat datang kembali!',
            'data' => [
                'token_akses' => $tokenSesiAkses,
                'token_ingat_saya' => $tokenIngatSaya,
                'pengguna' => [
                    'penggunaId' => $pengguna->penggunaId,
                    'nama' => $pengguna->nama,
                    'email' => $pengguna->email,
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
        $tokenIngat = $permintaan->header('X-Remember-Token') ?? $permintaan->query('token_ingat');

        if ($tokenIngat) {
            // Cari sesi di database yang belum kadaluarsa
            $sesi = SesiPengguna::with('pengguna')
                ->where('token_ingat_saya', $tokenIngat)
                ->where('kadaluarsa_pada', '>', Carbon::now())
                ->first();

            if ($sesi && $sesi->pengguna && $sesi->pengguna->status === 'Aktif') {
                $p = $sesi->pengguna;
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
                    ],
                ]);
            }
        }

        return response()->json([
            'status' => 'gagal',
            'pesan' => 'Sesi tidak ditemukan atau telah kadaluarsa.',
        ], 401);
    }

    /**
     * Fungsi Keluar / Logout (POST /api/autentikasi/keluar)
     * Hapus token pengingat dari database
     */
    public function keluar(Request $permintaan)
    {
        $tokenIngat = $permintaan->header('X-Remember-Token') ?? $permintaan->input('token_ingat_saya');

        if ($tokenIngat) {
            // Hapus sesi pengingat dari database
            SesiPengguna::where('token_ingat_saya', $tokenIngat)->delete();
        }

        return response()->json([
            'status' => 'sukses',
            'pesan' => 'Berhasil keluar dari sistem.',
        ], 200);
    }
}
