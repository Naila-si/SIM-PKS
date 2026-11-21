<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('token_akses_pengguna', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pengguna_id')->index();
            $table->string('nama', 100)->default('web-auth');
            $table->string('token_hash', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('terakhir_digunakan_pada')->nullable();
            $table->timestamp('kadaluarsa_pada')->nullable()->index();
            $table->timestamps();

            $table->foreign('pengguna_id')
                ->references('pengguna_id')
                ->on('pengguna')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('token_akses_pengguna');
    }
};
