<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('penyalurans', function (Blueprint $table) {
            $table->id();
            // PENTING: Gunakan seleksi_id agar terhubung ke data seleksi
            $table->unsignedBigInteger('seleksi_id'); 
            
            // PENTING: Nama kolom disamakan dengan controller
            $table->date('tanggal_penyaluran'); 
            
            $table->string('keterangan');
            $table->timestamps();

            // Foreign key
            $table->foreign('seleksi_id')->references('id')->on('seleksis')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('penyalurans');
    }
};