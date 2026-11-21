<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Pengguna;
use App\Models\TokenAksesPengguna;
use App\Models\Mitra;
use App\Models\PksDocument;
use App\Models\Adendum;
use Illuminate\Support\Facades\Hash;

class ComprehensiveSecurityRegressionTest extends TestCase
{
    protected function getOrCreateUser(string $role, string $name = 'User Test', ?string $bidang = null): Pengguna
    {
        $query = Pengguna::where('role', $role)->where('status', 'Aktif');
        if ($bidang) {
            $query->where('bidang', $bidang);
        }
        $user = $query->first();
        if (!$user) {
            $user = Pengguna::create([
                'nama' => "{$name} {$role}" . ($bidang ? " {$bidang}" : ''),
                'email' => strtolower($role) . ($bidang ? '.' . strtolower(preg_replace('/[^a-z0-9]/', '', $bidang)) : '') . '.' . uniqid() . '@jasaraharja.co.id',
                'password' => Hash::make('password123'),
                'role' => $role,
                'status' => 'Aktif',
                'bidang' => $bidang ?? 'Pelayanan',
            ]);
        }
        return $user;
    }

    /**
     * 1. RE-TEST VULN-01: Verifikasi Seluruh Endpoint Privat Terlindungi 401
     */
    public function test_all_private_endpoints_reject_unauthenticated_access(): void
    {
        $privateEndpoints = [
            ['GET', '/api/autentikasi/sesi-saya'],
            ['POST', '/api/autentikasi/keluar'],
            ['PUT', '/api/autentikasi/ganti-kata-sandi'],
            ['PUT', '/api/autentikasi/profil'],
            ['GET', '/api/pengguna'],
            ['GET', '/api/pengguna/1'],
            ['POST', '/api/pengguna/tambah'],
            ['PUT', '/api/pengguna/1/setujui'],
            ['PUT', '/api/pengguna/1/tolak'],
            ['PUT', '/api/pengguna/1/ubah-status'],
            ['PUT', '/api/pengguna/1/reset-password'],
            ['DELETE', '/api/pengguna/1'],
            ['GET', '/api/mitra'],
            ['POST', '/api/mitra'],
            ['GET', '/api/pks-templates'],
            ['POST', '/api/pks-templates'],
            ['GET', '/api/pks'],
            ['POST', '/api/pks'],
            ['DELETE', '/api/pks/1'],
            ['POST', '/api/pks/1/hentikan'],
            ['GET', '/api/pks/1/generate-docx'],
            ['POST', '/api/pks-approvals'],
            ['GET', '/api/approvals/count'],
            ['GET', '/api/adendums'],
            ['GET', '/api/system-logs'],
        ];

        foreach ($privateEndpoints as [$method, $uri]) {
            $response = $this->json($method, $uri);
            $this->assertEquals(
                401,
                $response->status(),
                "Endpoint {$method} {$uri} harus mengembalikan 401 jika diakses tanpa autentikasi, tetapi menghasilkan {$response->status()}"
            );
        }
    }

    /**
     * 2. RE-TEST VULN-02: Verifikasi Ketahanan Token (Fake, Invalid, Revoked, Deactivated)
     */
    public function test_token_defense_mechanisms(): void
    {
        // 2a. Token palsu format lama ditolak
        $fakeOldToken = 'sim-pks-token-1-1732174000';
        $resFakeOld = $this->withHeaders(['Authorization' => "Bearer {$fakeOldToken}"])->getJson('/api/pks');
        $resFakeOld->assertStatus(401);

        // 2b. Token acak tak dikenal ditolak
        $randomToken = 'unregistered_token_string_random_abcdef1234567890';
        $resRandom = $this->withHeaders(['Authorization' => "Bearer {$randomToken}"])->getJson('/api/pks');
        $resRandom->assertStatus(401);

        // 2c. Token pengguna nonaktif ditolak
        $userNonaktif = Pengguna::create([
            'nama' => 'User Nonaktif',
            'email' => 'nonaktif.' . uniqid() . '@jasaraharja.co.id',
            'password' => Hash::make('password123'),
            'role' => 'petugas_jr',
            'status' => 'Nonaktif',
        ]);
        $tokenNonaktif = TokenAksesPengguna::buatToken($userNonaktif);
        $resNonaktif = $this->withHeaders(['Authorization' => "Bearer {$tokenNonaktif}"])->getJson('/api/pks');
        $resNonaktif->assertStatus(401);

        // 2d. Token yang sudah logout (revoked) ditolak
        $petugas = $this->getOrCreateUser('petugas_jr');
        $tokenPetugas = TokenAksesPengguna::buatToken($petugas);
        
        // Akses sebelum logout -> 200
        $resBefore = $this->withHeaders(['Authorization' => "Bearer {$tokenPetugas}"])->getJson('/api/pks');
        $resBefore->assertStatus(200);

        // Logout
        $resLogout = $this->withHeaders(['Authorization' => "Bearer {$tokenPetugas}"])->postJson('/api/autentikasi/keluar');
        $resLogout->assertStatus(200);

        // Akses setelah logout -> 401
        $resAfter = $this->withHeaders(['Authorization' => "Bearer {$tokenPetugas}"])->getJson('/api/pks');
        $resAfter->assertStatus(401);

        $userNonaktif->delete();
    }

    /**
     * 3. RE-TEST VULN-03: Perlindungan Reset Password dan Otorisasi RBAC Pengguna
     */
    public function test_password_reset_and_user_management_rbac(): void
    {
        $admin = $this->getOrCreateUser('admin_utama');
        $kabag = $this->getOrCreateUser('kabag');
        $petugas = $this->getOrCreateUser('petugas_jr');

        $targetUser = Pengguna::create([
            'nama' => 'Pengguna Uji Reset',
            'email' => 'target.' . uniqid() . '@jasaraharja.co.id',
            'password' => Hash::make('password_awal123'),
            'role' => 'petugas_jr',
            'status' => 'Aktif',
        ]);

        $activeToken = TokenAksesPengguna::buatToken($targetUser);

        // Uji coba reset oleh Kabag (Non-Admin) -> Harus 403
        $kabagToken = TokenAksesPengguna::buatToken($kabag);
        $resKabag = $this->withHeaders(['Authorization' => "Bearer {$kabagToken}"])
            ->putJson("/api/pengguna/{$targetUser->pengguna_id}/reset-password", [
                'password_baru' => 'hackedpassword123',
            ]);
        $resKabag->assertStatus(403);

        // Uji coba reset oleh Petugas JR -> Harus 403
        $petugasToken = TokenAksesPengguna::buatToken($petugas);
        $resPetugas = $this->withHeaders(['Authorization' => "Bearer {$petugasToken}"])
            ->putJson("/api/pengguna/{$targetUser->pengguna_id}/reset-password", [
                'password_baru' => 'hackedpassword123',
            ]);
        $resPetugas->assertStatus(403);

        // Uji coba reset oleh Admin Utama -> Harus 200
        $adminToken = TokenAksesPengguna::buatToken($admin);
        $resAdmin = $this->withHeaders(['Authorization' => "Bearer {$adminToken}"])
            ->putJson("/api/pengguna/{$targetUser->pengguna_id}/reset-password", [
                'password_baru' => 'resettedpassword123',
            ]);
        $resAdmin->assertStatus(200);

        // Pastikan sesi lama target otomatis dibatalkan
        $this->assertNull(TokenAksesPengguna::verifikasiToken($activeToken));

        // Pastikan password baru bisa dipakai login
        $resLoginBaru = $this->postJson('/api/autentikasi/masuk', [
            'email' => $targetUser->email,
            'password' => 'resettedpassword123',
        ]);
        $resLoginBaru->assertStatus(200);

        $targetUser->delete();
    }

    /**
     * 4. RE-TEST VULN-04: Persetujuan PKS & Adendum Anti-Spoofing & Enforce State Machine
     */
    public function test_approval_anti_spoofing_and_state_machine_enforcement(): void
    {
        $admin = $this->getOrCreateUser('admin_utama');
        $kabag = $this->getOrCreateUser('kabag');
        $pimpinan = $this->getOrCreateUser('pimpinan');
        $pengelola = $this->getOrCreateUser('pengelola_pks', 'Pengelola Uji', 'Pelayanan');
        $petugas = $this->getOrCreateUser('petugas_jr');

        $mitra = Mitra::first() ?? Mitra::create([
            'nama_mitra' => 'Mitra Uji ' . uniqid(),
            'nama_pengelola' => 'Pengelola Uji',
            'no_hp_pengelola' => '08123456789',
            'status_mitra' => 'Aktif',
        ]);

        $pks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $petugas->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Klaim RS',
            'ringkasan_pks' => 'Uji Alur Ketat',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Draf',
        ]);

        $petugasToken = TokenAksesPengguna::buatToken($petugas);
        $pengelolaToken = TokenAksesPengguna::buatToken($pengelola);
        $kabagToken = TokenAksesPengguna::buatToken($kabag);
        $pimpinanToken = TokenAksesPengguna::buatToken($pimpinan);

        // 4a. Kabag mencoba menyetujui PKS yang masih Draf -> Ditolak (403 atau 400)
        $resInvalidJump = $this->withHeaders(['Authorization' => "Bearer {$kabagToken}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pks->pks_id,
                'status_aksi' => 'Disetujui Kabag',
            ]);
        // Harus ditolak karena status PKS belum 'Pemeriksaan Kabag'
        $this->assertTrue(in_array($resInvalidJump->status(), [400, 403]));

        // 4b. Petugas Menandai Siap Diserahkan -> Sukses
        $resSubmit = $this->withHeaders(['Authorization' => "Bearer {$petugasToken}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pks->pks_id,
                'status_aksi' => 'Tandai Siap Diserahkan',
            ]);
        $resSubmit->assertStatus(201);
        $this->assertEquals('Menunggu Penyerahan', $pks->fresh()->status_persetujuan);

        // 4c. Petugas mencoba mengeksekusi 'Sudah Diterima' pada status Menunggu Penyerahan -> Harus 403 (Hanya Pengelola/Admin)
        $resPetugasTerima = $this->withHeaders(['Authorization' => "Bearer {$petugasToken}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pks->pks_id,
                'status_aksi' => 'Sudah Diterima',
            ]);
        $resPetugasTerima->assertStatus(403);

        // 4d. Pengelola menerima dokumen fisik -> Sukses -> Status menjadi Pemeriksaan Pengelola
        $resPengelolaTerima = $this->withHeaders(['Authorization' => "Bearer {$pengelolaToken}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pks->pks_id,
                'status_aksi' => 'Sudah Diterima',
            ]);
        $resPengelolaTerima->assertStatus(201);
        $this->assertEquals('Pemeriksaan Pengelola', $pks->fresh()->status_persetujuan);

        // 4e. Pengelola menyetujui -> Sukses -> Disetujui Pengelola
        $resPengelolaSetuju = $this->withHeaders(['Authorization' => "Bearer {$pengelolaToken}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pks->pks_id,
                'status_aksi' => 'Disetujui Pengelola',
            ]);
        $resPengelolaSetuju->assertStatus(201);
        $this->assertEquals('Disetujui Pengelola', $pks->fresh()->status_persetujuan);

        $pks->delete();
    }

    /**
     * 5. RE-TEST VULN-05: Penolakan Ketat Role Privileged pada Registrasi Mandiri
     */
    public function test_self_registration_strict_role_whitelist(): void
    {
        $privilegedRoles = ['admin_utama', 'admin', 'kabag', 'pimpinan', 'superadmin', 'root'];

        foreach ($privilegedRoles as $role) {
            $response = $this->postJson('/api/pengguna/daftar', [
                'namaLengkap' => "Attacker {$role}",
                'email' => "attack.{$role}." . uniqid() . "@test.com",
                'password' => 'password123',
                'role' => $role,
            ]);

            $this->assertEquals(
                422,
                $response->status(),
                "Registrasi dengan role {$role} harus ditolak 422 Unprocessable Entity, namun menghasilkan {$response->status()}"
            );
        }

        // Whitelisted roles -> Harus berhasil 201
        $resPetugas = $this->postJson('/api/pengguna/daftar', [
            'namaLengkap' => 'Pendaftar Petugas',
            'email' => 'valid.petugas.' . uniqid() . '@test.com',
            'password' => 'password123',
            'role' => 'petugas_jr',
        ]);
        $resPetugas->assertStatus(201);

        $resPengelola = $this->postJson('/api/pengguna/daftar', [
            'namaLengkap' => 'Pendaftar Pengelola',
            'email' => 'valid.pengelola.' . uniqid() . '@test.com',
            'password' => 'password123',
            'role' => 'pengelola_pks',
        ]);
        $resPengelola->assertStatus(201);
    }

    /**
     * 6. RE-TEST VULN-06: Kebal Manipulasi Langsung Status Melalui Update Request
     */
    public function test_approval_status_cannot_be_manipulated_via_update_endpoint(): void
    {
        $petugas = $this->getOrCreateUser('petugas_jr');
        $token = TokenAksesPengguna::buatToken($petugas);

        $mitra = Mitra::first();
        $pks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $petugas->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Klaim RS',
            'ringkasan_pks' => 'Uji Tamper Update',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Draf',
            'status_pks' => 'Draft',
        ]);

        $adendum = Adendum::create([
            'pks_id' => $pks->pks_id,
            'pengguna_id' => $petugas->pengguna_id,
            'ruang_lingkup_perubahan' => 'Klausul Awal',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Draft',
            'status_adendum' => 'Draf',
        ]);

        // Coba manipulasi status Adendum langsung
        $resTamperAdendum = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->putJson("/api/adendums/{$adendum->adendum_id}", [
                'status_persetujuan' => 'Disetujui',
                'status_adendum' => 'Aktif',
                'ruang_lingkup_perubahan' => 'Klausul Baru',
            ]);
        $resTamperAdendum->assertStatus(200);

        $freshAdendum = Adendum::find($adendum->adendum_id);
        $this->assertEquals('Draft', $freshAdendum->status_persetujuan, 'Status persetujuan Adendum TIDAK BOLEH berubah menjadi Disetujui via update!');
        $this->assertEquals('Draf', $freshAdendum->status_adendum, 'Status adendum TIDAK BOLEH berubah menjadi Aktif via update!');
        $this->assertEquals('Klausul Baru', $freshAdendum->ruang_lingkup_perubahan);

        $adendum->delete();

        // Coba manipulasi status PKS langsung
        $resTamperPks = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->putJson("/api/pks/{$pks->pks_id}", [
                'status_persetujuan' => 'Disetujui',
                'status_pks' => 'Aktif',
                'ringkasan_pks' => 'Ringkasan Baru',
            ]);
        $resTamperPks->assertStatus(200);

        $freshPks = PksDocument::find($pks->pks_id);
        $this->assertEquals('Draf', $freshPks->status_persetujuan, 'Status persetujuan PKS TIDAK BOLEH berubah via update!');
        $this->assertEquals('Ringkasan Baru', $freshPks->ringkasan_pks);

        $pks->delete();
    }

    /**
     * 7. RE-TEST BUG-01: Validasi Ketat Method destroy() pada PKS
     */
    public function test_pks_destroy_method_and_rules(): void
    {
        $petugas = $this->getOrCreateUser('petugas_jr');
        $otherPetugas = Pengguna::create([
            'nama' => 'Petugas Lain',
            'email' => 'other.petugas.' . uniqid() . '@jasaraharja.co.id',
            'password' => Hash::make('password123'),
            'role' => 'petugas_jr',
            'status' => 'Aktif',
        ]);

        $mitra = Mitra::first();

        $drafPks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $petugas->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Klaim RS',
            'ringkasan_pks' => 'Draf Milik Petugas',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Draf',
        ]);

        // 7a. Petugas lain mencoba menghapus draf milik orang lain -> Harus 403
        $otherToken = TokenAksesPengguna::buatToken($otherPetugas);
        $resOtherDelete = $this->withHeaders(['Authorization' => "Bearer {$otherToken}"])
            ->deleteJson("/api/pks/{$drafPks->pks_id}");
        $resOtherDelete->assertStatus(403);

        // 7b. Pembuat sah menghapus draf -> Harus 200
        $petugasToken = TokenAksesPengguna::buatToken($petugas);
        $resValidDelete = $this->withHeaders(['Authorization' => "Bearer {$petugasToken}"])
            ->deleteJson("/api/pks/{$drafPks->pks_id}");
        $resValidDelete->assertStatus(200);
        $this->assertNull(PksDocument::find($drafPks->pks_id));

        // 7c. Mencoba menghapus PKS yang sudah disetujui -> Harus 422
        $disetujuiPks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $petugas->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Klaim RS',
            'ringkasan_pks' => 'PKS Disetujui',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Disetujui',
            'status_pks' => 'Aktif',
        ]);

        $resDeleteApproved = $this->withHeaders(['Authorization' => "Bearer {$petugasToken}"])
            ->deleteJson("/api/pks/{$disetujuiPks->pks_id}");
        $resDeleteApproved->assertStatus(422);

        $disetujuiPks->delete();
        $otherPetugas->delete();
    }

    /**
     * 8. RE-TEST BUG-02: Pencegahan Penghapusan Mitra yang Memiliki Relasi PKS
     */
    public function test_mitra_deletion_blocked_when_pks_exists(): void
    {
        $admin = $this->getOrCreateUser('admin_utama');
        $token = TokenAksesPengguna::buatToken($admin);

        $mitra = Mitra::create([
            'nama_mitra' => 'Mitra Uji Relasi ' . uniqid(),
            'nama_pengelola' => 'Bapak Mitra',
            'no_hp_pengelola' => '081233445566',
            'status_mitra' => 'Aktif',
        ]);

        // Belum ada PKS -> hapus harus berhasil 200
        $resDelEmpty = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->deleteJson("/api/mitra/{$mitra->mitra_id}");
        $resDelEmpty->assertStatus(200);

        // Buat mitra baru dengan PKS
        $mitraWithPks = Mitra::create([
            'nama_mitra' => 'Mitra Berelasi ' . uniqid(),
            'nama_pengelola' => 'Bapak Mitra 2',
            'no_hp_pengelola' => '081233445577',
            'status_mitra' => 'Aktif',
        ]);

        $pks = PksDocument::create([
            'mitra_id' => $mitraWithPks->mitra_id,
            'pengguna_id' => $admin->pengguna_id,
            'bidang' => 'SW',
            'jenis_pks' => 'SW Mandiri',
            'ringkasan_pks' => 'PKS Pengikat',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Draf',
        ]);

        // Coba hapus mitra yang berelasi -> Harus gagal 422
        $resDelBlocked = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->deleteJson("/api/mitra/{$mitraWithPks->mitra_id}");
        $resDelBlocked->assertStatus(422);
        $this->assertNotNull(Mitra::find($mitraWithPks->mitra_id));

        $pks->delete();
        $mitraWithPks->delete();
    }

    /**
     * 9. RE-TEST VULN-07: Dokumen dan Berkas Tidak Dapat Diakses Publik
     */
    public function test_documents_and_downloads_protected_from_public(): void
    {
        $docEndpoints = [
            '/api/pks/1/generate-docx',
            '/api/pks-documents/1/generate-docx',
            '/api/adendums/1/generate-docx',
            '/api/adendums/1/download-final',
            '/api/adendum/1/download-final',
        ];

        foreach ($docEndpoints as $uri) {
            $res = $this->getJson($uri);
            $this->assertEquals(401, $res->status(), "Akses publik ke dokumen {$uri} harus ditolak 401!");
        }
    }

    /**
     * 10. RE-TEST BUG-03: Perhitungan Akurat Status Masa Berlaku
     */
    public function test_dynamic_status_pks_calculations(): void
    {
        // Kasus 1: Sisa 10 hari -> Segera Berakhir
        $pksH10 = new PksDocument([
            'status_persetujuan' => 'Disetujui',
            'status_pks' => 'Aktif',
            'tanggal_berakhir' => now()->addDays(10)->toDateString(),
        ]);
        $this->assertEquals('Segera Berakhir', $pksH10->status_pks);
        $this->assertEquals('Segera Berakhir', $pksH10->statusPks);

        // Kasus 2: Sisa 45 hari -> Aktif
        $pksH45 = new PksDocument([
            'status_persetujuan' => 'Disetujui',
            'status_pks' => 'Aktif',
            'tanggal_berakhir' => now()->addDays(45)->toDateString(),
        ]);
        $this->assertEquals('Aktif', $pksH45->status_pks);
        $this->assertEquals('Aktif', $pksH45->statusPks);

        // Kasus 3: Lewat 1 hari -> Berakhir
        $pksExpired = new PksDocument([
            'status_persetujuan' => 'Disetujui',
            'status_pks' => 'Aktif',
            'tanggal_berakhir' => now()->subDay()->toDateString(),
        ]);
        $this->assertEquals('Berakhir', $pksExpired->status_pks);
        $this->assertEquals('Berakhir', $pksExpired->statusPks);

        // Kasus 4: Dihentikan -> Tidak Dilanjutkan
        $pksStopped = new PksDocument([
            'status_persetujuan' => 'Disetujui',
            'status_pks' => 'Tidak Dilanjutkan',
            'tanggal_berakhir' => now()->addDays(100)->toDateString(),
        ]);
        $this->assertEquals('Tidak Dilanjutkan', $pksStopped->status_pks);
        $this->assertEquals('Tidak Dilanjutkan', $pksStopped->statusPks);
    }

    /**
     * 11. RE-TEST SEC-01 & PERF-01: Verifikasi File Konfigurasi Produksi & Pagination
     */
    public function test_production_config_and_pagination_features(): void
    {
        // SEC-01
        $prodConfigFile = base_path('.env.production.example');
        $this->assertFileExists($prodConfigFile);
        $configContent = file_get_contents($prodConfigFile);
        $this->assertStringContainsString('APP_DEBUG=false', $configContent);
        $this->assertStringContainsString('APP_ENV=production', $configContent);
        $this->assertStringContainsString('SESSION_SECURE_COOKIE=true', $configContent);

        // Verifikasi CORS Config Keamanan
        $corsConfig = require config_path('cors.php');
        $this->assertIsArray($corsConfig);
        $this->assertArrayHasKey('allowed_origins_patterns', $corsConfig);
        if (config('app.env') === 'production') {
            $this->assertEmpty($corsConfig['allowed_origins_patterns']);
        } else {
            $this->assertNotEmpty($corsConfig['allowed_origins_patterns']);
        }

        // PERF-01
        $admin = $this->getOrCreateUser('admin_utama');
        $token = TokenAksesPengguna::buatToken($admin);

        $resPagination = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/pengguna?per_page=3&page=1');
        $resPagination->assertStatus(200);
        $resPagination->assertJsonStructure([
            'status',
            'data',
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
        $this->assertLessThanOrEqual(3, count($resPagination->json('data')));
    }

    /**
     * 12. REGRESSION: Verifikasi Fitur Autentikasi Pengguna & Profil Tetap Berjalan
     */
    public function test_regression_user_profile_and_password_change(): void
    {
        $user = Pengguna::create([
            'nama' => 'User Regression',
            'email' => 'user.regression.' . uniqid() . '@jasaraharja.co.id',
            'password' => Hash::make('password123'),
            'role' => 'petugas_jr',
            'status' => 'Aktif',
            'nomor_hp' => '0811111111',
        ]);

        $token = TokenAksesPengguna::buatToken($user);

        // Cek sesi saya
        $resMe = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->getJson('/api/autentikasi/sesi-saya');
        $resMe->assertStatus(200);
        $this->assertEquals($user->email, $resMe->json('data.email'));

        // Update profil
        $resUpdateProfil = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->putJson('/api/autentikasi/profil', [
                'nama' => 'User Regression Updated',
                'nomor_hp' => '0822222222',
            ]);
        $resUpdateProfil->assertStatus(200);
        $this->assertEquals('User Regression Updated', $user->fresh()->nama);

        // Ganti kata sandi
        $resGantiPw = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->putJson('/api/autentikasi/ganti-kata-sandi', [
                'kata_sandi_lama' => 'password123',
                'kata_sandi_baru' => 'newpassword456',
                'konfirmasi_kata_sandi' => 'newpassword456',
            ]);
        $resGantiPw->assertStatus(200);

        // Verifikasi password baru bisa untuk login
        $resLogin = $this->postJson('/api/autentikasi/masuk', [
            'email' => $user->email,
            'password' => 'newpassword456',
        ]);
        $resLogin->assertStatus(200);

        $user->delete();
    }
}
