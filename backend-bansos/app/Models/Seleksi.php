<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Seleksi extends Model
{
    use HasFactory;

    protected $guarded = [];

    /**
     * PERBAIKAN:
     * Karena di WargaController Anda menggunakan 'Auth::user()',
     * maka relasi ini HARUS ke model 'User', bukan 'Warga'.
     * * Jika diarahkan ke 'Warga', Laravel akan bingung mencari class Warga
     * sedangkan yang login adalah User.
     */
    public function warga()
    {
        return $this->belongsTo(User::class, 'warga_id');
        return $this->belongsTo(Warga::class, 'warga_id');
    }

    /**
     * Relasi ke Program Bantuan
     * Pastikan tabel di database bernama 'program_bantuan' (singular)
     * atau 'program_bantuans' (plural). Laravel akan menyesuaikan.
     */
    public function programBantuan()
    {
        // Pastikan foreign key di tabel seleksis adalah 'program_bantuan_id'
        return $this->belongsTo(ProgramBantuan::class, 'program_bantuan_id');
    }

    /**
     * Relasi ke Penyaluran
     * Digunakan untuk mengecek apakah bantuan sudah cair
     */
    public function penyaluran()
    {
        return $this->hasOne(Penyaluran::class, 'seleksi_id');
    }
}