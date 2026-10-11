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
        Schema::create('adendum_approvals', function (Blueprint $table) {
            $table->id('approvalId');
            $table->foreignId('adendumId')->constrained('adendums', 'adendumId')->onDelete('cascade');
            $table->foreignId('penggunaId')->constrained('pengguna', 'penggunaId')->onDelete('cascade');
            $table->string('aktor');
            $table->string('status_aksi');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adendum_approvals');
    }
};
