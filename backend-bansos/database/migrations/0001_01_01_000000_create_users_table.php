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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            
            // Ubah email jadi nullable karena pendaftaran via Admin tidak pakai email
            $table->string('email')->unique()->nullable(); 
            $table->timestamp('email_verified_at')->nullable();
            
            $table->string('password');
            
            // --- KOLOM BARU UNTUK BANSOS APP ---
            $table->string('nik')->unique()->nullable(); // NIK Wajib Unik
            $table->string('role')->default('warga');    // Default role 'warga'
            $table->string('no_telp')->nullable();
            $table->text('alamat')->nullable();          // Pakai text untuk alamat panjang
            $table->string('pekerjaan')->nullable();
            $table->bigInteger('gaji')->nullable();      // Pakai BigInteger untuk angka uang
            $table->integer('tanggungan')->nullable();
            $table->string('foto')->nullable();
            // -----------------------------------

            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};