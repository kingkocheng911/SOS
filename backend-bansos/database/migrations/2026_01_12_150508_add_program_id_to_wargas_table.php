<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wargas', function (Blueprint $table) {
            
            // 1. Cek dulu, kalau kolom program_id belum ada, baru buat
            if (!Schema::hasColumn('wargas', 'program_id')) {
                $table->unsignedBigInteger('program_id')->nullable()->after('nik');
            }

            // 2. Cek dulu, kalau kolom status_seleksi belum ada, buat baru
            if (!Schema::hasColumn('wargas', 'status_seleksi')) {
                // KITA BUAT BARU (Hapus ->change())
                $table->string('status_seleksi')->default('Belum Terdaftar')->after('program_id');
            } else {
                // Kalau ternyata sudah ada tapi mau diubah defaultnya (Jaga-jaga)
                $table->string('status_seleksi')->default('Belum Terdaftar')->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('wargas', function (Blueprint $table) {
            // Hapus kolom jika rollback
            if (Schema::hasColumn('wargas', 'program_id')) {
                $table->dropColumn('program_id');
            }
            if (Schema::hasColumn('wargas', 'status_seleksi')) {
                $table->dropColumn('status_seleksi');
            }
        });
    }
};