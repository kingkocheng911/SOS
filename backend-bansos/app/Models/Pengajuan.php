<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengajuan extends Model
{
    protected $fillable = ['nik_warga', 'nama_warga', 'jenis_bansos', 'status'];
}
