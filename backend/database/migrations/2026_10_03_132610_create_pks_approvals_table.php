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
        Schema::create('pks_approvals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('pks_id');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('status_aksi');
            $table->text('catatan')->nullable();
            $table->timestamps();

            // Optionally add foreign keys if pks_documents and pengguna tables exist
            // $table->foreign('pks_id')->references('id')->on('pks_documents')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pks_approvals');
    }
};
