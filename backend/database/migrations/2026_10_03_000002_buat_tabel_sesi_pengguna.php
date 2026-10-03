<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migrasi Database untuk Membuat Tabel 'sesi_pengguna'
 * Berfungsi menyimpan Token Pengingat "Ingat Saya" (Remember Me) dan Sesi Login Aktif di Database
 */
return new class extends Migration
{
    /**
     * Jalankan proses pembuatan tabel database.
     */
    public function up(): void
    {
        Schema::create('sesi_pengguna', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke tabel pengguna (Foreign Key ke kolom penggunaId)
            $table->foreignId('penggunaId')->constrained('pengguna', 'penggunaId')->onDelete('cascade');
            
            // Token Ingat Saya (Remember Token) berdurasi panjang
            $table->string('token_ingat_saya', 100)->unique();
            
            // Informasi Perangkat & IP untuk audit keamanan
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            
            // Masa berlaku token pengingat (misal 30 hari ke depan)
            $table->timestamp('kadaluarsa_pada');
            
            $table->timestamps();
        });
    }

    /**
     * Balikkan migrasi.
     */
    public function down(): void
    {
        Schema::dropIfExists('sesi_pengguna');
    }
};
