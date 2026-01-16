<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penyaluran extends Model
{
    use HasFactory;
    
    // SESUAI GAMBAR DATABASE: Nama tabelnya adalah 'penyalurans'
    protected $table = 'penyalurans';
    protected $guarded = []; 

    // Field tambahan untuk JSON Frontend agar nama muncul
    protected $appends = ['warga', 'program_bantuan'];

    public function seleksi()
    {
        // Tetap menggunakan seleksi_id sebagai jembatan
        return $this->belongsTo(Seleksi::class, 'seleksi_id');
    }

    public function getWargaAttribute()
    {
        // Mengambil data warga lewat relasi seleksi
        return $this->seleksi->warga ?? null;
    }

    public function getProgramBantuanAttribute()
    {
        return $this->seleksi->programBantuan ?? null;
    }
}