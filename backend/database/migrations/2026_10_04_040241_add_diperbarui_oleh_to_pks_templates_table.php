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
        Schema::table('pks_templates', function (Blueprint $table) {
            $table->unsignedBigInteger('diperbarui_oleh')->nullable();
            $table->foreign('diperbarui_oleh')->references('penggunaId')->on('pengguna')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pks_templates', function (Blueprint $table) {
            $table->dropForeign(['diperbarui_oleh']);
            $table->dropColumn('diperbarui_oleh');
        });
    }
};
