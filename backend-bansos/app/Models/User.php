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
        'role', // <--- PENTING: Pastikan ini ada agar tidak error saat Register
        'nik',
        'alamat',   // Pastikan ini ada
        'no_telp',  // Pastikan ini ada
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
}