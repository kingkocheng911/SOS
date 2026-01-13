<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('penyalurans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('warga_id'); // Penerima
            $table->date('tanggal_salur');
            $table->string('keterangan')->nullable(); // Misal: Beras 10kg
            $table->timestamps();

            // Relasi (Opsional, biar aman)
            // $table->foreign('warga_id')->references('id')->on('wargas')->onDelete('cascade');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('penyalurans');
    }
};