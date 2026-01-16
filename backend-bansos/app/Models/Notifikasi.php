<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    use HasFactory;

    // Nama tabel di database
    protected $table = 'notifikasis';

    // Kolom yang boleh diisi secara massal
    protected $fillable = [
        'user_id',
        'pesan',
        'is_read',
    ];

    /**
     * Relasi ke model User
     * Notifikasi ini dimiliki oleh seorang User (Warga)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}