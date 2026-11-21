<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Pengguna;
use App\Models\TokenAksesPengguna;
use App\Models\Mitra;
use App\Models\PksDocument;
use App\Models\Adendum;
use App\Models\PksTemplate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\UploadedFile;

class AdvancedSecurityAuditTest extends TestCase
{
    protected function getOrCreateUser(string $role, ?string $bidang = null): Pengguna
    {
        $query = Pengguna::where('role', $role)->where('status', 'Aktif');
        if ($bidang) {
            $query->where('bidang', $bidang);
        }
        $user = $query->first();

        if (!$user) {
            $user = Pengguna::create([
                'nama' => "User {$role} " . ($bidang ?? 'Umum'),
                'email' => strtolower($role) . '.' . ($bidang ? strtolower(substr($bidang, 0, 2)) . '.' : '') . uniqid() . '@jasaraharja.co.id',
                'password' => Hash::make('password123'),
                'role' => $role,
                'status' => 'Aktif',
                'bidang' => $bidang ?? 'Pelayanan',
            ]);
        }

        return $user;
    }

    /**
     * =========================================================================
     * 1. PEMERIKSAAN KEAMANAN PENYIMPANAN DOKUMEN (SEC-DOC-01)
     * =========================================================================
     */
    public function test_document_endpoints_reject_unauthenticated_download_access(): void
    {
        $endpoints = [
            '/api/pks/1/download-draft',
            '/api/pks-documents/1/download-draft',
            '/api/pks/1/download-surat-penghentian',
            '/api/pks-documents/1/download-surat-penghentian',
            '/api/adendums/1/download-draft',
            '/api/adendum/1/download-draft',
            '/api/adendums/1/download-final',
            '/api/adendum/1/download-final',
            '/api/pks-templates/1/download',
        ];

        foreach ($endpoints as $uri) {
            $response = $this->getJson($uri);
            $this->assertEquals(
                401,
                $response->status(),
                "Endpoint unduhan {$uri} harus ditolak 401 jika diakses tanpa autentikasi!"
            );
        }
    }

    public function test_pks_draft_generation_and_secure_download(): void
    {
        $admin = $this->getOrCreateUser('admin_utama');
        $token = TokenAksesPengguna::buatToken($admin);

        $mitra = Mitra::firstOrCreate(
            ['nama_mitra' => 'RSUD Uji Keamanan Dokumen'],
            ['nama_pengelola' => 'Dr. Budi', 'no_hp_pengelola' => '081234567890', 'status_mitra' => 'Aktif']
        );

        $pks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $admin->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Pelayanan Kesehatan',
            'ringkasan_pks' => 'Uji Keamanan Berkas Privat',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Draf',
        ]);

        // 1. Generate Docx
        $resGen = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->get("/api/pks/{$pks->pks_id}/generate-docx");
        
        $resGen->assertStatus(200);
        $pks->refresh();

        // 2. Verifikasi berkas disimpan di private storage, BUKAN di public storage
        $savedPath = $pks->url_berkas;
        $this->assertNotEmpty($savedPath);
        $privatePhysical = storage_path('app/private/' . $savedPath);
        $publicPhysical = storage_path('app/public/' . $savedPath);

        $this->assertFileExists($privatePhysical, 'Berkas draf PKS harus tersimpan di direktori storage/app/private!');
        $this->assertFalse(file_exists($publicPhysical), 'Berkas draf PKS TIDAK BOLEH tersimpan di direktori storage/app/public!');

        // 3. Unduh berkas melalui endpoint aman terautentikasi
        $resDownload = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->get("/api/pks/{$pks->pks_id}/download-draft");
        $resDownload->assertStatus(200);

        // Cleanup
        if (file_exists($privatePhysical)) {
            @unlink($privatePhysical);
        }
        $pks->delete();
    }

    /**
     * =========================================================================
     * 2. PENGUJIAN HAK AKSES SETIAP ROLE & ISOLASI BIDANG PENGELOLA (SEC-RBAC-01 & 02)
     * =========================================================================
     */
    public function test_pengelola_pks_bidang_isolation_on_index_and_show(): void
    {
        $pengelolaPelayanan = $this->getOrCreateUser('pengelola_pks', 'Pelayanan');
        $tokenPelayanan = TokenAksesPengguna::buatToken($pengelolaPelayanan);

        $pengelolaSw = $this->getOrCreateUser('pengelola_pks', 'Sumbangan Wajib (SW)');
        $tokenSw = TokenAksesPengguna::buatToken($pengelolaSw);

        $mitra = Mitra::first();

        // Buat PKS di bidang Pelayanan
        $pksPelayanan = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $pengelolaPelayanan->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Pelayanan Kesehatan',
            'ringkasan_pks' => 'PKS Bidang Pelayanan',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Draf',
        ]);

        // Buat PKS di bidang SW
        $pksSw = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $pengelolaSw->pengguna_id,
            'bidang' => 'SW',
            'jenis_pks' => 'SW Mandiri',
            'ringkasan_pks' => 'PKS Bidang SW',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Draf',
        ]);

        // 1. Pengelola SW mengakses list PKS -> Hanya melihat bidang SW
        $resListSw = $this->withHeaders(['Authorization' => "Bearer {$tokenSw}"])
            ->getJson('/api/pks');
        $resListSw->assertStatus(200);
        $dataSw = $resListSw->json('data') ?? $resListSw->json();
        foreach ($dataSw as $item) {
            $this->assertContains($item['bidang'], ['SW', 'Sumbangan Wajib (SW)', 'Sumbangan Wajib']);
        }

        // 2. Pengelola SW mencoba membuka detail PKS Pelayanan -> Harus 403 Forbidden!
        $resShowForbidden = $this->withHeaders(['Authorization' => "Bearer {$tokenSw}"])
            ->getJson("/api/pks/{$pksPelayanan->pks_id}");
        $resShowForbidden->assertStatus(403);

        // 3. Pengelola Pelayanan membuka detail PKS Pelayanan -> Harus 200 OK
        $resShowValid = $this->withHeaders(['Authorization' => "Bearer {$tokenPelayanan}"])
            ->getJson("/api/pks/{$pksPelayanan->pks_id}");
        $resShowValid->assertStatus(200);

        // 4. Pengelola SW mencoba menyetujui PKS Pelayanan -> Harus 403 Forbidden!
        $resApproveForbidden = $this->withHeaders(['Authorization' => "Bearer {$tokenSw}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pksPelayanan->pks_id,
                'status_aksi' => 'Disetujui Pengelola',
            ]);
        $resApproveForbidden->assertStatus(403);

        $pksPelayanan->delete();
        $pksSw->delete();
    }

    public function test_template_management_rbac_enforcement(): void
    {
        $petugas = $this->getOrCreateUser('petugas_jr');
        $kabag = $this->getOrCreateUser('kabag');
        $pimpinan = $this->getOrCreateUser('pimpinan');
        $pengelola = $this->getOrCreateUser('pengelola_pks', 'Pelayanan');

        $dummyFile = UploadedFile::fake()->create('template.docx', 500, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

        // 1. Petugas JR mencoba menambah template -> 403 Forbidden
        $tokenPetugas = TokenAksesPengguna::buatToken($petugas);
        $resPetugas = $this->withHeaders([
            'Authorization' => "Bearer {$tokenPetugas}",
            'Accept' => 'application/json',
        ])->post('/api/pks-templates', [
            'nama_template' => 'Template Ilegal',
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Pelayanan Kesehatan',
            'file_template' => $dummyFile,
        ]);
        $resPetugas->assertStatus(403);

        // 2. Kabag mencoba menambah template -> 403 Forbidden
        $tokenKabag = TokenAksesPengguna::buatToken($kabag);
        $resKabag = $this->withHeaders([
            'Authorization' => "Bearer {$tokenKabag}",
            'Accept' => 'application/json',
        ])->post('/api/pks-templates', [
            'nama_template' => 'Template Ilegal Kabag',
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Pelayanan Kesehatan',
            'file_template' => $dummyFile,
        ]);
        $resKabag->assertStatus(403);

        // 3. Pimpinan mencoba menambah template -> 403 Forbidden
        $tokenPimpinan = TokenAksesPengguna::buatToken($pimpinan);
        $resPimpinan = $this->withHeaders([
            'Authorization' => "Bearer {$tokenPimpinan}",
            'Accept' => 'application/json',
        ])->post('/api/pks-templates', [
            'nama_template' => 'Template Ilegal Pimpinan',
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Pelayanan Kesehatan',
            'file_template' => $dummyFile,
        ]);
        $resPimpinan->assertStatus(403);

        // 4. Pengelola PKS menambah template untuk bidangnya -> 201 Created
        $tokenPengelola = TokenAksesPengguna::buatToken($pengelola);
        $resPengelola = $this->withHeaders([
            'Authorization' => "Bearer {$tokenPengelola}",
            'Accept' => 'application/json',
        ])->post('/api/pks-templates', [
            'nama_template' => 'Template Resmi Pelayanan ' . uniqid(),
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Uji Template RBAC',
            'file_template' => $dummyFile,
        ]);
        $resPengelola->assertStatus(201);
        $templateId = $resPengelola->json('template_id') ?? $resPengelola->json('templateId');

        // 5. Verifikasi berkas template tersimpan di private storage
        $template = PksTemplate::find($templateId);
        $this->assertNotNull($template);
        $privateTemplatePath = storage_path('app/private/' . $template->url_berkas);
        $this->assertFileExists($privateTemplatePath);

        // Cleanup
        if (file_exists($privateTemplatePath)) {
            @unlink($privateTemplatePath);
        }
        $template->delete();
    }

    public function test_hentikan_pks_rbac_authorization(): void
    {
        $petugas1 = $this->getOrCreateUser('petugas_jr');
        $petugas2 = Pengguna::create([
            'nama' => 'Petugas Lain ' . uniqid(),
            'email' => 'other.petugas.' . uniqid() . '@jasaraharja.co.id',
            'password' => Hash::make('password123'),
            'role' => 'petugas_jr',
            'status' => 'Aktif',
        ]);

        $mitra = Mitra::first();
        $pks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $petugas1->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Pelayanan Kesehatan',
            'ringkasan_pks' => 'PKS Milik Petugas 1',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Disetujui',
            'status_pks' => 'Aktif',
        ]);

        $fakePdf = UploadedFile::fake()->create('surat_penghentian.pdf', 300, 'application/pdf');

        // 1. Petugas lain (bukan pembuat) mencoba menghentikan PKS -> 403 Forbidden!
        $tokenOther = TokenAksesPengguna::buatToken($petugas2);
        $resOther = $this->withHeaders([
            'Authorization' => "Bearer {$tokenOther}",
            'Accept' => 'application/json',
        ])->post("/api/pks/{$pks->pks_id}/hentikan", [
            'alasan_penghentian' => 'Upaya penghentian tidak sah',
            'surat_penghentian' => $fakePdf,
        ]);
        $resOther->assertStatus(403);

        // 2. Petugas pemilik sah menghentikan PKS -> 200 OK
        $tokenCreator = TokenAksesPengguna::buatToken($petugas1);
        $resCreator = $this->withHeaders([
            'Authorization' => "Bearer {$tokenCreator}",
            'Accept' => 'application/json',
        ])->post("/api/pks/{$pks->pks_id}/hentikan", [
            'alasan_penghentian' => 'Kesepakatan bersama tidak dilanjutkan',
            'surat_penghentian' => $fakePdf,
        ]);
        $resCreator->assertStatus(200);

        $freshPks = $pks->fresh();
        $this->assertEquals('Tidak Dilanjutkan', $freshPks->status_pks);

        // Verifikasi berkas surat tersimpan di private storage
        $privateSuratPath = storage_path('app/private/' . $freshPks->url_surat_penghentian);
        $this->assertFileExists($privateSuratPath);

        // Cleanup
        if (file_exists($privateSuratPath)) {
            @unlink($privateSuratPath);
        }
        $pks->delete();
        $petugas2->delete();
    }

    /**
     * =========================================================================
     * 3. PENGUJIAN KEAMANAN INPUT (SEC-INPUT-01 & SEC-TAMPER-01)
     * =========================================================================
     */
    public function test_state_tampering_arbitrary_status_rejected(): void
    {
        $admin = $this->getOrCreateUser('admin_utama');
        $token = TokenAksesPengguna::buatToken($admin);

        $mitra = Mitra::first();
        $pks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $admin->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Pelayanan Kesehatan',
            'ringkasan_pks' => 'PKS Uji Tampering',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Draf',
        ]);

        // Coba injeksi status tidak sah
        $resArbitrary = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pks->pks_id,
                'status_aksi' => 'HACKED_BYPASSED_STATUS',
            ]);
        
        $resArbitrary->assertStatus(422);
        $this->assertEquals('Draf', $pks->fresh()->status_persetujuan);

        $pks->delete();
    }

    public function test_active_pks_cannot_be_directly_modified_without_adendum(): void
    {
        $petugas = $this->getOrCreateUser('petugas_jr');
        $token = TokenAksesPengguna::buatToken($petugas);

        $mitra = Mitra::first();
        $activePks = PksDocument::create([
            'mitra_id' => $mitra->mitra_id,
            'pengguna_id' => $petugas->pengguna_id,
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Pelayanan Kesehatan',
            'ringkasan_pks' => 'PKS Legal Aktif Asli',
            'tanggal_mulai' => now()->toDateString(),
            'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            'status_persetujuan' => 'Disetujui',
            'status_pks' => 'Aktif',
        ]);

        // Mencoba mengubah tanggal atau klausul PKS aktif langsung via PUT /api/pks/{id} -> DITOLAK 422
        $resTamper = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->putJson("/api/pks/{$activePks->pks_id}", [
                'ringkasan_pks' => 'Klausul Dimodifikasi Tanpa Adendum',
                'tanggal_berakhir' => now()->addDays(365)->toDateString(),
            ]);

        $resTamper->assertStatus(422);
        $this->assertEquals('PKS Legal Aktif Asli', $activePks->fresh()->ringkasan_pks);

        $activePks->delete();
    }

    public function test_excessive_length_and_whitespace_validation(): void
    {
        $petugas = $this->getOrCreateUser('petugas_jr');
        $token = TokenAksesPengguna::buatToken($petugas);
        $mitra = Mitra::first();

        // 1. Input kosong / hanya spasi untuk bidang wajib
        $resWhitespace = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson('/api/pks', [
                'mitra_id' => $mitra->mitra_id,
                'bidang' => '   ',
                'jenis_pks' => '',
                'ringkasan_pks' => '   ',
                'tanggal_mulai' => now()->toDateString(),
                'tanggal_berakhir' => now()->addDays(60)->toDateString(),
            ]);
        $resWhitespace->assertStatus(422);

        // 2. Input panjang berlebihan (Buffer / String limit)
        $hugeString = str_repeat('A', 10000);
        $resOverflow = $this->withHeaders(['Authorization' => "Bearer {$token}"])
            ->postJson('/api/pks', [
                'mitra_id' => $mitra->mitra_id,
                'bidang' => 'Pelayanan',
                'jenis_pks' => 'Pelayanan Kesehatan',
                'ringkasan_pks' => $hugeString,
                'tanggal_mulai' => now()->toDateString(),
                'tanggal_berakhir' => now()->addDays(60)->toDateString(),
            ]);
        $resOverflow->assertStatus(422);
    }

    /**
     * =========================================================================
     * 4. PENGUJIAN UPLOAD DOKUMEN (SEC-UPLOAD-01)
     * =========================================================================
     */
    public function test_upload_disallowed_extension_rejected(): void
    {
        $admin = $this->getOrCreateUser('admin_utama');
        $token = TokenAksesPengguna::buatToken($admin);

        // 1. Unggah berkas berbahaya .php ke template -> Ditolak 422
        $phpFile = UploadedFile::fake()->create('exploit.php', 10, 'text/x-php');
        $resPhp = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
            'Accept' => 'application/json',
        ])->post('/api/pks-templates', [
            'nama_template' => 'Exploit Template',
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Pelayanan Kesehatan',
            'file_template' => $phpFile,
        ]);
        $resPhp->assertStatus(422);

        // 2. Unggah berkas .sh / executable ke surat penghentian -> Ditolak 422
        $pks = PksDocument::where('status_pks', 'Aktif')->first();
        if ($pks) {
            $shFile = UploadedFile::fake()->create('script.sh', 10, 'application/x-sh');
            $resSh = $this->withHeaders([
                'Authorization' => "Bearer {$token}",
                'Accept' => 'application/json',
            ])->post("/api/pks/{$pks->pks_id}/hentikan", [
                'alasan_penghentian' => 'Uji coba upload',
                'surat_penghentian' => $shFile,
            ]);
            $resSh->assertStatus(422);
        }
    }

    public function test_upload_file_size_exceeding_limit_rejected(): void
    {
        $admin = $this->getOrCreateUser('admin_utama');
        $token = TokenAksesPengguna::buatToken($admin);

        // Unggah berkas lebih dari 10MB (11MB = 11264KB)
        $oversizedFile = UploadedFile::fake()->create('huge.docx', 11264, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');

        $resOversize = $this->withHeaders([
            'Authorization' => "Bearer {$token}",
            'Accept' => 'application/json',
        ])->post('/api/pks-templates', [
            'nama_template' => 'Oversized Template',
            'bidang' => 'Pelayanan',
            'jenis_pks' => 'Pelayanan Kesehatan',
            'file_template' => $oversizedFile,
        ]);
        $resOversize->assertStatus(422);
    }

    /**
     * =========================================================================
     * 5. PENGUJIAN KEAMANAN INPUT (SQL INJECTION, XSS, & ANTI-SPOOFING)
     * =========================================================================
     */
    public function test_sql_injection_and_xss_input_safety(): void
    {
        $admin = $this->getOrCreateUser('admin_utama');
        $token = TokenAksesPengguna::buatToken($admin);

        // 1. SQL Injection pada parameter pencarian
        $sqliPayloads = [
            "' OR '1'='1",
            "1; DROP TABLE pks; --",
            "' UNION SELECT * FROM pengguna --",
            "admin' --",
        ];

        foreach ($sqliPayloads as $payload) {
            $resSearch = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                ->getJson('/api/pengguna?cari=' . urlencode($payload));
            $resSearch->assertStatus(200);

            $resPksBidang = $this->withHeaders(['Authorization' => "Bearer {$token}"])
                ->getJson('/api/pks?bidang=' . urlencode($payload));
            $resPksBidang->assertStatus(200);
        }

        // 2. XSS Payload Handling
        $petugas = $this->getOrCreateUser('petugas_jr');
        $tokenPetugas = TokenAksesPengguna::buatToken($petugas);
        $mitra = Mitra::first();

        $xssText = '<script>alert("XSS")</script><img src="x" onerror="alert(1)">';
        $resXssPks = $this->withHeaders(['Authorization' => "Bearer {$tokenPetugas}"])
            ->postJson('/api/pks', [
                'mitra_id' => $mitra->mitra_id,
                'bidang' => 'Pelayanan',
                'jenis_pks' => 'Pelayanan Kesehatan',
                'ringkasan_pks' => 'Uji XSS: ' . $xssText,
                'tanggal_mulai' => now()->toDateString(),
                'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            ]);

        $resXssPks->assertStatus(201);
        $createdPksId = $resXssPks->json('pks_id') ?? $resXssPks->json('id');
        $createdPks = PksDocument::find($createdPksId);
        $this->assertNotNull($createdPks);
        $this->assertStringContainsString('Uji XSS:', $createdPks->ringkasan_pks);

        $createdPks->delete();
    }

    /**
     * =========================================================================
     * 6. PENGUJIAN SIKLUS PENUH BISNIS DAN ADENDUM (ALUR LENGKAP & REGRESI)
     * =========================================================================
     */
    public function test_full_business_workflow_and_adendum_lifecycle(): void
    {
        $petugas = $this->getOrCreateUser('petugas_jr');
        $pengelola = $this->getOrCreateUser('pengelola_pks', 'Pelayanan');
        $kabag = $this->getOrCreateUser('kabag');
        $pimpinan = $this->getOrCreateUser('pimpinan');
        $admin = $this->getOrCreateUser('admin_utama');

        $tokenPetugas = TokenAksesPengguna::buatToken($petugas);
        $tokenPengelola = TokenAksesPengguna::buatToken($pengelola);
        $tokenKabag = TokenAksesPengguna::buatToken($kabag);
        $tokenPimpinan = TokenAksesPengguna::buatToken($pimpinan);
        $tokenAdmin = TokenAksesPengguna::buatToken($admin);

        $mitra = Mitra::create([
            'nama_mitra' => 'RSUD Alur Lengkap ' . uniqid(),
            'nama_pengelola' => 'Direktur RSUD',
            'no_hp_pengelola' => '081299887766',
            'status_mitra' => 'Aktif',
        ]);

        // 1. Petugas JR membuat PKS
        $resCreatePks = $this->withHeaders(['Authorization' => "Bearer {$tokenPetugas}"])
            ->postJson('/api/pks', [
                'mitra_id' => $mitra->mitra_id,
                'bidang' => 'Pelayanan',
                'jenis_pks' => 'Pelayanan Kesehatan',
                'ringkasan_pks' => 'PKS Kerjasama Lengkap Siklus Bisnis',
                'tanggal_mulai' => now()->toDateString(),
                'tanggal_berakhir' => now()->addDays(90)->toDateString(),
            ]);
        $resCreatePks->assertStatus(201);
        $pksId = $resCreatePks->json('pks_id') ?? $resCreatePks->json('id');
        $pks = PksDocument::find($pksId);

        // 2. Petugas Menandai Siap Diserahkan
        $this->withHeaders(['Authorization' => "Bearer {$tokenPetugas}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pksId,
                'status_aksi' => 'Tandai Siap Diserahkan',
            ])->assertStatus(201);

        // 3. Pengelola PKS menerima dan menyetujui
        $this->withHeaders(['Authorization' => "Bearer {$tokenPengelola}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pksId,
                'status_aksi' => 'Sudah Diterima',
            ])->assertStatus(201);

        $this->withHeaders(['Authorization' => "Bearer {$tokenPengelola}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pksId,
                'status_aksi' => 'Disetujui Pengelola',
            ])->assertStatus(201);

        // 4. Kabag menerima dan menyetujui
        $this->withHeaders(['Authorization' => "Bearer {$tokenKabag}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pksId,
                'status_aksi' => 'Sudah Diterima',
            ])->assertStatus(201);

        $this->withHeaders(['Authorization' => "Bearer {$tokenKabag}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pksId,
                'status_aksi' => 'Disetujui Kabag',
            ])->assertStatus(201);

        // 5. Pimpinan menerima dan memberikan persetujuan final
        $this->withHeaders(['Authorization' => "Bearer {$tokenPimpinan}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pksId,
                'status_aksi' => 'Sudah Diterima',
            ])->assertStatus(201);

        $this->withHeaders(['Authorization' => "Bearer {$tokenPimpinan}"])
            ->postJson('/api/pks-approvals', [
                'pks_id' => $pksId,
                'status_aksi' => 'Disetujui',
            ])->assertStatus(201);

        $pks->refresh();
        $this->assertEquals('Disetujui', $pks->status_persetujuan);
        $this->assertEquals('Aktif', $pks->status_pks);
        $this->assertNotEmpty($pks->nomor_pks);

        // 6. Pembuatan Adendum atas PKS Aktif
        $resCreateAdendum = $this->withHeaders(['Authorization' => "Bearer {$tokenPetugas}"])
            ->postJson("/api/pks/{$pksId}/adendums", [
                'ruang_lingkup_perubahan' => 'Perpanjangan jangka waktu kerjasama dan penambahan ruang poli.',
                'tanggal_mulai' => now()->toDateString(),
                'tanggal_berakhir' => now()->addDays(180)->toDateString(),
            ]);
        $resCreateAdendum->assertStatus(201);
        $adendumId = $resCreateAdendum->json('data.adendum_id') ?? $resCreateAdendum->json('data.id');
        $adendum = Adendum::find($adendumId);
        $this->assertNotNull($adendum);

        // 7. Pengunggahan Scan Dokumen Final Adendum (Anti-Spoofing: pengguna_id diambil dari session)
        $fakeFinalScan = UploadedFile::fake()->create('Final_Scan_Adendum.pdf', 500, 'application/pdf');
        $resUploadFinal = $this->withHeaders([
            'Authorization' => "Bearer {$tokenPetugas}",
            'Accept' => 'application/json',
        ])->post("/api/adendums/{$adendumId}/upload-final", [
            'file' => $fakeFinalScan,
            'user_id' => 9999, // Percobaan spoofing ID pengguna
        ]);
        $resUploadFinal->assertStatus(200);

        // Verifikasi dokumen final tersimpan di private storage
        $adendum->refresh();
        $privateFinalPath = storage_path('app/private/' . $adendum->url_berkas);
        $this->assertFileExists($privateFinalPath);

        // 8. Unduh berkas final scan adendum terautentikasi
        $resDownFinal = $this->withHeaders(['Authorization' => "Bearer {$tokenPetugas}"])
            ->get("/api/adendums/{$adendumId}/download-final");
        $resDownFinal->assertStatus(200);

        // 9. Penghentian PKS dengan Surat Penghentian PDF resmi
        $suratPenghentian = UploadedFile::fake()->create('surat_penghentian_resmi.pdf', 300, 'application/pdf');
        $resHentikan = $this->withHeaders([
            'Authorization' => "Bearer {$tokenPetugas}",
            'Accept' => 'application/json',
        ])->post("/api/pks/{$pksId}/hentikan", [
            'alasan_penghentian' => 'Rumah Sakit pindah operasional ke gedung baru.',
            'surat_penghentian' => $suratPenghentian,
        ]);
        $resHentikan->assertStatus(200);

        $pks->refresh();
        $this->assertEquals('Tidak Dilanjutkan', $pks->status_pks);

        // Verifikasi status Mitra otomatis menjadi Tidak Aktif karena tidak ada PKS aktif lain
        $mitra->refresh();
        $this->assertEquals('Tidak Aktif', $mitra->status_mitra);

        // Cleanup
        if (file_exists($privateFinalPath)) {
            @unlink($privateFinalPath);
        }
        if ($pks->url_surat_penghentian && file_exists(storage_path('app/private/' . $pks->url_surat_penghentian))) {
            @unlink(storage_path('app/private/' . $pks->url_surat_penghentian));
        }
        $adendum->delete();
        $pks->delete();
        $mitra->delete();
    }
}
