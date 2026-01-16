<?php

namespace App\Models;

// Import library Sanctum untuk API Token
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    // Gunakan HasApiTokens di sini
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Kolom yang boleh diisi secara massal (Mass Assignment).
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'nik',
        'role',
        'no_telp',
        'alamat',
        'pekerjaan',
        'gaji',
        'tanggungan',
        'foto',
    ];

    /**
     * Kolom yang disembunyikan saat data dikirim ke JSON.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Konversi tipe data otomatis.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function seleksi()
    {
        // Relasi ke tabel seleksi
        return $this->hasMany(Seleksi::class, 'warga_id');
    }
}

