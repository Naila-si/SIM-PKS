<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Pengguna;
use App\Models\TokenAksesPengguna;
use App\Models\Mitra;
use App\Models\PksDocument;
use App\Models\Adendum;
use Illuminate\Support\Facades\Hash;

class SecurityAndWorkflowTest extends TestCase
{
    /**
     * Test VULN-01: Proteksi Endpoint API dari Akses Tanpa Autentikasi
     */
    public function test_unauthenticated_request_to_protected_endpoints_is_blocked(): void
    {
        $response = $this->getJson('/api/pks');
        $response->assertStatus(401);

        $responseMitra = $this->getJson('/api/mitra');
        $responseMitra->assertStatus(401);

        $responseLogs = $this->getJson('/api/system-logs');
        $responseLogs->assertStatus(401);
    }

    /**
     * Test VULN-02: Pembuatan Token Kriptografis SHA-256 dan Penolakan Token Palsu
     */
    public function test_cryptographic_token_generation_and_rejection_of_forged_tokens(): void
    {
        // 1. Coba gunakan token palsu statis lama
        $responseForged = $this->withHeaders([
            'Authorization' => 'Bearer sim-pks-token-1-1732174000',
        ])->getJson('/api/pks');
        $responseForged->assertStatus(401);

        // 2. Login pengguna valid
        $admin = Pengguna::where('role', 'admin_utama')->first();
        if (!$admin) {
            $admin = Pengguna::create([
                'nama' => 'Admin Utama Test',
                'email' => 'admin.test@jasaraharja.co.id',
                'password' => Hash::make('password123'),
                'role' => 'admin_utama',
                'status' => 'Aktif',
            ]);
        }

        $loginResponse = $this->postJson('/api/autentikasi/masuk', [
            'email' => $admin->email,
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200);
        $token = $loginResponse->json('data.token_akses');
        $this->assertNotEmpty($token);
        $this->assertStringNotContainsString('sim-pks-token-', $token);
        $this->assertGreaterThanOrEqual(60, strlen($token));

        // 3. Request menggunakan token sah
        $authResponse = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/pks');
        $authResponse->assertStatus(200);
    }

    /**
     * Test VULN-03: Reset Password Hanya Boleh oleh Admin Utama
     */
    public function test_reset_password_protected_for_admin_only(): void
    {
        $petugas = Pengguna::where('role', 'petugas_jr')->first();
        if (!$petugas) {
            $petugas = Pengguna::create([
                'nama' => 'Petugas Test',
                'email' => 'petugas.test@jasaraharja.co.id',
                'password' => Hash::make('password123'),
                'role' => 'petugas_jr',
                'status' => 'Aktif',
            ]);
        }

        $targetUser = Pengguna::create([
            'nama' => 'Target Reset User',
            'email' => 'target.reset.' . uniqid() . '@jasaraharja.co.id',
            'password' => Hash::make('password_lama123'),
            'role' => 'petugas_jr',
            'status' => 'Aktif',
        ]);

        // Buat token aktif untuk target
        $targetToken = TokenAksesPengguna::buatToken($targetUser);
        $this->assertNotNull(TokenAksesPengguna::verifikasiToken($targetToken));

        // Petugas mencoba reset password pengguna lain -> harus 403
        $petugasToken = TokenAksesPengguna::buatToken($petugas);
        $unauthReset = $this->withHeaders([
            'Authorization' => "Bearer {$petugasToken}",
        ])->putJson("/api/pengguna/{$targetUser->pengguna_id}/reset-password", [
            'password_baru' => 'newpassword123',
        ]);
        $unauthReset->assertStatus(403);

        // Admin melakukan reset -> harus 200 dan sesi target harus dicabut
        $admin = Pengguna::where('role', 'admin_utama')->first();
        $adminToken = TokenAksesPengguna::buatToken($admin);
        $authReset = $this->withHeaders([
            'Authorization' => "Bearer {$adminToken}",
        ])->putJson("/api/pengguna/{$targetUser->pengguna_id}/reset-password", [
            'password_baru' => 'newpassword123',
        ]);
        $authReset->assertStatus(200);

        // Verifikasi token target sudah dicabut
        $this->assertNull(TokenAksesPengguna::verifikasiToken($targetToken));

        $targetUser->delete();
    }

    /**
     * Test VULN-04: Approval Menggunakan Identitas Asli Session Backend
     */
    public function test_pks_approval_uses_authenticated_user_identity(): void
    {
        $petugas = Pengguna::where('role', 'petugas_jr')->first();
        $admin = Pengguna::where('role', 'admin_utama')->first();

        $mitra = Mitra::first();
        if (!$mitra) {
            $mitra = Mitra::create([
                'nama_mitra' => 'Mitra Uji ' . uniqid(),
                'nama_pengelola' => 'Budi',
                'no_hp_pengelola' => '08123456789',
                'status_mitra' => 'Aktif',
            ]);
        }

        $pks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $petugas->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Klaim RS',
            'ringkasan_pks' => 'Uji Keamanan Persetujuan',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Draf',
        ]);

        // Petugas mencoba menyetujui PKS langsung dengan memalsukan ID Admin di request body
        $petugasToken = TokenAksesPengguna::buatToken($petugas);
        $spoofAttempt = $this->withHeaders([
            'Authorization' => "Bearer {$petugasToken}",
        ])->postJson('/api/pks-approvals', [
            'pks_id' => $pks->pks_id,
            'status_aksi' => 'Draf PKS Disetujui',
            'pengguna_id' => $admin->pengguna_id, // Mencoba spoofing ID Admin
        ]);

        // Harus ditolak 403 karena role asli session adalah petugas_jr
        $spoofAttempt->assertStatus(403);

        $pks->delete();
    }

    /**
     * Test VULN-05: Pembatasan Role pada Registrasi Mandiri
     */
    public function test_self_registration_restricts_privileged_roles(): void
    {
        // 1. Coba daftar sebagai admin_utama -> harus gagal validasi (422)
        $regAdmin = $this->postJson('/api/pengguna/daftar', [
            'namaLengkap' => 'Hacker Admin',
            'email' => 'hacker.' . uniqid() . '@test.com',
            'password' => 'password123',
            'role' => 'admin_utama',
        ]);
        $regAdmin->assertStatus(422);

        // 2. Coba daftar sebagai pimpinan -> harus gagal validasi (422)
        $regPimpinan = $this->postJson('/api/pengguna/daftar', [
            'namaLengkap' => 'Hacker Pimpinan',
            'email' => 'pimpinan.' . uniqid() . '@test.com',
            'password' => 'password123',
            'role' => 'pimpinan',
        ]);
        $regPimpinan->assertStatus(422);

        // 3. Daftar sah sebagai petugas_jr -> harus sukses 201
        $regPetugas = $this->postJson('/api/pengguna/daftar', [
            'namaLengkap' => 'Calon Petugas JR',
            'email' => 'calon.petugas.' . uniqid() . '@test.com',
            'password' => 'password123',
            'role' => 'petugas_jr',
        ]);
        $regPetugas->assertStatus(201);
        $this->assertEquals('Menunggu Persetujuan', $regPetugas->json('data.status'));
    }

    /**
     * Test VULN-06: Pencegahan Manipulasi Langsung Status Persetujuan & Adendum
     */
    public function test_direct_update_of_adendum_approval_status_is_prevented(): void
    {
        $petugas = Pengguna::where('role', 'petugas_jr')->first();
        $token = TokenAksesPengguna::buatToken($petugas);

        $mitra = Mitra::first();
        $pks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $petugas->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Klaim RS',
            'ringkasan_pks' => 'Uji Adendum',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Disetujui',
        ]);

        $adendum = Adendum::create([
            'pks_id' => $pks->pks_id,
            'pengguna_id' => $petugas->pengguna_id,
            'ruang_lingkup_perubahan' => 'Perubahan Klausul Uji',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Draft',
            'status_adendum' => 'Draf',
        ]);

        // Coba bypass persetujuan dengan PUT status_persetujuan = Disetujui
        $bypassResponse = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->putJson("/api/adendums/{$adendum->adendum_id}", [
            'status_persetujuan' => 'Disetujui',
            'status_adendum' => 'Aktif',
            'ruang_lingkup_perubahan' => 'Perubahan Disetujui Sepihak',
        ]);

        $bypassResponse->assertStatus(200);

        // Verifikasi bahwa status tetap Draft dan TIDAK meloncat ke Disetujui
        $freshAdendum = Adendum::find($adendum->adendum_id);
        $this->assertEquals('Draft', $freshAdendum->status_persetujuan);
        $this->assertEquals('Draf', $freshAdendum->status_adendum);

        $adendum->delete();
        $pks->delete();
    }

    /**
     * Test BUG-01: Method destroy() pada PksDocumentController dengan Validasi Status Draf
     */
    public function test_pks_document_destroy_validation(): void
    {
        $petugas = Pengguna::where('role', 'petugas_jr')->first();
        $token = TokenAksesPengguna::buatToken($petugas);

        $mitra = Mitra::first();

        // 1. PKS berstatus Draf -> bisa dihapus
        $draftPks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $petugas->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Draf Uji Hapus',
            'ringkasan_pks' => 'Ringkasan',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(60)->toDateString(),
            'status_persetujuan' => 'Draf',
        ]);

        $deleteDraft = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->deleteJson("/api/pks/{$draftPks->pks_id}");
        $deleteDraft->assertStatus(200);
        $this->assertNull(PksDocument::find($draftPks->pks_id));

        // 2. PKS berstatus Disetujui -> DITOLAK (422)
        $approvedPks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $petugas->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'PKS Aktif',
            'ringkasan_pks' => 'Ringkasan',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(60)->toDateString(),
            'status_persetujuan' => 'Disetujui',
            'status_pks' => 'Aktif',
        ]);

        $deleteApproved = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->deleteJson("/api/pks/{$approvedPks->pks_id}");
        $deleteApproved->assertStatus(422);

        $approvedPks->delete();
    }

    /**
     * Test BUG-02: Pencegahan Penghapusan Mitra yang Memiliki Relasi PKS
     */
    public function test_mitra_with_existing_pks_cannot_be_deleted(): void
    {
        $admin = Pengguna::where('role', 'admin_utama')->first();
        $token = TokenAksesPengguna::buatToken($admin);

        $mitra = Mitra::create([
            'nama_mitra' => 'Mitra Relasi PKS ' . uniqid(),
            'nama_pengelola' => 'Pengelola Test',
            'no_hp_pengelola' => '08987654321',
            'status_mitra' => 'Aktif',
        ]);

        $pks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $admin->pengguna_id,
            'bidang' => 'SW',
            'jenis_pks' => 'SW Mandiri',
            'ringkasan_pks' => 'Relasi',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(60)->toDateString(),
            'status_persetujuan' => 'Draf',
        ]);

        // Hapus mitra -> harus gagal 422
        $deleteResponse = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->deleteJson("/api/mitra/{$mitra->mitra_id}");

        $deleteResponse->assertStatus(422);
        $this->assertNotNull(Mitra::find($mitra->mitra_id));

        $pks->delete();
        $mitra->delete();
    }

    /**
     * Test BUG-03: Perhitungan Otomatis Masa Berlaku PKS (H-30, Berakhir, Aktif, Tidak Dilanjutkan)
     */
    public function test_pks_dynamic_status_calculation(): void
    {
        // 1. Dokumen Tidak Dilanjutkan
        $pksTidakDilanjutkan = new PksDocument([
            'status_persetujuan' => 'Disetujui',
            'status_pks' => 'Tidak Dilanjutkan',
            'tanggal_berakhir' => now()->addDays(60)->toDateString(),
        ]);
        $this->assertEquals('Tidak Dilanjutkan', $pksTidakDilanjutkan->status_pks);

        // 2. Dokumen Masa Berlaku > 30 Hari -> Aktif
        $pksAktif = new PksDocument([
            'status_persetujuan' => 'Disetujui',
            'status_pks' => 'Aktif',
            'tanggal_berakhir' => now()->addDays(60)->toDateString(),
        ]);
        $this->assertEquals('Aktif', $pksAktif->status_pks);

        // 3. Dokumen Sisa Masa Berlaku <= 30 Hari (H-30) -> Segera Berakhir
        $pksH30 = new PksDocument([
            'status_persetujuan' => 'Disetujui',
            'status_pks' => 'Aktif',
            'tanggal_berakhir' => now()->addDays(15)->toDateString(),
        ]);
        $this->assertEquals('Segera Berakhir', $pksH30->status_pks);

        // 4. Dokumen Telah Melewati Tanggal Berakhir -> Berakhir
        $pksExpired = new PksDocument([
            'status_persetujuan' => 'Disetujui',
            'status_pks' => 'Aktif',
            'tanggal_berakhir' => now()->subDays(5)->toDateString(),
        ]);
        $this->assertEquals('Berakhir', $pksExpired->status_pks);
    }

    /**
     * Test VULN-07: Akses Download Berkas & Generate Dilindungi Autentikasi
     */
    public function test_document_endpoints_require_authentication(): void
    {
        $responseDocx = $this->getJson('/api/pks/1/generate-docx');
        $responseDocx->assertStatus(401);

        $responseAdendumDocx = $this->getJson('/api/adendums/1/generate-docx');
        $responseAdendumDocx->assertStatus(401);

        $responseFinal = $this->getJson('/api/adendums/1/download-final');
        $responseFinal->assertStatus(401);
    }

    /**
     * Test SEC-01: Verifikasi File Konfigurasi Production Siap Pakai
     */
    public function test_production_environment_configuration_file_exists(): void
    {
        $prodEnvPath = base_path('.env.production.example');
        $this->assertFileExists($prodEnvPath);

        $content = file_get_contents($prodEnvPath);
        $this->assertStringContainsString('APP_ENV=production', $content);
        $this->assertStringContainsString('APP_DEBUG=false', $content);
        $this->assertStringContainsString('SESSION_SECURE_COOKIE=true', $content);
    }

    /**
     * Test PERF-01: Dukungan Parameter Pagination pada Endpoint Data Besar
     */
    public function test_pagination_support_on_large_data_endpoints(): void
    {
        $admin = Pengguna::where('role', 'admin_utama')->first();
        $token = TokenAksesPengguna::buatToken($admin);

        // 1. Pagination Pengguna
        $userResponse = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/pengguna?per_page=5');

        $userResponse->assertStatus(200);
        $userResponse->assertJsonStructure([
            'status',
            'data',
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);

        // 2. Pagination PKS
        $pksResponse = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/pks?per_page=5');

        $pksResponse->assertStatus(200);
        $pksResponse->assertJsonStructure([
            'success',
            'data',
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);

        // 3. Pagination Mitra
        $mitraResponse = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
        ])->getJson('/api/mitra?per_page=5');

        $mitraResponse->assertStatus(200);
        $mitraResponse->assertJsonStructure([
            'success',
            'data',
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
    }
}
