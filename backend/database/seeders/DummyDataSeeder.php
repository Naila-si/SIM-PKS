<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengguna;
use App\Models\Mitra;
use App\Models\PksDocument;
use App\Models\Adendum;
use App\Models\PksApproval;
use App\Models\AdendumApproval;
use App\Models\PksTemplate;
use App\Models\SystemLog;
use Carbon\Carbon;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ambil data Pengguna Akun Resmi
        $petugasSw = Pengguna::where('email', 'petugas.sw@jasaraharja.co.id')->first();
        $petugasIw = Pengguna::where('email', 'petugas.iw@jasaraharja.co.id')->first();
        $petugasPly = Pengguna::where('email', 'petugas.pelayanan@jasaraharja.co.id')->first();

        $pengelolaSw = Pengguna::where('email', 'pengelola.sw@jasaraharja.co.id')->first();
        $pengelolaIw = Pengguna::where('email', 'pengelola.iw@jasaraharja.co.id')->first();
        $pengelolaPly = Pengguna::where('email', 'pengelola.pelayanan@jasaraharja.co.id')->first();

        $kabag = Pengguna::where('role', 'kabag')->first();
        $pimpinan = Pengguna::where('role', 'pimpinan')->first();
        $adminSw = Pengguna::where('email', 'admin.sw@jasaraharja.co.id')->first();

        $today = Carbon::today();

        // 2. SEED MITRA REKANAN
        $mitras = [
            // Pelayanan (Rumah Sakit)
            [
                'nama_mitra' => 'RSUD Arifin Achmad Provinsi Riau',
                'bidang' => 'Pelayanan',
                'nama_pengelola' => 'drg. Wan Fajriatul, M.Kes',
                'jabatan' => 'Direktur Utama',
                'no_hp_pengelola' => '081275819001',
                'email_pengelola' => 'humas@rsudarifinachmad.riau.go.id',
                'alamat_mitra' => 'Jl. Diponegoro No. 2, Sumahilang, Kec. Pekanbaru Kota, Pekanbaru, Riau 28111',
                'status_mitra' => 'Aktif',
            ],
            [
                'nama_mitra' => 'RS Awal Bros Sudirman Pekanbaru',
                'bidang' => 'Pelayanan',
                'nama_pengelola' => 'dr. Mutiara, MARS',
                'jabatan' => 'Manajer Pelayanan Medis',
                'no_hp_pengelola' => '08117620023',
                'email_pengelola' => 'layanan.medis@awalbros.com',
                'alamat_mitra' => 'Jl. Jend. Sudirman No. 117, Tengkerang Sel., Kec. Bukit Raya, Pekanbaru 28282',
                'status_mitra' => 'Aktif',
            ],
            [
                'nama_mitra' => 'RS Santa Maria Pekanbaru',
                'bidang' => 'Pelayanan',
                'nama_pengelola' => 'dr. Arifin Kencana, Sp.B',
                'jabatan' => 'Kepala Divisi Kemitraan',
                'no_hp_pengelola' => '081365902123',
                'email_pengelola' => 'kemitraan@rssantamariapekanbaru.com',
                'alamat_mitra' => 'Jl. Jend. Ahmad Yani No. 68, Pulau Karam, Kec. Sukajadi, Pekanbaru 28127',
                'status_mitra' => 'Aktif',
            ],
            [
                'nama_mitra' => 'RSUD Petala Bumi Pekanbaru',
                'bidang' => 'Pelayanan',
                'nama_pengelola' => 'dr. Sumiati, M.Biomed',
                'jabatan' => 'Direktur',
                'no_hp_pengelola' => '085278103344',
                'email_pengelola' => 'rsudpetalabumi@riau.go.id',
                'alamat_mitra' => 'Jl. Dr. Soetomo No. 65, Sekip, Kec. Lima Puluh, Pekanbaru 28144',
                'status_mitra' => 'Aktif',
            ],

            // Iuran Wajib (PO Angkutan Umum & Travel)
            [
                'nama_mitra' => 'PO Sanura Transport Antar Lintas',
                'bidang' => 'IW',
                'nama_pengelola' => 'H. Syamsuddin Nur',
                'jabatan' => 'Direktur Utama',
                'no_hp_pengelola' => '082169004455',
                'email_pengelola' => 'sanuratransport@gmail.com',
                'alamat_mitra' => 'Jl. SM Amin No. 88, Arengka II, Kec. Payung Sekaki, Pekanbaru 28292',
                'status_mitra' => 'Aktif',
            ],
            [
                'nama_mitra' => 'PO Makmur Jaya Mandiri',
                'bidang' => 'IW',
                'nama_pengelola' => 'Hendrik Silalahi',
                'jabatan' => 'Kepala Operasional Wilayah Riau',
                'no_hp_pengelola' => '081276008899',
                'email_pengelola' => 'makmur.riau@makmurbus.co.id',
                'alamat_mitra' => 'Jl. Riau Ujung No. 12B, Air Hitam, Kec. Payung Sekaki, Pekanbaru 28291',
                'status_mitra' => 'Aktif',
            ],
            [
                'nama_mitra' => 'PT Riau Tour Wisata Eksekutif',
                'bidang' => 'IW',
                'nama_pengelola' => 'Linda Handayani',
                'jabatan' => 'Manajer Keuangan & Kepatuhan',
                'no_hp_pengelola' => '081371009988',
                'email_pengelola' => 'finance@riautourwisata.com',
                'alamat_mitra' => 'Jl. Tuanku Tambusai No. 245, Labuh Baru Tim., Kec. Payung Sekaki, Pekanbaru 28292',
                'status_mitra' => 'Aktif',
            ],
            [
                'nama_mitra' => 'PO Sinar Riau Express',
                'bidang' => 'IW',
                'nama_pengelola' => 'Ridwan Siregar',
                'jabatan' => 'Pimpinan Cabang',
                'no_hp_pengelola' => '085271334411',
                'email_pengelola' => 'sinarriau.express@yahoo.com',
                'alamat_mitra' => 'Terminal AKAP Bandar Raya Payung Sekaki, Blok B No. 4, Pekanbaru 28291',
                'status_mitra' => 'Aktif',
            ],

            // Sumbangan Wajib (Samsat & Korporasi Swasta)
            [
                'nama_mitra' => 'Badan Pendapatan Daerah (Bapenda) Provinsi Riau',
                'bidang' => 'SW',
                'nama_pengelola' => 'Drs. H. Syahrial Abdi, AP., M.Si',
                'jabatan' => 'Kepala Bapenda',
                'no_hp_pengelola' => '08117510200',
                'email_pengelola' => 'sekretariat@bapenda.riau.go.id',
                'alamat_mitra' => 'Jl. Jend. Sudirman No. 460, Jadirejo, Kec. Sukajadi, Pekanbaru 28121',
                'status_mitra' => 'Aktif',
            ],
            [
                'nama_mitra' => 'PT Riau Andalan Pulp & Paper (RAPP)',
                'bidang' => 'SW',
                'nama_pengelola' => 'Mulia Nainggolan',
                'jabatan' => 'Head of Fleet & Logistic Management',
                'no_hp_pengelola' => '08117590888',
                'email_pengelola' => 'mulia_nainggolan@aprilasia.com',
                'alamat_mitra' => 'Pangkalan Kerinci, Kabupaten Pelalawan, Riau 28300',
                'status_mitra' => 'Aktif',
            ],
            [
                'nama_mitra' => 'PT Pertamina Hulu Rokan (PHR)',
                'bidang' => 'SW',
                'nama_pengelola' => 'Bambang Sukoco',
                'jabatan' => 'Sr. Manager Transportation & Fleet',
                'no_hp_pengelola' => '081275001122',
                'email_pengelola' => 'fleet.phr@pertamina.com',
                'alamat_mitra' => 'Rumbai Camp, Komplek Perkantoran PHR, Pekanbaru 28271',
                'status_mitra' => 'Aktif',
            ],
            [
                'nama_mitra' => 'Koperasi Angkutan Sawit Mandiri Riau',
                'bidang' => 'SW',
                'nama_pengelola' => 'Suryadi Pratama',
                'jabatan' => 'Ketua Koperasi',
                'no_hp_pengelola' => '082388009911',
                'email_pengelola' => 'sawitmandiri.riau@gmail.com',
                'alamat_mitra' => 'Jl. Garuda Sakti Km. 3, Simpang Baru, Kec. Tampan, Pekanbaru 28293',
                'status_mitra' => 'Aktif',
            ],
        ];

        $savedMitras = [];
        foreach ($mitras as $m) {
            $saved = Mitra::updateOrCreate(
                ['nama_mitra' => $m['nama_mitra']],
                $m
            );
            $savedMitras[$m['nama_mitra']] = $saved;
        }

        // 3. SEED DOKUMEN PKS
        $pksData = [
            // PKS 1: Aktif Masa Berlaku Panjang (Pelayanan)
            [
                'mitra_id' => $savedMitras['RSUD Arifin Achmad Provinsi Riau']->mitra_id,
                'pengguna_id' => $petugasPly?->pengguna_id ?? 1,
                'bidang' => 'Pelayanan',
                'jenis_pks' => 'Pelayanan Kesehatan',
                'nomor_pks' => 'PKS/001/JR-RIAU/PLY/2026',
                'ringkasan_pks' => 'Kerja Sama Penanganan dan Perawatan Korban Kecelakaan Lalu Lintas Jalan Serta Penerbitan Surat Jaminan (Guarantee Letter) Pasien IGD',
                'tanggal_mulai' => $today->copy()->subMonths(3)->toDateString(),
                'tanggal_berakhir' => $today->copy()->addMonths(9)->toDateString(),
                'url_berkas' => '/storage/pks/pks_001_rsud_arifin_achmad.pdf',
                'status_persetujuan' => 'Disetujui',
                'status_pks' => 'Aktif',
            ],
            // PKS 2: Segera Berakhir H-18 Hari (Masa Berlaku mendekati habis -> Memicu Notifikasi Kuning!)
            [
                'mitra_id' => $savedMitras['RS Awal Bros Sudirman Pekanbaru']->mitra_id,
                'pengguna_id' => $petugasPly?->pengguna_id ?? 1,
                'bidang' => 'Pelayanan',
                'jenis_pks' => 'Pelayanan Kesehatan',
                'nomor_pks' => 'PKS/014/JR-RIAU/PLY/2025',
                'ringkasan_pks' => 'Pelayanan Medis Tindakan Bedah Trauma dan Rawat Inap Korban Kecelakaan Lalu Lintas Terpadu',
                'tanggal_mulai' => $today->copy()->subDays(347)->toDateString(),
                'tanggal_berakhir' => $today->copy()->addDays(18)->toDateString(), // H-18!
                'url_berkas' => '/storage/pks/pks_014_awal_bros.pdf',
                'status_persetujuan' => 'Disetujui',
                'status_pks' => 'Segera Berakhir',
            ],
            // PKS 3: Telah Berakhir (Perlu Perpanjangan / Adendum Baru)
            [
                'mitra_id' => $savedMitras['PO Sanura Transport Antar Lintas']->mitra_id,
                'pengguna_id' => $petugasIw?->pengguna_id ?? 1,
                'bidang' => 'IW',
                'jenis_pks' => 'Kerja Sama Operasional',
                'nomor_pks' => 'PKS/008/JR-RIAU/IW/2025',
                'ringkasan_pks' => 'Penyetoran Iuran Wajib Dana Pertanggungan Wajib Kecelakaan Penumpang Bus Trayek Antar Kota Dalam Provinsi (AKDP)',
                'tanggal_mulai' => $today->copy()->subYears(1)->toDateString(),
                'tanggal_berakhir' => $today->copy()->subDays(5)->toDateString(), // Telah Berakhir 5 hari lalu!
                'url_berkas' => '/storage/pks/pks_008_sanura.pdf',
                'status_persetujuan' => 'Disetujui',
                'status_pks' => 'Berakhir',
            ],
            // PKS 4: Menunggu Penyerahan Berkas Fisik (Pengajuan Baru Petugas SW -> Menunggu Pengelola Terima)
            [
                'mitra_id' => $savedMitras['Badan Pendapatan Daerah (Bapenda) Provinsi Riau']->mitra_id,
                'pengguna_id' => $petugasSw?->pengguna_id ?? 1,
                'bidang' => 'SW',
                'jenis_pks' => 'Kerja Sama Operasional',
                'nomor_pks' => 'PKS/021/JR-RIAU/SW/2026',
                'ringkasan_pks' => 'Integrasi Sistem Pembayaran Sumbangan Wajib Dana Kecelakaan Lalu Lintas Jalan (SWDKLLJ) pada Unit Layanan Samsat Drive-Thru Pekanbaru',
                'tanggal_mulai' => $today->copy()->toDateString(),
                'tanggal_berakhir' => $today->copy()->addYears(1)->toDateString(),
                'url_berkas' => null,
                'status_persetujuan' => 'Menunggu Penyerahan',
                'status_pks' => 'Draf',
            ],
            // PKS 5: Pemeriksaan Pengelola PKS (Sedang diperiksa berkasnya oleh Pengelola)
            [
                'mitra_id' => $savedMitras['RS Santa Maria Pekanbaru']->mitra_id,
                'pengguna_id' => $petugasPly?->pengguna_id ?? 1,
                'bidang' => 'Pelayanan',
                'jenis_pks' => 'Pelayanan Kesehatan',
                'nomor_pks' => 'PKS/025/JR-RIAU/PLY/2026',
                'ringkasan_pks' => 'Penyediaan Fasilitas Trauma Center dan Standarisasi Billing Pengobatan Korban Kecelakaan Lalu Lintas Tingkat Lanjut',
                'tanggal_mulai' => $today->copy()->toDateString(),
                'tanggal_berakhir' => $today->copy()->addYears(1)->toDateString(),
                'url_berkas' => null,
                'status_persetujuan' => 'Pemeriksaan Pengelola',
                'status_pks' => 'Draf',
            ],
            // PKS 6: Pemeriksaan Kabag (Sudah Disetujui Pengelola, Antrean Persetujuan Kepala Bagian)
            [
                'mitra_id' => $savedMitras['PO Makmur Jaya Mandiri']->mitra_id,
                'pengguna_id' => $petugasIw?->pengguna_id ?? 1,
                'bidang' => 'IW',
                'jenis_pks' => 'Kerja Sama Operasional',
                'nomor_pks' => 'PKS/027/JR-RIAU/IW/2026',
                'ringkasan_pks' => 'Optimalisasi Penerimaan Iuran Wajib Armada Bus Pariwisata dan AKAP Wilayah Riau Menuju Sumatra Utara',
                'tanggal_mulai' => $today->copy()->toDateString(),
                'tanggal_berakhir' => $today->copy()->addYears(1)->toDateString(),
                'url_berkas' => null,
                'status_persetujuan' => 'Pemeriksaan Kabag',
                'status_pks' => 'Draf',
            ],
            // PKS 7: Pemeriksaan Pimpinan (Sudah Disetujui Kabag, Antrean Pengesahan Akhir Kepala Cabang / Pimpinan)
            [
                'mitra_id' => $savedMitras['PT Riau Andalan Pulp & Paper (RAPP)']->mitra_id,
                'pengguna_id' => $petugasSw?->pengguna_id ?? 1,
                'bidang' => 'SW',
                'jenis_pks' => 'Kerja Sama Operasional',
                'nomor_pks' => 'PKS/029/JR-RIAU/SW/2026',
                'ringkasan_pks' => 'Kemitraan Kepatuhan Pelunasan SWDKLLJ Kendaraan Angkutan Berat dan Truk Logistik Pabrik Pelalawan',
                'tanggal_mulai' => $today->copy()->toDateString(),
                'tanggal_berakhir' => $today->copy()->addYears(2)->toDateString(),
                'url_berkas' => null,
                'status_persetujuan' => 'Pemeriksaan Pimpinan',
                'status_pks' => 'Draf',
            ],
            // PKS 8: Revisi Pengelola (Terdapat Catatan Perbaikan untuk Petugas)
            [
                'mitra_id' => $savedMitras['RSUD Petala Bumi Pekanbaru']->mitra_id,
                'pengguna_id' => $petugasPly?->pengguna_id ?? 1,
                'bidang' => 'Pelayanan',
                'jenis_pks' => 'Pelayanan Kesehatan',
                'nomor_pks' => 'PKS/030/JR-RIAU/PLY/2026',
                'ringkasan_pks' => 'Perjanjian Kerja Sama Pelayanan Medis Rawat Jalan dan Instalasi Farmasi Korban Laka Lantas',
                'tanggal_mulai' => $today->copy()->toDateString(),
                'tanggal_berakhir' => $today->copy()->addYears(1)->toDateString(),
                'url_berkas' => null,
                'status_persetujuan' => 'Revisi Pengelola',
                'status_pks' => 'Draf',
                'catatan_revisi' => 'Mohon sesuaikan lampiran daftar tarif obat formularium dan lampirkan SK Direktur terkait PIC koordinasi klaim 24 jam.',
            ],
            // PKS 9: Aktif Normal (SW)
            [
                'mitra_id' => $savedMitras['PT Pertamina Hulu Rokan (PHR)']->mitra_id,
                'pengguna_id' => $petugasSw?->pengguna_id ?? 1,
                'bidang' => 'SW',
                'jenis_pks' => 'Kerja Sama Operasional',
                'nomor_pks' => 'PKS/032/JR-RIAU/SW/2026',
                'ringkasan_pks' => 'Pengelolaan dan Perlindungan Asuransi Kecelakaan Penumpang Kendaraan Operasional Lapangan Minyak Rumbai Camp',
                'tanggal_mulai' => $today->copy()->subMonths(2)->toDateString(),
                'tanggal_berakhir' => $today->copy()->addMonths(10)->toDateString(),
                'url_berkas' => '/storage/pks/pks_phr_2026.pdf',
                'status_persetujuan' => 'Disetujui',
                'status_pks' => 'Aktif',
            ],
            // PKS 10: Aktif Normal (IW)
            [
                'mitra_id' => $savedMitras['PT Riau Tour Wisata Eksekutif']->mitra_id,
                'pengguna_id' => $petugasIw?->pengguna_id ?? 1,
                'bidang' => 'IW',
                'jenis_pks' => 'Kerja Sama Operasional',
                'nomor_pks' => 'PKS/033/JR-RIAU/IW/2026',
                'ringkasan_pks' => 'Kemitraan Penjaminan Asuransi Penumpang Angkutan Pariwisata Shuttle Pekanbaru - Bandara SSK II',
                'tanggal_mulai' => $today->copy()->subMonths(1)->toDateString(),
                'tanggal_berakhir' => $today->copy()->addMonths(11)->toDateString(),
                'url_berkas' => '/storage/pks/pks_riautour_2026.pdf',
                'status_persetujuan' => 'Disetujui',
                'status_pks' => 'Aktif',
            ],
        ];

        $savedPks = [];
        foreach ($pksData as $p) {
            $saved = PksDocument::updateOrCreate(
                ['nomor_pks' => $p['nomor_pks']],
                $p
            );
            $savedPks[$p['nomor_pks']] = $saved;
        }

        // 4. SEED RIWAYAT PERSETUJUAN PKS (pks_persetujuan)
        $approvalLogs = [
            // Riwayat untuk PKS 1 (Disetujui Lengkap)
            [
                'pks_id' => $savedPks['PKS/001/JR-RIAU/PLY/2026']->pks_id,
                'pengguna_id' => $petugasPly?->pengguna_id ?? 1,
                'status_aksi' => 'Draf Diajukan',
                'catatan' => 'Draf PKS Rumah Sakit telah dibuat dan berkas fisik siap diverifikasi.',
                'created_at' => $today->copy()->subMonths(3)->subDays(4),
            ],
            [
                'pks_id' => $savedPks['PKS/001/JR-RIAU/PLY/2026']->pks_id,
                'pengguna_id' => $pengelolaPly?->pengguna_id ?? 2,
                'status_aksi' => 'Disetujui Pengelola',
                'catatan' => 'Kelengkapan administrasi dan MoU induk telah sesuai ketentuan legal.',
                'created_at' => $today->copy()->subMonths(3)->subDays(3),
            ],
            [
                'pks_id' => $savedPks['PKS/001/JR-RIAU/PLY/2026']->pks_id,
                'pengguna_id' => $kabag?->pengguna_id ?? 3,
                'status_aksi' => 'Disetujui Kabag',
                'catatan' => 'Disetujui untuk proses penerbitan final ke pimpinan.',
                'created_at' => $today->copy()->subMonths(3)->subDays(2),
            ],
            [
                'pks_id' => $savedPks['PKS/001/JR-RIAU/PLY/2026']->pks_id,
                'pengguna_id' => $pimpinan?->pengguna_id ?? 4,
                'status_aksi' => 'Disetujui Pimpinan',
                'catatan' => 'PKS disahkan dan ditandatangani para pihak.',
                'created_at' => $today->copy()->subMonths(3)->subDays(1),
            ],

            // Riwayat untuk PKS 6 (Sudah Disetujui Pengelola, Menunggu Kabag)
            [
                'pks_id' => $savedPks['PKS/027/JR-RIAU/IW/2026']->pks_id,
                'pengguna_id' => $petugasIw?->pengguna_id ?? 1,
                'status_aksi' => 'Tandai Siap Diserahkan',
                'catatan' => 'Draf PKS telah dicetak dan diserahkan ke bagian pengelola.',
                'created_at' => $today->copy()->subDays(2),
            ],
            [
                'pks_id' => $savedPks['PKS/027/JR-RIAU/IW/2026']->pks_id,
                'pengguna_id' => $pengelolaIw?->pengguna_id ?? 2,
                'status_aksi' => 'Disetujui Pengelola',
                'catatan' => 'Verifikasi dokumen rampung. Diteruskan ke Kepala Bagian.',
                'created_at' => $today->copy()->subDays(1),
            ],

            // Riwayat untuk PKS 8 (Revisi Pengelola)
            [
                'pks_id' => $savedPks['PKS/030/JR-RIAU/PLY/2026']->pks_id,
                'pengguna_id' => $petugasPly?->pengguna_id ?? 1,
                'status_aksi' => 'Draf Diajukan',
                'catatan' => 'Pengajuan berkas kerja sama instalasi farmasi.',
                'created_at' => $today->copy()->subDays(3),
            ],
            [
                'pks_id' => $savedPks['PKS/030/JR-RIAU/PLY/2026']->pks_id,
                'pengguna_id' => $pengelolaPly?->pengguna_id ?? 2,
                'status_aksi' => 'Revisi Pengelola',
                'catatan' => 'Mohon sesuaikan lampiran daftar tarif obat formularium dan lampirkan SK Direktur terkait PIC koordinasi klaim 24 jam.',
                'created_at' => $today->copy()->subDays(1),
            ],
        ];

        foreach ($approvalLogs as $log) {
            PksApproval::create($log);
        }

        // 5. SEED ADENDUM PKS
        $adendums = [
            [
                'pks_id' => $savedPks['PKS/001/JR-RIAU/PLY/2026']->pks_id,
                'pengguna_id' => $petugasPly?->pengguna_id ?? 1,
                'nomor_adendum' => 'ADD/001/PKS-001/2026',
                'ruang_lingkup_perubahan' => 'Penambahan Kuota Plafon Penjaminan Ruang Perawatan Intensif (ICU/HCU) Korban Laka Lantas dan Fasilitas Rawat Jalan Fisioterapi',
                'tanggal_mulai' => $today->copy()->subDays(10)->toDateString(),
                'tanggal_berakhir' => $today->copy()->addMonths(9)->toDateString(),
                'status_persetujuan' => 'Pemeriksaan Kabag',
                'status_adendum' => 'Draf',
                'url_berkas' => null,
            ],
            [
                'pks_id' => $savedPks['PKS/014/JR-RIAU/PLY/2025']->pks_id,
                'pengguna_id' => $petugasPly?->pengguna_id ?? 1,
                'nomor_adendum' => 'ADD/002/PKS-014/2026',
                'ruang_lingkup_perubahan' => 'Perpanjangan Masa Berlaku Dokumen Kerja Sama Pelayanan Kesehatan selama 1 (satu) Tahun Penuh terhitung sejak tanggal berakhir PKS awal.',
                'tanggal_mulai' => $today->copy()->addDays(19)->toDateString(),
                'tanggal_berakhir' => $today->copy()->addDays(19)->addYears(1)->toDateString(),
                'status_persetujuan' => 'Disetujui',
                'status_adendum' => 'Aktif',
                'url_berkas' => '/storage/adendum/add_002_awal_bros.pdf',
            ],
        ];

        foreach ($adendums as $ad) {
            $savedAd = Adendum::updateOrCreate(
                ['nomor_adendum' => $ad['nomor_adendum']],
                $ad
            );

            // Seed log persetujuan adendum
            AdendumApproval::create([
                'adendum_id' => $savedAd->adendum_id,
                'pengguna_id' => $petugasPly?->pengguna_id ?? 1,
                'status_aksi' => 'Draf Diajukan',
                'catatan' => 'Draf adendum dibuat untuk penyesuaian operasional.',
                'created_at' => $today->copy()->subDays(5),
            ]);
        }

        // 6. SEED MASTER TEMPLATE DOKUMEN PKS
        $templates = [
            [
                'nama_template' => 'Template Dokumen PKS Standar Pelayanan Rumah Sakit',
                'kategori_template' => 'Standar PKS',
                'bidang' => 'Pelayanan',
                'jenis_pks' => 'Pelayanan Kesehatan',
                'versi_template' => 2,
                'status_template' => 'Aktif',
                'pengguna_id' => $pengelolaPly?->pengguna_id ?? 1,
                'url_berkas' => '/storage/templates/template_pks_rs_v2.docx',
            ],
            [
                'nama_template' => 'Template PKS Penyetoran Iuran Wajib PO Bus & Angkutan Umum',
                'kategori_template' => 'Standar PKS',
                'bidang' => 'IW',
                'jenis_pks' => 'Kerja Sama Operasional',
                'versi_template' => 1,
                'status_template' => 'Aktif',
                'pengguna_id' => $pengelolaIw?->pengguna_id ?? 1,
                'url_berkas' => '/storage/templates/template_pks_iw_v1.docx',
            ],
            [
                'nama_template' => 'Template PKS Kemitraan SWDKLLJ Korporasi & Samsat Terpadu',
                'kategori_template' => 'Standar PKS',
                'bidang' => 'SW',
                'jenis_pks' => 'Kerja Sama Operasional',
                'versi_template' => 1,
                'status_template' => 'Aktif',
                'pengguna_id' => $pengelolaSw?->pengguna_id ?? 1,
                'url_berkas' => '/storage/templates/template_pks_sw_v1.docx',
            ],
            [
                'nama_template' => 'Format Baku Naskah Adendum Perpanjangan Jangka Waktu PKS',
                'kategori_template' => 'Adendum',
                'bidang' => 'Pelayanan',
                'jenis_pks' => 'Pelayanan Kesehatan',
                'versi_template' => 1,
                'status_template' => 'Aktif',
                'pengguna_id' => $pengelolaPly?->pengguna_id ?? 1,
                'url_berkas' => '/storage/templates/template_adendum_waktu_v1.docx',
            ],
        ];

        foreach ($templates as $t) {
            PksTemplate::updateOrCreate(
                ['nama_template' => $t['nama_template']],
                $t
            );
        }

        // 7. SEED LOG AKTIVITAS SISTEM (AUDIT TRAIL LOG SISTEM)
        $systemLogs = [
            [
                'pengguna_id' => $adminSw?->pengguna_id ?? 1,
                'bidang' => 'SW',
                'aksi' => 'Otentikasi',
                'loggable_type' => 'App\Models\Pengguna',
                'loggable_id' => $adminSw?->pengguna_id ?? 1,
                'keterangan' => 'Administrator Utama berhasil masuk (login) ke dalam sistem SIM-PKS.',
                'created_at' => $today->copy()->subHours(8),
            ],
            [
                'pengguna_id' => $petugasPly?->pengguna_id ?? 1,
                'bidang' => 'Pelayanan',
                'aksi' => 'Pendaftaran Mitra',
                'loggable_type' => 'App\Models\Mitra',
                'loggable_id' => $savedMitras['RSUD Arifin Achmad Provinsi Riau']->mitra_id,
                'keterangan' => 'Mendaftarkan data mitra strategis baru: RSUD Arifin Achmad Provinsi Riau pada Bidang Pelayanan.',
                'created_at' => $today->copy()->subDays(10),
            ],
            [
                'pengguna_id' => $petugasSw?->pengguna_id ?? 1,
                'bidang' => 'SW',
                'aksi' => 'Pembuatan Draf PKS',
                'loggable_type' => 'App\Models\PksDocument',
                'loggable_id' => $savedPks['PKS/021/JR-RIAU/SW/2026']->pks_id,
                'keterangan' => 'Membuat draf PKS baru nomor PKS/021/JR-RIAU/SW/2026 bersama Bapenda Provinsi Riau.',
                'created_at' => $today->copy()->subDays(2),
            ],
            [
                'pengguna_id' => $pengelolaPly?->pengguna_id ?? 2,
                'bidang' => 'Pelayanan',
                'aksi' => 'Persetujuan Dokumen',
                'loggable_type' => 'App\Models\PksDocument',
                'loggable_id' => $savedPks['PKS/001/JR-RIAU/PLY/2026']->pks_id,
                'keterangan' => 'Pengelola PKS menyetujui draf kerja sama rumah sakit setelah verifikasi berkas lengkap.',
                'created_at' => $today->copy()->subDays(3),
            ],
            [
                'pengguna_id' => $kabag?->pengguna_id ?? 3,
                'bidang' => 'IW',
                'aksi' => 'Pemeriksaan Kabag',
                'loggable_type' => 'App\Models\PksDocument',
                'loggable_id' => $savedPks['PKS/027/JR-RIAU/IW/2026']->pks_id,
                'keterangan' => 'Kepala Bagian Operasional menyetujui draf PKS PO Makmur Jaya Mandiri.',
                'created_at' => $today->copy()->subHours(4),
            ],
            [
                'pengguna_id' => $pimpinan?->pengguna_id ?? 4,
                'bidang' => 'Pelayanan',
                'aksi' => 'Pengesahan PKS',
                'loggable_type' => 'App\Models\PksDocument',
                'loggable_id' => $savedPks['PKS/001/JR-RIAU/PLY/2026']->pks_id,
                'keterangan' => 'Pimpinan Cabang mengesahkan dokumen PKS RSUD Arifin Achmad Provinsi Riau.',
                'created_at' => $today->copy()->subDays(1),
            ],
            [
                'pengguna_id' => $pengelolaPly?->pengguna_id ?? 1,
                'bidang' => 'Pelayanan',
                'aksi' => 'Kelola Template',
                'loggable_type' => 'App\Models\PksTemplate',
                'loggable_id' => 1,
                'keterangan' => 'Memperbarui berkas template standar pelayanan rumah sakit ke Versi 2.',
                'created_at' => $today->copy()->subDays(4),
            ],
            [
                'pengguna_id' => $adminSw?->pengguna_id ?? 1,
                'bidang' => 'SW',
                'aksi' => 'Ekspor Laporan',
                'loggable_type' => 'App\Models\PksDocument',
                'loggable_id' => 1,
                'keterangan' => 'Mengekspor laporan rekapitulasi data PKS dan Adendum aktif ke dalam berkas Excel.',
                'created_at' => $today->copy()->subMinutes(30),
            ],
        ];

        foreach ($systemLogs as $log) {
            SystemLog::create($log);
        }
    }
}

