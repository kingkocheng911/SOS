<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Cek dulu apakah kolom sudah ada agar tidak error
            if (!Schema::hasColumn('users', 'alamat')) {
                $table->string('alamat')->nullable();
            }
            if (!Schema::hasColumn('users', 'no_telp')) {
                $table->string('no_telp')->nullable();
            }
            if (!Schema::hasColumn('users', 'foto')) {
                $table->string('foto')->nullable();
            }
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['alamat', 'no_telp', 'foto']);
        });
    }
};