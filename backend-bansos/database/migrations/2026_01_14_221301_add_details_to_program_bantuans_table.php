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
        Schema::table('program_bantuans', function (Blueprint $table) {
            $table->decimal('maksimal_penghasilan', 15, 2)->nullable()->after('deskripsi');
            $table->integer('minimal_tanggungan')->nullable()->after('maksimal_penghasilan');
        });
    }

    public function down()
    {
        Schema::table('program_bantuans', function (Blueprint $table) {
            $table->dropColumn(['maksimal_penghasilan', 'minimal_tanggungan']);
        });
    }
};
