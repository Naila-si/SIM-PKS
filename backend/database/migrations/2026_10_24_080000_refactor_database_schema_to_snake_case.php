<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Jalankan migrasi penyelarasan nama tabel dan kolom menjadi snake_case & Bahasa Indonesia.
     */
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0;');

        // Fungsi helper untuk drop foreign key jika ada
        $dropFk = function ($table, $fk) {
            try {
                DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$fk}`;");
            } catch (\Throwable $e) {}
        };

        // 1. Hapus tabel sesi_pengguna yang sudah tidak digunakan
        Schema::dropIfExists('sesi_pengguna');

        // 2. Drop foreign keys yang terikat pada kolom lama
        $dropFk('pks_documents', 'pks_documents_locked_by_foreign');
        $dropFk('pks_documents', 'pks_documents_mitraid_foreign');
        $dropFk('pks_documents', 'pks_documents_penggunaid_foreign');
        $dropFk('pks', 'pks_locked_by_foreign');
        $dropFk('pks', 'pks_mitra_id_foreign');
        $dropFk('pks', 'pks_pengguna_id_foreign');

        $dropFk('adendums', 'adendums_pembuat_id_foreign');
        $dropFk('adendums', 'adendums_pks_document_id_foreign');
        $dropFk('adendum', 'adendum_pengguna_id_foreign');
        $dropFk('adendum', 'adendum_pks_id_foreign');

        $dropFk('adendum_approvals', 'adendum_approvals_adendumid_foreign');
        $dropFk('adendum_approvals', 'adendum_approvals_penggunaid_foreign');
        $dropFk('adendum_persetujuan', 'adendum_persetujuan_adendum_id_foreign');
        $dropFk('adendum_persetujuan', 'adendum_persetujuan_pengguna_id_foreign');

        $dropFk('pks_templates', 'pks_templates_diperbarui_oleh_foreign');
        $dropFk('pks_templates', 'pks_templates_penggunaid_foreign');

        $dropFk('system_logs', 'system_logs_user_id_foreign');
        $dropFk('log_sistem', 'log_sistem_pengguna_id_foreign');

        // 3. Tabel pengguna: penggunaId -> pengguna_id
        if (Schema::hasTable('pengguna')) {
            if (Schema::hasColumn('pengguna', 'penggunaId')) {
                DB::statement('ALTER TABLE `pengguna` CHANGE COLUMN `penggunaId` `pengguna_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;');
            }
        }

        // 4. Tabel mitra: mitraId -> mitra_id
        if (Schema::hasTable('mitra')) {
            if (Schema::hasColumn('mitra', 'mitraId')) {
                DB::statement('ALTER TABLE `mitra` CHANGE COLUMN `mitraId` `mitra_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;');
            }
        }

        // 5. Tabel pks_documents -> pks (dan kolom camelCase ke snake_case)
        $pksTableName = Schema::hasTable('pks_documents') ? 'pks_documents' : (Schema::hasTable('pks') ? 'pks' : null);
        if ($pksTableName) {
            if (Schema::hasColumn($pksTableName, 'pksId')) {
                DB::statement("ALTER TABLE `{$pksTableName}` CHANGE COLUMN `pksId` `pks_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;");
            }
            if (Schema::hasColumn($pksTableName, 'mitraId')) {
                DB::statement("ALTER TABLE `{$pksTableName}` CHANGE COLUMN `mitraId` `mitra_id` BIGINT UNSIGNED NOT NULL;");
            }
            if (Schema::hasColumn($pksTableName, 'penggunaId')) {
                DB::statement("ALTER TABLE `{$pksTableName}` CHANGE COLUMN `penggunaId` `pengguna_id` BIGINT UNSIGNED NOT NULL;");
            }
            if (Schema::hasColumn($pksTableName, 'locked_by')) {
                DB::statement("ALTER TABLE `{$pksTableName}` DROP COLUMN `locked_by`;");
            }
            if ($pksTableName === 'pks_documents') {
                DB::statement('RENAME TABLE `pks_documents` TO `pks`;');
            }
        }

        // 6. Tabel pks_templates: templateId -> template_id, penggunaId -> pengguna_id
        if (Schema::hasTable('pks_templates')) {
            if (Schema::hasColumn('pks_templates', 'templateId')) {
                DB::statement('ALTER TABLE `pks_templates` CHANGE COLUMN `templateId` `template_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;');
            }
            if (Schema::hasColumn('pks_templates', 'penggunaId')) {
                DB::statement('ALTER TABLE `pks_templates` CHANGE COLUMN `penggunaId` `pengguna_id` BIGINT UNSIGNED NOT NULL;');
            }
        }

        // 7. Tabel system_logs -> log_sistem
        $logTableName = Schema::hasTable('system_logs') ? 'system_logs' : (Schema::hasTable('log_sistem') ? 'log_sistem' : null);
        if ($logTableName) {
            if (Schema::hasColumn($logTableName, 'id')) {
                DB::statement("ALTER TABLE `{$logTableName}` CHANGE COLUMN `id` `log_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;");
            }
            if (Schema::hasColumn($logTableName, 'user_id')) {
                DB::statement("ALTER TABLE `{$logTableName}` CHANGE COLUMN `user_id` `pengguna_id` BIGINT UNSIGNED NULL;");
            }
            if (Schema::hasColumn($logTableName, 'action')) {
                DB::statement("ALTER TABLE `{$logTableName}` CHANGE COLUMN `action` `aksi` VARCHAR(255) NOT NULL;");
            }
            if (Schema::hasColumn($logTableName, 'description')) {
                DB::statement("ALTER TABLE `{$logTableName}` CHANGE COLUMN `description` `keterangan` TEXT NULL;");
            }
            if ($logTableName === 'system_logs') {
                DB::statement('RENAME TABLE `system_logs` TO `log_sistem`;');
            }
        }

        // 8. Tabel adendums -> adendum
        $adendumTableName = Schema::hasTable('adendums') ? 'adendums' : (Schema::hasTable('adendum') ? 'adendum' : null);
        if ($adendumTableName) {
            if (Schema::hasColumn($adendumTableName, 'adendumId')) {
                DB::statement("ALTER TABLE `{$adendumTableName}` CHANGE COLUMN `adendumId` `adendum_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;");
            }
            if (Schema::hasColumn($adendumTableName, 'pks_document_id')) {
                DB::statement("ALTER TABLE `{$adendumTableName}` CHANGE COLUMN `pks_document_id` `pks_id` BIGINT UNSIGNED NOT NULL;");
            }
            if (Schema::hasColumn($adendumTableName, 'nomorAdendum')) {
                DB::statement("ALTER TABLE `{$adendumTableName}` CHANGE COLUMN `nomorAdendum` `nomor_adendum` VARCHAR(255) NULL;");
            }
            if (Schema::hasColumn($adendumTableName, 'ruangLingkupPerubahan')) {
                DB::statement("ALTER TABLE `{$adendumTableName}` CHANGE COLUMN `ruangLingkupPerubahan` `ruang_lingkup_perubahan` TEXT NULL;");
            }
            if (Schema::hasColumn($adendumTableName, 'tanggalMulai')) {
                DB::statement("ALTER TABLE `{$adendumTableName}` CHANGE COLUMN `tanggalMulai` `tanggal_mulai` DATE NULL;");
            }
            if (Schema::hasColumn($adendumTableName, 'tanggalBerakhir')) {
                DB::statement("ALTER TABLE `{$adendumTableName}` CHANGE COLUMN `tanggalBerakhir` `tanggal_berakhir` DATE NULL;");
            }
            if (Schema::hasColumn($adendumTableName, 'statusPersetujuan')) {
                DB::statement("ALTER TABLE `{$adendumTableName}` CHANGE COLUMN `statusPersetujuan` `status_persetujuan` VARCHAR(255) NOT NULL DEFAULT 'Draft';");
            }
            if (Schema::hasColumn($adendumTableName, 'urlBerkas')) {
                DB::statement("ALTER TABLE `{$adendumTableName}` CHANGE COLUMN `urlBerkas` `url_berkas` VARCHAR(255) NULL;");
            }
            if (Schema::hasColumn($adendumTableName, 'catatanRevisi')) {
                DB::statement("ALTER TABLE `{$adendumTableName}` CHANGE COLUMN `catatanRevisi` `catatan_revisi` TEXT NULL;");
            }
            if (Schema::hasColumn($adendumTableName, 'pembuat_id')) {
                DB::statement("ALTER TABLE `{$adendumTableName}` CHANGE COLUMN `pembuat_id` `pengguna_id` BIGINT UNSIGNED NULL;");
            }
            if ($adendumTableName === 'adendums') {
                DB::statement('RENAME TABLE `adendums` TO `adendum`;');
            }
        }

        // 9. Tabel pks_approvals -> pks_persetujuan
        $pksApprovalTableName = Schema::hasTable('pks_approvals') ? 'pks_approvals' : (Schema::hasTable('pks_persetujuan') ? 'pks_persetujuan' : null);
        if ($pksApprovalTableName) {
            if (Schema::hasColumn($pksApprovalTableName, 'id')) {
                DB::statement("ALTER TABLE `{$pksApprovalTableName}` CHANGE COLUMN `id` `persetujuan_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;");
            }
            if (Schema::hasColumn($pksApprovalTableName, 'user_id')) {
                DB::statement("ALTER TABLE `{$pksApprovalTableName}` CHANGE COLUMN `user_id` `pengguna_id` BIGINT UNSIGNED NULL;");
            }
            if ($pksApprovalTableName === 'pks_approvals') {
                DB::statement('RENAME TABLE `pks_approvals` TO `pks_persetujuan`;');
            }
        }

        // 10. Tabel adendum_approvals -> adendum_persetujuan
        $adendumApprovalTableName = Schema::hasTable('adendum_approvals') ? 'adendum_approvals' : (Schema::hasTable('adendum_persetujuan') ? 'adendum_persetujuan' : null);
        if ($adendumApprovalTableName) {
            if (Schema::hasColumn($adendumApprovalTableName, 'approvalId')) {
                DB::statement("ALTER TABLE `{$adendumApprovalTableName}` CHANGE COLUMN `approvalId` `persetujuan_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT;");
            }
            if (Schema::hasColumn($adendumApprovalTableName, 'adendumId')) {
                DB::statement("ALTER TABLE `{$adendumApprovalTableName}` CHANGE COLUMN `adendumId` `adendum_id` BIGINT UNSIGNED NOT NULL;");
            }
            if (Schema::hasColumn($adendumApprovalTableName, 'penggunaId')) {
                DB::statement("ALTER TABLE `{$adendumApprovalTableName}` CHANGE COLUMN `penggunaId` `pengguna_id` BIGINT UNSIGNED NOT NULL;");
            }
            if (Schema::hasColumn($adendumApprovalTableName, 'aktor')) {
                DB::statement("ALTER TABLE `{$adendumApprovalTableName}` DROP COLUMN `aktor`;");
            }
            if ($adendumApprovalTableName === 'adendum_approvals') {
                DB::statement('RENAME TABLE `adendum_approvals` TO `adendum_persetujuan`;');
            }
        }

        // 11. Pasang kembali foreign keys dengan nama yang bersih
        try {
            DB::statement('ALTER TABLE `pks` ADD CONSTRAINT `pks_mitra_id_foreign` FOREIGN KEY (`mitra_id`) REFERENCES `mitra` (`mitra_id`) ON DELETE RESTRICT;');
            DB::statement('ALTER TABLE `pks` ADD CONSTRAINT `pks_pengguna_id_foreign` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`pengguna_id`) ON DELETE RESTRICT;');
        } catch (\Throwable $e) {}

        try {
            DB::statement('ALTER TABLE `pks_templates` ADD CONSTRAINT `pks_templates_pengguna_id_foreign` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`pengguna_id`) ON DELETE RESTRICT;');
            DB::statement('ALTER TABLE `pks_templates` ADD CONSTRAINT `pks_templates_diperbarui_oleh_foreign` FOREIGN KEY (`diperbarui_oleh`) REFERENCES `pengguna` (`pengguna_id`) ON DELETE SET NULL;');
        } catch (\Throwable $e) {}

        try {
            DB::statement('ALTER TABLE `log_sistem` ADD CONSTRAINT `log_sistem_pengguna_id_foreign` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`pengguna_id`) ON DELETE SET NULL;');
        } catch (\Throwable $e) {}

        try {
            DB::statement('ALTER TABLE `adendum` ADD CONSTRAINT `adendum_pks_id_foreign` FOREIGN KEY (`pks_id`) REFERENCES `pks` (`pks_id`) ON DELETE CASCADE;');
            DB::statement('ALTER TABLE `adendum` ADD CONSTRAINT `adendum_pengguna_id_foreign` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`pengguna_id`) ON DELETE SET NULL;');
        } catch (\Throwable $e) {}

        try {
            DB::statement('ALTER TABLE `pks_persetujuan` ADD CONSTRAINT `pks_persetujuan_pks_id_foreign` FOREIGN KEY (`pks_id`) REFERENCES `pks` (`pks_id`) ON DELETE CASCADE;');
            DB::statement('ALTER TABLE `pks_persetujuan` ADD CONSTRAINT `pks_persetujuan_pengguna_id_foreign` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`pengguna_id`) ON DELETE SET NULL;');
        } catch (\Throwable $e) {}

        try {
            DB::statement('ALTER TABLE `adendum_persetujuan` ADD CONSTRAINT `adendum_persetujuan_adendum_id_foreign` FOREIGN KEY (`adendum_id`) REFERENCES `adendum` (`adendum_id`) ON DELETE CASCADE;');
            DB::statement('ALTER TABLE `adendum_persetujuan` ADD CONSTRAINT `adendum_persetujuan_pengguna_id_foreign` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`pengguna_id`) ON DELETE CASCADE;');
        } catch (\Throwable $e) {}

        DB::statement('SET FOREIGN_KEY_CHECKS = 1;');
    }

    /**
     * Balikkan migrasi jika diperlukan.
     */
    public function down(): void
    {
    }
};
