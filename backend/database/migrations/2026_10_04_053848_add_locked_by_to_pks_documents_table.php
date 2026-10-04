<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('pks_documents', function (Blueprint $table) {
            $table->unsignedBigInteger('locked_by')->nullable()->after('status_pks');
            $table->foreign('locked_by')->references('penggunaId')->on('pengguna')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pks_documents', function (Blueprint $table) {
            $table->dropForeign(['locked_by']);
            $table->dropColumn('locked_by');
        });
    }
};
