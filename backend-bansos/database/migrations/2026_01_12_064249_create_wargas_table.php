<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('wargas', function (Blueprint $table) {
            $table->id();
            // Menghubungkan warga dengan akun user (PENTING untuk login)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            $table->string('nama');
            $table->string('nik')->unique();
            
            // Tambahkan kolom ini agar Fungsi Filter Otomatis di SeleksiController tidak error
            $table->decimal('gaji', 15, 2)->default(0); 
            $table->integer('tanggungan')->default(0);
            
            $table->text('alamat')->nullable();
            $table->string('nomor_hp')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wargas');
    }
};