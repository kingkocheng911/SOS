<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seleksi extends Model
{
    protected $guarded = [];

    // Relasi ke Warga
    public function warga()
    {
        return $this->belongsTo(Warga::class, 'warga_id');
    }

    // Relasi ke Program Bantuan
    public function programBantuan()
    {
        return $this->belongsTo(ProgramBantuan::class, 'program_bantuan_id');
    }

    // --- BAGIAN INI YANG WAJIB ADA AGAR ERROR HILANG ---
    public function penyaluran()
    {
        return $this->hasOne(Penyaluran::class, 'seleksi_id');
    }
}