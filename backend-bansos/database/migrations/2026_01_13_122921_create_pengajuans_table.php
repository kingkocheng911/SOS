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
        Schema::create('pengajuans', function (Blueprint $table) {
            $table->id();
            $table->string('nik_warga', 16); // <--- KUNCI UTAMA PENGHUBUNG (Foreign Key logic)
            $table->string('nama_warga');
            $table->string('jenis_bansos'); // Misal: BLT, PKH, Sembako
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }
};
