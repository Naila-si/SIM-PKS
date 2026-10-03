<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AutentikasiKontroller;
use App\Http\Controllers\PenggunaKontroller;

/*
|--------------------------------------------------------------------------
| Rute API Sistem SIM-PKS (Bahasa Indonesia)
|--------------------------------------------------------------------------
| Mendefinisikan seluruh Endpoint API untuk Autentikasi & Manajemen Pengguna
*/

// ================= RUTE AUTENTIKASI (AUTH) =================
Route::prefix('autentikasi')->group(function () {
    // Rute Masuk / Login Pengguna
    Route::post('masuk', [AutentikasiKontroller::class, 'masuk']);
    
    // Rute Verifikasi Sesi Aktif & Ingat Saya
    Route::get('sesi-saya', [AutentikasiKontroller::class, 'sesiSaya']);
    
    // Rute Keluar / Logout
    Route::post('keluar', [AutentikasiKontroller::class, 'keluar']);
});

// ================= RUTE MANAJEMEN PENGGUNA (USERS) =================
Route::prefix('pengguna')->group(function () {
    // Registrasi Mandiri Pengguna Baru dari Halaman Register
    Route::post('daftar', [PenggunaKontroller::class, 'registrasiMandiri']);

    // Tampilkan Seluruh Daftar Pengguna (Untuk Administrator Utama)
    Route::get('/', [PenggunaKontroller::class, 'tampilkanSemua']);
    
    // Tampilkan Detail Pengguna Berdasarkan ID
    Route::get('{id}', [PenggunaKontroller::class, 'tampilkanDetail']);
    
    // Tambah Pengguna Baru Langsung oleh Admin Utama
    Route::post('tambah', [PenggunaKontroller::class, 'tambahOlehAdmin']);
    
    // Persetujuan Pengguna oleh Admin Utama
    Route::put('{id}/setujui', [PenggunaKontroller::class, 'setujuiPengguna']);
    Route::put('{id}/tolak', [PenggunaKontroller::class, 'tolakPengguna']);
    Route::put('{id}/ubah-status', [PenggunaKontroller::class, 'ubahStatus']);
    
    // Perbarui & Hapus Pengguna
    Route::put('{id}', [PenggunaKontroller::class, 'perbaruiPengguna']);
    Route::delete('{id}', [PenggunaKontroller::class, 'hapusPengguna']);
});

// ================= RUTE MITRA (PARTNERS) =================
Route::apiResource('mitra', \App\Http\Controllers\MitraController::class);

// ================= RUTE TEMPLATE PKS =================
Route::apiResource('pks-templates', \App\Http\Controllers\PksTemplateController::class);

// ================= RUTE DOKUMEN PKS =================
Route::get('pks-documents/{id}/generate-docx', [\App\Http\Controllers\PksDocumentController::class, 'generateDocx']);
Route::apiResource('pks-documents', \App\Http\Controllers\PksDocumentController::class);

// ================= RUTE RIWAYAT PERSETUJUAN =================
Route::post('pks-approvals', [\App\Http\Controllers\PksApprovalController::class, 'store']);

