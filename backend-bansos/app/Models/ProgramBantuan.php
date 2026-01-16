<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProgramBantuan extends Model
{
    use HasFactory;

    // Nama tabel di database
    protected $table = 'program_bantuans'; 

    // Mendaftarkan kolom agar bisa diisi (Mass Assignment)
    protected $fillable = [
        'nama_program',
        'deskripsi',
        'maksimal_penghasilan', // Kolom Baru
        'minimal_tanggungan'    // Kolom Baru
    ];
}