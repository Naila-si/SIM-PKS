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
        Schema::create('pks_documents', function (Blueprint $table) {
            $table->id('pksId');
            $table->foreignId('mitraId')->constrained('mitra', 'mitraId')->onDelete('restrict');
            $table->foreignId('penggunaId')->constrained('pengguna', 'penggunaId')->onDelete('restrict');
            $table->string('bidang');
            $table->string('jenis_pks');
            $table->string('nomor_pks')->nullable();
            $table->text('ringkasan_pks');
            $table->date('tanggal_mulai');
            $table->date('tanggal_berakhir');
            $table->string('url_berkas')->nullable();
            $table->string('status_persetujuan')->default('Draf');
            $table->string('status_pks')->nullable();
            $table->text('catatan_revisi')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pks_documents');
    }
};
