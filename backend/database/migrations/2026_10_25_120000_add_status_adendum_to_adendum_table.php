<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tableName = Schema::hasTable('adendum') ? 'adendum' : 'adendums';

        if (Schema::hasTable($tableName)) {
            if (!Schema::hasColumn($tableName, 'status_adendum')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->string('status_adendum')->default('Draf')->after('status_persetujuan');
                });
            }

            // Backfill existing data
            DB::statement("
                UPDATE `{$tableName}`
                SET `status_adendum` = CASE
                    WHEN LOWER(`status_persetujuan`) IN ('disetujui', 'selesai', 'draf adendum disetujui') THEN
                        CASE
                            WHEN `tanggal_berakhir` IS NOT NULL AND `tanggal_berakhir` < CURRENT_DATE() THEN 'Berakhir'
                            WHEN `tanggal_berakhir` IS NOT NULL AND DATEDIFF(`tanggal_berakhir`, CURRENT_DATE()) <= 30 THEN 'Segera Berakhir'
                            ELSE 'Aktif'
                        END
                    ELSE 'Draf'
                END
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tableName = Schema::hasTable('adendum') ? 'adendum' : 'adendums';

        if (Schema::hasTable($tableName) && Schema::hasColumn($tableName, 'status_adendum')) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('status_adendum');
            });
        }
    }
};
