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
        Schema::create('adendums', function (Blueprint $table) {
            $table->id('adendumId');
            $table->foreignId('pks_document_id')->constrained('pks_documents', 'pksId')->onDelete('cascade');
            $table->string('nomorAdendum')->nullable();
            $table->text('ruangLingkupPerubahan')->nullable();
            $table->date('tanggalMulai')->nullable();
            $table->date('tanggalBerakhir')->nullable();
            $table->string('statusPersetujuan')->default('Draft');
            $table->string('urlBerkas')->nullable();
            $table->text('catatanRevisi')->nullable();
            $table->foreignId('pembuat_id')->nullable()->constrained('pengguna', 'penggunaId')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adendums');
    }
};
