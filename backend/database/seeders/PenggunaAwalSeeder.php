<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;

/**
 * Seeder Database untuk Mengisi Akun Resmi Awal Sistem SIM-PKS
 * Mengisi akun preset (3 Admin Utama, Kabag, Pimpinan) serta akun resmi Petugas JR & Pengelola PKS per Bidang
 */
class PenggunaAwalSeeder extends Seeder
{
    /**
     * Jalankan proses seeding data ke tabel 'pengguna'.
     */
    public function run(): void
    {
        // 1. Akun Preset: Administrator SW (Sumbangan Wajib)
        Pengguna::updateOrCreate(
            ['email' => 'admin.sw@jasaraharja.co.id'],
            [
                'nama' => 'Administrator SW',
                'password' => Hash::make('password123'),
                'nomor_hp' => null,
                'role' => 'admin_utama',
                'bidang' => 'Sumbangan Wajib (SW)',
                'status' => 'Aktif',
            ]
        );

        // 2. Akun Preset: Administrator IW (Iuran Wajib)
        Pengguna::updateOrCreate(
            ['email' => 'admin.iw@jasaraharja.co.id'],
            [
                'nama' => 'Administrator IW',
                'password' => Hash::make('password123'),
                'nomor_hp' => null,
                'role' => 'admin_utama',
                'bidang' => 'Iuran Wajib (IW)',
                'status' => 'Aktif',
            ]
        );

        // 3. Akun Preset: Administrator Pelayanan
        Pengguna::updateOrCreate(
            ['email' => 'admin.pelayanan@jasaraharja.co.id'],
            [
                'nama' => 'Administrator Pelayanan',
                'password' => Hash::make('password123'),
                'nomor_hp' => null,
                'role' => 'admin_utama',
                'bidang' => 'Pelayanan',
                'status' => 'Aktif',
            ]
        );

        // 4. Akun Preset: Kepala Bagian Operasional (Kabag)
        Pengguna::updateOrCreate(
            ['email' => 'kabag@jasaraharja.co.id'],
            [
                'nama' => 'Kepala Bagian Operasional',
                'password' => Hash::make('password123'),
                'nomor_hp' => null,
                'role' => 'kabag',
                'bidang' => 'Lintas Bidang',
                'status' => 'Aktif',
            ]
        );

        // 5. Akun Preset: Pimpinan Kanwil
        Pengguna::updateOrCreate(
            ['email' => 'pimpinan@jasaraharja.co.id'],
            [
                'nama' => 'Pimpinan Kanwil',
                'password' => Hash::make('password123'),
                'nomor_hp' => null,
                'role' => 'pimpinan',
                'bidang' => 'Lintas Bidang',
                'status' => 'Aktif',
            ]
        );

        // 6. Akun Resmi: Petugas JR
        Pengguna::updateOrCreate(
            ['email' => 'petugas.jr@jasaraharja.co.id'],
            [
                'nama' => 'Petugas JR',
                'password' => Hash::make('password123'),
                'nomor_hp' => '081234567890',
                'role' => 'petugas_jr',
                'wilayah' => 'Wilayah Riau',
                'samsat' => 'Samsat Pekanbaru Kota',
                'status' => 'Aktif',
            ]
        );

        // 7. Akun Resmi: Pengelola PKS - Bidang SW
        Pengguna::updateOrCreate(
            ['email' => 'pengelola.sw@jasaraharja.co.id'],
            [
                'nama' => 'Pengelola SW',
                'password' => Hash::make('password123'),
                'nomor_hp' => '081298765432',
                'role' => 'pengelola_pks',
                'bidang' => 'Sumbangan Wajib (SW)',
                'status' => 'Aktif',
            ]
        );

        // 8. Akun Resmi: Pengelola PKS - Bidang IW
        Pengguna::updateOrCreate(
            ['email' => 'pengelola.iw@jasaraharja.co.id'],
            [
                'nama' => 'Pengelola IW',
                'password' => Hash::make('password123'),
                'nomor_hp' => '081311223344',
                'role' => 'pengelola_pks',
                'bidang' => 'Iuran Wajib (IW)',
                'status' => 'Aktif',
            ]
        );

        // 9. Akun Resmi: Pengelola PKS - Bidang Pelayanan
        Pengguna::updateOrCreate(
            ['email' => 'pengelola.pelayanan@jasaraharja.co.id'],
            [
                'nama' => 'Pengelola Pelayanan',
                'password' => Hash::make('password123'),
                'nomor_hp' => '081355667788',
                'role' => 'pengelola_pks',
                'bidang' => 'Pelayanan',
                'status' => 'Aktif',
            ]
        );
    }
}

