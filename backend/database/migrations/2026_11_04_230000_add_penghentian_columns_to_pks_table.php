<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pks', function (Blueprint $table) {
            if (!Schema::hasColumn('pks', 'url_surat_penghentian')) {
                $table->string('url_surat_penghentian')->nullable()->after('catatan_revisi');
            }
            if (!Schema::hasColumn('pks', 'alasan_penghentian')) {
                $table->text('alasan_penghentian')->nullable()->after('url_surat_penghentian');
            }
            if (!Schema::hasColumn('pks', 'tanggal_penghentian')) {
                $table->date('tanggal_penghentian')->nullable()->after('alasan_penghentian');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pks', function (Blueprint $table) {
            $table->dropColumn(['url_surat_penghentian', 'alasan_penghentian', 'tanggal_penghentian']);
        });
    }
};

