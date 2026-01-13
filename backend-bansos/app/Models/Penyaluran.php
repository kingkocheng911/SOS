<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Penyaluran extends Model
{
    use HasFactory;

    protected $table = 'penyalurans'; // Pastikan nama tabel DB Anda benar
    protected $guarded = [];

    // Relasi ke Seleksi
    public function seleksi()
    {
        return $this->belongsTo(Seleksi::class, 'seleksi_id');
    }
}