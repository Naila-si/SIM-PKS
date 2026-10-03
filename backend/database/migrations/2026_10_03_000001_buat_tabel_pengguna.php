<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migrasi Database untuk Membuat Tabel 'pengguna'
 * Berfungsi menyimpan seluruh akun pengguna (Admin, Kabag, Pimpinan, Pengelola PKS, Petugas JR)
 */
return new class extends Migration
{
    /**
     * Jalankan proses pembuatan tabel database.
     */
    public function up(): void
    {
        Schema::create('pengguna', function (Blueprint $table) {
            $table->id(); // Primary Key ID Pengguna (Auto Increment)
            $table->string('nama'); // Nama Lengkap atau Nama Peran (misal: Siska Wijaya / Administrator SW)
            $table->string('email')->unique(); // Email Perusahaan (Harus unik untuk login)
            $table->string('password'); // Password yang sudah ter-enkripsi (Bcrypt Hash)
            $table->string('nomor_hp')->nullable(); // Nomor WhatsApp / HP (Opsional untuk akun preset)
            $table->string('jabatan'); // Label Jabatan (Petugas JR, Pengelola PKS, dll)
            $table->string('role'); // Kode Peran (petugas_jr, pengelola_pks, kabag, pimpinan, admin_utama)
            
            // Kolom Khusus Lokasi Penugasan (Petugas JR)
            $table->string('wilayah')->nullable(); // Wilayah Riau, Kepri, Sumbar
            $table->string('samsat')->nullable(); // Samsat Pekanbaru Kota, Dumai, dll
            
            // Kolom Khusus Bidang Kerja (Pengelola PKS & Admin Utama)
            $table->string('bidang')->nullable(); // Sumbangan Wajib (SW), Iuran Wajib (IW), Pelayanan
            $table->string('unit_kerja')->default('Jasa Raharja'); // Nama Unit Kerja / Cabang

            // Status Persetujuan Akun
            // 'Aktif': Bisa login langsung
            // 'Menunggu Persetujuan': Pendaftaran baru dari frontend, belum disetujui Admin Utama
            // 'Nonaktif': Akun dimatikan oleh Admin
            // 'Ditolak': Pengajuan pendaftaran ditolak oleh Admin Utama
            $table->enum('status', ['Aktif', 'Menunggu Persetujuan', 'Nonaktif', 'Ditolak'])->default('Menunggu Persetujuan');

            $table->timestamps(); // Created_at & Updated_at otomatis dari Laravel
        });
    }

    /**
     * Balikkan migrasi (Hapus tabel jika diprollback).
     */
    public function down(): void
    {
        Schema::dropIfExists('pengguna');
    }
};
