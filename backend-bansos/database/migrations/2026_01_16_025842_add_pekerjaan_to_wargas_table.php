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
        Schema::table('wargas', function (Blueprint $table) {
            // Kita tambahkan kolom pekerjaan setelah kolom tanggungan
            // nullable() artinya boleh kosong
            // default('-') artinya jika kosong otomatis diisi strip
            $table->string('pekerjaan')->nullable()->default('-')->after('tanggungan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wargas', function (Blueprint $table) {
            // Ini untuk menghapus kolom jika migrasi dibatalkan (rollback)
            $table->dropColumn('pekerjaan');
        });
    }
};