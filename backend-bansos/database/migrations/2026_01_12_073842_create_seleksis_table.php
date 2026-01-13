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
        Schema::create('seleksis', function (Blueprint $table) {
            $table->id();
            // Menghubungkan ke tabel warga (foreign key)
            $table->foreignId('warga_id')->constrained('wargas')->onDelete('cascade');
            // Menghubungkan ke tabel program (foreign key)
            $table->foreignId('program_bantuan_id')->constrained('program_bantuans')->onDelete('cascade');
            $table->string('status')->default('menunggu'); // menunggu, disetujui, ditolak
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seleksis');
    }
};
