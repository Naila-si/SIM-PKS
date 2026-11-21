<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AutentikasiKontroller;
use App\Http\Controllers\PenggunaKontroller;
use App\Http\Controllers\MitraController;
use App\Http\Controllers\PksTemplateController;
use App\Http\Controllers\PksDocumentController;
use App\Http\Controllers\PksApprovalController;
use App\Http\Controllers\AdendumController;
use App\Http\Controllers\AdendumApprovalController;
use App\Http\Controllers\SystemLogController;

/*
|--------------------------------------------------------------------------
| Rute API Sistem SIM-PKS (Sistem Integrasi Monitoring Perjanjian Kerja Sama)
|--------------------------------------------------------------------------
| Seluruh endpoint terproteksi autentikasi backend menggunakan token kriptografis (SHA-256)
| dan otorisasi berbasis peran (Role-Based Access Control).
*/

// =========================================================================
// 1. RUTE PUBLIK (TIDAK MEMERLUKAN AUTENTIKASI)
// =========================================================================
Route::post('autentikasi/masuk', [AutentikasiKontroller::class, 'masuk']);
Route::post('pengguna/daftar', [PenggunaKontroller::class, 'registrasiMandiri']);

// =========================================================================
// 2. RUTE TERPROTEKSI AUTENTIKASI (MEMERLUKAN TOKEN VALID)
// =========================================================================
Route::middleware('auth.simpks')->group(function () {

    // --- AUTENTIKASI & PROFIL MANDIRI ---
    Route::prefix('autentikasi')->group(function () {
        Route::get('sesi-saya', [AutentikasiKontroller::class, 'sesiSaya']);
        Route::post('keluar', [AutentikasiKontroller::class, 'keluar']);
        Route::put('ganti-kata-sandi', [AutentikasiKontroller::class, 'gantiKataSandi']);
        Route::put('profil', [AutentikasiKontroller::class, 'perbaruiProfil']);
    });

    // --- MANAJEMEN PENGGUNA (ADMINISTRATOR UTAMA) ---
    Route::prefix('pengguna')->group(function () {
        // Tampilkan Seluruh Pengguna & Detail Pengguna
        Route::get('/', [PenggunaKontroller::class, 'tampilkanSemua']);
        Route::get('{id}', [PenggunaKontroller::class, 'tampilkanDetail']);

        // Operasi Khusus Admin Utama
        Route::middleware('auth.simpks:admin_utama,admin')->group(function () {
            Route::post('tambah', [PenggunaKontroller::class, 'tambahOlehAdmin']);
            Route::put('{id}/setujui', [PenggunaKontroller::class, 'setujuiPengguna']);
            Route::put('{id}/tolak', [PenggunaKontroller::class, 'tolakPengguna']);
            Route::put('{id}/ubah-status', [PenggunaKontroller::class, 'ubahStatus']);
            Route::put('{id}/reset-password', [PenggunaKontroller::class, 'resetPasswordOlehAdmin']);
            Route::delete('{id}', [PenggunaKontroller::class, 'hapusPengguna']);
        });

        // Perbarui Data Pengguna (Admin atau Pengguna Sendiri)
        Route::put('{id}', [PenggunaKontroller::class, 'perbaruiPengguna']);
    });

    // --- MITRA (PARTNERS) ---
    Route::apiResource('mitra', MitraController::class);

    // --- TEMPLATE PKS (RBAC: Pengelolaan Khusus Admin Utama & Pengelola PKS - SEC-RBAC-02) ---
    Route::get('pks-templates', [PksTemplateController::class, 'index']);
    Route::get('pks-templates/{id}', [PksTemplateController::class, 'show']);
    Route::get('pks-templates/{id}/download', [PksTemplateController::class, 'downloadTemplate']);
    Route::middleware('auth.simpks:admin_utama,admin,pengelola_pks,pengelola')->group(function () {
        Route::post('pks-templates', [PksTemplateController::class, 'store']);
        Route::put('pks-templates/{id}', [PksTemplateController::class, 'update']);
        Route::delete('pks-templates/{id}', [PksTemplateController::class, 'destroy']);
    });

    // --- DOKUMEN PKS ---
    Route::post('pks/{id}/hentikan', [PksDocumentController::class, 'hentikanPks']);
    Route::post('pks-documents/{id}/hentikan', [PksDocumentController::class, 'hentikanPks']);
    Route::get('pks-documents/{id}/generate-docx', [PksDocumentController::class, 'generateDocx']);
    Route::get('pks/{id}/generate-docx', [PksDocumentController::class, 'generateDocx']);
    Route::get('pks/{id}/download-draft', [PksDocumentController::class, 'downloadDraft']);
    Route::get('pks-documents/{id}/download-draft', [PksDocumentController::class, 'downloadDraft']);
    Route::get('pks/{id}/download-surat-penghentian', [PksDocumentController::class, 'downloadSuratPenghentian']);
    Route::get('pks-documents/{id}/download-surat-penghentian', [PksDocumentController::class, 'downloadSuratPenghentian']);
    Route::apiResource('pks-documents', PksDocumentController::class);
    Route::apiResource('pks', PksDocumentController::class);

    // --- RIWAYAT PERSETUJUAN PKS ---
    Route::post('pks-approvals', [PksApprovalController::class, 'store']);
    Route::post('pks-persetujuan', [PksApprovalController::class, 'store']);
    Route::get('approvals/count', [PksApprovalController::class, 'getPendingCount']);
    Route::get('persetujuan/jumlah-menunggu', [PksApprovalController::class, 'getPendingCount']);

    // --- ADENDUM PKS ---
    Route::prefix('pks')->group(function () {
        Route::get('{pksId}/adendums', [AdendumController::class, 'index']);
        Route::post('{pksId}/adendums', [AdendumController::class, 'store']);
        Route::get('{pksId}/adendum', [AdendumController::class, 'index']);
        Route::post('{pksId}/adendum', [AdendumController::class, 'store']);
    });

    Route::get('adendums', [AdendumController::class, 'getAll']);
    Route::get('adendum', [AdendumController::class, 'getAll']);

    Route::prefix('adendums')->group(function () {
        Route::get('{id}/generate-docx', [AdendumController::class, 'generateDocx']);
        Route::get('{id}/download-draft', [AdendumController::class, 'downloadDraft']);
        Route::get('{id}/download-final', [AdendumController::class, 'downloadFinal']);
        Route::post('{id}/upload-final', [AdendumController::class, 'uploadFinal']);
        Route::get('{id}', [AdendumController::class, 'show']);
        Route::put('{id}', [AdendumController::class, 'update']);
        Route::delete('{id}', [AdendumController::class, 'destroy']);
    });

    Route::prefix('adendum')->group(function () {
        Route::get('{id}/generate-docx', [AdendumController::class, 'generateDocx']);
        Route::get('{id}/download-draft', [AdendumController::class, 'downloadDraft']);
        Route::get('{id}/download-final', [AdendumController::class, 'downloadFinal']);
        Route::post('{id}/upload-final', [AdendumController::class, 'uploadFinal']);
        Route::get('{id}', [AdendumController::class, 'show']);
        Route::put('{id}', [AdendumController::class, 'update']);
        Route::delete('{id}', [AdendumController::class, 'destroy']);
    });

    Route::post('adendum-approvals', [AdendumApprovalController::class, 'store']);
    Route::post('adendum-persetujuan', [AdendumApprovalController::class, 'store']);

    // --- LOG SISTEM (CCTV / AUDIT TRAIL) - KHUSUS ADMIN UTAMA ---
    Route::middleware('auth.simpks:admin_utama,admin')->group(function () {
        Route::get('system-logs', [SystemLogController::class, 'index']);
        Route::get('log-sistem', [SystemLogController::class, 'index']);
    });
});
